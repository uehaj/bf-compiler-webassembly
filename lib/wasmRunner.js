'use strict';

const readlineSync = require('readline-sync');

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

async function run(uint8array, opts) {
  const wasm = await WebAssembly.instantiate(uint8array, {
    imports: {
      getchar,
      putchar,
    },
  });

  const result = wasm.instance.exports.main();
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    const memory = new Uint8Array(wasm.instance.exports.memory.buffer);
    console.log(memory);
  }
  return result;
}

exports.run = run;
