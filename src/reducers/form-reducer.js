import get from 'lodash/object/get';
import set from 'lodash/object/set';
import xor from 'lodash/array/xor';
import startsWith from 'lodash/string/startsWith';
import cloneDeep from 'lodash/lang/cloneDeep';
import isArray from 'lodash/lang/isArray';
import filter from 'lodash/collection/filter';
import map from 'lodash/collection/map';

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

const initialFormState = {
  ...initialFieldState,
  fields: {}
};

function createFormReducer(model, initialState = initialFormState) {
  return (state = initialState, action) => {
    console.log(action);

    if (model && !startsWith(action.model, model)) {
      return state;
    }

    let superState = set(
      {},
      model,
      cloneDeep(state.fields)
    );

    let form = state;

    let collection = get(superState, action.model, []);

    switch (action.type) {
      case 'rsf/focus':
        Object.assign(form, { focus: true, blur: false });
        setField(superState, action.model, { focus: true, blur: false });

        break;

      case 'rsf/change':
      case 'rsf/setDirty':
        setField(superState, action.model, { dirty: true, pristine: false });

        break;

      case 'rsf/setPristine':
        setField(superState, action.model, { dirty: false, pristine: true });

        break;

      case 'rsf/blur':
      case 'rsf/setTouched':
        setField(superState, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true,
        });

        break;

      case 'rsf/setUntouched':
        setField(superState, action.model, { touched: false, untouched: true });

        break;

      case 'rsf/setInitial':
      default:
        setField(superState, action.model, initialFieldState);

        break;
    }

    return {
      ...form,
      fields: get(superState, model)
    }
  }
}

export {
  createFormReducer,
  initialFieldState
}
