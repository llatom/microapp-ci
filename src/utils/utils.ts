import { spinner } from './spinner'
const { execSync } = require('child_process')
const Dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
require('dayjs/locale/zh-cn')
Dayjs.locale('zh-cn')
Dayjs.extend(relativeTime)
const MAX_COMMIT_NUM = 3 //commit 数量

export function getLatestCommitMsg(cwd) {
  const options = { cwd }
  try {
    let commitMsgs = execSync(
      `git log --no-merges -n ${MAX_COMMIT_NUM} --grep="^[feat|fix]" --format=format:"* %s (@%cn #DATE<%cd>)"`,
      options
    )
      .toString()
      .trim()
    commitMsgs = replaceDate(commitMsgs)
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', options).toString().trim()
    return `当前分支: ${branchName}
最近${MAX_COMMIT_NUM}次commit:
${commitMsgs}`
  } catch (e) {
    console.error('获取 git 日志失败：', e)
    return ''
  }
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

const replaceDate = (message) => {
  return message.replace(/#DATE<([^>]+)>/gi, function (_, p1) {
    return new Dayjs(p1).fromNow()
  })
}
