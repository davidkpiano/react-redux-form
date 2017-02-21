# React Redux Form

[![Join the chat at https://gitter.im/react-redux-form/Lobby](https://badges.gitter.im/react-redux-form/Lobby.svg)](https://gitter.im/react-redux-form/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form) [![npm version](https://badge.fury.io/js/react-redux-form.svg)](https://badge.fury.io/js/react-redux-form)

## [🆕 Read the Documentation](https://davidkpiano.github.io/react-redux-form/docs.html)

React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form@latest --save`

## Installation

```bash
# Dependencies (you probably already have these)
npm install react react-dom redux react-redux --save

# version 1.x.x
npm install react-redux-form@latest --save
```

## Zero-Boilerplate `<LocalForm>`

If you want to get up and running with forms quickly without having to set up Redux, [just use Local Forms](http://davidkpiano.github.io/react-redux-form/docs/guides/local.html):

```js
import React from 'react';
import { LocalForm, Control } from 'react-redux-form';

export default class MyApp extends React.Component {
  handleChange(values) { ... }
  handleUpdate(form) { ... }
  handleSubmit(values) { ... }
  render() {
    return (
      <LocalForm
        onUpdate={(form) => this.handleUpdate(form)}
        onChange={(values) => this.handleChange(values)}
        onSubmit={(values) => this.handleSubmit(values)}
      >
        <Control.text model=".username" />
        <Control.text model=".password" />
      </LocalForm>
    );
  }
}
```

That's all you need. Seriously. [Read the Documentation](http://davidkpiano.github.io/react-redux-form/docs/guides/local.html) for more information.

**NOTE:** Please use `<LocalForm>` with `react-redux` version 4.x.x. 

## Quick Start
For more fine-grained control (such as using custom reducers, storing form state globally, dispatching actions, etc.), you'll want to set up a Redux store for your forms.

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
        <Control.text model=".name" />
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

Feel free to [fork this CodePen](http://codepen.io/davidkpiano/pen/2cbfd61bdcff474ca6e40e8ed2221ef9) for quickly creating reproducible examples!
