import rp from 'request-promise'
import { getLatestCommitMsg } from '../utils/utils'
const { execSync } = require('child_process')
const Dayjs = require('dayjs')
const HOSTNAME = require('os').hostname()

async function pushNotice(
  options = {
    imgKey: '',
    isExperience: true,
    webhookUrl: '',
  }
) {
  const { imgKey, isExperience, webhookUrl } = options
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', options).toString().trim()
  const commitMsgs = await getLatestCommitMsg(process.cwd())
  const uploadType = isExperience ? '体验版' : '预览版'
  const cardBody = {
    elements: [
      {
        fields: [
          {
            is_short: true,
            text: {
              content: '**👤 相关人员：**\n<at id=all>所有人</at> ',
              tag: 'lark_md',
            },
          },
          {
            is_short: true,
            text: {
              content: `**💻 构建机器：**\n ${HOSTNAME}`,
              tag: 'lark_md',
            },
          },
        ],
        tag: 'div',
      },
      {
        fields: [
          {
            is_short: true,
            text: {
              content: `**🔀 当前分支：**\n ${branchName}`,
              tag: 'lark_md',
            },
          },
          {
            is_short: true,
            text: {
              content: `**📅  构建时间：**\n ${new Dayjs().format('MM-DD HH:mm')}`,
              tag: 'lark_md',
            },
          },
        ],
        tag: 'div',
      },
      {
        fields: [
          {
            is_short: true,
            text: {
              content: `**📚 最近更新：**\n ${commitMsgs}`,
              tag: 'lark_md',
            },
          },
        ],
        tag: 'div',
      },
      {
        actions: [
          {
            tag: 'button',
            text: {
              content: '点击下载构建包',
              tag: 'plain_text',
            },
            url: '',
            type: 'primary',
            value: {},
          },
          // {
          //   tag: 'button',
          //   text: {
          //     content: '点击查看微信体验码',
          //     tag: 'plain_text',
          //   },
          //   url: '',
          //   type: 'primary',
          //   value: {},
          // },
          // {
          //   tag: 'button',
          //   text: {
          //     content: '点击查看京东体验码',
          //     tag: 'plain_text',
          //   },
          //   url: '',
          //   type: 'primary',
          //   value: {},
          // },
        ],
        tag: 'action',
      },
    ],
    header: {
      template: 'blue',
      title: {
        content: `📪 ${uploadType}小程序构建完成`,
        tag: 'plain_text',
      },
    },
  }

  await sendWebhook()
  async function sendWebhook() {
    const baseUrl = webhookUrl
    const options = {
      method: 'POST',
      uri: baseUrl,
      body: {
        msg_type: 'interactive',
        card: cardBody,
      },
      json: true, // Automatically stringifies the body to JSON
    }
    const result = await rp(options)
    return result
  }
}

export default pushNotice
