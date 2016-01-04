import React from 'react';

import Markdown, { js } from '../components/markdown-component';

const content =
`
# Reducers

Redux Simple Form is built around a single action that describes all
changes to your models, the \`change(model, value)\` action.
Let's say you had a user store that looked like this:

${js`
  // index.js
  
  import React, { Component } from 'react';
  import { createStore } from 'redux';
  import { Provider } from 'react-redux';
  import { createModelReducer } from 'redux-simple-form';

  const initialState = {
    firstName: '',
    lastName: ''
  };

  const userReducer = createModelReducer('user', initialState);
  const store = createStore(userReducer);

  export default class App extends Component {
    render() {
      return (
        <Provider store={ store }>
          <UserForm />
        </Provider>
      );
    }
  }
`}
`;

const IntroPage = () => (
  <Markdown content={content} />
);

export default IntroPage;
