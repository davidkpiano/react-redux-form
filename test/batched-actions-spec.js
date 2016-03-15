// import { assert } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';


import { actions, actionTypes } from '../src';

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
});
