import { Config, Inject, Logger, Provide } from '@midwayjs/core';
import type { ILogger } from '@midwayjs/logger';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserWxService } from './wx';
import * as jwt from 'jsonwebtoken';
import { UserWxEntity } from '../entity/wx';
import { BaseSysLoginService } from '../../base/service/sys/login';
import { UserSmsService } from './sms';
import { v1 as uuid } from 'uuid';
import * as md5 from 'md5';
import { PluginService } from '../../plugin/service/info';
import { UserIdentitySyncService } from './identity_sync';

/**
 * 登录
 */
@Provide()
export class UserLoginService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  userWxService: UserWxService;

  @Config('module.user.jwt')
  jwtConfig;

  @Config('module.user.sms')
  smsConfig: {
    testPhone?: string | null;
    testCode?: string | null;
    testAccounts?: Array<{ phone: string; code: string }>;
  };

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  pluginService: PluginService;

  @Inject()
  userSmsService: UserSmsService;

  @Inject()
  userIdentitySyncService: UserIdentitySyncService;

  @Logger()
  logger: ILogger;

  /**
   * 发送手机验证码
   * @param phone
   * @param captchaId
   * @param code
   */
  async smsCode(phone, captchaId, code) {
    // 1、检查图片验证码  2、发送短信验证码
    const check = await this.baseSysLoginService.captchaCheck(captchaId, code);
    if (!check) {
      throw new CoolCommException('图片验证码错误');
    }
    await this.userSmsService.sendSms(phone);
  }

  /** 开发/测试用账号，配置未加载时也放行 */
  private static readonly TEST_ACCOUNTS: Array<{
    phone: string;
    code: string;
  }> = [
    { phone: '18000000000', code: '123456' },
    { phone: '18000000001', code: '123456' },
  ];

  /**
   *  手机验证码登录
   * @param phone
   * @param smsCode
   */
  async phoneVerifyCode(phone: string, smsCode: string, tenantId?: number) {
    const p = String(phone ?? '').trim();
    const c = String(smsCode ?? '').trim();
    this.logger.info('[app-login] phone verify, phone=%s', p || '(empty)');
    const { testPhone, testCode, testAccounts } = this.smsConfig ?? {};
    const matchConfigSingle =
      testPhone != null &&
      testCode != null &&
      p === String(testPhone).trim() &&
      c === String(testCode).trim();
    const matchConfigList =
      Array.isArray(testAccounts) &&
      testAccounts.some(
        (a: { phone?: string; code?: string }) =>
          p === String(a?.phone ?? '').trim() &&
          c === String(a?.code ?? '').trim()
      );
    const matchFallback = UserLoginService.TEST_ACCOUNTS.some(
      a => p === a.phone && c === a.code
    );
    const check =
      matchConfigSingle ||
      matchConfigList ||
      matchFallback ||
      (await this.userSmsService.checkCode(phone, smsCode));
    if (check) {
      return await this.phone(p, tenantId);
    }
    throw new CoolCommException('验证码错误');
  }

  /**
   * 小程序手机号登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniPhone(code, encryptedData, iv) {
    const phone = await this.userWxService.miniPhone(code, encryptedData, iv);
    if (phone) {
      return await this.phone(phone);
    } else {
      throw new CoolCommException('获得手机号失败，请检查配置');
    }
  }

  /**
   * 手机号一键登录
   * @param access_token
   * @param openid
   */
  async uniPhone(access_token, openid, appId) {
    const instance: any = await this.pluginService.getInstance('uniphone');
    const phone = await instance.getPhone(access_token, openid, appId);
    if (phone) {
      return await this.phone(phone);
    } else {
      throw new CoolCommException('获得手机号失败，请检查配置');
    }
  }

  /**
   * 手机登录
   * @param phone
   * @param tenantId 可选，用户登录时选择的租户ID，新用户会写入 user_info
   * @returns
   */
  async phone(phone: string, tenantId?: number) {
    let user: any = await this.userInfoEntity.findOneBy({
      phone: Equal(phone),
    });
    if (!user) {
      this.logger.info(
        '[app-login] user_info save start, phone=%s, tenantId=%s',
        phone,
        tenantId ?? 'null'
      );
      const saveData: Record<string, unknown> = {
        phone,
        unionid: phone,
        loginType: 2,
        nickName: phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
      };
      if (tenantId != null && !Number.isNaN(tenantId)) {
        saveData.tenantId = tenantId;
      }
      try {
        user = await this.userInfoEntity.save(saveData as any);
        this.logger.info(
          '[app-login] user_info created, userId=%s, phone=%s',
          user.id,
          phone
        );
      } catch (err) {
        this.logger.error(
          '[app-login] user_info save failed, phone=%s, err=%s',
          phone,
          (err as Error)?.message ?? err
        );
        throw err;
      }
    }

    // 自动同步到后台账号，不阻断登录主流程
    await this.userIdentitySyncService.syncByAppUserId(user.id).catch(err => {
      this.logger.warn(
        '[user-sync] phone login sync failed, appUserId=%s, message=%s',
        user.id,
        err?.message ?? err
      );
    });

    return this.token({ id: user.id });
  }

  /**
   * 公众号登录
   * @param code
   */
  async mp(code: string) {
    let wxUserInfo = await this.userWxService.mpUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      wxUserInfo = await this.saveWxInfo(
        {
          openid: wxUserInfo.openid,
          unionid: wxUserInfo.unionid,
          avatarUrl: wxUserInfo.headimgurl,
          nickName: wxUserInfo.nickname,
          gender: wxUserInfo.sex,
          city: wxUserInfo.city,
          province: wxUserInfo.province,
          country: wxUserInfo.country,
        },
        1
      );
      return this.wxLoginToken(wxUserInfo);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 微信APP授权登录
   * @param code
   */
  async wxApp(code: string) {
    let wxUserInfo = await this.userWxService.appUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      wxUserInfo = await this.saveWxInfo(
        {
          openid: wxUserInfo.openid,
          unionid: wxUserInfo.unionid,
          avatarUrl: wxUserInfo.headimgurl,
          nickName: wxUserInfo.nickname,
          gender: wxUserInfo.sex,
          city: wxUserInfo.city,
          province: wxUserInfo.province,
          country: wxUserInfo.country,
        },
        1
      );
      return this.wxLoginToken(wxUserInfo);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 保存微信信息
   * @param wxUserInfo
   * @param type
   * @returns
   */
  async saveWxInfo(wxUserInfo, type) {
    const find: any = { openid: wxUserInfo.openid };
    let wxInfo: any = await this.userWxEntity.findOneBy(find);
    if (wxInfo) {
      wxUserInfo.id = wxInfo.id;
    }
    return this.userWxEntity.save({
      ...wxUserInfo,
      type,
    });
  }

  /**
   * 小程序登录
   * @param code
   * @param encryptedData
   * @param iv
   * @param tenantId 可选，用户登录时选择的租户ID，新用户会写入 user_info
   */
  async mini(
    code: string,
    encryptedData: string,
    iv: string,
    tenantId?: number
  ) {
    this.logger.info(
      '[app-login] mini login (wx code), tenantId=%s',
      tenantId ?? 'null'
    );
    const wxUserInfo = await this.userWxService.miniUserInfo(
      code,
      encryptedData,
      iv
    );
    if (wxUserInfo) {
      const saved = await this.saveWxInfo(wxUserInfo, 0);
      return await this.wxLoginToken(saved, tenantId);
    }
  }

  /**
   * 微信登录 获得token
   * @param wxUserInfo 微信用户信息
   * @param tenantId 可选，用户登录时选择的租户ID，新用户会写入 user_info
   * @returns
   */
  async wxLoginToken(wxUserInfo: any, tenantId?: number) {
    const unionid = wxUserInfo.unionid ? wxUserInfo.unionid : wxUserInfo.openid;
    let userInfo: any = await this.userInfoEntity.findOneBy({ unionid });
    if (!userInfo) {
      const file = await this.pluginService.getInstance('upload');
      const avatarUrl = await file.downAndUpload(
        wxUserInfo.avatarUrl,
        uuid() + '.png'
      );
      const saveData: Record<string, unknown> = {
        unionid,
        nickName: wxUserInfo.nickName,
        avatarUrl,
        gender: wxUserInfo.gender,
        loginType: wxUserInfo.type,
      };
      if (tenantId != null && !Number.isNaN(tenantId)) {
        saveData.tenantId = tenantId;
      }
      userInfo = await this.userInfoEntity.save(saveData as any);
      this.logger.info(
        '[app-login] user_info created (wx), userId=%s, tenantId=%s',
        userInfo.id,
        tenantId ?? 'null'
      );
    }

    // 自动同步到后台账号，不阻断登录主流程
    await this.userIdentitySyncService
      .syncByAppUserId(userInfo.id)
      .catch(err => {
        this.logger.warn(
          '[user-sync] wx login sync failed, appUserId=%s, message=%s',
          userInfo.id,
          err?.message ?? err
        );
      });

    return this.token({ id: userInfo.id });
  }

  /**
   * 刷新token
   * @param refreshToken
   */
  async refreshToken(refreshToken) {
    try {
      const info = jwt.verify(refreshToken, this.jwtConfig.secret);
      if (!info['isRefresh']) {
        throw new CoolCommException('token类型非refreshToken');
      }
      const userInfo = await this.userInfoEntity.findOneBy({
        id: info['id'],
      });
      return this.token({ id: userInfo.id });
    } catch (e) {
      throw new CoolCommException(
        '刷新token失败，请检查refreshToken是否正确或过期'
      );
    }
  }

  /**
   * 密码登录
   * @param phone
   * @param password
   */
  async password(phone, password) {
    const user = await this.userInfoEntity.findOneBy({ phone });

    if (user && user.password == md5(password)) {
      return this.token({
        id: user.id,
      });
    } else {
      throw new CoolCommException('账号或密码错误');
    }
  }

  /**
   * 获得token
   * @param info
   * @returns
   */
  async token(info) {
    const { expire, refreshExpire } = this.jwtConfig;
    return {
      expire,
      token: await this.generateToken(info),
      refreshExpire,
      refreshToken: await this.generateToken(info, true),
    };
  }

  /**
   * 生成token
   * @param tokenInfo 信息
   * @param roleIds 角色集合
   */
  async generateToken(info, isRefresh = false) {
    const { expire, refreshExpire, secret } = this.jwtConfig;
    const user = await this.userInfoEntity.findOneBy({ id: Equal(info.id) });
    const tokenInfo = {
      isRefresh,
      ...info,
      tenantId: user?.tenantId,
    };
    return jwt.sign(tokenInfo, secret, {
      expiresIn: isRefresh ? refreshExpire : expire,
    });
  }
}
