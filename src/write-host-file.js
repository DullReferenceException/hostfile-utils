import { createWriteStream } from 'fs';
import { EOL } from 'os';
import Promise from 'bluebird';
import hostFilePath from './host-file-path';

export default function writeHostFile(lines) {
  let maxAddressWidth = 0, maxHostsWidth = 0;
  lines.filter(line => line.type === 'entry').forEach(({ address, hosts }) => {
    maxAddressWidth = Math.max(
        maxAddressWidth,
        address.length);
    maxHostsWidth = Math.max(
        maxHostsWidth,
        hosts.reduce((sum, host) => sum + host.length, hosts.length - 1));
  });

  const addressPadding = ' '.repeat(maxAddressWidth);
  const hostPadding = ' '.repeat(maxHostsWidth);

  const stream = createWriteStream(hostFilePath);
  return lines.reduce((prev, line) => {
    return prev.then(() => {
      let output = null;
      switch (line.type) {
        case 'blank':
          output = '';
          break;
        case 'comment':
          output = line.content;
          break;
        case 'entry':
          const address = (line.address + addressPadding).slice(0, maxAddressWidth);
          const host = (line.hosts.join(' ') + hostPadding).slice(0, maxHostsWidth);
          const comment = line.comment || '';
          output = line.isActive
              ? `${address}  ${host} ${comment}`
              : `#${address} ${host} ${comment}`;
          break;
      }
      if (line.updated) {
        console.log(output);
      } else if (line.deleted) {
        return void console.log(`deleted: ${output}`);
      }

      return Promise.fromCallback(cb => stream.write(output + EOL, cb));
    });
  }, Promise.resolve()).then(() => {
    return Promise.fromCallback(cb => stream.end(cb));
  });
}

