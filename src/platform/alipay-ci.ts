/* eslint-disable no-console */
import minidev from 'minidev'
import * as path from 'path'
import fs from 'fs'
import BaseCI from '../base-ci'
import generateQrCode from '../utils/utils'
import { spinner } from '../utils/spinner'
export default class AlipayCI extends BaseCI {
  protected async _init(): Promise<void> {
    if (this.deployConfig.alipay == null) {
      throw new Error('请为"microapp-ci"插件配置 "alipay" 选项')
    }
    const { toolId, privateKeyPath: _privateKeyPath } = this.deployConfig.alipay
    const privateKeyPath = path.isAbsolute(_privateKeyPath)
      ? _privateKeyPath
      : path.join(this.appPath, _privateKeyPath)
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`"alipay.privateKeyPath"选项配置的路径不存在,本次上传终止:${privateKeyPath}`)
    }
    await minidev.config.useRuntime({
      'alipay.authentication.privateKey': fs.readFileSync(privateKeyPath, 'utf-8'),
      'alipay.authentication.toolId': toolId,
    })
  }

  open() {
    minidev.startIde({
      project: this.deployConfig.alipay!.projectPath,
      lite: true,
    })
  }

  async preview() {
    spinner.pending('正在生成支付宝小程序预览码，请稍后...')
    const previewResult = await minidev.preview({
      project: this.deployConfig.alipay!.projectPath,
      appId: this.deployConfig.alipay!.appId,
      clientType: this.deployConfig.alipay!.clientType || 'alipay',
    })
    spinner.info(`预览二维码地址： ${previewResult.qrcodeUrl}`)
    generateQrCode(previewResult.qrcodeUrl!)
    return previewResult.qrcodeUrl
  }

  async upload() {
    const clientType = this.deployConfig.alipay!.clientType || 'alipay'
    spinner.info(`上传代码到阿里小程序后台${clientType}`)
    const uploadResult = await minidev
      .upload(
        {
          appId: this.deployConfig.alipay!.appId,
          clientType,
          experience: true,
          version: this.deployConfig.alipay.version,
          project: this.deployConfig.alipay!.projectPath,
        },
        {
          onLog: (data) => {
            // 输出日志
            spinner.info(`${data}`)
          },
        }
      )
      .catch((err) => {
        spinner.error(`上传代码到阿里小程序后台${clientType}失败，请检查配置${err}`)
        throw err
      })
    return uploadResult.experienceQrCodeUrl
  }
}
