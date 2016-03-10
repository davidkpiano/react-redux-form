import toPath from 'lodash/toPath';
import {
  createFormer,
  initialFieldState,
  initialFormState,
} from '../reducers/form-reducer';

function getField(state, path) {
  const localPath = toPath(path);

  if (!localPath.length) {
    return state;
  }

  try {
    return state.getIn(['fields', localPath.join('.')], initialFieldState);
    // return state.getIn(path, defaultValue);
  } catch (error) {
    throw new Error(`Unable to retrieve path '${path.join(
      '.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

function setField(state, localPath, props) {
  try {
    return (!localPath.length) ?
      state.merge(props) :
      state.merge({
        fields: {
          [localPath.join('.')]: {
            ...getField(state, localPath),
            ...props,
          },
        },
      });
  } catch (error) {
    throw new Error(`Unable to set path '${localPath.join(
      '.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

function resetField(state, localPath) {
  if (!localPath.length) {
    return initialFormState;
  }

  return state.setIn(
    ['fields', localPath.join('.')],
    initialFieldState
  );
}

const formReducer = createFormer(getField, setField, resetField);

function createFormReducer(...args) {
  console.warn('The createFormReducer() function is deprecated (renamed). '
    + 'Please use formReducer().');

  return formReducer(...args);
}

export {
  createFormer,
  createFormReducer,
  formReducer,
  initialFieldState,
  initialFormState,
  getField,
};
