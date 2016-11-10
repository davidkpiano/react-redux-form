import { assert } from 'chai';
import { combineReducers } from 'redux';
import Immutable from 'immutable';
import { actions, modelReducer, formReducer, track } from '../src';
import {
  actions as immutableActions,
  modelReducer as immutableModelReducer,
} from '../immutable';

describe('model actions', () => {
  const testItems = [
    { id: 1, value: 'one' },
    { id: 2, value: 'two' },
    { id: 3, value: 'three' },
  ];

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
      assert.equal(actual.fooForm.$form.pristine, true);
      assert.equal(actual.fooForm.$form.touched, false);
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

    it('should work with a tracker', () => {
      const reducer = modelReducer('foo', testItems);

      const dispatch = (action) => {
        const actual = reducer(undefined, action);
        assert.deepEqual(actual[1], { id: 2, value: 'tracked' });
      };

      const getState = () => ({ foo: testItems });

      actions.change(
        track('foo[].value', { id: 2 }),
        'tracked')(dispatch, getState);
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
        {
          init: [
            testItems[0],
            { id: 2, value: ['two'] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), 'pushed'],
          expected: [
            testItems[0],
            {
              id: 2,
              value: ['two', 'pushed'],
            },
            testItems[2],
          ],
          tracked: true,
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
          params: ['test.foo', { a: 'b' }, (item) => (item.get ? item.get('a') : item.a) === 'b'],
          expected: { foo: ['primitive'] },
          immutable: false,
        },
        {
          init: [
            testItems[0],
            { id: 2, value: ['two'] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), 'two'],
          expected: [
            testItems[0],
            { id: 2, value: [] },
            testItems[2],
          ],
          tracked: true,
        },
      ],
      toggle: [
        {
          init: { foo: true },
          params: ['test.foo'],
          expected: { foo: false },
        },
        {
          init: testItems,
          params: [track('test[].value', { id: 2 })],
          expected: [
            testItems[0],
            { id: 2, value: false },
            testItems[2],
          ],
          tracked: true,
        },
      ],
      filter: [
        {
          init: { foo: [1, 2, 3, 4, 5, 6] },
          params: ['test.foo', n => n % 2 === 0],
          expected: { foo: [2, 4, 6] },
        },
        {
          init: [
            testItems[0],
            { id: 2, value: [1, 2, 3, 4, 5, 6] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), n => n % 2 === 0],
          expected: [
            testItems[0],
            { id: 2, value: [2, 4, 6] },
            testItems[2],
          ],
          tracked: true,
        },
      ],
      map: [
        {
          init: { foo: [1, 2, 3, 4, 5] },
          params: ['test.foo', n => n * 2],
          expected: { foo: [2, 4, 6, 8, 10] },
        },
        {
          init: [
            testItems[0],
            { id: 2, value: [1, 2, 3, 4, 5] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), n => n * 2],
          expected: [
            testItems[0],
            { id: 2, value: [2, 4, 6, 8, 10] },
            testItems[2],
          ],
          tracked: true,
        },
      ],
      remove: [
        {
          init: { foo: ['first', 'second', 'third'] },
          params: ['test.foo', 1],
          expected: { foo: ['first', 'third'] },
        },
        {
          init: [
            testItems[0],
            { id: 2, value: ['first', 'second', 'third'] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), 1],
          expected: [
            testItems[0],
            { id: 2, value: ['first', 'third'] },
            testItems[2],
          ],
          tracked: true,
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
        {
          init: [
            testItems[0],
            { id: 2, value: ['first', 'second', 'third'] },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), 0, 2],
          expected: [
            testItems[0],
            { id: 2, value: ['second', 'third', 'first'] },
            testItems[2],
          ],
          tracked: true,
        },
      ],
      merge: [
        {
          init: { foo: { bar: 'baz', untouched: 'intact' } },
          params: ['test.foo', { bar: 'new', one: 'two' }],
          expected: { foo: { bar: 'new', one: 'two', untouched: 'intact' } },
        },
        {
          init: [
            testItems[0],
            { id: 2, value: { bar: 'baz', untouched: 'intact' } },
            testItems[2],
          ],
          params: [
            track('test[].value', { id: 2 }),
            { bar: 'new', one: 'two' },
          ],
          expected: [
            testItems[0],
            { id: 2, value: { bar: 'new', one: 'two', untouched: 'intact' } },
            testItems[2],
          ],
          tracked: true,
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
        {
          init: [
            testItems[0],
            { id: 2, value: { one: 1, two: 2, three: 3 } },
            testItems[2],
          ],
          params: [track('test[].value', { id: 2 }), 'two'],
          expected: [
            testItems[0],
            { id: 2, value: { one: 1, three: 3 } },
            testItems[2],
          ],
          tracked: true,
        },
      ],
    };

    /* eslint-disable array-callback-return */
    Object.keys(actionTests).map((action) => {
      describe(`${action}()`, () => {
        actionTests[action].map((test) => {
          const { init, params, expected } = test;

          it('should modify the model to the expected result', () => {
            const reducer = modelReducer('test');
            const getState = () => ({ test: init });
            const dispatch = (_action) => {
              if (typeof _action === 'function') {
                _action(dispatch, getState);
              } else {
                assert.deepEqual(
                  reducer(init, _action),
                  expected);
              }
            };

            if (expected instanceof Error) {
              assert.throws(() => actions[action](...params)(dispatch, getState), expected.message);
            } else {
              actions[action](...params)(dispatch, getState);
            }
          });
        });
      });

      describe(`${action}() (Immutable.JS)`, () => {
        actionTests[action].map((test, i) => {
          const { init, params, expected, tracked } = test;

          // TODO: test tracker with immutablejs
          if (tracked) return;

          const initImmutable = Immutable.fromJS(init);
          const immutableParams = params.map((param) => Immutable.fromJS(param));

          it(`should modify the model to the expected result (${i})`, () => {
            const reducer = immutableModelReducer('test');
            const getState = () => ({ test: Immutable.fromJS(initImmutable) });
            const dispatch = (_action) => {
              if (typeof _action === 'function') {
                _action(dispatch, getState);
              } else {
                assert.deepEqual(
                  reducer(initImmutable, _action).toJS(),
                  expected, [reducer(initImmutable, _action), expected]);
              }
            };

            if (expected instanceof Error) {
              assert.throws(() =>
                immutableActions[action](...immutableParams)(dispatch, getState), expected.message);
            } else {
              immutableActions[action](...immutableParams)(dispatch, getState);
            }
          });
        });
      });
    });
    /* eslint-enable */
  });
});
