import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { createModelReducer } from './reducers/model-reducer';
import { createFormReducer, getField } from './reducers/form-reducer';

import { isPristine, isFocused } from './utils';

import * as modelActions from './actions/model-actions';
import * as fieldActions from './actions/field-actions';

import Field from './components/field-component';
import Form from './components/form-component';

const actions = {
  ...modelActions,
  ...fieldActions
}

export {
  createModelReducer,
  createFormReducer,
  actions,
  Field,
  Form,
  getField
}
