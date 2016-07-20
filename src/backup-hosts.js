import { join } from 'path';
import { createReadStream, createWriteStream, mkdir, stat } from 'fs';
import Promise from 'bluebird';
import hostFilePath from './host-file-path';
import backupDir from './backups-path';
import copyFile from './copy-file';

export default function backupHosts() {
  return (
    Promise.fromCallback(cb => stat(backupDir, cb))
  ).catch(err => {
    if (err.code === 'ENOENT') {
      return Promise.fromCallback(cb => mkdir(backupDir, cb));
    }
  }).then(() => {
    const backupFileName = `${Date.now()}.bak`;
    const backupFilePath = join(backupDir, backupFileName);
    return copyFile(hostFilePath, backupFilePath);
  })
};
