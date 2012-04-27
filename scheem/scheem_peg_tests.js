var peg = require('pegjs');
var assert = require('assert');
var fs = require('fs');
var scheem = require('./scheem.js');
var scheem_parser = scheem.parse;

// verify that regular and multiline comments are parsed and ignored
assert.deepEqual(scheem_parser(";; asdf\n"), "");
assert.deepEqual(scheem_parser(";; asdf\n;; asdf\n"), "");

// verify that regular and quoted lists are parsed
assert.deepEqual(scheem_parser("(+ 1 2)"), ['+', '1', '2']);
assert.deepEqual(scheem_parser("'(+ 1 2)"), ['quote', ['+', '1', '2']]);

// verify that nested lists are also parsed as expected
assert.deepEqual(scheem_parser("(+ 1 (+ 2 3))"), ["+", "1", ["+", "2", "3"]]);
assert.deepEqual(scheem_parser("(+ 1 '(+ 2 3))"), ["+", "1", ['quote', ["+", "2", "3"]]]);
