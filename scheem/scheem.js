var evalScheem = function(expr, env) {
  if (typeof expr === 'number') { // numbers evaluate to themselves
    return expr;
  }
  if (typeof expr === 'string') { // strings are variable refs so need to look them up
    return env[expr];
  }
  switch (expr[0]) {
    case 'quote':
      // throw an exception if the quote form has length more than 2
      if (expr.length !== 2) {
        throw "'quote' forms must have length exactly equal to 2.";
      }
      return expr[1]; // return the unevaluated form that had the quote
    case '+':
      return evalScheem(expr[1], env) + evalScheem(expr[2], env);
    case '-':
      return evalScheem(expr[1], env) - evalScheem(expr[2], env);
    case '/':
      return evalScheem(expr[1], env) / evalScheem(expr[2], env);
    case '*':
      return evalScheem(expr[1], env) / evalScheem(expr[2], env);
    case 'define':
    case 'set!': 
      // throw an error if set! is called on a variable that doesn't exist in env
      if (!env[expr[1]]) {
        throw "'set!' can not be called on a variable that has not been defined by 'define'.";
      }
      // otherwise we are ok and can proceed with evaluation
      return (env[expr[1]] = evalScheem(expr[2], env));
    case 'begin':
      expr.shift();
      for (var i = 0, len = expr.length - 1; i < len; i++) {
        evalScheem(expr[i], env);
      }
      return evalScheem(expr[len], env);
    case '=':
      return evalScheem(expr[1], env) === evalScheem(expr[2], env) ? '#t' : '#f';
    case '<':
      return evalScheem(expr[1], env) < evalScheem(expr[2], env) ? '#t' : '#f';
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
  }
};

if (typeof module !== 'undefined') {
  module.exports.evalScheem = evalScheem;
}
