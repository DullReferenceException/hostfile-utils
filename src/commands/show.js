import readHostFile from '../read-host-file';
import { addressRegex, hostRegex } from '../patterns';

export default {
  command: 'show <item>',
  describe: 'Shows information about the given address or hostname',
  handler({ item }) {
    readHostFile().then(lines => {
      let filter = x => x;
      let output = ({ address, hosts }) => {
        hosts.forEach(host => {
          console.log(`${host} -> ${address}`);
        });
      };

      if (addressRegex.test(item)) {
        filter = line => line.address === item;
        output = line => line.hosts.forEach(host => console.log(host));
      } else if (hostRegex.test(item)) {
        filter = line => line.hosts.some(host => host === item);
        output = line => console.log(line.address);
      }

      const isConsequential = line => line.type === 'entry';
      const relevantLines = lines.filter(isConsequential).filter(filter);
      const activeEntries = relevantLines.filter(line => line.isActive);
      const inactiveEntries = relevantLines.filter(line => !line.isActive);

      const hasActiveEntries = !!activeEntries.length;
      const hasInactiveEntries = !!inactiveEntries.length;
      const hasEntries = hasActiveEntries || hasInactiveEntries;

      if (!hasEntries) {
        console.log('No matches were found.');
      }

      if (hasActiveEntries) {
        console.log('\nActive:');
        activeEntries.forEach(output);
      }

      if (hasInactiveEntries) {
        console.log('\nInactive:');
        inactiveEntries.forEach(output);
      }
    });
  }
};
