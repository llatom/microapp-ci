// /* eslint-disable no-console */
import * as path from 'path'
import fs from 'fs'
import pushNotice from './notice/notice'
import WeappCI from './platform/weapp-ci'
import TTCI from './platform/tt-ci'
import AlipayCI from './platform/alipay-ci'
import SwanCI from './platform/swan-ci'
import { printLog } from './utils/printLog'
import { DEPLOY_CONFIG_DATA } from './types/base-ci'
const { spawn } = require('child_process')
import rp from 'request-promise'


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

  async build() {
    const {env, platform} = this.deployConfig
    const platformText = platform === 'weapp' ? '微信' : platform === 'alipay' ? '支付宝' : platform === 'swan' ? '百度' : '字节'
    printLog.pending(`正在编译${platformText}小程序，请稍后...`)
    const logFilePath = path.join(process.cwd() , 'build_alipay.log')
    const stream = fs.createWriteStream(logFilePath)
    return new Promise<void>((resolve, reject) => {
      const cmd = `taro build --type ${platform}`
      const proc = spawn('npx', cmd.split(' '), {
        env: {
          ...process.env,
          ...env
        }
      })
      proc.stdout.on('data', data => {
        stream.write(data)
      })

      proc.stderr.on('data', data => {
        stream.write(data)
      })

      proc.on('error', (e) => {
        printLog.error(`error: ${ e.message }`)
        reject(e)
      })

      proc.on('close', code => {
        if (code !== 0) {
          printLog.error(`Failed building. See ${ logFilePath }`)
          reject(`Exit code: ${ code }`)
        } else {
          printLog.success('编译完成')
          resolve()
        }
      })
    })
  }

  async open() {
    const ci = this._init(this.deployConfig)
    ci.open()
  }

  async upload() {
    await this.build()
    const ci = this._init(this.deployConfig)
    ci.upload()
    await this.pushNoticeMsg("", "", true)
  }

  async preview() {
    await this.build()
    // await this.getTenantAccessToken()
    const ci = this._init(this.deployConfig)
    ci.preview()
    // await this.uploadImage('./test.jpg')
    await this.pushNoticeMsg(this.deployConfig.imgKey, false)
  }

  async pushNoticeMsg(imgKey, isExperience) {
    if (!imgKey) {
      printLog.error('缺少二维码，不推送飞书消息')
      return
    }
  
    if (!this.deployConfig.webhookUrl) {
      printLog.error('缺少 webhookUrl 配置，不推送飞书 消息')
      return
    }
  
    const options = {
      imgKey,
      isExperience,
      webhookUrl: this.deployConfig.webhookUrl,
      platform: this.deployConfig.platform
    }
    await pushNotice(options)
  }

  async getTenantAccessToken() {
    const baseUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
    var options = {
      uri: baseUrl,
      body: {
        app_id: this.deployConfig.app_id,
        app_secret: this.deployConfig.app_secret
      },
      json: true,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    }
    const result = await rp(options)
    if(result.code == 0) {
      return result.tenant_access_token
    }else{
      printLog.error(result.msg)
    }
  }

  async uploadImage(qr_img_url) {
    const baseUrl = 'https://open.feishu.cn/open-apis/image/v4/put/'
    const token = await this.getTenantAccessToken()
    var options = {
      uri: baseUrl,
      data: {
        "image_type": "message",
        "image": qr_img_url
      },
      json: true,
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      stream: true
    }

    const resp = await rp(options)
    resp.raise_for_status()
    const content = resp.json()
    if(content.code == 0) {
      return content
    }else{
      printLog.error(content.msg)
    }
  }
}
