import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';
import backupHosts from '../backup-hosts';

export default {
  command: 'reset <host>',
  describe: 'Comments out address assignment for the given hostname',
  handler({ host }) {
    let updated = false;
    readHostFile().then(lines => {
      const newLines = lines.map(line => {
        if (lineMatchesHost(line, host) && line.isActive) {
          updated = true;
          return { ...line, isActive: false, updated: true };
        }

        return line;
      });

      if (!updated) {
        return void console.log(`No active address assignments for ${host} to reset.`);
      }

      return backupHosts().then(() => writeHostFile(newLines));
    });
  }
};
