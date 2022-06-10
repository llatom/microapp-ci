import { WeappConfig, TTConfig, SwanConfig, AlipayConfig, noticeCardConfig } from './base-ci'
export declare type PlatformsType = 'weapp' | 'weqy' | 'alipay' | 'tt' | 'jd' | 'swan'
export interface DEPLOY_CONFIG_DATA {
  /** 微信小程序CI配置, 官方文档地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html */
  weapp?: WeappConfig
  /** 字节小程序配置, 官方文档地址：https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/developer-instrument/development-assistance/ide-order-instrument */
  tt?: TTConfig
  /** 支付宝系列小程序配置，官方文档地址： https://opendocs.alipay.com/mini/02q17h */
  alipay?: AlipayConfig
  /** 百度小程序配置, 官方文档地址：https://smartprogram.baidu.com/docs/develop/devtools/commandtool/ */
  swan?: SwanConfig
  /** 推送消息卡片配置 */
  noticeCardConfig: noticeCardConfig
  /** base url */
  deployBaseUrl: string
  /** 微信体验码默认地址 */
  defaultWeappQrUrl: string
  /** 京东小程序体验码默认地址 */
  defaultJdQrUrl: string
  /** 打包环境, 默认取env.config的 env字段 */
  env: string
  /** 飞书机器人webhookUrl 默认为'' */
  webhookUrl: string
  /** 发布版本号，默认取 package.json 文件的 taroConfig.version 字段 */
  version: string
  /** 是否根据日期生成版本号 */
  isGenerateVersion: boolean
  /** 当前主版本号 */
  majorVersion: string
  /** 版本发布描述， 默认取 package.json 文件的 taroConfig.desc 字段 */
  desc: string
  /** 打包平台，默认为[] */
  platforms: Array<PlatformsType>
}
