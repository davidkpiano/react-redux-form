// ./store.js
import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';
import { createForms } from 'react-redux-form';
import thunk from 'redux-thunk';

const initialUserState = {
  firstName: '',
  lastName: '',
};

const store = applyMiddleware(thunk)(createStore)(combineReducers({
  ...createForms({
      user: initialUserState
    }),
}));

export default store;
