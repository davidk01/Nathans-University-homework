var builtin_functions = {
  '<': function(x,y) {return x < y;},
  '+': function(x,y) {return x + y;},
  '*': function(x,y) {return x * y;}
};

var lookup = function(name, env) {
  if (env === null) { // we reached the root and couldn't find anything so throw an exception
    throw "Variable not found: " + name;
  }
  var value = env.bindings[name]; // see if name exists in current scope
  return value ? value : lookup(name, env.outer); // return if found or continue upwards if not
};

var add_binding = function(env, name, value) {
  if (env.bindings[name]) { // variable already exists so we throw an exception
    throw "Variable already exists: " + name;
  }
  return env.bindings[name] = value;
};

var update = function(env, name, value) {
  if (env === null) { // reached the root and couldn't find the value so throw an exception
    throw "Variable is undefined: " + name;
  }
  if (env.bindings[name]) { // value exists in this scope so update and return the new value
    return env.bindings[name] = value;
  } // otherwise we need to walk up the scope chain
  return update(env.outer, name, value);
};

var evalExpr = function(expr, env) {
  if (typeof expr === 'number') {
    return expr;
  }
  switch (expr.tag) {
    case '<':
    case '+':
    case '*':
      return builtin_functions[expr.tag](evalExpr(expr.left, env), evalExpr(expr.right, env));
    case 'call': // function call
      var func = lookup(env, expr.name); // lookup the function
      var args = expr.args.map(function(arg){return evalExpr(arg, env);}); // evaluate the arguments
      return func.apply(null, args); // call the function
    case 'ident': // variable lookup
      return evalExpr(lookup(env, expr.name), env); // find the variable and evaluate it
  }
};

var evalStatement = function(stmt, env) {
  switch (stmt.tag) {
    case 'ignore': // simple statement so we just evaluate it
      return evalExpr(stmt.body, env);
    case 'var': // variable declaration so we add the binding with default value of 0
      return add_binding(env, stmt.name, 0);
    case ':=': // assignment
      var val = evalExpr(stmt.right, env); // evaluate
      return update(env, stmt.left, val); // update
    case 'if':
      if (evalExpr(stmt.expr, env)) {
        return evalStatements(stmt.body, env);
      }
      return evalExpr(stmt.expr, env) ? evalStatements(stmt.body, env) : undefined;
    case 'repeat':
      var ret_val, rep_count = evalExpr(stmt.expr, env);
      for (var i = 0; i < rep_count; i++) {
        ret_val = evalStatements(stmt.body, env);
      }
      return ret_val;
    case 'define':
      var new_func = function() {
        var new_env, new_bindings = {};
        for (var i = 0, len = stmt.args.length; i < len; i++) {
          new_bindings[stmt.args[i]] = arguments[i];
        }
        new_env = {bindings:new_bindings, outer:env};
        return evalStatements(stmt.body, new_env);
      };
      return add_binding(env, stmt.name, new_func);
  }
};

var evalStatements = function(stmts, env) {
  var ret_val;
  for (var i = 0, len = stmts.length; i < len; i++) {
    ret_val = evalStatement(stmts[i], env);
  }
  return ret_val;
};

if (typeof module !== 'undefined') {
  module.exports.tortoise = evalExpr;
}
