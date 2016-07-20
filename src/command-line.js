import yargs from 'yargs';

export default function execute() {
  return yargs
    .commandDir('commands', { visit: module => module.default })
    .demand(1)
    .strict()
    .help()
    .argv;
}
