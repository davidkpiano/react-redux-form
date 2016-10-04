// ./store.js
import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';
import {
  modelReducer,
  formReducer,
} from 'react-redux-form/immutable';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

// set initial state with Immutable Map
const initialUserState = Immutable.fromJS({
  firstName: '',
  lastName: '',
});

const store = applyMiddleware(thunk)(createStore)(combineReducers({
  user: modelReducer('user', initialUserState),
  userForm: formReducer('user', initialUserState),
}));

export default store;

