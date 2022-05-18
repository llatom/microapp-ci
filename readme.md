# microapp-ci

> Taro 小程序端构建后支持 CI（持续集成）的脚手架， 集成微信，支付宝，百度，字节 CI（持续集成）的插件，支持构建完毕后自动打开小程序开发这个工具、上传作为体验版、生成预览二维码。通过脚手架工具 microapp-ci 执行预定义的脚本文件，实现根据 commit msg 生成版本信息，推送提测信息到相关群组。

### 安装

---

建议在全局安装 microapp-ci

```
npm i microapp-ci -g
```

### 使用

---

命令行使用

```
Usage: microapp-ci [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init            初始化发布配置文件
  doctor          检查发布配置文件是否正确
  open            构建完后自动打开开发者工具
  upload          构建完后上传代码作为体验版
  preview         构建完后作为开发版并生成预览二维码
  upload:all      自动完成多平台构建上传体验版
  preview:all     自动完成多平台构建预览
  help [command]  display help for command

```
