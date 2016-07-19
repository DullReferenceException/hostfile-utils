import { readFile } from 'fs';
import Promise from 'bluebird';
import hostFilePath from './host-file-path';
import { hostEntryRegex, commentedHostRegex, commentLineRegex, blankLineRegex } from './patterns';

const readFileAsync = Promise.promisify(readFile);

function splitHosts(str) {
  return str.split(/\s+/).map(str => str.trim()).filter(Boolean);
}

export default function() {
  return readFileAsync(hostFilePath, 'utf8').then(contents => {
    const lines = contents.split(/\r?\n/);
    return lines.map(line => {

      const hostEntry = hostEntryRegex.exec(line);
      if (hostEntry) {
        return {
          type: 'entry',
          isActive: true,
          address: hostEntry[1],
          hosts: splitHosts(hostEntry[2]),
          comment: hostEntry[3]
        }
      }

      const commentedEntry = commentedHostRegex.exec(line);
      if (commentedEntry) {
        return {
          type: 'entry',
          isActive: false,
          address: commentedEntry[1],
          hosts: splitHosts(commentedEntry[2]),
          comment: commentedEntry[3]
        }
      }

      const commentLine = commentLineRegex.exec(line);
      if (commentLine) {
        return {
          type: 'comment',
          content: commentLine[0]
        };
      }

      if (blankLineRegex.test(line)) {
        return {
          type: 'blank'
        }
      }

      return {
        type: 'unknown',
        content: line
      }
    });
  });
}
