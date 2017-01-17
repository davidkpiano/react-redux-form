# Quick Start

This step-by-step guide assumes that you already have a project set up with:

- NPM (with a `package.json` file, though this is optional)
- module importing with Webpack (or another bundler): https://github.com/petehunt/webpack-howto
- ES6 compilation with Babel: http://jamesknelson.com/the-complete-guide-to-es6-with-babel-6/
- Using React with ES6/Babel: http://jamesknelson.com/react-babel-cheatsheet/

Check out the above links if you need any help with those prerequisites.

### 1. Install `react-redux-form` and its prerequisite dependencies:

- `npm install react react-dom --save`
- `npm install redux react-redux --save`
- `npm install react-redux-form --save`

**Note:** - `redux-thunk` is no longer required for versions 1.3.0 and higher. If you are using a previous version, make sure to install it as well.

### 2. Setup your app.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

// We'll create this in step 3.
import store from './store.js';

// We'll create this in step 4.
import UserForm from './components/UserForm.js';

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
```


### 3. Setup your store.

We'll be using [`combineForms`]('../api/combineForms.html') to create the reducer that contains all of your `modelReducer`s, and
a single `formReducer` under the `'form'` key.

```jsx
// ./store.js
import {
  createStore,
  applyMiddleware
} from 'redux';
import { combineForms } from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const store = createStore(combineForms({
  user: initialUserState,
}));

export default store;
```

**Note:** `redux-thunk` is no longer required for RRF versions 1.3.0 and higher. If you are using a previous version, make sure to configure your store to use `redux-thunk`.

### 4. Setup your form!

```jsx
// ./components/UserForm.js

import React from 'react';
import { Control, Form, actions } from 'react-redux-form';

class UserForm extends React.Component {
  handleSubmit(user) {
    const { dispatch } = this.props;

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
  }
  render() {
    return (
      <Form model="user"
        onSubmit={(user) => this.handleSubmit(user)}>
        <label>First name:</label>
        <Control.text model="user.firstName" />

        <label>Last name:</label>
        <Control.text model="user.lastName" />

        <button type="submit">
          Finish registration!
        </button>
      </Form>
    );
  }
}

export default UserForm;
```
