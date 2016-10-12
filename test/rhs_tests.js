const {assert} = require('chai');
const {jsdom} = require('jsdom');

const {dom, func, rule, ruleset, score, type, typeIn} = require('../index');


describe('RHS', function () {
    it('combines different calls piecewise, with rightmost repeated subfacts shadowing', function () {
        const rhs = type('foo').score(5).func(node => ({score: 6})).asRhs();
        assert.deepEqual(rhs.fact('dummy'), {type: 'foo', score: 6});
    });

    it('has same-named calls shadow, with rightmost winning', function () {
        const rhs = func(node => ({score: 1})).func(node => ({note: 'foo'})).asRhs();
        assert.deepEqual(rhs.fact('dummy'), {note: 'foo'});
    });

    it('runs callbacks only once', function () {
        let count = 0;
        function addOne() {
            count++;
            return {};
        }
        const rhs = func(addOne).asRhs();
        assert.deepEqual(rhs.fact('dummy'), {});
        assert.equal(count, 1);
    });

    it('ignores unexpected subfacts returned from func() callbacks', function () {
        const rhs = func(node => ({conserveScore: true, score: 3})).asRhs();
        assert.deepEqual(rhs.fact('dummy'), {score: 3});
    });

    it('enforces scoreUpTo()', function () {
        const doc = jsdom('<p></p>');
        const rules = ruleset(
            rule(dom('p'), score(8).type('para').scoreUpTo(3))
        );
        const facts = rules.against(doc);
        assert.throws(() => facts.get(type('para')),
                      'Score of 8 exceeds the declared scoreUpTo(3).');
    });

    it('works fine when scoreUpTo() is satisfied', function () {
        const doc = jsdom('<p></p>');
        const rules = ruleset(
            rule(dom('p'), score(2).type('para').scoreUpTo(3))
        );
        const facts = rules.against(doc);
        assert.equal(facts.get(type('para'))[0].getScore('para'), 2);
    });

    it('enforces typeIn()', function () {
        const doc = jsdom('<p></p>');
        const rules = ruleset(
            rule(dom('p'), typeIn('nope').type('para'))
        );
        const facts = rules.against(doc);
        assert.throws(() => facts.get(type('para')),
                      'A right-hand side claimed, via typeIn(...) to emit one of the types [object Set] but actually emitted para.');
        // TODO: Fix lack of set pretty-printing in error message.
    });

    it('works fine when typeIn() is satisfied', function () {
        const doc = jsdom('<p></p>');
        const rules = ruleset(
            rule(dom('p'), typeIn('para').type('para'))
        );
        const facts = rules.against(doc);
        assert.equal(facts.get(type('para')).length, 1);
    });
});
