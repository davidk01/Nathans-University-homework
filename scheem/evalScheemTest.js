if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('./scheem.js').evalScheem;
    var parse = require('./parser.js').scheem.parse;
} else {
    // In browser assume loaded by <script>
    var parse = scheem.parse;
    var assert = chai.assert;
}

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});
