import rp from 'request-promise'
import { getLatestCommitMsg } from '../utils/utils'
const Dayjs = require('dayjs')
const HOSTNAME = require('os').hostname()

async function pushNotice(
  options = {
    imgKey: '',
    isExperience: true,
    webhookUrl: '',
    platform: '',
  }
) {
  const { imgKey, isExperience, webhookUrl, platform } = options
  const qrImg = imgKey
  const gitInfo = getLatestCommitMsg(process.cwd())
  const platformText =
    platform === 'weapp' ? '微信' : platform === 'alipay' ? '支付宝' : platform === 'swan' ? '百度' : '字节'
  const uploadType = isExperience ? '体验版' : '预览版'
  const postBody = {
    zh_cn: {
      title: `${platformText}${uploadType}小程序构建完成`,
      content: [
        [
          {
            tag: 'text',
            un_escape: true,
            text: `构建时间: ${new Dayjs().format('MM-DD HH:mm')}`,
          },
        ],
        [
          {
            tag: 'text',
            un_escape: true,
            text: `构建机器：${HOSTNAME}`,
          },
        ],
        [
          {
            tag: 'text',
            un_escape: true,
            text: `${gitInfo}`,
          },
        ],
        [
          {
            tag: 'img',
            image_key: qrImg,
            width: 300,
            height: 300,
          },
        ],
      ],
    },
  }

  await sendWebhook()
  async function sendWebhook() {
    const baseUrl = webhookUrl
    const options = {
      method: 'POST',
      uri: baseUrl,
      body: {
        msg_type: 'post',
        content: {
          post: postBody,
        },
      },
      json: true, // Automatically stringifies the body to JSON
    }
    const result = await rp(options)
    return result
  }
}

export default pushNotice
