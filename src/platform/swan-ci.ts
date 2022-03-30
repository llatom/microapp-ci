/* eslint-disable no-console */
import * as shell from 'shelljs'
import * as path from 'path'
import BaseCI from '../base-ci'
import generateQrCode from '../utils/qr-code'
import { printLog } from '../utils/printLog'
export default class SwanCI extends BaseCI {
  private swanBin = path.resolve(require.resolve('swan-toolkit'), '../../.bin/swan')

  protected _init(): void {
    if (this.deployConfig.swan == null) {
      throw new Error('请为"microapp-ci"插件配置 "swan" 选项')
    }
  }

  open() {
    printLog.error('百度小程序不支持 "--open" 参数打开开发者工具')
  }

  async preview() {
    const outputPath = this.deployConfig.alipay.projectPath
    printLog.info('预览百度小程序')
    shell.exec(
      `${this.swanBin} preview --project-path ${outputPath} --token ${this.deployConfig.swan!.token} --min-swan-version ${
        this.deployConfig.swan!.minSwanVersion || '3.350.6'
      } --json`,
      (_code, stdout, stderr) => {
        if (!stderr) {
          stdout = JSON.parse(stdout)
          printLog.info(`在线预览地址： ${stdout.list[0].url}`)
          generateQrCode(stdout.list[0].url)
        }
      }
    )
  }

  async upload() {
    const outputPath = this.deployConfig.alipay.projectPath
    printLog.info('上传体验版代码到百度后台')
    printLog.info(`本次上传版本号为："${this.version}"，上传描述为：“${this.desc}”`)
    shell.exec(
      `${this.swanBin} upload --project-path ${outputPath} --token ${this.deployConfig.swan!.token} --release-version ${
        this.version
      } --min-swan-version ${this.deployConfig.swan!.minSwanVersion || '3.350.6'} --desc ${this.desc} --json`,
      (_code, _stdout, stderr) => {
        if (!stderr) {
          printLog.success(`上传成功 ${new Date().toLocaleString()}`)
        }
      }
    )
  }
}
