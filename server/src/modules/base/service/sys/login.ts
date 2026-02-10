import { Inject, Provide, Config, InjectClient } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { LoginDTO } from '../../dto/login';
import { PhoneLoginDTO } from '../../dto/phone_login';
import { v1 as uuid } from 'uuid';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { BaseSysTenantEntity } from '../../entity/sys/tenant';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { noTenant } from '../../db/tenant';
import * as md5 from 'md5';
import { BaseSysRoleService } from './role';
import * as _ from 'lodash';
import { BaseSysMenuService } from './menu';
import { BaseSysDepartmentService } from './department';
import * as jwt from 'jsonwebtoken';
import { Context } from '@midwayjs/koa';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { Utils } from '../../../../comm/utils';
import * as svgCaptcha from 'svg-captcha';

/**
 * 登录
 */
@Provide()
export class BaseSysLoginService extends BaseService {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysTenantEntity)
  baseSysTenantEntity: Repository<BaseSysTenantEntity>;

  @Inject()
  baseSysRoleService: BaseSysRoleService;

  @Inject()
  baseSysMenuService: BaseSysMenuService;

  @Inject()
  baseSysDepartmentService: BaseSysDepartmentService;

  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  @Config('module.base')
  coolConfig;

  @Config('cool.tenant')
  tenantConfig: { enable?: boolean };

  /**
   * 获取租户列表（开放接口，用于登录页下拉；仅返回未过期的租户）
   */
  async getTenantList() {
    if (!this.tenantConfig?.enable) {
      return [];
    }
    const today = _.split(new Date().toISOString(), 'T')[0]; // YYYY-MM-DD
    return noTenant(this.ctx, async () => {
      return this.baseSysTenantEntity
        .createQueryBuilder('t')
        .select(['t.id', 't.name'])
        .where('t.expireDate IS NULL OR t.expireDate >= :today', { today })
        .orderBy('t.id', 'ASC')
        .getMany();
    });
  }

  /**
   * 校验租户是否在有效期内（过期则不允许登录）
   */
  private async checkTenantExpire(tenantId: number | null): Promise<void> {
    if (tenantId == null) return;
    const tenant = await noTenant(this.ctx, () =>
      this.baseSysTenantEntity.findOne({
        where: { id: tenantId },
        select: ['id', 'expireDate'],
      })
    );
    if (!tenant) return;
    if (tenant.expireDate) {
      const today = _.split(new Date().toISOString(), 'T')[0];
      if (tenant.expireDate < today) {
        throw new CoolCommException('租户已过期，无法登录~');
      }
    }
  }

  /**
   * 登录
   * @param login
   */
  async login(login: LoginDTO) {
    const { username, captchaId, verifyCode, password, tenantId } = login;
    // 校验验证码
    const checkV = await this.captchaCheck(captchaId, verifyCode);
    if (checkV) {
      const where: Record<string, unknown> = { username };
      if (this.tenantConfig?.enable) {
        const tid =
          tenantId != null && !Number.isNaN(Number(tenantId))
            ? Number(tenantId)
            : null;
        where.tenantId = tid;
      }
      const user = await this.baseSysUserEntity.findOneBy(
        where as { username: string; tenantId?: number | null }
      );
      // 校验用户
      if (user) {
        // 校验租户是否在有效期内（过期则不允许登录）
        await this.checkTenantExpire(user.tenantId ?? null);
        // 校验用户状态及密码
        if (user.status === 0 || user.password !== md5(password)) {
          throw new CoolCommException('账户或密码不正确~');
        }
      } else {
        throw new CoolCommException('账户或密码不正确~');
      }
      // 校验角色
      const roleIds = await this.baseSysRoleService.getByUser(user.id);
      if (_.isEmpty(roleIds)) {
        throw new CoolCommException('该用户未设置任何角色，无法登录~');
      }

      // 生成token
      const { expire, refreshExpire } = this.coolConfig.jwt.token;
      const result = {
        expire,
        token: await this.generateToken(user, roleIds, expire),
        refreshExpire,
        refreshToken: await this.generateToken(
          user,
          roleIds,
          refreshExpire,
          true
        ),
      };

      // 将用户相关信息保存到缓存
      const perms = await this.baseSysMenuService.getPerms(roleIds);
      const departments = await this.baseSysDepartmentService.getByRoleIds(
        roleIds,
        user.username === 'admin'
      );
      await this.midwayCache.set(`admin:department:${user.id}`, departments);
      await this.midwayCache.set(`admin:perms:${user.id}`, perms);
      await this.midwayCache.set(`admin:token:${user.id}`, result.token);
      await this.midwayCache.set(
        `admin:token:refresh:${user.id}`,
        result.token
      );

      return result;
    } else {
      throw new CoolCommException('验证码不正确');
    }
  }

  /**
   * 手机号验证码登录
   */
  async phoneLogin(login: PhoneLoginDTO) {
    const { phone, code } = login;
    if (code !== this.coolConfig.phoneLoginCode) {
      throw new CoolCommException('验证码不正确');
    }
    const user = await this.baseSysUserEntity.findOneBy({ phone });
    if (!user) {
      throw new CoolCommException('账户或验证码不正确~');
    }
    if (user.status === 0) {
      throw new CoolCommException('账户已禁用');
    }
    const roleIds = await this.baseSysRoleService.getByUser(user.id);
    if (_.isEmpty(roleIds)) {
      throw new CoolCommException('该用户未设置任何角色，无法登录~');
    }
    const { expire, refreshExpire } = this.coolConfig.jwt.token;
    const result = {
      expire,
      token: await this.generateToken(user, roleIds, expire),
      refreshExpire,
      refreshToken: await this.generateToken(user, roleIds, refreshExpire, true),
    };
    const perms = await this.baseSysMenuService.getPerms(roleIds);
    const departments = await this.baseSysDepartmentService.getByRoleIds(
      roleIds,
      user.username === 'admin'
    );
    await this.midwayCache.set(`admin:department:${user.id}`, departments);
    await this.midwayCache.set(`admin:perms:${user.id}`, perms);
    await this.midwayCache.set(`admin:token:${user.id}`, result.token);
    await this.midwayCache.set(`admin:token:refresh:${user.id}`, result.token);
    return result;
  }

  /**
   * 验证码
   * @param width 宽
   * @param height 高
   */
  async captcha(width = 150, height = 50, color = '#fff') {
    const w = Number(width) || 150;
    const h = Number(height) || 50;
    const c = typeof color === 'string' ? color : '#fff';
    const svg = svgCaptcha.create({
      width: w,
      height: h,
      noise: 3,
    });
    const result = {
      captchaId: uuid(),
      data: svg.data.replace(/"/g, "'"),
    };
    // 文字变白（使用 replace + 全局正则，兼容无 replaceAll 的 Node 版本）
    const rpList = [
      '#111',
      '#222',
      '#333',
      '#444',
      '#555',
      '#666',
      '#777',
      '#888',
      '#999',
    ];
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rpList.forEach(rp => {
      result.data = result.data.replace(new RegExp(escapeRegex(rp), 'g'), c);
    });

    // Convert SVG to base64
    const base64Data = Buffer.from(result.data).toString('base64');
    result.data = `data:image/svg+xml;base64,${base64Data}`;

    // 半小时过期
    await this.midwayCache.set(
      `verify:img:${result.captchaId}`,
      svg.text.toLowerCase(),
      1800 * 1000
    );
    return result;
  }

  /**
   * 退出登录
   */
  async logout() {
    if (!this.coolConfig.jwt.sso) return;
    const { userId } = this.ctx.admin;
    await this.midwayCache.del(`admin:department:${userId}`);
    await this.midwayCache.del(`admin:perms:${userId}`);
    await this.midwayCache.del(`admin:token:${userId}`);
    await this.midwayCache.del(`admin:token:refresh:${userId}`);
    await this.midwayCache.del(`admin:passwordVersion:${userId}`);
  }

  /**
   * 检验图片验证码
   * @param captchaId 验证码ID
   * @param value 验证码
   */
  async captchaCheck(captchaId, value) {
    const rv = await this.midwayCache.get(`verify:img:${captchaId}`);
    if (!rv || !value || value.toLowerCase() !== rv) {
      return false;
    } else {
      this.midwayCache.del(`verify:img:${captchaId}`);
      return true;
    }
  }

  /**
   * 生成token
   * @param user 用户对象
   * @param roleIds 角色集合
   * @param expire 过期
   * @param isRefresh 是否是刷新
   */
  async generateToken(user, roleIds, expire, isRefresh?) {
    await this.midwayCache.set(
      `admin:passwordVersion:${user.id}`,
      user.passwordV
    );
    const tokenInfo = {
      isRefresh: false,
      roleIds,
      username: user.username,
      userId: user.id,
      passwordVersion: user.passwordV,
      tenantId: user['tenantId'],
    };
    if (isRefresh) {
      tokenInfo.isRefresh = true;
    }
    return jwt.sign(tokenInfo, this.coolConfig.jwt.secret, {
      expiresIn: expire,
    });
  }

  /**
   * 刷新token
   * @param token
   */
  async refreshToken(token: string) {
    if (!token || typeof token !== 'string') {
      throw new CoolCommException('登录失效~');
    }
    const decoded = jwt.verify(token, this.coolConfig.jwt.secret) as Record<string, unknown>;
    if (!decoded || !decoded['isRefresh']) {
      throw new CoolCommException('登录失效~');
    }
    delete decoded['exp'];
    delete decoded['iat'];

    const { expire, refreshExpire } = this.coolConfig.jwt.token;
    decoded['isRefresh'] = false;
    const result = {
      expire,
      token: jwt.sign(decoded, this.coolConfig.jwt.secret, {
        expiresIn: expire,
      }),
      refreshExpire,
      refreshToken: '',
    };
    decoded['isRefresh'] = true;
    result.refreshToken = jwt.sign(decoded, this.coolConfig.jwt.secret, {
      expiresIn: refreshExpire,
    });
    await this.midwayCache.set(
      `admin:passwordVersion:${decoded['userId']}`,
      decoded['passwordVersion']
    );
    await this.midwayCache.set(
      `admin:token:${decoded['userId']}`,
      result.token
    );
    return result;
  }
}
