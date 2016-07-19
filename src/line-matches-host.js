export default function lineMatchesHost(line, host) {
  return line.type === 'entry' && line.hosts.some(h => h.toLowerCase() === host.toLowerCase());
}
