import get from 'lodash/object/get';
import set from 'lodash/object/set';
import xor from 'lodash/array/xor';
import startsWith from 'lodash/string/startsWith';
import cloneDeep from 'lodash/lang/cloneDeep';
import isArray from 'lodash/lang/isArray';
import filter from 'lodash/collection/filter';
import map from 'lodash/collection/map';

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
        switch (action.method) {
          default:
          case 'change':      
            set(superState, action.model, action.value);

            return get(superState, model);

          case 'toggle':
            set(superState, action.model, xor(collection, [action.value]));

            return get(superState, model);

          case 'filter':
            set(superState, action.model, filter(collection, action.iteratee));

            return get(superState, model);

          case 'map':
            set(superState, action.model, map(collection, action.iteratee));

            return get(superState, model);
        }

      default:
        return state;
    }
  }
}

export {
  createModelReducer
}
