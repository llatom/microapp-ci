import BaseCI from './base-ci'
/** 文档地址： https://opendocs.alipay.com/mini/02q17h*/
export default class AlipayCI extends BaseCI {
  protected _init(): void
  open(): void
  upload(): Promise<void>
  preview(): Promise<void>
}
