import React from 'react';

import Markdown, { js } from '../components/markdown-component';

const content =
`
## The Form Reducer

In Redux Simple Form, a **form reducer** is a reducer that responds to any [field actions](todo) on the model (and its submodels) you specify when creating the form reducer. Let's say your user model looks like this:

${js`
let initialUser = {
  firstName: '',
  lastName: ''
};
`}

You can create a form reducer that responds only to field actions to models that modify the user like this:

${js`
import { createFormReducer } from 'redux-simple-form';

const userFormReducer = createFormReducer('user');
`}

Now when you dispatch a field action to the \`'user'\`, such as \`focus('user.firstName')\` or \`setDirty('user.lastName')\`, the \`userFormReducer\` will update the user form state.

**Important:** The state returned from the form reducer does not contain the model values. This is to keep a clean separation between view (the form) and model values. It also gives you complete control of your model, and allows you to represent it as a plain JavaScript object or array.

### Form Reducers in Stores

Form reducer keys in the store can be named anything that makes sense in your app. I like to name them \`'[model]Form'\`, such as \`'userForm'\` to represent the \`'user'\` model. Here is how you would set up a form reducer in your app's store:

${js`
// store.js
import { combineReducers, createStore } from 'redux';
import { createFormReducer } from 'redux-simple-router';

import userReducer from './reducers/user-reducer';

const store = createStore(combineReducers({
  user: userReducer,
  userForm: createFormReducer('user'), // <= form reducer
  // etc.
}));

export default store;
`}

There can be multiple form reducers in your app.
`;

const ModelReducerPage = () => (
  <Markdown content={content} />
);

export default ModelReducerPage;
