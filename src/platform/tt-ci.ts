/* eslint-disable no-console */
import * as tma from 'tt-ide-cli'
import * as cp from 'child_process'
import * as fs from 'fs'
import BaseCI from '../base-ci'
import { spinner } from '../utils/spinner'

// previewResult 返回值
interface ProjectQRCode {
  expireTime: number // 二维码过期时间
  shortUrl: string // 二维码短链
  originSchema: string // 二维码 schema
  qrcodeSVG?: string // 二维码 SVG
  qrcodeFilePath?: string // 二维码存储路径
  useCache: boolean // 是否命中并使用缓存
}

export default class TTCI extends BaseCI {
  async _init() {
    if (this.deployConfig.tt == null) {
      spinner.error('请为"microapp-ci"插件配置 "tt" 选项')
    }
  }

  async _beforeCheck() {
    await tma.loginByEmail({ email: this.deployConfig.tt?.email, password: this.deployConfig.tt?.password })
    return await tma.checkSession()
  }

  open() {
    const projectPath = this.deployConfig.tt.projectPath
    const isMac = process.platform === 'darwin'
    const IDE_SCHEMA = 'bytedanceide:'
    const openCmd = isMac ? `open ${IDE_SCHEMA}` : `explorer ${IDE_SCHEMA}`
    if (fs.existsSync(projectPath)) {
      spinner.info(`打开字节跳动小程序项目 ${projectPath}`)
      const openPath = `${openCmd}?path=${projectPath}`
      cp.exec(openPath, (error) => {
        if (!error) {
          spinner.success(`打开IDE ${openPath} 成功`)
        } else {
          spinner.error(`打开IDE失败, ${error}`)
        }
      })
    } else {
      spinner.info('打开IDE')
      cp.exec(openCmd, (error) => {
        if (!error) {
          spinner.success('打开IDE成功')
        } else {
          spinner.error(`打开IDE失败, ${error}`)
        }
      })
    }
  }

  async preview() {
    const projectPath = this.deployConfig.tt.projectPath
    const isLogin = await this._beforeCheck()
    if (!isLogin) return
    try {
      spinner.info('预览字节跳动小程序')
      const previewResult: ProjectQRCode = await tma.preview({
        project: {
          path: projectPath, // 项目地址
        },
        page: {
          path: '', // 小程序打开页面
          query: '', // 小程序打开 query
          scene: '', // 小程序打开场景值
          launchFrom: '', // 小程序打开场景（未知可填空字符串）
          location: '', // 小程序打开位置（未知可填空字符串）
        },
        qrcode: {
          format: 'terminal', // imageSVG | imageFile | null | terminal
          options: {
            small: true, // 使用小二维码，主要用于 terminal
          },
        },
        cache: false, // 是否使用缓存
        copyToClipboard: true, // 是否将产出的二维码链接复制到剪切板
      })
      spinner.success(`二维码预览地址 ${previewResult.shortUrl}`)
    } catch (error: any) {
      spinner.error(`预览失败 ${new Date().toLocaleString()} \n${error.message}`)
    }
  }

  async upload() {
    const isLogin = await this._beforeCheck()
    if (!isLogin) return
    const projectPath = this.deployConfig.tt.projectPath
    try {
      spinner.info('上传代码到字节跳动后台')
      spinner.info(`本次上传版本号为："${this.version}"，上传描述为：“${this.desc}”`)
      const uploadResult: ProjectQRCode = await tma.upload({
        project: {
          path: projectPath, // 项目地址
        },
        qrcode: {
          format: 'terminal', // imageSVG | imageFile | null | terminal
          output: '', // 只在 imageFile 生效，填写图片输出绝对路径
          options: {
            small: false, // 使用小二维码，主要用于 terminal
          },
        },
        copyToClipboard: true, // 是否将产出的二维码链接复制到剪切板
        changeLog: this.desc, // 上传描述
        version: this.version, // 上传版本号
        needUploadSourcemap: true, // 是否上传后生成 sourcemap，推荐使用 true，否则开发者后台解析错误时将不能展示原始代码
      })
      spinner.success(`二维码预览地址 ${uploadResult.shortUrl}`)
    } catch (error: any) {
      spinner.error(`上传失败 ${new Date().toLocaleString()} \n${error.message}`)
    }
  }
}
