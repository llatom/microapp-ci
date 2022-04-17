// /* eslint-disable no-console */
import * as path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import rp from 'request-promise'
import pushNotice from './notice/notice'
import WeappCI from './platform/weapp-ci'
import TTCI from './platform/tt-ci'
import AlipayCI from './platform/alipay-ci'
import SwanCI from './platform/swan-ci'
import { spinner } from './utils/spinner'
import { DEPLOY_CONFIG_DATA } from './types/base-ci'

export class MicroAppCi {
  microappCiArr: any[]
  constructor(private deployConfig: DEPLOY_CONFIG_DATA) {
    this.microappCiArr = this._init(this.deployConfig)
  }

  _init(deployConfig) {
    const platforms = deployConfig.platforms
    let microappCiArr: Array<any> = []
    platforms.forEach(platform => {
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
        spinner.error(`"microapp-ci" 暂不支持 "${platform}" 平台`)
        return
      } else {
        microappCiArr.push({ platform: platform, ci: ci })
      }
    })
    return microappCiArr
  }

  async build(platforms, env) {
    let tasks: Array<Promise<any>> = []
    platforms.forEach(platform => {
      const logFilePath = path.join(process.cwd(), `build_${platform}.log`)
      const stream = fs.createWriteStream(logFilePath)
      const platformText = platform === 'weapp' ? '微信' : platform === 'alipay' ? '支付宝' : platform === 'swan' ? '百度' : '字节'
      spinner.pending(`正在编译${platformText}小程序，请稍后...`)
      const cmd = `taro build --type ${platform}`
      const proc = spawn('npx', cmd.split(' '), {
        env: {
          ...process.env,
          ...env
        }
      })
      const promise = new Promise((resolve, reject) => {
        proc.stdout.setEncoding('utf-8')
        proc.stdout.on('data', (data: string) => {
          let str = data
          if (data && data.length > 50) {
            str = data.substring(0, 50) + '...'
          }
          stream.write(data)
          spinner.info(`[${platformText}]标准输出: -> ${str}`.trim())
        })

        proc.stderr.setEncoding('utf-8')
        proc.stderr.on('data', data => {
          let str = data
          if (data && data.length > 50) {
            str = data.substring(0, 50) + '...'
          }
          stream.write(data)
          spinner.info(`[${platformText}]标准输出: -> ${str}`.trim())
        })

        proc.on('error', e => {
          spinner.warn(`error: ${e.message}`)
          reject(e)
        })

        proc.on('close', code => {
          if (code !== 0) {
            spinner.warn(`编译失败. 请查看日志 ${logFilePath}`)
            reject(`Exit code: ${code}`)
          } else {
            spinner.success(`${cmd}编译完成！`)
            resolve(code)
          }
        })
      })
      tasks.push(promise)
    })

    await Promise.all(tasks)
  }

  async open() {
    this.microappCiArr.forEach(item => {
      item.ci.open()
    })
  }

  async upload() {
    await this.build(this.deployConfig?.platforms, this.deployConfig?.env)
    this.microappCiArr.forEach(async item => {
      item.ci.upload()
    })
  }

  async preview() {
    await this.build(this.deployConfig?.platforms, this.deployConfig?.env)
    this.microappCiArr.forEach(async item => {
      await item.ci.preview()
      await this.pushNoticeMsg(this.deployConfig.imgKey, false, item.platform)
    })
  }

  async pushNoticeMsg(imgKey, isExperience, platform) {
    if (!imgKey) {
      spinner.error('缺少二维码，不推送飞书消息')
      return
    }

    if (!this.deployConfig.webhookUrl) {
      spinner.error('缺少 webhookUrl 配置，不推送飞书 消息')
      return
    }

    const options = {
      imgKey,
      isExperience,
      platform,
      webhookUrl: this.deployConfig.webhookUrl
    }
    await pushNotice(options)
  }

  async getTenantAccessToken() {
    const baseUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
    var options = {
      uri: baseUrl,
      body: {
        app_id: this.deployConfig.feishu_app_id,
        app_secret: this.deployConfig.feishu_app_secret
      },
      json: true,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    }
    const result = await rp(options)
    if (result.code == 0) {
      return result.tenant_access_token
    } else {
      spinner.error(result.msg)
    }
  }

  async uploadImage(qr_img_url) {
    const baseUrl = 'https://open.feishu.cn/open-apis/image/v4/put/'
    const token = await this.getTenantAccessToken()
    var options = {
      uri: baseUrl,
      data: {
        image_type: 'message',
        image: qr_img_url
      },
      json: true,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      stream: true
    }

    const resp = await rp(options)
    resp.raise_for_status()
    const content = resp.json()
    if (content.code == 0) {
      return content
    } else {
      spinner.error(content.msg)
    }
  }
}
