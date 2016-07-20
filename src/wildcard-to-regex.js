export default function wildcardToRegex(pattern) {
  const regexStr = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
  return new RegExp(`^${regexStr}$`, 'i');
}
