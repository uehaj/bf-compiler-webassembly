'use strict';

const util = require('util');
const fs = require('fs');

const bfParser = require('./bfParser');
const bfCompiler = require('./bfCompiler');
const wast2wasm = require('./wast2wasm');
const wasmRuner = require('./wasmRunner');

// compile from string
async function compileAndRunString(bfSource) {
  const bfAst = bfParser.parse(bfSource);
  const wast = bfCompiler.compile(bfAst);
  const wasm = await wast2wasm.convert(wast);
  return wasmRuner.run(wasm);
}

// compile from file
async function compileAndRunFile(bfFileName) {
  const data = await util.promisify(fs.readFile)(bfFileName, 'utf-8');
  try {
    return await compileAndRunString(data);
  } catch (e) {
    console.error('Error on compile: ', e);
  }
}

exports.compileAndRunFile = compileAndRunFile;
exports.compileAndRunString = compileAndRunString;
