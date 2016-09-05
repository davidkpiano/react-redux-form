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

const store = window.store = createStore(combineForms({
  field: {
    model: '',
    label: '',
    controls: [],
  },
  currentField: null,
  fields: [],
}), applyMiddleware(
  thunk
  ,createLogger()
));

export default store;
