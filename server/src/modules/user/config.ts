import { ModuleConfig } from '@cool-midway/core';
import { UserMiddleware } from './middleware/app';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '用户模块',
    // 模块描述
    description: 'APP、小程序、公众号等用户',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [UserMiddleware],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 短信
    sms: {
      // 验证码有效期，单位秒
      timeout: 60 * 3,
      // 开发/测试：该手机号+验证码可直接登录并写入 user_info，不校验真实短信；生产环境请设为 null
      testPhone: '18000000000' as string | null,
      testCode: '123456' as string | null,
      // 多个测试账号（同上，跳过短信发送）；可用于绑定门店管理员等，生产请设为 []
      testAccounts: [
        { phone: '18000000000', code: '123456' },
        { phone: '18000000001', code: '123456' },
      ] as Array<{ phone: string; code: string }>,
    },
    // jwt
    jwt: {
      // token 过期时间，单位秒
      expire: 60 * 60 * 24,
      // 刷新token 过期时间，单位秒
      refreshExpire: 60 * 60 * 24 * 30,
      // jwt 秘钥
      secret: '2677645d-d7e3-493b-8696-2d1d72f121bfx',
    },
    // C端用户与后台账号自动同步配置
    sync: {
      // 是否开启自动同步
      enable: true,
      // 默认用户名前缀，实际规则：{prefix}{appUserId}[_{n}]
      usernamePrefix: 'mini_u_',
      // 同步时自动追加的默认角色标签（可为空；普通用户无需角色可设为[]）
      defaultRoleLabels: [],
      // 是否按手机号优先复用后台账号
      autoBindByPhone: true,
      // 每次登录是否同步昵称/头像/手机号到后台账号
      updateAdminProfileOnLogin: true,
      // 小程序用户默认归属的租户ID（设为数字则写入 user_info 与后台账号，租户管理员可见；不设或 null 则仅超管可见）
      defaultTenantIdForAppUser: null as number | null,
    },
  } as ModuleConfig;
};
