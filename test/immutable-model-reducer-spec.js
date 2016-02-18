import { assert } from 'chai';

import { actions } from '../lib';

import {
  createModelReducer as immutableCreateModelReducer
} from '../lib/immutable';
import Immutable from 'immutable';

describe('immutable createModelReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = immutableCreateModelReducer('test');

    assert.isFunction(reducer);
  });

  it('should create a reducer with initial state given a model and initial state', () => {
    const reducer = immutableCreateModelReducer('test',
      Immutable.fromJS({ foo: 'bar' }));

    assert.deepEqual(
      reducer(undefined, {}),
      Immutable.fromJS({ foo: 'bar' }));
  });

  it('should ignore external actions', () => {
    const model = Immutable.fromJS({ foo: 'bar' });
    const reducer = immutableCreateModelReducer('test', model);
    const externalAction = {
      type: 'EXTERNAL_ACTION'
    };

    assert.equal(
      reducer(undefined, externalAction),
      model);
  });

  it('should ignore actions that are outside of the model', () => {
    const model = Immutable.fromJS({ foo: 'bar' });
    const reducer = immutableCreateModelReducer('test', model);

    assert.equal(
      reducer(undefined, actions.change('outside', 'value')),
      model);

    assert.equal(
      reducer(undefined, actions.change('external.value', 'value')),
      model);
  });

  it('should update the state given a change action', () => {
    const model = Immutable.fromJS({ foo: 'bar', one: 'two' });
    const reducer = immutableCreateModelReducer('test', model);

    assert.ok(
      reducer(undefined, actions.change('test.foo', 'new'))
        .equals(Immutable.fromJS({ foo: 'new', one: 'two' }))
    );
  });

  it('should be able to handle models with depth > 1', () => {
    const model = Immutable.fromJS({ 'bar' : [1, 2, 3] });
    const deepReducer = immutableCreateModelReducer('test.foo');
    const shallowReducer = (state = Immutable.fromJS({ original: 'untouched', foo: model }), action) => {
      return state.set('foo', deepReducer(state.get('foo'), action));
    }

    assert.ok(
      shallowReducer(undefined, {})
        .equals(Immutable.fromJS({ original: 'untouched', foo: model }))
    );

    assert.ok(
      shallowReducer(undefined, actions.change('test.foo', 'something else'))
        .equals(Immutable.fromJS({ original: 'untouched', foo: 'something else' }))
    );

    assert.ok(
      shallowReducer(undefined, actions.change('test.foo.bar', 'baz'))
        .equals(Immutable.fromJS({ original: 'untouched', foo: { bar: 'baz' } }))
    );

    assert.ok(
      shallowReducer(undefined, actions.change('test.foo.bar[1]', 'two'))
        .equals(Immutable.fromJS({ original: 'untouched', foo: { bar: [1, 'two', 3] } }))
    );
  });
  
  it('should handle model at deep state path', () => {
    const reducer = immutableCreateModelReducer('forms.test', Immutable.Map());

    assert.ok(
      reducer(undefined, actions.change('forms.test.foo', 'new'))
        .equals(Immutable.fromJS({ foo: 'new' }))
    );

    assert.ok(
      reducer(undefined, actions.change('forms.different.foo', 'new'))
        .equals(Immutable.Map()),
      'should only change when base path is equal');
  });
});
