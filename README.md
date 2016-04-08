# React Redux Form
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form) [![npm version](https://badge.fury.io/js/react-redux-form.svg)](https://badge.fury.io/js/react-redux-form)

## [Read the Full Documentation](https://davidkpiano.gitbooks.io/react-redux-form/content/)

React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form --save`

## Features

- Separation of model state and form state for simplicity and performance
- Ability to use [existing reducers](http://davidkpiano.github.io/react-redux-form/#/api/Guide:-Using-Existing-Reducers) easily
- Sync and async field [validation](http://davidkpiano.github.io/react-redux-form/#/api/Guide:-Validation) at any part of the state
- Convenient [`<Field>` component](http://davidkpiano.github.io/react-redux-form/#/api/API:-Field-Component) for automatically mapping props to native form controls
- Support for Immutable.JS: `import { createModelReducer } from 'react-redux-form/immutable'`
- Support for [React-Native and custom components](http://davidkpiano.github.io/react-redux-form/#/api/Guide:-React-Native-&-Custom-Components)
- Multiple utility [model actions](http://davidkpiano.github.io/react-redux-form/#/api/API:-Action-Thunk-Creators)

## Quick Start

Be sure to read the [step-by-step](http://davidkpiano.github.io/react-redux-form/#/api/Guide:-Step-by-Step) guide in the documentation.

```js
import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { modelReducer, formReducer } from 'react-redux-form';

import MyForm from './components/my-form-component';

const store = createStore(combineReducers({
  user: modelReducer('user', { name: '' }),
  userForm: formReducer('user')
}));

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

## Posting Issues
When posting an issue, please include a detailed description along with a relevant code sample. Attaching a failing test case with your issue will go a long way and is much appreciated.
