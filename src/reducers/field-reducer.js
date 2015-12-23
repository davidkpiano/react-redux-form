import { get, set } from 'lodash/object';
import { xor } from 'lodash/array';
import { startsWith } from 'lodash/string';
import { filterActions } from 'redux-ignore';
import { cloneDeep, isArray } from 'lodash/lang';
import { filter, map } from 'lodash/collection';

function setField(state, model, props) {
  return set(state, model, {
    ...initialFieldState,
    ...get(state, model),
    ...props
  });
}

const initialFieldState = {
  focus: false,
  blur: true,
  pristine: true,
  dirty: false,
  touched: false,
  untouched: true,
};

function createFieldReducer(model, initialState = {}) {
  return (state = initialState, action) => {
    console.log(action);

    if (model && !startsWith(action.model, model)) {
      return state;
    }

    let superState = set(
      {},
      model,
      cloneDeep(state)
    );

    let collection = get(superState, action.model, []);

    switch (action.type) {
      case 'rsf/focus':
        setField(superState, action.model, { focus: true, blur: false });

        return get(superState, model);
      case 'rsf/blur':
        setField(superState, action.model, { focus: false, blur: true });

        return get(superState, model);

      case 'rsf/change':
      case 'rsf/setDirty':
        setField(superState, action.model, { dirty: true, pristine: false });

        return get(superState, model);
      case 'rsf/setPristine':
        setField(superState, action.model, { dirty: false, pristine: true });

        return get(superState, model);
      case 'rsf/blur':
      case 'rsf/setTouched':
        setField(superState, action.model, { touched: true, untouched: false });

        return get(superState, model);
      case 'rsf/setUntouched':
        setField(superState, action.model, { touched: false, untouched: true });

        return get(superState, model);
      default:
        setField(superState, action.model, initialFieldState);

        return get(superState, model);
    }
  }
}

export {
  createFieldReducer,
  initialFieldState
}
