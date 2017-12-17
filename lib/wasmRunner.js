'use strict';

function run(wasm) {
  wasm.exports.main();
  const memory = new Uint8Array(wasm.exports.memory.buffer);
  if (process.env.NODE_ENV === 'debug') {
    console.log(memory);
  }
}

exports.run = run;
