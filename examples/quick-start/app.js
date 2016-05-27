import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

// We'll create this in Step 5.
import store from './store.js';

// We'll create this in Step 6.
import UserForm from './components/user-form.js';

class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <UserForm />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
