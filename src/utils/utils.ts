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
