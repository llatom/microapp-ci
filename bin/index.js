#!/usr/bin/env node
const { program } = require('commander')
const { CLI_CONFIG } = require('./cli.js')
const packageJson = require('../package.json')

program
  .version(packageJson.version)
  .option('-a, --buildAction', '可选项[preview, upload]，执行preview生成预览码，upload上传体验版，默认preview')
  .option('-e, --buildEnv', '可选项[test, prod]，test打包测试环境，prod打包生产环境，默认test')
  .option(
    '-t, --type',
    '可选项[weapp, weqy, alipay, tt, swan, jd]，微信小程序，企业微信小程序，支付宝小程序，字节小程序，百度小程序，京东小程序，默认weapp'
  )

for (let item of CLI_CONFIG) {
  program.command(item.command).description(item.description).action(item.action)
}

program.parse(process.argv)
