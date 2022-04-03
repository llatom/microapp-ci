// /* eslint-disable no-console */
import * as path from 'path'
import fs from 'fs'
const { spawn } = require('child_process')
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
  }

  async preview() {
    await this.build()
    const ci = this._init(this.deployConfig)
    ci.preview()
  }
}
