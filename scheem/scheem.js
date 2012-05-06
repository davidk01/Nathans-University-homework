var initial_env = {
  name: '+',
  value: function(x) {return function(y) {return x + y;}},
  outer: {
    name: '-',
    value: function(x,y) {return x - y;},
    outer: {
      name: '/',
      value: function(x,y) {return x / y;},
      outer: {
        name: '*',
        value: function(x,y) {return x * y;},
        outer: {
          name: '=',
          value: function(x,y) {return x === y ? '#t' : '#f';},
          outer: {
            name: '<',
            value: function(x,y) {return x < y ? '#t' : '#f';},
            outer: {
              name: '>',
              value: function(x,y) {return x > y ? '#t' : '#f';},
              outer: null
            }
          }
        }
      }
    }
  }
};

// used when we encounter define
var add_binding = function(env, v, val) { // used in define forms to add a new binding
  env.outer = (function(e) {
    return {
      name: e.name,
      value: e.value,
      outer: e.outer
    };
  })(env);
  env.name = v;
  return (env.value = val);
};

// used when we encounter set!
var update = function(env, v, val) {
  if (env === null) { // reached the root and couldn't find anything so let the user know
    throw "Variable is undefined so can't be updated: " + v + " is undefined.";
  }
  if (env.name === v) { // found it, update and return the new value
    return (env.value = val);
  }
  return update(env.outer, v, val);  
};

// used when we encounter a variable
var lookup = function(env, v) {
  if (env === null) { // we reached the root and couldn't find anything so return null
    return null;
  }
  if (env.name === v) {
    return env.value;
  }
  return lookup(env.outer, v);
};

// used to convert functions of more than one variable to nested
// lambda-one definitions
var lambda_to_lambda_one = function(vars, body) {
  if (typeof vars === 'string') {
    return ['lambda-one', vars, body];
  }
  if (vars.length > 1) {
    var first_argument = vars[0];
    vars.shift();
    return ['lambda-one', first_argument, lambda_to_lambda_one(vars, body)];
  }
  return ['lambda-one', vars[0], body];
};

// used to recursively evaluate lisp forms
var evalScheem = function(expr, env) {
  if (env === null) { // if env is null then set it to the initial environment
    env = initial_env;
  }
  if (typeof expr === 'number') { // numbers evaluate to themselves
    return expr;
  }
  if (typeof expr === 'string') { // strings are variable refs so need to look them up
    return lookup(env, expr);
  }
  switch (expr[0]) {
    case 'lambda': // (lambda (vars)? body)
      if (expr.length === 2) { // this means we have no variables so we return a function with no variables
        return function() {
          return evalScheem(expr[1], env);
        };
      } // otherwise we do have variables so we first transform everything to nested lambda-one forms
      var converted = lambda_to_lambda_one(expr[1], expr[2]);
      return evalScheem(converted, env);
    case 'lambda-one': // (lambda-one var (body form))
      return function(x) {
        var new_env = {
          name: expr[1],
          value: x,
          outer: env
        };
        return evalScheem(expr[2], new_env);
      };
    case 'let-one': // (let-one x (value form) (body form))
      var new_env = {
        name: expr[1],
        value: evalScheem(expr[2], env),
        outer: env
      };
      return evalScheem(expr[3], new_env);
    case 'quote': // '(form)
      // throw an exception if the quote form has length more than 2
      if (expr.length !== 2) {
        throw "'quote' forms must have length exactly equal to 2.";
      }
      return expr[1]; // return the unevaluated form that had the quote
    case 'define':
      // throw an error if a variable has already been defined
      if (lookup(env, expr[1])) {
        throw "Variable has already been defined: " + expr[1] + ".";
      }
      return add_binding(env, expr[1], evalScheem(expr[2], env));
    case 'set!': 
      if (!lookup(env, expr[1])) { // couldn't find the variable so throw an error
        throw "'set!' called on an undefined variable: " + expr[1] + ".";
      }
      return update(env, expr[1], evalScheem(expr[2], env));
    case 'begin':
      expr.shift();
      for (var i = 0, len = expr.length - 1; i < len; i++) {
        evalScheem(expr[i], env);
      }
      return evalScheem(expr[len], env);
    case 'cons': // list append
      var head = evalScheem(expr[1], env);
      var rest = evalScheem(expr[2], env);
      rest.unshift(head);
      return rest;
    case 'car': // head
      return evalScheem(expr[1], env)[0];
    case 'cdr': // tail
      var result = evalScheem(expr[1], env);
      result.shift();
      return result;
    case 'if':
      return evalScheem(expr[1], env) === '#t' ? 
        evalScheem(expr[2], env) : evalScheem(expr[3], env);
    default: // not a special form so must be a function application form
      var func = evalScheem(expr[0], env);
      expr.shift();
      var args = expr.map(function(x) {return evalScheem(x, env);});
      var result = func.apply(null, args);
      args.shift()
      while (typeof result === 'function' && args.length !== 0) {
        result = result.apply(null, args);
        args.shift();
      }
      return result;
  }
};

if (typeof module !== 'undefined') {
  module.exports.evalScheem = evalScheem;
}
