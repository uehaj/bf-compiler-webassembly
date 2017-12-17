'use strict';

const wast2wasm = require('wast2wasm');
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

async function convert(wasmTextCode, opts) {
  const wasm = await wast2wasm(wasmTextCode, true);
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
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

exports.convert = convert;
