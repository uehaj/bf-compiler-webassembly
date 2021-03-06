'use strict';

const peg = require('pegjs');

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

function parse(bfSource, opts) {
  const bfAst = parser.parse(bfSource);
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    console.log(bfAst);
  }
  return bfAst;
}

exports.parse = parse;
