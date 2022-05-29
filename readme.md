# microapp-ci

> microapp-ci 是在taro提供的插件[taro-plugin-mini-ci][1]基础上实现的命令行工具，目的是实现多平台小程序构建、提测、发布流程自动化，目前暂时仅支持微信、字节、支付宝、百度小程序。
 
 - 支持构建完毕后自动打开小程序开发这个工具、上传作为体验版、生成预览二维码
 - 通过命令行工具 microapp-ci 执行预定义的命令，把根据 commit msg 生成的更新描述，各平台小程序命令行工具生成的预览码、体验码及构建压缩包等提测/发布信息，通过webhook推送到飞书群组。(也可fork稍作调整适配钉钉消息推送)

### 安装
---
#### 方式一： 全局安装 microapp-ci
```
npm i microapp-ci -g
```

#### 方式二：本地安装
```
npm i microapp-ci -D
```

### 使用
####  构建完后打开开发者工具
```
microapp-ci open  
```
#### 预览版构建:
构建小程序并生成预览二维码
```
microapp-ci preview  
```
#### 体验版发布：
构建小程序并完成上传体验版，同时生成体验二维码
```
microapp-ci upload 
```
上述命令因有用户交互，需用户选择构建平台，构建环境等信息，所以仅适用本地命令行使用。
 - 因各平台小程序差异性，如微信命令行ci工具返回的二维码链接无法查看.
 - 测试同学需要小程序包进行多场景测试，需提供构建压缩包
 - 依然依赖研发同学命令行执行，不能结合现有的流水线完全解放研发生产力
 
基于以上考虑，又提供了`build`命令

---

#### 构建打包压缩并完成消息推送
```
microapp-ci build 
```
可结合通用的业务发布流水线，完成构建部署上传。可支持构建zip文件下载。保存本地的二维码访问等。

e.g.
```microapp-ci build --type weapp,swan,alipay --buildEnv test --buildAction preview```

命令行使用
```
Usage: microapp-ci [options] [command]

Options:
  -a, --buildAction 可选项[preview,upload]，执行preview生成预览码，upload上传体验版，默认preview
  -e, --buildEnv 可选项[test,prod]，test打包测试环境，prod打包生产环境，默认test
  -t, --type 可选项[weapp,weqy,alipay,tt,swan,jd]，微信小程序，企业微信小程序，支付宝小程序，字节小程序，百度小程序，京东小程序，默认weapp

Commands:
  build              构建打包压缩并完成消息推送

```
#### 配置相关
```
Usage: microapp-ci [options] [command]

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  init               初始化发布配置文件
  doctor             检查发布配置文件是否正确(TODO)
  help [command]     display help for command
```
#### 消息推送示例

<img src="https://raw.githubusercontent.com/marsczen/microapp-ci/master/preview.png" alt="preview" width="200"/>


  [1]: https://github.com/NervJS/taro/tree/next/packages/taro-plugin-mini-ci