import { CoolEvent, Event } from '@cool-midway/core';
import { App, ILogger, IMidwayApplication, Inject } from '@midwayjs/core';

/**
 * 接收事件
 */
@CoolEvent()
export class BaseAppEvent {
  @App()
  app: IMidwayApplication;

  @Inject()
  logger: ILogger;

  @Event('onServerReady')
  async onServerReady() {
    const port = this.app.getConfig('koa.port') || 8001;
    const url = `http://0.0.0.0:${port}`;
    this.logger.info('Server is running at %s', url);

    // 仅 pkg 打包后的本地运行时自动打开浏览器
    if (process['pkg']) {
      const { exec } = require('child_process');
      let command: string;
      switch (process.platform) {
        case 'darwin':
          command = `open http://127.0.0.1:${port}`;
          break;
        case 'win32':
          command = `start http://127.0.0.1:${port}`;
          break;
        default:
          command = `xdg-open http://127.0.0.1:${port}`;
          break;
      }
      exec(command, (error: unknown) => {
        if (!error) this.logger.info('Application opened in browser');
      });
    }
  }
}
