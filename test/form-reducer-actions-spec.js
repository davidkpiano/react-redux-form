import { assert } from 'chai';
import { actions, initialFieldState, getField } from '../src';
import formReducer from '../src/reducers/v1-form-reducer';

describe.only('formReducer() (V1)', () => {
  const nullAction = { type: '' };

  it('should exist as a function', () => {
    assert.isFunction(formReducer);
  });

  describe('FOCUS action', () => {
    const reducer = formReducer('user', { name: '' });

    const unfocusedState = reducer(undefined, nullAction);
    const focusedState = reducer(undefined, actions.focus('user.name'));

    it('should initially be unfocused', () => {    
      assert.containSubset(unfocusedState, {
        $form: { focus: false },
      });

      assert.containSubset(unfocusedState, {
        name: { focus: false },
      });
    });

    it('should set the specified field to focused', () => {
      assert.containSubset(focusedState.name, {
        focus: true,
      });
    });

    it('should set the form to focused', () => {
      assert.containSubset(focusedState.$form, {
        focus: true,
      });
    });
  });
});
