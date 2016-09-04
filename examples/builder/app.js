import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import store from './store.js';
import FormBuilder from './FormBuilder';


class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <FormBuilder />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
