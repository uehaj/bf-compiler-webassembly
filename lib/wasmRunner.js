'use strict';

function run(wasm, opts) {
  const result = wasm.exports.main();
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    const memory = new Uint8Array(wasm.exports.memory.buffer);
    console.log(memory);
  }
  return result;
}

exports.run = run;
