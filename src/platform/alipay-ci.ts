/* eslint-disable no-console */
import * as miniu from 'miniu'
import * as path from 'path'
import fs from 'fs'
import BaseCI from '../base-ci'
import generateQrCode from '../utils/qr-code'
import { printLog } from '../utils/printLog'
export default class AlipayCI extends BaseCI {
  protected _init(): void {
    if (this.deployConfig.alipay == null) {
      throw new Error('请为"microapp-ci"插件配置 "alipay" 选项')
    }
    const { toolId, privateKeyPath: _privateKeyPath, proxy } = this.deployConfig.alipay
    const privateKeyPath = path.isAbsolute(_privateKeyPath) ? _privateKeyPath : path.join(this.appPath, _privateKeyPath)
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`"alipay.privateKeyPath"选项配置的路径不存在,本次上传终止:${privateKeyPath}`)
    }

    miniu.setConfig({
      toolId,
      privateKey: fs.readFileSync(privateKeyPath, 'utf-8'),
      proxy
    })
  }

  open() {
    printLog.error('阿里小程序不支持 "--open" 参数打开开发者工具')
  }

  async preview() {
    printLog.pending(`正在生成支付宝小程序预览码，请稍后...`)
    const previewResult = await miniu.miniPreview({
      project: this.deployConfig.alipay!.projectPath,
      appId: this.deployConfig.alipay!.appId,
      clientType: this.deployConfig.alipay!.clientType || 'alipay',
      qrcodeFormat: 'base64'
    })
    printLog.info(`预览二维码地址： ${previewResult.packageQrcode}`)
    generateQrCode(previewResult.packageQrcode!)
  }

  async upload() {
    const clientType = this.deployConfig.alipay!.clientType || 'alipay'
    printLog.info('上传代码到阿里小程序后台', clientType)
    // 上传结果CI库本身有提示，故此不做异常处理
    // TODO 阿里的CI库上传时不能设置“禁止压缩”，所以上传时被CI二次压缩代码，可能会造成报错，这块暂时无法处理; SDK上传不支持设置描述信息
    const result = await miniu.miniUpload({
      project: this.deployConfig.alipay!.projectPath,
      appId: this.deployConfig.alipay!.appId,
      packageVersion: this.version,
      clientType,
      experience: true,
      onProgressUpdate(info) {
        const { status, data } = info
        printLog.info(`${status} ${data}`)
      }
    })
    if (result.packages) {
      const allPackageInfo = result.packages.find(pkg => pkg.type === 'FULL')
      const mainPackageInfo = result.packages.find(item => item.type === 'MAIN')
      const extInfo = `本次上传${allPackageInfo!.size} ${mainPackageInfo ? ',其中主包' + mainPackageInfo.size : ''}`
      printLog.success(`上传成功 ${new Date().toLocaleString()} ${extInfo}`)
    }
  }
}
