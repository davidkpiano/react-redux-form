import {
  createStore,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { combineForms } from 'react-redux-form';

const initialState = Array(1000)
  .fill({
    name: '',
    email: '',
    active: false,
  });

const store = createStore(combineForms({
  rows: initialState,
}), applyMiddleware(
  // createLogger(),
  thunk
));

export default store;
