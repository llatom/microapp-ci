import fs from 'fs'
import DEPLOY_CONFIG_DATA from './types/base-ci'
import * as path from 'path'

export default abstract class BaseCI {
  /** 传入的插件配置项 */
  protected deployConfig: DEPLOY_CONFIG_DATA
  /** 当前项目路径 */
  protected appPath: string

  /** 当前要发布的版本号 */
  protected version: string

  /** 当前发布内容的描述 */
  protected desc: string

  constructor(deployConfig: DEPLOY_CONFIG_DATA) {
    this.deployConfig = deployConfig
    this.appPath = process.cwd()
    // const appPath = process.cwd()

    const packageInfo = JSON.parse(
      fs.readFileSync(path.join(this.appPath, 'package.json'), {
        encoding: 'utf8',
      })
    )
    this.version = deployConfig.version || packageInfo.taroConfig?.version || '1.0.0'
    this.desc =
      deployConfig.desc || packageInfo.description || `CI构建自动构建于${new Date().toLocaleTimeString()}`

    this._init()
  }

  // /** 初始化函数，会被构造函数调用 */
  protected abstract _init(): void

  /** 打开小程序项目 */
  abstract open()

  /** 上传小程序 */
  abstract upload()

  /** 预览小程序 */
  abstract preview()
}
