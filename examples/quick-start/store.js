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
  firstName: 'first',
  lastName: 'last',
  bag: 'paper',
};

const store = createStore(combineForms({
  user: initialUserState,
}), applyMiddleware(
  createLogger(),
  thunk));

export default store;
