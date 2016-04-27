# React Redux Form
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form) [![npm version](https://badge.fury.io/js/react-redux-form.svg)](https://badge.fury.io/js/react-redux-form)

## [Read the Full Documentation](https://davidkpiano.gitbooks.io/react-redux-form/content/)

React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form --save`

- Guides
  - [Quick Start](https://davidkpiano.gitbooks.io/react-redux-form/content/step_by_step.html)
  - [Model Reducers](https://davidkpiano.gitbooks.io/react-redux-form/content/model_reducers.html)
  - [Form Reducers](https://davidkpiano.gitbooks.io/react-redux-form/content/form_reducers.html)
  - [React Native & Custom Components](https://davidkpiano.gitbooks.io/react-redux-form/content/react_native_&_custom_components.html)
  - [Validation](https://davidkpiano.gitbooks.io/react-redux-form/content/validation.html)
  - [Tracking Collections](https://davidkpiano.gitbooks.io/react-redux-form/content/tracking_collections.html)
  - [FAQs](https://davidkpiano.gitbooks.io/react-redux-form/content/faqs.html)
- API Reference
  - [Model Action Creators](https://davidkpiano.gitbooks.io/react-redux-form/content/model_actions.html)
  - [Field Action Creators](https://davidkpiano.gitbooks.io/react-redux-form/content/field_actions.html)
  - [Validation Action Creators](https://davidkpiano.gitbooks.io/react-redux-form/content/validation_actions.html)
  - [Model Reducer](https://davidkpiano.gitbooks.io/react-redux-form/content/model_reducer.html)
  - [Form Reducer](https://davidkpiano.gitbooks.io/react-redux-form/content/form_reducer.html)
  - [`<Field>` Component](https://davidkpiano.gitbooks.io/react-redux-form/content/field_component.html)
  - [`<Form>` Component](https://davidkpiano.gitbooks.io/react-redux-form/content/form_component.html)
  - [`<Errors>` Component](https://davidkpiano.gitbooks.io/react-redux-form/content/errors_component.html)

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
import { Field, Form } from 'react-redux-form';

class MyForm extends React.Component {
  handleSubmit(val) {
    // Do anything you want with the form value
    console.log(val);
  }
  
  render() {
    let { user } = this.props;
    
    return (
      <Form model="user" onSubmit={(val) => this.handleSubmit(val)}>
        <h1>Hello, { user.name }!</h1>
        <Field model="user.name">
          <input type="text" />
        </Field>
        <button>Submit!</button>
      </form>
    );
  }
}

export default connect(state => ({ user: state.user }))(MyForm);
```

## Posting Issues
When posting an issue, please include a detailed description along with a relevant code sample. Attaching a failing test case with your issue will go a long way and is much appreciated.
