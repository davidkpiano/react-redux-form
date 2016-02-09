import React from 'react';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { createModelReducer } from './reducers/model-reducer';
import { createFormReducer, getField, initialFieldState } from './reducers/form-reducer';

import { isPristine, isFocused } from './utils';

import * as modelActions from './actions/model-actions';
import * as fieldActions from './actions/field-actions';

import Field, { createFieldClass } from './components/field-component';
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
  actions,
  Field,
  Form,
  getField,
  actionTypes,
  initialFieldState,
  modeled
}
