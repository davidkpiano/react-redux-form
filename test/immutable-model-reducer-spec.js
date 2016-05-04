import { assert } from 'chai';
import Immutable from 'immutable';

import { actions } from '../src';
import { modelReducer as immutableModelReducer } from '../src/immutable';

describe('immutable modelReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = immutableModelReducer('test');

    assert.isFunction(reducer);
  });

  it('should create a reducer with initial state given a model and initial state', () => {
    const reducer = immutableModelReducer('test',
      Immutable.fromJS({ foo: 'bar' }));

    assert.deepEqual(
      reducer(undefined, {}),
      Immutable.fromJS({ foo: 'bar' }));
  });

  it('should ignore external actions', () => {
    const model = Immutable.fromJS({ foo: 'bar' });
    const reducer = immutableModelReducer('test', model);
    const externalAction = {
      type: 'EXTERNAL_ACTION',
    };

    assert.equal(
      reducer(undefined, externalAction),
      model);
  });

  it('should ignore actions that are outside of the model', () => {
    const model = Immutable.fromJS({ foo: 'bar' });
    const reducer = immutableModelReducer('test', model);

    assert.equal(
      reducer(undefined, actions.change('outside', 'value')),
      model);

    assert.equal(
      reducer(undefined, actions.change('external.value', 'value')),
      model);
  });

  it('should update the state given a change action', () => {
    const model = Immutable.fromJS({ foo: 'bar', one: 'two' });
    const reducer = immutableModelReducer('test', model);

    assert.ok(
      reducer(undefined, actions.change('test.foo', 'new'))
        .equals(Immutable.fromJS({ foo: 'new', one: 'two' }))
    );
  });

  it('should be able to handle models with depth > 1', () => {
    const model = Immutable.fromJS({ bar: [1, 2, 3] });
    const deepReducer = immutableModelReducer('test.foo');
    const shallowReducer = (state = Immutable.fromJS({
      original: 'untouched',
      foo: model,
    }), action) => state.set('foo', deepReducer(state.get('foo'), action));

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
    const reducer = immutableModelReducer('forms.test', Immutable.Map());

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
