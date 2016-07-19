import readHostFile from '../read-host-file';
import writeHostFile from '../write-host-file';

export default {
  command: 'reset <host>',
  describe: 'Comments out address assignment for the given hostname',
  handler({ host }) {
    let updated = false;
    readHostFile().then(lines => {
      const newLines = lines.map(line => {
        if (line.type === 'entry' && line.hosts.some(h => h.toLowerCase() === host.toLowerCase())) {
          if (line.isActive) {
            updated = true;
            return { ...line, isActive: false };
          }
        }

        return line;
      });

      if (!updated) {
        return void console.log(`No active address assignments for ${host} to reset.`);
      }

      return writeHostFile(newLines);
    });
  }
};
