import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { createModelReducer } from './reducers/model-reducer';
import { createFormReducer } from './reducers/form-reducer';

import { isPristine, isFocused } from './utils';

import * as actions from './actions/model-actions';
import * as fieldActions from './actions/field-actions';


import Field from './components/field-component';

export {
  createModelReducer,
  createFormReducer,
  actions as modelActions,
  fieldActions,
  Field
}
