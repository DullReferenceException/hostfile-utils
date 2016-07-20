import wildcardToRegex from './wildcard-to-regex';

export default function lineMatchesHost(line, host) {
  let hostMatches = other => other.toLowerCase() === host.toLowerCase();

  if (host.indexOf('*') >= 0) {
    const regex = wildcardToRegex(host);
    hostMatches = other => regex.test(other);
  }

  return line.type === 'entry' && line.hosts.some(hostMatches);
}
