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

**Note:** - `redux-thunk` is no longer required for versions 1.3.0 and higher, unless you are using action thunk creators (such as `actions.push`, etc.).
Please see [the docs for action creators](../api/actions.html) to see which actions do not require `redux-thunk`.
If you are using a previous version, `redux-thunk` is still required, but upgrading to the latest version is highly recommended.

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

We'll be using [`combineForms`](../api/combineForms.html) to create the reducer that contains all of your `modelReducer`s, and
a single `formReducer` under the `'form'` key.

```jsx
// ./store.js
import {
  createStore,
  applyMiddleware
} from 'redux';
import {
  combineForms,
  createForms // optional
} from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

// If you want your entire store to have the form state...
const store = createStore(combineForms({
  user: initialUserState,
}));

// Or you have an existing store and want the form state to
// exist alongside the existing state...
const store = createStore(combineReducers({
  existing: existingReducer,
  foo: fooReducer,
  bar: barReducer,

  // ... use createForms, which will create:
  // the model reducer at "user"
  // the forms reducer at "forms" (e.g., "forms.user")
  ...createForms({
    user: initialUserState,
  }),
}));

// Or you want to nest your form and model reducer under a specific key...
const store = createStore(combineReducers({
  existing: existingReducer,
  foo: fooReducer,
  bar: barReducer,

  // Make sure to specify the key as the second argument, so that RRF
  // knows where the form and model reducers exist in the store!
  myForms: combineForms({
    user: initialUserState,
  }, 'myForms'),
}));

export default store;
```

See [`createForms`](../api/createForms.html) and [`combineForms`](../api/combineForms.html) for more info on adding RRF to existing stores.

**Note:** `redux-thunk` is no longer required for RRF versions 1.3.0 and higher. If you are using a previous version, make sure to configure your store to use `redux-thunk`.

### 4. Setup your form!

```jsx
// ./components/UserForm.js

import React from 'react';
import { Control, Form, actions } from 'react-redux-form';

class UserForm extends React.Component {
  handleSubmit(user) {
    // Do whatever you like in here.
    // If you connect the UserForm to the Redux store,
    // you can dispatch actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
  }
  render() {
    return (
      <Form
        model="user"
        onSubmit={(user) => this.handleSubmit(user)}
      >
        <label htmlFor="user.firstName">First name:</label>
        <Control.text model="user.firstName" id="user.firstName" />

        <label htmlFor="user.lastName">Last name:</label>
        <Control.text model="user.lastName" id="user.lastName" />

        <button type="submit">
          Finish registration!
        </button>
      </Form>
    );
  }
}

export default UserForm;
```
