import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';
import backupHosts from '../backup-hosts';

export default {
  command: 'point <host> to <address>',
  describe: 'Assigns an address to the given hostname',
  handler({ host, address }) {
    readHostFile().then(lines => {
      let updated = false;
      let foundMatch = false;
      let insertionPoint = lines.length;
      const newLines = lines.map((line, i) => {
        if (lineMatchesHost(line, host)) {
          insertionPoint = i + 1;
          if (line.address === address) {
            foundMatch = true;
            if (line.isActive) {
              console.log(`${line.hosts} is already pointing to ${address}`);
            } else {
              updated = true;
              return { ...line, isActive: true, updated: true };
            }
          } else if (line.isActive) {
            updated = true;
            return { ...line, isActive: false, updated: true };
          }
        }

        return line;
      });

      if (!foundMatch) {
        if (host.indexOf('*') >= 0) {
          return void console.log('No matching hosts found.');
        } else {
          updated = true;
          newLines.splice(insertionPoint, 0, {
            type: 'entry',
            isActive: true,
            address,
            hosts: [host],
            updated: true
          });
        }
      }

      if (updated) {
        return backupHosts().then(() => writeHostFile(newLines));
      }
    });
  }
};
