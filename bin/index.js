#!/usr/bin/env node

'use strict';

const program = require('commander');
const driver = require('../lib/driver');

function main(argv) {
  program
    .version('0.1.0')
    .option('-e,--script [script]', 'run script from command line')
    .option('-v,--verbose', 'verbose output')
    .arguments('[file...]', 'Brainf*ck file')
    .action(function(files, opts) {
      for (const file of files) {
        driver
          .compileAndRunFile(file, { verbose: opts.verbose })
          .catch(e => console.log('error:' + e));
      }
    })
    .on('--help', function() {
      console.log(`

  Examples:

    $ npx bf-compiler-webassembly -e "+++"
    $ npx bf-compiler-webassembly hello.bf

`);
    })
    .parse(argv);

  // for -e,--script option
  if (program.script) {
    driver
      .compileAndRunString(program.script, { verbose: program.verbose })
      .catch(e => console.log('error:' + e));
  } else {
    program.args.length !== 0 || program.help();
  }
}

main(process.argv);

exports.main = main;
