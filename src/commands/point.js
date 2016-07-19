import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';

export default {
  command: 'point <host> to <address>',
  describe: 'Assigns an address to the given hostname',
  handler({ host, address }) {
    readHostFile().then(lines => {
      let foundMatch = false;
      let insertionPoint = 0;
      const newLines = lines.map((line, i) => {
        if (lineMatchesHost(line, host)) {
          insertionPoint = i + 1;
          if (line.address === address) {
            foundMatch = true;
            if (line.isActive) {
              console.log(`${host} is already pointing to ${address}`);
            } else {
              return { ...line, isActive: true };
            }
          } else if (line.isActive) {
            return { ...line, isActive: false };
          }
        }

        return line;
      });

      if (!foundMatch) {
        newLines.splice(insertionPoint, 0, {
          type: 'entry',
          isActive: true,
          address,
          hosts: [host]
        });
      }

      return writeHostFile(newLines);
    });
  }
};
