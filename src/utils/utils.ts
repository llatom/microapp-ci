import simpleGit from 'simple-git';
import { printLog } from './printLog';

export async function getLatestCommitMsg(baseDir: string) {
  const git = simpleGit(baseDir);

  const { latest } = await git.log({ n: 1 });
  return latest?.message || '';
}

export function handleProgress(taskStatus) {
  let msg = taskStatus._msg;

  if (msg) {
      const isWxmlTask = /(\/|json|wxss|wxml|js)/.test(msg);
      msg = isWxmlTask ? `[Compile] ${msg}` : msg;

      if (taskStatus._status === 'done') {
          printLog.success(msg);
      } else {
          printLog.pending(msg);
      }
  }
}
