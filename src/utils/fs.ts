import fs from 'fs'
import path from 'path'
import DEFAULT_CONFIG_DATA from '../schemas/default-deploy-config.json'
import { printLog } from './printLog'
import { validateConfigData } from './json-schema'
import DeployOptions from '../types/base-ci'

const CONFIG_FILE_NAME = 'deploy.config.json'

export function checkDeployConfigFile(rootDir: string): DeployOptions | null {
  try {
    const data = fs.readFileSync(path.join(rootDir, CONFIG_FILE_NAME), { encoding: 'utf-8' })
    const configJson = JSON.parse(data)

    // 对配置文件做运行时校验
    // const result = validateConfigData(configJson);

    // // 校验失败，数据不符合预期
    // if (!result.valid) {
    //     printLog.error(`${CONFIG_FILE_NAME} check failed \n${result.errors.map((item) => item.toString()).join('\n')}`);
    //     return null;
    // }

    // printLog.success(`${CONFIG_FILE_NAME} check passed`);
    return JSON.parse(data)
  } catch (err: any) {
    printLog.error(err.message)
    printLog.info(`请运行 "microapp-ci init"初始化配置文件`)
    return null
  }
}

export function writeDeployConfigFile(rootDir: string) {
  fs.writeFileSync(path.join(rootDir, CONFIG_FILE_NAME), JSON.stringify(DEFAULT_CONFIG_DATA, null, 2), { encoding: 'utf-8' })
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

export function bytesToSize(bytes: number) {
  if (bytes === 0) {
    return '0 B'
  }
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}
