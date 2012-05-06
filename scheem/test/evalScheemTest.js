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

var helper_function = function(source_code, expected_result) {
  var ast = parse(source_code);
  var actual_result = evalScheem(ast, null);
  assert.deepEqual(actual_result, expected_result);
};

// various let-one form tests
suite('let-one', function() {
  test('simple let-one', function() {
    helper_function("(let-one x 2 (+ x 1))", 3);
  });
  test('evaluated let-one assignment', function() {
    helper_function("(let-one x (+ 1 1) (+ x 1))", 3);
  });
  test('evaluated let-one assignment with let-one', function() {
    helper_function("(let-one x (let-one y (+ 1 1) (+ y 1)) (+ x 1))", 2 + 1 + 1);
  });
  test('nested let-one assignment', function() {
    helper_function("(let-one x (+ 1 1) (let-one y 2 (+ x y)))", 2 + 2);
  });
});

// various set! form tests
suite('set!', function() {
  test('let-one, set!', function() {
    helper_function("(let-one x 1 (set! x 2))", 2);
  });
  test('set! for undefined variable', function() {
    var ast = parse("(set! x 1)");
    assert.throws(function() {
      evalScheem(ast, null);
    }, /string/, "'set!' called on an undefined variable: x.");
  });
});

// various lambda-one tests
suite('lambda-one', function() {
  test('simple lambda-one', function() {
    helper_function("((lambda-one x (+ x x)) 5)", 10);
  });
  test('lambda-one with let-one', function() {
    helper_function("(let-one p (lambda-one x (+ x x)) (p 5))", 10);
  });
  test('lambda-one that returns a lambda-one', function() {
    helper_function("(let-one l (lambda-one x (lambda-one y (+ x y))) ((l 5) 5))", 10);
  });
});
