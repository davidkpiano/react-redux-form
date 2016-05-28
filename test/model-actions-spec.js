import { assert } from 'chai';
import { combineReducers } from 'redux';
import { actions, modelReducer, formReducer } from '../src';

describe('model actions', () => {
  describe('load()', () => {
    it('should load model values', () => {
      const reducer = modelReducer('foo');

      const actual = reducer({}, actions.load('foo', { bar: 'string' }));
      assert.deepEqual(actual, { bar: 'string' });
    });

    it('should load model and form stay untouched', () => {
      const reducer = combineReducers({
        foo: modelReducer('foo'),
        fooForm: formReducer('foo'),
      });

      const actual = reducer({}, actions.load('foo', { bar: 'string' }));
      assert.deepEqual(actual.foo, { bar: 'string' });
      assert.equal(actual.fooForm.dirty, false);
      assert.equal(actual.fooForm.untouched, true);
    });
  });

  describe('change()', () => {
    it('should modify the model given a shallow path', () => {
      const reducer = modelReducer('foo');

      const actual = reducer({}, actions.change('foo.bar', 'string'));
      assert.deepEqual(actual, { bar: 'string' });
    });

    it('should modify the model given a deep path', () => {
      const reducer = modelReducer('foo');

      const actual = reducer({}, actions.change('foo.bar.baz', 'string'));
      assert.deepEqual(actual, { bar: { baz: 'string' } });
    });
  });

  describe('reset()', () => {
    it('should reset the model to the initial state provided in the reducer', () => {
      const reducer = modelReducer('test', {
        foo: 'initial',
      });

      const actual = reducer({ foo: 'bar' }, actions.reset('test.foo'));

      assert.deepEqual(actual, { foo: 'initial' });
    });

    it('should set the model to undefined if an initial state was not provided from a deep model',
      () => {
        const reducer = modelReducer('test', {
          foo: 'initial',
        });

        const actual = reducer({ bar: { baz: 'uninitialized' } }, actions.reset('test.bar.baz'));

        assert.isDefined(actual.bar);

        assert.isUndefined(actual.bar.baz);
      });

    it('should set the model to undefined if an initial state was not provided', () => {
      const reducer = modelReducer('test', {
        foo: 'initial',
      });

      const actual = reducer({ bar: 'uninitialized' }, actions.reset('test.bar'));

      assert.isUndefined(actual.bar);
    });

    it('should be able to reset an entire model', () => {
      const initialState = {
        foo: 'test foo',
        bar: 'test bar',
        baz: { one: 'two' },
      };

      const reducer = modelReducer('test', initialState);

      const actual = reducer({}, actions.reset('test'));

      assert.deepEqual(actual, initialState);
    });
  });

  describe('thunk action creators', () => {
    const actionTests = {
      push: [
        {
          init: { foo: [123] },
          params: ['test.foo', 456],
          expected: { foo: [123, 456] },
        },
        {
          init: {},
          params: ['test.foo', 456],
          expected: { foo: [456] },
        },
      ],
      xor: [
        {
          init: { foo: [123, 456] },
          params: ['test.foo', 456],
          expected: { foo: [123] },
        },
        {
          init: { foo: ['primitive', { a: 'b' }] },
          params: ['test.foo', { a: 'b' }, (item) => item.a === 'b'],
          expected: { foo: ['primitive'] },
        },
      ],
      toggle: [
        {
          init: { foo: true },
          params: ['test.foo'],
          expected: { foo: false },
        },
      ],
      filter: [
        {
          init: { foo: [1, 2, 3, 4, 5, 6] },
          params: ['test.foo', n => n % 2 === 0],
          expected: { foo: [2, 4, 6] },
        },
      ],
      map: [
        {
          init: { foo: [1, 2, 3, 4, 5] },
          params: ['test.foo', n => n * 2],
          expected: { foo: [2, 4, 6, 8, 10] },
        },
      ],
      remove: [
        {
          init: { foo: ['first', 'second', 'third'] },
          params: ['test.foo', 1],
          expected: { foo: ['first', 'third'] },
        },
      ],
      move: [
        {
          init: { foo: ['first', 'second', 'third'] },
          params: ['test.foo', 2, 1],
          expected: { foo: ['first', 'third', 'second'] },
        },
        {
          init: { foo: ['first', 'second', 'third'] },
          params: ['test.foo', 0, 2],
          expected: { foo: ['second', 'third', 'first'] },
        },
        {
          init: { foo: [] },
          params: ['test.foo', 0, 2],
          expected: Error('Error moving array item: invalid bounds 0, 2'),
        },
      ],
      merge: [
        {
          init: { foo: { bar: 'baz', untouched: 'intact' } },
          params: ['test.foo', { bar: 'new', one: 'two' }],
          expected: { foo: { bar: 'new', one: 'two', untouched: 'intact' } },
        },
      ],
      omit: [
        {
          init: { one: 1, two: 2, three: 3 },
          params: ['test', 'two'],
          expected: { one: 1, three: 3 },
        },
        {
          init: { one: 1, two: 2, three: 3 },
          params: ['test', ['one', 'three']],
          expected: { two: 2 },
        },
      ],
    };

    /* eslint-disable array-callback-return */
    Object.keys(actionTests).map(action => {
      describe(`${action}()`, () => {
        actionTests[action].map(test => {
          const { init, params, expected } = test;
          it('should modify the model to the expected result', () => {
            const reducer = modelReducer('test');
            const dispatch = _action => {
              assert.deepEqual(
                reducer(init, _action),
                expected);
            };
            const getState = () => ({ test: init });

            if (expected instanceof Error) {
              assert.throws(() => actions[action](...params)(dispatch, getState), expected.message);
            } else {
              actions[action](...params)(dispatch, getState);
            }
          });
        });
      });
    });
    /* eslint-enable */
  });
});
