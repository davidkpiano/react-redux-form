import { assert } from 'chai';
import should from 'should';

import actions from '../src/actions';

describe('RSF model action creators', () => {
  describe('actions.change()', () => {  
    it('should return an action', () => {
      assert.deepEqual(
        actions.change('foo.bar', 'baz'),
        {
          model: 'foo.bar',
          multi: false,
          type: 'rsf/change',
          value: 'baz'
        });
    });

    it('should detect when a model is multivalue', () => {
      assert.isTrue(
        actions.change('multi.value[]', 'baz').multi);
    });
  });

  describe('actions.reset()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.reset('foo.bar'),
        {
          type: 'rsf/reset',
          model: 'foo.bar',
        });
    });
  });

  describe('actions.xor() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.xor('foo.bar', 2);
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection via symmetric difference', (done) => {
      let fn = actions.xor('foo.bar', 2);
      let dispatch = (action) => {
        done(assert.deepEqual(
          action.value,
          [ 1, 3 ]));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.push() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.push('foo.bar', 4);
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by pushing an item to it', (done) => {
      let fn = actions.push('foo.bar', 4);
      let dispatch = (action) => {
        done(assert.deepEqual(
          action.value,
          [ 1, 2, 3, 4 ]));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.toggle() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.push('foo.bar');
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: false
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should toggle the model value', (done) => {
      let fn = actions.toggle('foo.bar');
      let dispatch = (action) => {
        done(assert.isTrue(
          action.value));
      };
      let getState = () => ({
        foo: {
          bar: false
        }
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.filter() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.filter('foo.bar', (i) => i % 2 == 0);
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3, 4 ]
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by returning filtered items', (done) => {
      let fn = actions.filter('foo.bar', (i) => i % 2 == 0);
      let dispatch = (action) => {
        done(assert.deepEqual(
          action.value,
          [ 2, 4 ]));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3, 4 ]
        }
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.map() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.map('foo.bar', (i) => i * 2);
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by returning mapped items', (done) => {
      let fn = actions.map('foo.bar', (i) => i * 2);
      let dispatch = (action) => {
        done(assert.deepEqual(
          action.value,
          [ 2, 4, 6 ]));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3 ]
        }
      });

      fn(dispatch, getState);
    });
  });

  describe('actions.remove() thunk', () => {
    it('should return a function that dispatches a change event', (done) => {
      let fn = actions.remove('foo.bar', 2);
      let dispatch = (action) => {
        done(assert.equal(
          action.type,
          'rsf/change'));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3, 4 ]
        }
      });

      assert.isFunction(fn);

      fn(dispatch, getState);
    });

    it('should change a collection by removing the item at the specified index', (done) => {
      let fn = actions.remove('foo.bar', 2);
      let dispatch = (action) => {
        done(assert.deepEqual(
          action.value,
          [ 1, 2, 4 ]));
      };
      let getState = () => ({
        foo: {
          bar: [ 1, 2, 3, 4 ]
        }
      });

      fn(dispatch, getState);
    });
  });
});

describe('RSF field action creators', () => {
  describe('actions.focus()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.focus('foo.bar'),
        {
          type: 'rsf/focus',
          model: 'foo.bar'
        });
    });
  });

  describe('actions.blur()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.blur('foo.bar'),
        {
          type: 'rsf/blur',
          model: 'foo.bar'
        });
    });
  });

  describe('actions.setPristine()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setPristine('foo.bar'),
        {
          type: 'rsf/setPristine',
          model: 'foo.bar'
        });
    });
  });

  describe('actions.setDirty()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setDirty('foo.bar'),
        {
          type: 'rsf/setDirty',
          model: 'foo.bar'
        });
    });
  });

  describe('actions.setInitial()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setInitial('foo.bar'),
        {
          type: 'rsf/setInitial',
          model: 'foo.bar'
        });
    });
  });

  describe('actions.setValidity()', () => {
    it('should return an action', () => {
      assert.deepEqual(
        actions.setValidity('foo.bar', true),
        {
          type: 'rsf/setValidity',
          model: 'foo.bar',
          validity: true
        });
    });
  });
})
