const { buildAction, initAction, doctorAction, openAction, previewAction, uploadAction } = require('./actions')

const CLI_CONFIG = [
  {
    command: 'init',
    description: '初始化发布配置文件',
    action: initAction,
  },
  {
    command: 'doctor',
    description: '检查发布配置文件是否正确[TODO]',
    action: doctorAction,
  },
  {
    command: 'open',
    description: '构建完后自动打开开发者工具',
    action: openAction,
  },
  {
    command: 'upload',
    description: '构建完后上传代码作为体验版',
    action: uploadAction,
  },
  {
    command: 'preview',
    description: '构建完后作为开发版并生成预览二维码',
    action: previewAction,
  },
  {
    command: 'build',
    description: '构建打包压缩及触发飞书消息推送',
    action: buildAction,
  },
]

module.exports = {
  CLI_CONFIG,
}
