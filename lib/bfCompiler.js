'use strict';

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
        '    (i32.store8 (get_local $ptr) (i32.sub (i32.load8_s (get_local $ptr)) (i32.const 1))) ;; -',
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

function compile(bfCode, opts) {
  const prologue = `(module
  (func $getchar (import "imports" "getchar") (result i32))
  (func $putchar (import "imports" "putchar") (param i32))
  (memory $0 (export "memory") 1 1)

  (func (export "main") (local $ptr i32)
`;
  const epilogue = `  )
)
`;

  const wast = `${prologue}${genCode(bfCode, 0)}${epilogue}`;
  if (opts.verbose || process.env.NODE_ENV === 'debug') {
    console.log(wast);
  }
  return wast;
}

exports.compile = compile;
