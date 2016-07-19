import yargs from 'yargs';

export default function execute() {
  return yargs
    .commandDir('commands', { visit: module => module.default })
    .help()
    .argv;
}
