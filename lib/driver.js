'use strict';

const util = require('util');
const fs = require('fs');

const bfParser = require('./bfParser');
const bfCompiler = require('./bfCompiler');
const wast2wasm = require('./wast2wasm');
const wasmRuner = require('./wasmRunner');

// compile from string
async function compileAndRunString(bfSource, opts) {
  const bfAst = bfParser.parse(bfSource, opts);
  const wast = bfCompiler.compile(bfAst, opts);
  const wasm = await wast2wasm.convert(wast, opts);
  return await wasmRuner.run(wasm, opts);
}

// compile from file
async function compileAndRunFile(bfFileName, opts) {
  const data = await util.promisify(fs.readFile)(bfFileName, 'utf-8');
  try {
    return await compileAndRunString(data, opts);
  } catch (e) {
    console.error('Error on compile: ', e);
  }
}

exports.compileAndRunFile = compileAndRunFile;
exports.compileAndRunString = compileAndRunString;
