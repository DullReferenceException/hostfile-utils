import Promise from 'bluebird';
import { createReadStream, createWriteStream } from 'fs';

export default function copyFile(source, dest) {
  const sourceStream = createReadStream(source);
  const destStream = createWriteStream(dest);
  return Promise.fromCallback(cb => sourceStream.pipe(destStream).on('finish', cb));
}
