import { assert } from 'chai';
import { actions, actionTypes } from '../src';

describe('model action creators', () => {
  describe('actions.change()', () => {
    it('should return an action', () => {
      assert.containSubset(
        actions.change('foo.bar', 'baz'),
        {
          model: 'foo.bar',
          multi: false,
          type: actionTypes.CHANGE,
          value: 'baz',
        });
    });

    it('should detect when a model is multi-value', () => {
      assert.isTrue(
        actions.change('multi.value[]', 'baz').multi);
    });
  });

  describe('actions.reset()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.reset('foo.bar'),
        {
          type: actionTypes.RESET,
          model: 'foo.bar',
        });
    });
  });

  describe('actions.xor() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.xor('foo.bar', 2);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection via symmetric difference', done => {
      const fn = actions.xor('foo.bar', 2);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [1, 3]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.push() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.push('foo.bar', 4);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by pushing an item to it', done => {
      const fn = actions.push('foo.bar', 4);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [1, 2, 3, 4]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.toggle() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.push('foo.bar');
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: false,
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should toggle the model value', done => {
      const fn = actions.toggle('foo.bar');
      const dispatch = action => {
        done(assert.isTrue(
          action.value));
      };
      const getState = () => ({
        foo: {
          bar: false,
        },
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.filter() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.filter('foo.bar', i => i % 2 === 0);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by returning filtered items', done => {
      const fn = actions.filter('foo.bar', i => i % 2 === 0);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [2, 4]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.map() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.map('foo.bar', i => i * 2);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by returning mapped items', done => {
      const fn = actions.map('foo.bar', i => i * 2);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [2, 4, 6]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3],
        },
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.remove() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.remove('foo.bar', 2);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by removing the item at the specified index', done => {
      const fn = actions.remove('foo.bar', 2);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [1, 2, 4]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      fn(dispatch, getState);
    });

    it('should remove from collections of complex values', (done) => {
      const getState = () => ({
        foo: {
          bar: [
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
          ],
        },
      });

      const getNextState = () => ({
        foo: {
          bar: [
            { value: 1 },
            { value: 2 },
            { value: 4 },
          ],
        },
      });

      const nextDispatch = action => {
        done(assert.deepEqual(
          action.value,
          [
            { value: 1 },
            { value: 2 },
          ]));
      };

      const dispatch = action => {
        assert.deepEqual(
          action.value,
          [
            { value: 1 },
            { value: 2 },
            { value: 4 },
          ]);

        actions.remove('foo.bar', 2)(nextDispatch, getNextState);
      };

      actions.remove('foo.bar', 2)(dispatch, getState);
    });
  });

  describe('actions.move() thunk', () => {
    it('should return a function that dispatches a change event', done => {
      const fn = actions.move('foo.bar', 2, 0);
      const dispatch = action => {
        done(assert.equal(
          action.type,
          actionTypes.CHANGE));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by moving the item to the specified index', done => {
      const fn = actions.move('foo.bar', 2, 0);
      const dispatch = action => {
        done(assert.deepEqual(
          action.value,
          [3, 1, 2, 4]));
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      fn(dispatch, getState);
    });

    it('should ignore invalid from index', () => {
      const fn = actions.move('foo.bar', 4, 0);
      const dispatch = () => {
        assert.fail('Should not dispatch action');
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      assert.throws(() => fn(dispatch, getState), 'Error moving array item: invalid bounds 4, 0');
    });

    it('should ignore invalid to index', () => {
      const fn = actions.move('foo.bar', 3, 4);
      const dispatch = () => {
        assert.fail('Should not dispatch action');
      };
      const getState = () => ({
        foo: {
          bar: [1, 2, 3, 4],
        },
      });

      assert.throws(() => fn(dispatch, getState), 'Error moving array item: invalid bounds 3, 4');
    });
  });
});

describe('field action creators', () => {
  describe('actions.focus()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.focus('foo.bar'),
        {
          type: actionTypes.FOCUS,
          model: 'foo.bar',
          value: undefined,
        });
    });
  });

  describe('actions.blur()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.blur('foo.bar'),
        {
          type: actionTypes.BLUR,
          model: 'foo.bar',
        });
    });
  });

  describe('actions.setPristine()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setPristine('foo.bar'),
        {
          type: actionTypes.SET_PRISTINE,
          model: 'foo.bar',
        });
    });
  });

  describe('actions.setDirty()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setDirty('foo.bar'),
        {
          type: actionTypes.SET_DIRTY,
          model: 'foo.bar',
        });
    });
  });

  describe('actions.setInitial()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setInitial('foo.bar'),
        {
          type: actionTypes.SET_INITIAL,
          model: 'foo.bar',
        });
    });
  });

  describe('actions.setValidity()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setValidity('foo.bar', true),
        {
          type: actionTypes.SET_VALIDITY,
          model: 'foo.bar',
          validity: true,
        });
    });
  });
});
