import { assert } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';


import { formReducer, modelReducer, actions, actionTypes } from '../src';

describe('batched actions', (done) => {
  const mockStore = configureMockStore([thunk]);

  const action = actions.batch('test.foo', [
    actions.change('test.foo', 'testing'),
    actions.focus('test.foo'),
    actions.toggle('test.foo'),
  ]);

  it('should batch actions', () => {
    const expectedActions = [
      {
        type: actionTypes.BATCH,
        model: 'test.foo',
        actions: [
          {
            model: 'test.foo',
            multi: false,
            silent: false,
            type: 'rrf/change',
            value: 'testing',
          },
          {
            model: 'test.foo',
            type: 'rrf/focus',
          },
        ],
      },

      { model: 'test.foo', type: actionTypes.CHANGE, value: true },
    ];

    const store = mockStore({}, expectedActions, done);

    store.dispatch(action);
  });

  it('should update the form reducer with each action', () => {
    const reducer = formReducer('test');

    const testAction = actions.batch('test.foo', [
      actions.change('test.foo', 'testing'),
      actions.focus('test.foo'),
    ]);

    const actual = reducer(undefined, testAction);

    assert.containSubset(
      actual.fields.foo,
      {
        dirty: true,
        pristine: false,
        focus: true,
        blur: false,
      });
  });

  it('should update the model reducer with each action', () => {
    const reducer = modelReducer('test');

    const testAction = actions.batch('test.foo', [
      actions.change('test.foo', 'testing'),
      actions.focus('test.foo'),
    ]);

    const actual = reducer(undefined, testAction);

    assert.equal(actual.foo, 'testing');
  });
});
