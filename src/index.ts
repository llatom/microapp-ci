import WeappCI from './platform/weapp-ci'
import TTCI from './platform/tt-ci'
import AlipayCI from './platform/alipay-ci'
import SwanCI from './platform/swan-ci'
import { printLog } from './utils/printLog'
import { DEPLOY_CONFIG_DATA } from './types/base-ci'

export class MiniAppCi {
  constructor(private deployConfig: DEPLOY_CONFIG_DATA) {
    this._init(this.deployConfig)
  }

  _init(deployConfig) {
    const platform = deployConfig.platform
    let ci
    switch (platform) {
      case 'weapp':
        ci = new WeappCI(deployConfig)
        break
      case 'tt':
        ci = new TTCI(deployConfig)
        break
      case 'alipay':
        ci = new AlipayCI(deployConfig)
        break
      case 'swan':
        ci = new SwanCI(deployConfig)
        break
      default:
        break
    }
    if (!ci) {
      printLog.error(`"microapp-ci" 暂不支持 "${platform}" 平台`)
      return
    } else {
      return ci
    }
  }

  async open() {
    const ci = this._init(this.deployConfig)
    ci.open()
  }

  async upload() {
    const ci = this._init(this.deployConfig)
    ci.upload()
  }

  async preview() {
    const ci = this._init(this.deployConfig)
    ci.preview()
  }
}
