import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';
import backupHosts from '../backup-hosts';

export default {
  command: 'delete <host>',
  describe: 'Removes all active/inactive lines for the given hostname',
  handler({ host }) {
    let updated = false;
    readHostFile().then(lines => {
      const newLines = lines.map(line => {
        if (lineMatchesHost(line, host)) {
          updated = true;
          return { ...line, deleted: true };
        }

        return line;
      });

      if (!updated) {
        return void console.log(`No matches found for ${host}.`);
      }

      return backupHosts().then(() => writeHostFile(newLines));
    });
  }
};
