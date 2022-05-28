import { spinner } from './spinner'
import simpleGit from 'simple-git'

export async function getLatestCommitMsg(baseDir: string) {
  const git = simpleGit(baseDir)

  const { latest } = await git.log({ n: 3 })
  return latest?.message || ''
}

export function handleProgress(taskStatus) {
  let msg = taskStatus._msg

  if (msg) {
    const isWxmlTask = /(\/|json|wxss|wxml|js)/.test(msg)
    msg = isWxmlTask ? `[Compile] ${msg}` : msg

    if (taskStatus._status === 'done') {
      spinner.success(msg)
    } else {
      spinner.pending(msg)
    }
  }
}

export function getActionName(action, isExperience) {
  let actionName = ''
  const qrCodeType = isExperience ? '体验码' : '预览码'
  switch (action) {
    case 'buildUrl':
      actionName = '点击下载小程序构建包'
      break
    case 'weappQrCodeUrl':
      actionName = `查看微信小程序${qrCodeType}`
      break
    case 'alipayQrCodeUrl':
      actionName = `查看支付宝小程序${qrCodeType}`
      break
    case 'swanQrCodeUrl':
      actionName = `查看百度小程序${qrCodeType}`
      break
    case 'ttQrCodeUrl':
      actionName = `查看字节小程序${qrCodeType}`
      break
    case 'jdQrCodeUrl':
      actionName = `查看京东小程序${qrCodeType}`
      break
  }
  return actionName
}
