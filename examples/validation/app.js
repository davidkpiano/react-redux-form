import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import store from './store.js';
import UserForm from './components/user-form.js';

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <UserForm />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
