import { assert } from 'chai';
import should from 'should';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { actions, createModelReducer } from '../src';

describe('RSF model actions', () => {
  describe('change()', () => {
    it('should modify the model given a shallow path', () => {
      const reducer = createModelReducer('foo');

      let actual = reducer({}, actions.change('foo.bar', 'string'));
      assert.deepEqual(actual, { bar: 'string' });
    });

    it('should modify the model given a deep path', () => {
      const reducer = createModelReducer('foo');

      let actual = reducer({}, actions.change('foo.bar.baz', 'string'));
      assert.deepEqual(actual, { bar: { baz: 'string' } });
    });
  });

  describe('thunk action creators', () => {
    let actionTests = {
      push: {
        init: { foo: [123] },
        params: ['test.foo', 456],
        expected: { foo: [123, 456] }
      },
      xor: {
        init: { foo: [123, 456] },
        params: ['test.foo', 456],
        expected: { foo: [123] }
      },
      toggle: {
        init: { foo: true },
        params: ['test.foo'],
        expected: { foo: false }
      },
      filter: {
        init: { foo: [1, 2, 3, 4, 5, 6] },
        params: ['test.foo', (n) => n % 2 === 0],
        expected: { foo: [2, 4, 6] }
      },
      map: {
        init: { foo: [1, 2, 3, 4, 5] },
        params: ['test.foo', (n) => n * 2],
        expected: { foo: [2, 4, 6, 8, 10] }
      },
      remove: {
        init: { foo: ['first', 'second', 'third'] },
        params: ['test.foo', 1],
        expected: { foo: ['first', 'third'] }
      }
    }

    Object.keys(actionTests).map((action) => {
      let { init, params, expected } = actionTests[action];

      describe(`${action}()`, () => {
        it('should modify the model to the expected result', (done) => {
          const reducer = createModelReducer('test');
          const dispatch = (action) => {
            done(assert.deepEqual(
              reducer(init, action),
              expected));
          }
          const getState = () => ({ test: init });

          actions[action](...params)(dispatch, getState);
        });
      });
    })
  })
})
