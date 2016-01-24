import React from 'react';

import Markdown, { js } from '../components/markdown-component';

const content =
`
# redux simple form

Redux Simple Form is **a collection of action creators and reducer creators**
that makes building complex and custom forms with React and Redux simple. That's all.

It also provides the helpful \`<Field model="..." />\` component for mapping controls to form and model changes quickly.

${js`
import { Field } from 'redux-simple-form';

// in your component's render() method
<Field model="user.name">
  <input type="text" />
</Field>
`}

Heavily inspired by Angular's forms and controls, Redux Simple Form:

- handles model value changes for _any_ object/array
- provides utility actions for manipulating state
- handles control updates, such as focus, blur, pristine, etc.
- keeps track of validity on _any part_ of your model
- allows for completely dynamic and deep forms
- **keeps your model state intact**, which allows you to
have full control of your model reducer

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
