import React from 'react';

import Markdown, { js } from '../components/markdown-component';

const content =
`
# redux simple form

A simple, flexible, and powerful way to create complex forms
with React and Redux.

Heavily inspired by Angular's forms and controls.

**Getting Started**
1. Install the prerequisites:
  - \`npm install react redux react-redux --save\`
  - (recommended) \`npm install redux-thunk --save\`
1. \`npm install redux-simple-form --save\`

**Full Example**

${js`
// app.js

import React from 'react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { createModelReducer } from 'redux-simple-form';

import LoginForm from './forms/login-form';

const store = createStore(combineReducers({
  user: createModelReducer('user')
}));

export default class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <LoginForm />
      </Provider>
    )
  }
}
`}

${js`
// forms/login-form.js

import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

class LoginForm extends React.Component {
  render() {
    let { user } = this.props;

    return (
      <form>
        <Field model="user.username">
          <label>Username</label>
          <input type="text" />
        </Field>

        <Field model="user.password">
          <label>Password</label>
          <input type="password" />
        </Field>

        <button>
          Log in as { user.username }
        </button>
      </form>
    )
  }
}

const selector = (state) => ({ user: state.user });

export default connect(selector)(LoginForm);
`}
`;

const IntroPage = () => (
  <Markdown content={content} />
);

export default IntroPage;
