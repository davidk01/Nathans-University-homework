// converts notes to midi numbers
var note_to_midi_mapper = require('./note_mapping.js').note_to_midi_mapper;

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
      return Math.max.(left, right);
    case 'repeat': // segment repetion
      return init_time + expr.count * end_time(0, expr.section);
  }
};

// flattens out the mus expression tree to an array of note objects
var compile_aux = function(init_time, expr) {
  var left, right, repeat_acc = [], section_dur;
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
    case 'repeat': // repeat case
      section_dur = end_time(0, expr.section); // find out the duration of the repeating section
      for (var i = 0, len = expr.count; i < len; i++) { // accumulate
        repeat_acc = repeat_acc.concat(compile_aux(init_time + i * section_dur, expr.section));
      }
      return repeat_acc;
  }
};

// converts the compiled note array to another one in place that has
// midi pitch numbers instead of notes
var transform_to_midi = function(notes) {
  for (var i = 0, len = notes.length; i < len; i++) {
    notes[i].pitch = note_to_midi_mapper(notes[i].pitch);
  }
  return notes;
};

var compile = function(expr, midi_conversion) {
  var convert = midi_conversion || false; // see if the user wants the compiled output in terms of midi notes
  var compiled_notes = compile_aux(0, expr);
  return convert ? transform_to_midi(compiled_notes) : compiled_notes;
};

// some test data
var melody_mus = { tag: 'repeat', count: 3,
    section: { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'note', pitch: 'c3', dur: 250 },
         right: { tag: 'note', pitch: 'g4', dur: 500 } },
      right:
       { tag: 'par',
         left: { tag: 'note', pitch: 'd3', dur: 500 },
         right: { tag: 'note', pitch: 'f4', dur: 250 } } } };
var melody_note = [
    { tag: 'note', pitch: 'c3', start: 0, dur: 250 },
    { tag: 'note', pitch: 'g4', start: 0, dur: 500 },
    { tag: 'note', pitch: 'd3', start: 500, dur: 500 },
    { tag: 'note', pitch: 'f4', start: 500, dur: 250 } ];
console.log(melody_mus);
console.log(compile(melody_mus));
console.log(compile(melody_mus, true));
console.log(melody_note);
