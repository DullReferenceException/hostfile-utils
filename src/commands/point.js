import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';

export default {
  command: 'point <host> to <address>',
  describe: 'Assigns an address to the given hostname',
  handler({ host, address }) {
    readHostFile().then(lines => {
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
              return { ...line, isActive: true, updated: true };
            }
          } else if (line.isActive) {
            return { ...line, isActive: false, updated: true };
          }
        }

        return line;
      });

      if (!foundMatch) {
        if (host.indexOf('*') >= 0) {
          console.log('No matching hosts found.');
        } else {
          newLines.splice(insertionPoint, 0, {
            type: 'entry',
            isActive: true,
            address,
            hosts: [host],
            updated: true
          });
        }
      }

      return writeHostFile(newLines);
    });
  }
};
