if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('../scheem.js').evalScheem;
    var parse = require('../parser.js').scheem.parse;
} else {
    // In browser assume loaded by <script>
    var parse = scheem.parse;
    var assert = chai.assert;
}

// eval tests that bypass the parser
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], null),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], null),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], null),
            [1, 2, 3]
        );
    });
    test('source list', function() {
      var ast = parse("'(1 2 3)");
      var expected_result = [1,2,3];
      var actual_result = evalScheem(ast, null);
      assert.deepEqual(actual_result, expected_result);
    });
});

// takes source code, passes it through the parser, evaluates it and compares
// to the second argument
var helper_function = function(source_code, expected_result) {
  var ast = parse(source_code);
  var actual_result = evalScheem(ast, null);
  assert.deepEqual(actual_result, expected_result);
};

// let-one tests
suite('let-one', function() {
  test('simple', function() {
    helper_function("(let-one x 2 (+ x 1))", 3);
  });
  test('evaluated assignment', function() {
    helper_function("(let-one x (+ 1 1) (+ x 1))", 3);
  });
  test('evaluated assignment with let-one', function() {
    helper_function("(let-one x (let-one y (+ 1 1) (+ y 1)) (+ x 1))", 2 + 1 + 1);
  });
  test('nested', function() {
    helper_function("(let-one x (+ 1 1) (let-one y 2 (+ x y)))", 2 + 2);
  });
});

// set! tests
suite('set!', function() {
  test('let-one', function() {
    helper_function("(let-one x 1 (set! x 2))", 2);
  });
  test('for undefined variable', function() {
    var ast = parse("(set! x 1)");
    assert.throws(function() {
      evalScheem(ast, null);
    }, "'set!' called on an undefined variable: x.");
  });
});

// lambda-one tests
suite('lambda-one', function() {
  test('simple', function() {
    helper_function("((lambda-one x (+ x x)) 5)", 10);
  });
  test('with let-one', function() {
    helper_function("(let-one p (lambda-one x (+ x x)) (p 5))", 10);
  });
  test('returns a lambda-one', function() {
    helper_function("(let-one l (lambda-one x (lambda-one y (+ x y))) ((l 5) 5))", 10);
  });
});

// lambda tests
suite('lambda', function() {
  test('no arguments', function() {
    helper_function("((lambda (+ 5 5)))", 10);
  });
  test('single argument', function() {
    helper_function("((lambda x (+ x x)) 5)", 10);
  });
  test('two arguments', function() {
    helper_function("((lambda (x y) (+ x y)) 5 5)", 10);
  });
  test('three arguments', function() {
    helper_function("((lambda (x y z) (+ (+ x y) z)) 5 5 5)", 15);
  });
  test('passed another lambda', function() {
    helper_function("(let-one l (lambda (x y) (x y)) (l (lambda x (+ x x)) 5))", 10);
  });
  test('closure', function() {
    helper_function("(let-one l (lambda x (lambda y (+ x y))) ((l 5) 5))", 10);
  });
  test('recursion', function() {
    helper_function("(let-one l (define sum (lambda (x acc) (if (= x 0) acc (sum (- x 1) (+ acc x))))) (sum 3 0))", 6);
  });
});

// built-in function tests
suite('initial environment', function() {
  test('+ regular', function() {
    helper_function("(+ 1 2)", 3);
  });
  test('+ curried', function() {
    helper_function("((+ 1) 2)", 3);
  });
  test('- regular', function() {
    helper_function("(- 1 2)", -1);
  });
  test('- curried', function() {
    helper_function("((- 1) 2)", -1);
  });
  test('* regular', function() {
    helper_function("(* 1 2)", 2);
  });
  test('* curried', function() {
    helper_function("((* 1) 2)", 2);
  });
  test('/ regular', function() {
    helper_function("(/ 1 2)", 0.5);
  });
  test('/ curried', function() {
    helper_function("((/ 1) 2)", 0.5);
  });
  test('= regular false', function() {
    helper_function("(= 1 2)", '#f');
  });
  test('= curried false', function() {
    helper_function("((= 1) 2)", '#f');
  });
  test('= regular true', function() {
    helper_function("(= 1 1)", '#t');
  });
  test('= curried true', function() {
    helper_function("((= 1) 1)", '#t');
  });
  test('< regular true', function() {
    helper_function("(< 1 2)", '#t');
  });
  test('< curried true', function() {
    helper_function("((< 1) 2)", '#t');
  });
  test('< regular false', function() {
    helper_function("(< 3 2)", '#f');
  });
  test('< curried false', function() {
    helper_function("((< 3) 2)", '#f');
  });
  test('car regular', function() {
    helper_function("(car '(1 2))", 1);
  });
  test('cdr regular', function() {
    helper_function("(cdr '(1 2 3))", [2,3]);
  });
  test('cons regular', function() {
    helper_function("(cons 1 '(2 3))", [1,2,3]);
  });
  test('cons curried', function() {
    helper_function("((cons 1) '(2 3))", [1,2,3]);
  });
});
