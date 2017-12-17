'use strict';

const peg = require('pegjs');
const wast2wasm = require('wast2wasm');
const readlineSync = require('readline-sync');
const fs = require('fs');
const util = require('util');
const program = require('commander');

const syntax = `
code = (normal_insn / block_insn / otherchar) *

normal_insn = ch:[><+-.,] { return ch }
block_insn = '[' brk:block ']' { return brk  }

block = cod:code {
  return cod;
}

otherchar = [^><+-.,\\[\\]] {
  return undefined
}
`;

const parser = peg.generate(syntax);

function genInst(inst, depth) {
  return '  '.repeat(depth * 2) + inst + '\n';
}

function genCode(code, depth) {
  let result = '';
  for (const i of code) {
    if (Array.isArray(i)) {
      result += genInst(`    (block ;; [`, depth);
      result += genInst(`      (loop`, depth);
      result += genInst(
        `        (br_if 1 (i32.eqz (i32.load8_s (get_local $ptr))))`,
        depth
      );
      result += genCode(i, depth + 1);
      result += genInst(`        (br 0)`, depth);
      result += genInst('      )', depth);
      result += genInst('    ) ;; ]', depth);
    } else if (i === '>') {
      result += genInst(
        '    (set_local $ptr (i32.add (get_local $ptr) (i32.const 1))) ;; >',
        depth
      );
    } else if (i === '<') {
      result += genInst(
        '    (set_local $ptr (i32.sub (get_local $ptr) (i32.const 1))) ;; <',
        depth
      );
    } else if (i === '+') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (i32.add (i32.load8_s (get_local $ptr)) (i32.const 1))) ;; +',
        depth
      );
    } else if (i === '-') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (i32.add (i32.load8_s (get_local $ptr)) (i32.const -1))) ;; -',
        depth
      );
    } else if (i === '.') {
      result += genInst(
        '    (i32.load8_s (get_local $ptr)) (call $putchar) ;; .',
        depth
      );
    } else if (i === ',') {
      result += genInst(
        '    (i32.store8 (get_local $ptr) (call $getchar)) ;; ,',
        depth
      );
    }
  }
  return result;
}

function bfCompile(bfCode) {
  const prologue = `(module
  (func $getchar (import "imports" "getchar") (result i32))
  (func $putchar (import "imports" "putchar") (param i32))
  (memory $0 (export "memory") 1 1)

  (func (export "main") (local $ptr i32)
`;
  const epilogue = `  )
)
`;
  return `${prologue}${genCode(bfCode, 0)}${epilogue}`;
}

// runtime
function putchar(ch) {
  process.stdout.write(String.fromCharCode(ch));
}

let buf = '';
function getchar() {
  if (buf === '') {
    buf = buf + readlineSync.question() + '\n';
  }
  const result = buf.charCodeAt(0);
  buf = buf.substring(1);
  return result;
}

// compile WAST->WASM
async function wastCompile(wasmTextCode) {
  const wasm = await wast2wasm(wasmTextCode, true);
  if (process.env.NODE_ENV === 'debug') {
    console.log(wasm.log);
  }
  const uint8array = wasm.buffer;
  const results = await WebAssembly.instantiate(uint8array, {
    imports: {
      getchar,
      putchar,
    },
  });
  return results.instance;
}

// compile wast on string
function compileAndRunString(bfSource) {
  const bfAst = parser.parse(bfSource);
  const wast = bfCompile(bfAst);
  if (process.env.NODE_ENV === 'debug') {
    console.log(wast);
  }
  return wastCompile(wast)
    .then(it => {
      it.exports.main();
      var memory = new Uint8Array(it.exports.memory.buffer);
      if (process.env.NODE_ENV === 'debug') {
        console.log(memory);
      }
    })
    .catch(e => console.error('Error on running: ', e));
}

// compile wast on file
function compileAndRunFile(bfFileName) {
  return util
    .promisify(fs.readFile)(bfFileName, 'utf-8')
    .then(data => {
      compileAndRunString(data);
    })
    .catch(e => console.error('Error on compile: ', e));
}

function usage(program) {
  program.help();
  process.exit(-1);
}

program
  .version('0.1.0')
  .option('-e,--script [string]', 'Brainf*ck script on command line')
  .arguments('[files...]', 'Brainf*ck file')
  .action(function(files, opts) {
    for (const file of files) {
      compileAndRunFile(file);
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
