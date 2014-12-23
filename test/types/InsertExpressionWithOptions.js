/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  InsertExpressionWithOptions = types._InsertExpressionWithOptions,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('InsertExpressionWithOptions', function () {
  it('returns a statement', function () {
    var expr = new InsertExpressionWithOptions(null, 'x', 'y', 'a');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a INSERT statement', function () {
    expect(new InsertExpressionWithOptions(null, 'x', 'y', 'a').toAQL()).to.equal('INSERT x INTO y OPTIONS a');
  });
  it('auto-casts expressions', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new InsertExpressionWithOptions(null, arr[i], 'y', 'a').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new InsertExpressionWithOptions(null, op, 'y', 'a').toAQL()).to.equal('INSERT (x) INTO y OPTIONS a');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new InsertExpressionWithOptions(null, st, 'y', 'a').toAQL()).to.equal('INSERT (x) INTO y OPTIONS a');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new InsertExpressionWithOptions(null, ps, 'y', 'a').toAQL()).to.equal('INSERT (x) INTO y OPTIONS a');
  });
  it('wraps well-formed strings as collection names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'totally-radical',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new InsertExpressionWithOptions(null, 'x', values[i]).collection.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as collection names', function () {
    var values = [
      '',
      '-x',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new InsertExpressionWithOptions(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as collection names', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new InsertExpressionWithOptions(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('auto-casts options', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new InsertExpressionWithOptions(null, 'x', 'y', arr[i]).opts.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation options in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'a';};
    expect(new InsertExpressionWithOptions(null, 'x', 'y', op).toAQL()).to.equal('INSERT x INTO y OPTIONS (a)');
  });
  it('wraps Statement options in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'a';};
    expect(new InsertExpressionWithOptions(null, 'x', 'y', st).toAQL()).to.equal('INSERT x INTO y OPTIONS (a)');
  });
  it('wraps PartialStatement options in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'a';};
    expect(new InsertExpressionWithOptions(null, 'x', 'y', ps).toAQL()).to.equal('INSERT x INTO y OPTIONS (a)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new InsertExpressionWithOptions(ps, 'x', 'y', 'a').toAQL()).to.equal('$ INSERT x INTO y OPTIONS a');
  });
});