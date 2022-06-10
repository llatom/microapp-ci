import fs from 'fs'
import path from 'path'
import { spinner } from './spinner'
import simpleGit from 'simple-git'
import { validateConfigData } from './json-schema'
import { DEPLOY_CONFIG_DATA } from '../types/config-json'
import DEFAULT_CONFIG_DATA from '../schemas/default-deploy-config.json'
const Dayjs = require('dayjs')
const CONFIG_FILE_NAME = 'deploy.config.json'

export function checkDeployConfigFile(rootDir: string): DEPLOY_CONFIG_DATA | null {
  try {
    const data = fs.readFileSync(path.join(rootDir, CONFIG_FILE_NAME), { encoding: 'utf-8' })
    const configJson = JSON.parse(data)

    // 对配置文件做运行时校验
    const result = validateConfigData(configJson)

    // 校验失败，数据不符合预期
    if (!result?.valid) {
      spinner.error(
        `${CONFIG_FILE_NAME} check failed \n${result?.errors.map((item) => item.toString()).join('\n')}`
      )
      return null
    }
    spinner.success(`${CONFIG_FILE_NAME} check success`)
    return JSON.parse(data)
  } catch (err: any) {
    spinner.error(`${err.message} check failed`)
    spinner.info('请运行"microapp-ci init" 初始化配置文件')
    return null
  }
}

export function writeDeployConfigFile(rootDir: string) {
  fs.writeFileSync(path.join(rootDir, CONFIG_FILE_NAME), JSON.stringify(DEFAULT_CONFIG_DATA, null, 2), {
    encoding: 'utf-8',
  })
}

export function getProjectConfig(miniprogramWorkspack: string) {
  try {
    const data = fs.readFileSync(path.join(miniprogramWorkspack, 'project.config.json'), { encoding: 'utf-8' })
    return JSON.parse(data)
  } catch (e) {
    console.log(e)
    return null
  }
}

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

export function handleGenerateVersionByDate() {
  const date = Dayjs().format('YYMMDDHHMM')
  return date
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
    case 'weqyQrCodeUrl':
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

export function convertPlatformToText(platform) {
  let platformText = ''
  switch (platform) {
    case 'weapp':
    case 'weqy':
      platformText = '微信'
      break
    case 'alipay':
      platformText = '支付宝'
      break
    case 'swan':
      platformText = '百度'
      break
    case 'tt':
      platformText = '字节'
      break
    case 'jd':
      platformText = '京东'
      break
  }
  return platformText
}

/**
 * 生产二维码输出到控制台
 * @param url 链接地址
 */
export default function generateQrCode(url: string) {
  require('qrcode-terminal').generate(url, { small: true })
}
