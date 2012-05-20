// this will blow the stack limit for n = 21782
var sum = function(n) {
  return n === 1 ? 1 : sum(n - 1) + n;
};

// cps style
var sumCPS = function(n, cont) {
  if (n <= 1) {
    return cont(1);
  } else {
    var new_cont = function(v) {
      return cont(v + n);
    };
    return sumCPS(n - 1, new_cont);
  }
};

// regular factorial
var factorial = function(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
};

// cps factorial
var factorialCPS = function(n, cont) {
  if (n <= 1) {
    return cont(1);
  } else {
    var new_cont = function(v) {
      return cont(v * n);
    };
    return factorialCPS(n - 1, new_cont);
  }
};

// abstract function application with thunks
var thunk = function(f, lst) {
  return {tag:'thunk', func:f, args:lst};
};

// sum function with abstracted function application
var sumThunk = function(n, cont) {
  if (n <= 1) {
    return thunk(cont, [1]); // abstracted cont(1)
  } else {
    var new_cont = function(v) {
      return thunk(cont, [n + v]); // abstracted cont(n + v)
    };
    return thunk(sumThunk, [n - 1, new_cont]); // abstracted sum(n - 1, new_cont)
  }
};

// factorial function with abstracted function application
var factorialThunk = function(n, cont) {
  if (n <= 1) {
    return thunk(cont, [1]);
  } else {
    var new_cont = function(v) {
      return thunk(cont, [n * v]);
    };
    return thunk(factorialThunk, [n - 1, new_cont]);
  }
};

// takes a value and turns it into a thunk
var thunkValue = function(x) {
  return {tag:'value',val:x};
};

// thunk structure evaluator
var evalThunk = function(thk) {
  if (thk.tag === 'value') {
    return thk.val;
  }
  var sub_expr = thk.func.apply(null, thk.args);
  return evalThunk(sub_expr);
};

// trampolined thunk evaluator
var trampoline = function(thk) {
  while (true) {
    if (thk.tag === 'value') {
      return thk.val;
    }
    thk = thk.func.apply(null, thk.args);
  }
};

// recursive fibonacci
var fibonacci = function(n) {
  if (n <= 2) {
    return 1;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// cps fibonacci
var fibonacciCPS = function(n, cont) {
  if (n <= 2) {
    return cont(1);
  }
  var new_cont = function(v) {
    var sub_cont = function(y) {
      return cont(v + y);
    };
    return fibonacciCPS(n - 2, sub_cont);
  };
  return fibonacciCPS(n - 1, new_cont);
};

// thunked fibonacci
var fibonacciThunk = function(n, cont) {
  if (n <= 2) {
    return thunk(cont, [1]);
  }
  var new_cont = function(v) {
    var sub_cont = function(y) {
      return thunk(cont, [v + y]);
    };
    return thunk(fibonacciThunk, [n - 2, sub_cont]);
  };
  return thunk(fibonacciThunk, [n - 1, new_cont]);
};

if (typeof module !== 'undefined') {
  module.exports.fibCPS = fibonacciCPS;
  module.exports.fibThunk = fibonacciThunk;
  module.exports.thunkValue = thunkValue;
  module.exports.trampoline = trampoline;
}
