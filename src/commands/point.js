import Promise from 'bluebird';
import { resolve } from 'dns';
import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';
import lineMatchesHost from '../line-matches-host';
import backupHosts from '../backup-hosts';
import { addressRegex } from '../patterns';
import wildcardToRegex from '../wildcard-to-regex';

export default {
  command: 'point <host> to <address>',
  describe: 'Assigns an address to the given hostname',
  handler({ host, address: destName }) {

    let dest = null;
    let lines = null;

    return (
      readHostFile()
    ).then(contents => {
      lines = contents;
      return resolveDest(destName, host, lines);
    }).then(resolved => {
      dest = resolved;
      let updated = false;
      let foundMatch = false;
      let insertionPoint = lines.length;
      const newLines = lines.map((line, i) => {
        if (lineMatchesHost(line, host)) {
          insertionPoint = i + 1;
          if (line.address === dest.address) {
            foundMatch = true;
            if (line.isActive) {
              console.log(`${line.hosts} is already pointing to ${dest.address}`);
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
            address: dest.address,
            hosts: [host],
            comment: dest.name && `# ${dest.name}`,
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

function resolveDest(destName, host, lines) {
  if (/^local(host)?$/i.test(destName)) {
    return { address: '127.0.0.1' };
  }

  if (addressRegex.test(destName)) {
    return { address: destName };
  }

  if (destName.indexOf('*') >= 0) {
    const regex = wildcardToRegex(destName);
    const matches = lines.filter(line => {
      return (
        lineMatchesHost(line, host)
        && (line.addressAliases || []).some(alias => regex.test(alias))
      );
    });
    if (!matches.length) {
      throw new Error(`Could not resolve ${destName}`);
    } else if (matches.length > 1) {
      const matchDesc = matches.map(m => `${m.address} (${m.addressAliases})`);
      throw new Error(`Ambiguous pattern ${destName} matches ${matchDesc}`);
    } else {
      return { address: matches[0].address };
    }
  }

  return (
    Promise.fromCallback(cb => resolve(destName, cb))
  ).then(addresses => {
    const validAddress = addresses.find(address => addressRegex.test(address));
    if (!validAddress) {
      throw new Error(`Could not resolve ${destName}.`);
    }

    return {
      name: destName,
      address: validAddress
    };
  });
}
