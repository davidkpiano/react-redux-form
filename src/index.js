import { createModelReducer } from './reducers/model-reducer';
import { createFormReducer, getField, initialFieldState } from './reducers/form-reducer';

import * as modelActions from './actions/model-actions';
import * as fieldActions from './actions/field-actions';

import Field, { createFieldClass, controlPropsMap } from './components/field-component';
import Form from './components/form-component';

import * as actionTypes from './action-types';

import modeled from './enhancers/modeled-enhancer';

const actions = {
  ...modelActions,
  ...fieldActions
}

export {
  createModelReducer,
  createFormReducer,
  createFieldClass,
  controlPropsMap as controls,
  actions,
  Field,
  Form,
  getField,
  actionTypes,
  initialFieldState,
  modeled
}
