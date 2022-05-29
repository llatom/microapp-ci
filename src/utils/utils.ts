import { spinner } from './spinner'
import simpleGit from 'simple-git'

/**
 * 获取buildEnv： preview | upload
 */
export function getBuildAction() {
  const { argv } = process
  const allowBuildAction = ['preview', 'upload']
  const idxParam = argv.indexOf('--buildAction')

  const buildction = argv[idxParam + 1]
  if (buildction && allowBuildAction.includes(buildction)) {
    return buildction
  }
  return allowBuildAction[0]
}

/**
 * 获取buildEnv： weapp | weqy | alipay | swan | tt | jd
 */
export function getBuildPlatform() {
  const { argv } = process
  const allowBuildPlatform = ['weapp', 'weqy', 'alipay', 'swan', 'tt', 'jd']
  const idxParam = argv.indexOf('--type')

  const input = argv[idxParam + 1]
  const platforms = input.split(',')
  if (platforms.length > 0) {
    for (const platform of platforms) {
      if (allowBuildPlatform.includes(platform)) {
        return platforms
      }
    }
  }
  return allowBuildPlatform[0]
}

/**
 * 获取buildEnv： test | prod
 */
export function getBuildEnv() {
  const { argv } = process
  const allowBuildEnv = ['test', 'prod']
  const idxParam = argv.indexOf('--buildEnv')

  const env = argv[idxParam + 1]
  if (env && allowBuildEnv.includes(env)) {
    return env
  }
  return allowBuildEnv[0]
}

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
  const qrCodeType = isExperience ? '体验' : '预览'
  switch (action) {
    case 'buildUrl':
      actionName = '点击下载小程序构建包'
      break
    case 'weappQrCodeUrl':
      actionName = `查看微信小程序${qrCodeType}码`
      break
    case 'alipayQrCodeUrl':
      actionName = `查看支付宝小程序${qrCodeType}码`
      break
    case 'jdQrCodeUrl':
      actionName = `查看京东小程序${qrCodeType}码`
      break
    case 'swanQrCodeUrl':
      actionName = `戳我跳转百度小程序${qrCodeType}版`
      break
    case 'ttQrCodeUrl':
      actionName = `戳我跳转字节小程序${qrCodeType}版`
      break
  }
  return actionName
}
