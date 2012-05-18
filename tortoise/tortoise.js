// begin Turtle object
var Turtle = function(x, y, w, h) {
  this.paper = Raphael(x, y, w, h);
  this.originx = w / 2;
  this.originy = h / 2;
  this.clear();
};
Turtle.prototype.clear = function() {
  this.paper.clear();
  this.x = this.originx;
  this.y = this.originy;
  this.angle = 90;
  this.pen = true;
  this.turtleimg = undefined();
  this.updateTurtle();
};
Turtle.prototype.updateTurtle = function() {
  if (this.turtleimg === undefined) {
    this.turtleimg = this.paper.image("./turtle2.png", 0, 0, 64, 64);
  }
  this.turtleimg.attr({
    x: this.x - 32, y: this.y - 32, transform: "r" + (-this.angle)
  });
  this.turtleimg.toFront();
};
Turtle.prototype.drawTo = function(x, y) {
  var x1 = this.x, y1 = this.y, params = {"stroke-width": 4};
  var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}", x1, y1, x, y)).attr(params);
};
Turtle.prototype.forward = function(d) {
  var radians = Raphael.rad(this.angle)
  var newx = this.x + Math.cos(radians) * d;
  var newy = this.y - Math.sin(radians) * d;
  if (this.pen) {
    this.drawTo(newx, newy);
  }
  this.x = newx; this.y = newy;
  this.updateTurtle();
};
Turtle.prototype.right = function(angle) {
  this.angle -= angle;
  this.updateTurtle();
};
Trutle.prototype.left = function(angle) {
  this.angle += angle;
  this.updateTurtle();
};
// end Turtle object

var myTurtle = new Turtle(0, 0, 400, 400);
var turtleFuncs = {
  'forward': function(d) {
    myTurtle.forward(d);
  },
  'right': function(angle) {
    myTurtle.right(angle);
  },
  'left': function(angle) {
    myTurtle.left(angle);
  }
};
var init_env = {bindings: {forward:}, outer: null};

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
