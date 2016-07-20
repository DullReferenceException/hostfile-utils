export default function lineMatchesHost(line, host) {
  let hostMatches = other => other.toLowerCase() === host.toLowerCase();

  if (host.indexOf('*') >= 0) {
    const regexStr = host.replace(/\./g, '\\.').replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexStr}$`, 'i');
    hostMatches = other => regex.test(other);
  }

  return line.type === 'entry' && line.hosts.some(hostMatches);
}
