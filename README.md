# React Redux Form
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form) [![npm version](https://badge.fury.io/js/react-redux-form.svg)](https://badge.fury.io/js/react-redux-form)

## [Read the Full Documentation](http://davidkpiano.github.io/react-redux-form)

React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form --save`

## Quick Start

Be sure to read the [step-by-step](http://davidkpiano.github.io/react-redux-form/#/api/Step-by-Step) guide in the documentation.

```js
import React from 'react';
import { createStore, combineReducers } from 'redux';
import  { Provider } from 'react-redux';
import { createModelReducer, createFormReducer } from 'react-redux-form';

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
import { Field } from 'react-redux-form';

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

## Road map
- [x] - ~~Deep states for form and model reducers~~
- [ ] - React Native support
- [ ] - Support for `<input type="file" />`
- [ ] - Automatic model resetting for `<input type="reset" />`
- [ ] - Support for `<input type="range" />`
- [ ] - Support for `<input type="color" />`
- [ ] - Support for `<progress />`
- [ ] - Potential `<FieldSet />` component for grouping fields?
