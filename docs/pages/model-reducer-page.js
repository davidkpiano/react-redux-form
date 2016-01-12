import React from 'react';

import Markdown, { js } from '../components/markdown-component';

const content =
`
## The Model Reducer

In Redux Simple Form, a **model reducer** is a reducer that responds to \`change()\` actions on the model you specify when creating the model reducer. Let's say your user model looks like this:

${js`
let initialUser = {
  firstName: '',
  lastName: ''
};
`}

You can create a model reducer that responds only to changes to models that modify the user like this:

${js`
import { createModelReducer } from 'redux-simple-form';

let initialUser = {
  firstName: '',
  lastName: ''
};

const userReducer = createModelReducer('user', initialUser);
`}

Now, when you send a \`change(...)\` action that intends to modify the user, such as \`change('user.firstName', 'John')\`, the reducer will update the model accordingly.

The \`createModelReducer(model, initialState)\` function takes two arguments: the **model** and the optional **initialState**. It's highly recommended that you provide an initial state to your model reducer, though Redux Simple Form will create missing keys (shallow or deep) regardless.

### Model Reducers in Stores

The _only requirement_\\* in Redux Simple Form is that your model reducer has the **same model as the key of the reducer in the store.** This is so that the \`<Field model="...">\` component knows where to look for the latest model value. Here is how you would set up a model reducer in your app's store:

${js`
// store.js
import { combineReducers, createStore } from 'redux';
import { createModelReducer } from 'redux-simple-router';

const store = createStore(combineReducers({
  user: createModelReducer('user'),
  items: createModelReducer('items'),
  // etc.
}));

export default store;
`}

\\* If you are not using the \`<Field />\` component, you may forego this requirement.

### Custom Model Reducers

Using \`createModelReducer()\` is *not required*, and you can implement your own functionality to respond to model changes:

${js`
import { actionTypes } from 'redux-simple-form';

const userReducer = (state = {}, action) => {
  if (action.type === actionTypes.CHANGE) {
    if (action.model === 'user.firstName') {
      return {
        ...state,
        firstName: action.value
      }
    }
  }

  return state;
}
`}

However, \`createModelReducer()\` is _really convenient_, as it uses lodash's \`get()\` and \`set()\` methods to efficiently update the model given a model string such as \`"foo.bar[2].baz"\`. You can **compose** reducer functions in order to have custom functionality:

${js`
import { createModelReducer } from 'redux-simple-form';
import compose from 'lodash/function/compose';

let initialState = {
  firstName: '',
  lastName: '',
  fullName: ''
};

const modelReducer = createModelReducer('user', initialState);

const fullName = (state) => {
  return {
    ...state,
    fullName: [state.firstName, state.lastName].join(' ')
  };
}

const userReducer = (state, action) => {
  return compose(fullName, modelReducer)(state, action);
}

export default userReducer;
`}
`;

const ModelReducerPage = () => (
  <Markdown content={content} />
);

export default ModelReducerPage;
