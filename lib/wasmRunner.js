'use strict';

function run(wasm) {
  const result = wasm.exports.main();
  const memory = new Uint8Array(wasm.exports.memory.buffer);
  if (process.env.NODE_ENV === 'debug') {
    console.log(memory);
  }
  return result;
}

exports.run = run;
