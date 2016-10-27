// ./store.js
import {
  createStore,
  applyMiddleware,
} from 'redux';

// Enable one of the two:
import { combineReducers } from 'redux';
//import { combineReducers } from 'redux-immutable';

import { createForms } from 'react-redux-form/immutable';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

// set initial state with Immutable Map
const initialUserState = Immutable.fromJS({
  firstName: '',
  lastName: '',
});

const store = applyMiddleware(thunk)(createStore)(combineReducers({
  ...createForms({
    user: initialUserState,
  })
}));

export default store;

