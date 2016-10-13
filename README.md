# React Redux Form

[![Join the chat at https://gitter.im/react-redux-form/Lobby](https://badges.gitter.im/react-redux-form/Lobby.svg)](https://gitter.im/react-redux-form/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form) [![npm version](https://badge.fury.io/js/react-redux-form.svg)](https://badge.fury.io/js/react-redux-form)

## [🆕 Read the Documentation](https://davidkpiano.github.io/react-redux-form/docs.html)

Or, if you're using an old version, [read the v0.14.x documentation](https://davidkpiano.gitbooks.io/react-redux-form/content/)

React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form@latest --save`

## Installation

```bash
# Dependencies (you probably already have these)
npm install react react-dom redux react-redux redux-thunk --save

# version 1.0.x
npm install react-redux-form@latest --save
```

## Quick Start

Be sure to read the [step-by-step quick start guide](http://davidkpiano.github.io/react-redux-form/docs/guides/quickstart.html) in the documentation.

```jsx
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { combineForms } from 'react-redux-form';

import MyForm from './components/my-form-component';

const initialUser = { name: '' };

const store = createStore(combineForms({
  user: initialUser,
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

```jsx
// ./components/my-form-component.js'
import React from 'react';
import { connect } from 'react-redux';
import { Control, Form } from 'react-redux-form';

class MyForm extends React.Component {
  handleSubmit(val) {
    // Do anything you want with the form value
    console.log(val);
  }
  
  render() {
    return (
      <Form model="user" onSubmit={(val) => this.handleSubmit(val)}>
        <label>Your name?</label>
        <Control.text model="user.name" />
        <button>Submit!</button>
      </Form>
    );
  }
}

// No need to connect()!
export default MyForm;
```

## Posting Issues
When posting an issue, please include a detailed description along with a relevant code sample. Attaching a failing test case with your issue will go a long way and is much appreciated.

Feel free to [fork this esnextb.in gist](https://esnextb.in/?gist=b31277251f5c24df9b13b2cc95abc00c) for quickly creating reproducible examples!
