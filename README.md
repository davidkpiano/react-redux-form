# Redux Simple Form

**Still in development! Read the [latest docs](http://davidkpiano.github.io/redux-simple-form)**

Redux Simple Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react redux redux-simple-form --save`

## Quick Start

```js
import React from 'react';
import { createStore, combineReducers } from 'redux';
import  { Provider } from 'react-redux';
import { createModelReducer, createFormReducer } from 'redux-simple-form';

import MyForm from './components/my-form-component';

const store = createStore(combineReducers({
  user: createModelReducer('user', { name: '' }),
  userForm: createFormReducer('user')
};

class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <MyForm />
      </Provider>
    );
  }
}
```

```js
// ./components/my-form-component.js'
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

class MyForm extends React.Component {
  render() {
    let { user } = this.props;
    
    return (
      <form>
        <h1>Hello, { user.name }!</h1>
        <Field model="user.name">
          <input type="text" />
        </Field>
      </form>
    );
  }
}

export default connect(state => ({ user: state.user }))(MyForm);
```
