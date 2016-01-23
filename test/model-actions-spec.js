import { assert } from 'chai';
import should from 'should';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { actions, createModelReducer } from '../lib';

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

  describe('reset()', () => {
    it('should reset the model to the initial state provided in the reducer', () => {
      const reducer = createModelReducer('test', {
        foo: 'initial'
      });

      let actual = reducer({ foo: 'bar' }, actions.reset('test.foo'));

      assert.deepEqual(actual, { foo: 'initial' });
    });

    it('should set the model to undefined if an initial state was not provided from a deep model', () => {
      const reducer = createModelReducer('test', {
        foo: 'initial'
      });

      let actual = reducer({ bar: { baz: 'uninitialized' } }, actions.reset('test.bar.baz'));

      assert.isDefined(actual.bar);

      assert.isUndefined(actual.bar.baz);
    });

    it('should set the model to undefined if an initial state was not provided', () => {
      const reducer = createModelReducer('test', {
        foo: 'initial'
      });

      let actual = reducer({ bar: 'uninitialized' }, actions.reset('test.bar'));

      assert.isUndefined(actual.bar);
    });

    it('should be able to reset an entire model', () => {
      const initialState = {
        foo: 'test foo',
        bar: 'test bar',
        baz: { one: 'two' }
      };

      const reducer = createModelReducer('test', initialState);

      let actual = reducer({}, actions.reset('test'));

      assert.deepEqual(actual, initialState);
    });
  });

  describe('thunk action creators', () => {
    let actionTests = {
      push: [
        {
          init: { foo: [123] },
          params: ['test.foo', 456],
          expected: { foo: [123, 456] }
        },
        {
          init: { },
          params: ['test.foo', 456],
          expected: { foo: [456] }
        }
      ],
      xor: [
        {
          init: { foo: [123, 456] },
          params: ['test.foo', 456],
          expected: { foo: [123] }
        },
        {
          init: { foo: ['primitive', {'a': 'b'}] },
          params: ['test.foo', {'a': 'b'}],
          expected: { foo: ['primitive'] }
        }
      ],
      toggle: [
        {
          init: { foo: true },
          params: ['test.foo'],
          expected: { foo: false }
        }
      ],
      filter: [
        {
          init: { foo: [1, 2, 3, 4, 5, 6] },
          params: ['test.foo', (n) => n % 2 === 0],
          expected: { foo: [2, 4, 6] }
        }
      ],
      map: [
        {
          init: { foo: [1, 2, 3, 4, 5] },
          params: ['test.foo', (n) => n * 2],
          expected: { foo: [2, 4, 6, 8, 10] }
        }
      ],
      remove: [
        {
          init: { foo: ['first', 'second', 'third'] },
          params: ['test.foo', 1],
          expected: { foo: ['first', 'third'] }
        }
      ]
    }

    Object.keys(actionTests).map((action) => {

      describe(`${action}()`, () => {
        actionTests[action].map((test) => {        
          let { init, params, expected } = test;
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
        })
      });
    })
  })
})
