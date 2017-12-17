'use strict';

const program = require('commander');
const driver = require('../lib/driver');

function usage(program) {
  program.help();
  process.exit(-1);
}

program
  .version('0.1.0')
  .option('-e,--script [string]', 'run script from command line')
  .arguments('[files...]', 'Brainf*ck file')
  .action(function(files, opts) {
    for (const file of files) {
      driver.compileAndRunFile(file);
    }
  })
  .parse(process.argv);

program.args.length !== 0 || usage(program);

/*
program
  .version('0.1.0')
  .option('-e,--script [string]', 'Brainf*ck script on command line')
  .arguments('<bfFile> [bfFiles]', 'Brainf*ck file')
  .parse(process.argv);

if (program.args.length === 0) {
  program.help();
  process.exit(0);
}
console.log(program);
if (program.script) {
  console.log(program.script);
  for (const target of program.args) {
    console.log(target);
    compileAndRunFile(target);
  }
}
if (program.script) {
  compileAndRunString(target);
}
*/
