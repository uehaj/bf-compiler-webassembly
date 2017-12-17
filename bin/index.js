'use strict';

const program = require('commander');
const driver = require('../lib/driver');

program
  .version('0.1.0')
  .option('-e,--script [script]', 'run script from command line')
  .arguments('[file...]', 'Brainf*ck file')
  .action(function(files, opts) {
    for (const file of files) {
      driver.compileAndRunFile(file).catch(e => console.log('error:' + e));
    }
  })
  .on('--help', function() {
    console.log(`  Examples:'
    $ npx bf-compiler-webassembly -e "+++"
    $ npx bf-compiler-webassembly hello.bf"

`);
  })
  .parse(process.argv);

if (program.script) {
  driver
    .compileAndRunString(program.script)
    .catch(e => console.log('error:' + e));
} else {
  program.args.length !== 0 || program.help();
}
