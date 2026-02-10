import { CoolConfig, MODETYPE } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import { CoolCacheStore } from '@cool-midway/core';
import * as path from 'path';
import { pCachePath, pUploadPath } from '../comm/path';
import { availablePort } from '../comm/port';

// redis缓存
// import { redisStore } from 'cache-manager-ioredis-yet';

export default {
  // 确保每个项目唯一，项目首次启动会自动生成
  keys: 'fc6fb10e-49f0-4d71-9cad-5e3665d6011d',
  koa: {
    port: availablePort(8001),
  },
  // 开启异步上下文管理
  asyncContextManager: {
    enable: true,
  },
  // 静态文件配置
  staticFile: {
    buffer: true,
    dirs: {
      default: {
        prefix: '/',
        dir: path.join(__dirname, '..', '..', 'public'),
      },
      static: {
        prefix: '/upload',
        dir: pUploadPath(),
      },
    },
  },
  // 文件上传
  upload: {
    fileSize: '200mb',
    whitelist: null,
  },
  // 缓存 可切换成其他缓存如：redis http://www.midwayjs.org/docs/extensions/caching
  cacheManager: {
    clients: {
      default: {
        store: CoolCacheStore,
        options: {
          path: pCachePath(),
          ttl: 0,
        },
      },
    },
  },
  // cacheManager: {
  //   clients: {
  //     default: {
  //       store: redisStore,
  //       options: {
  //         port: 6379,
  //         host: '127.0.0.1',
  //         password: '',
  //         ttl: 0,
  //         db: 0,
  //       },
  //     },
  //   },
  // },
  cool: {
    // 已经插件化，本地文件上传查看 plugin/config.ts，其他云存储查看对应插件的使用
    file: {
      mode: MODETYPE.LOCAL,
      aws: {
        accessKeyId: '',
        secretAccessKey: '',
        bucket: '',
        region: '',
      },
    },
    // 判断是否初始化的方式
    initJudge: 'db',
    // 是否开启多租户
    tenant: {
      // 是否开启多租户
      enable: true,
      // 需要过滤多租户的url, 支持通配符， 如/admin/**/* 表示admin模块下的所有接口都进行多租户过滤
      urls: ['/admin/**', '/app/**'],
      // 不进行租户过滤的用户名
      ignoreUsername: ['admin'],
    },
    // 国际化配置
    i18n: {
      // 是否开启
      enable: false,
      // 语言
      languages: ['zh-cn', 'zh-tw', 'en'],
    },
    // crud配置
    crud: {
      // 插入模式，save不会校验字段(允许传入不存在的字段)，insert会校验字段
      upsert: 'save',
      // 默认分页大小
      pageSize: 20,
      // 软删除
      softDelete: true,
    },
  } as CoolConfig,
} as MidwayConfig;
