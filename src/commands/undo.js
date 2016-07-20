import { readdir, unlink } from 'fs';
import { join } from 'path';
import Promise from 'bluebird';
import hostFilePath from '../host-file-path';
import backupsPath from '../backups-path';
import copyFile from '../copy-file';

export default {
  command: 'undo',
  describe: 'Restores the last hosts file from backup',
  handler() {
    let backupFile = null;

    return (
      Promise.fromCallback(cb => readdir(backupsPath, cb))
    ).then(files => {
      if (!files.length) {
        return void console.log('No backups were found.');
      }

      files.sort();
      const latest = files[files.length - 1];

      backupFile = join(backupsPath, latest);
      return copyFile(backupFile, hostFilePath);
    }).then(() => {
      if (backupFile) {
        return Promise.fromCallback(cb => unlink(backupFile))
      }
    });
  }
};
