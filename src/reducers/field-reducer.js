import { get, set } from 'lodash/object';
import { xor } from 'lodash/array';
import { startsWith } from 'lodash/string';
import { filterActions } from 'redux-ignore';
import { cloneDeep, isArray } from 'lodash/lang';
import { filter, map } from 'lodash/collection';

function setField(state, model, props) {
  return set(state, model, {
    ...get(state, model),
    ...props
  });
}

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
        set(superState, action.model, { focus: true, blur: false });

        return get(superState, model);
      case 'rsf/blur':
        set(superState, action.model, { blur: true, focus: false });

        return get(superState, model);
      default:
        return state;
    }
  }
}

export {
  createFieldReducer
}
