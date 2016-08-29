// ./store.js
import {
  applyMiddleware,
  createStore,
} from 'redux';
import {
  combineForms,
} from 'react-redux-form';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

const initialUserState = {
  firstName: '',
  lastName: '',
};

const store = createStore(combineForms({
  user: initialUserState,
}), applyMiddleware(
  createLogger(),
  thunk));

export default store;
