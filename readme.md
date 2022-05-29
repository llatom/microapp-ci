# microapp-ci

> microapp-ci 是在taro提供的插件[taro-plugin-mini-ci][1]基础上实现的命令行工具，目的是实现多平台小程序构建、提测、发布流程自动化，目前暂时仅支持微信、字节、支付宝、百度小程序。
 
 - 支持构建完毕后自动打开小程序开发这个工具、上传作为体验版、生成预览二维码
 - 通过命令行工具 microapp-ci 执行预定义的命令，把根据 commit msg 生成的版本描述，各平台命令行工具生成的预览码、体验码及构建压缩包等提测/发布信息，通过webhook推送到相关（飞书，钉钉）群组。

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
  -V, --version      output the version number
  -a, --buildAction  可选项[preview, upload]，执行preview生成预览码，upload上传体验版，默认preview
  -e, --buildEnv     可选项[test, prod]，test打包测试环境，prod打包生产环境，默认test
  -t, --type         可选项[weapp, weqy, alipay, tt, swan, jd]，微信小程序，企业微信小程序，支付宝小程序，字节小程序，百度小程序，京东小程序，默认weapp
  -h, --help         display help for command

Commands:
  init               初始化发布配置文件
  doctor             检查发布配置文件是否正确
  open               构建完后自动打开开发者工具
  upload             构建完后上传代码作为体验版
  preview            构建完后作为开发版并生成预览二维码
  build              构建打包压缩并完成消息推送
  help [command]     display help for command

```


  [1]: https://github.com/NervJS/taro/tree/next/packages/taro-plugin-mini-ci