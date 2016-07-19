import os from 'os';
import path from 'path';

export default (function() {
  if (/windows/i.test(os.type())) {
    return path.join(process.env.SystemRoot, 'System32/drivers/etc/hosts');
  } else {
    return '/etc/hosts';
  }
})();
