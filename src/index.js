import actions from './actions';
import actionTypes from './action-types';

import Field, { controlPropsMap, createFieldClass } from './components/field-component';
import Form from './components/form-component';
import Errors from './components/errors-component';

import modeled from './enhancers/modeled-enhancer';

import {
  createFormReducer,
  formReducer,
  initialFieldState,
  getField,
} from './reducers/form-reducer';

import {
  createModelReducer,
  modelReducer,
} from './reducers/model-reducer';

import {
  track,
} from './utils/track';

export {
  actions,
  actionTypes,
  controlPropsMap as controls,
  createFieldClass,
  formReducer,
  createFormReducer,
  modelReducer,
  createModelReducer,
  Field,
  Form,
  Errors,
  getField,
  initialFieldState,
  modeled,
  track,
};


window.React = require('react');
window.ReactDOM = require('react-dom');
window.redux = require('redux');
window.reactRedux = require('react-redux');
window.thunk = require('redux-thunk');
window.reactReduxForm = {
  actions,
  actionTypes,
  controls: controlPropsMap,
  createFieldClass,
  formReducer,
  modelReducer,
  Field,
  Form,
  getField,
  initialFieldState,
  modeled,
  track,
};
