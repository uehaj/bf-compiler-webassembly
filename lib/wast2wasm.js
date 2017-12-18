'use strict';

const wast2wasm = require('wast2wasm');

async function convert(wasmTextCode, opts) {
  const wasm = await wast2wasm(wasmTextCode, true);
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    console.log(wasm.log);
  }
  return wasm.buffer;
}

exports.convert = convert;
