// computes durations of mus expression segments
var end_time = function(init_time, expr) {
  var left, right;
  switch (expr.tag) {
    case 'note': // base case
      return init_time + expr.dur;
    case 'rest': // another base case
      return init_time + expr.dur;
    case 'seq': // seq case
      return end_time(end_time(init_time, expr.left), expr.right);
    case 'par': // par case
      left = end_time(init_time, expr.left);
      right = end_time(init_time, expr.right);
      return Math.max.apply(null, [left, right]);
  }
};

// flattens out the mus expression tree to an array of note objects
var compile_aux = function(init_time, expr) {
  var left, right;
  switch (expr.tag) {
    case 'note': // base case
      return [{tag: 'note', pitch: expr.pitch, start: init_time, dur: expr.dur}];
    case 'rest': // another base case
      return [{tag: 'rest', start: init_time, dur: expr.dur}];
    case 'seq': // seq case
      left = compile_aux(init_time, expr.left);
      right = compile_aux(end_time(init_time, expr.left), expr.right);
      return left.concat(right);
    case 'par': // par case
      left = compile_aux(init_time, expr.left);
      right = compile_aux(init_time, expr.right);
      return left.concat(right);
  }
};

var compile = function(expr) {
  return compile_aux(0, expr);
};

// some test data
var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'note', pitch: 'c3', dur: 250 },
         right: { tag: 'note', pitch: 'g4', dur: 500 } },
      right:
       { tag: 'par',
         left: { tag: 'note', pitch: 'd3', dur: 500 },
         right: { tag: 'note', pitch: 'f4', dur: 250 } } };
var melody_note = [
    { tag: 'note', pitch: 'c3', start: 0, dur: 250 },
    { tag: 'note', pitch: 'g4', start: 0, dur: 500 },
    { tag: 'note', pitch: 'd3', start: 500, dur: 500 },
    { tag: 'note', pitch: 'f4', start: 500, dur: 250 } ];
    
console.log(compile(melody_mus));
console.log(melody_note);
