import { get, set } from 'lodash/object';
import { xor } from 'lodash/array';
import { startsWith } from 'lodash/string';
import { filterActions } from 'redux-ignore';
import { cloneDeep, isArray } from 'lodash/lang';
import { filter, map } from 'lodash/collection';

function createModelReducer(model, initialState = {}) {
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
      case 'rsf/change':
        if (action.multi) {
          set(superState, action.model, xor(collection, [action.value]));
        } else {
          set(superState, action.model, action.value);
        }

        return get(superState, model);
      case 'rsf/filter':
        set(superState, action.model, filter(collection, action.iteratee));

        return get(superState, model);

      case 'rsf/map':
        set(superState, action.model, map(collection, action.iteratee));

        return get(superState, model);
      default:
        return state;
    }
  }
}

export {
  createModelReducer
}
