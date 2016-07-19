const ipv4 = '\\d{1,3}(?:\\.\\d{1,3}){3}';
const ipv6 = '[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}';
const address = `${ipv4}|${ipv6}`;

const host = '[a-z0-9\\-]+(?:\\.[a-z0-9\\-]+)*';

const comment = '#.*';

const hostEntry = `^\\s*(${address})((?:\\s+${host})+)\\s*(${comment})?$`;
const commentedHostEntry = hostEntry.replace('^', '^\\s*#\\s*');

export const addressRegex = new RegExp(`^${address}$`, 'i');
export const hostRegex = new RegExp(`^${host}$`, 'i');

export const blankLineRegex = /^\s*$/;
export const hostEntryRegex = new RegExp(hostEntry, 'i');
export const commentedHostRegex = new RegExp(commentedHostEntry, 'i');
export const commentLineRegex = new RegExp(`^\\s*${comment}$`);
