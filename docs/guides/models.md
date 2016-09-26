# Models

A **model** represents the data that the user can interact with. For example, the initial states of a `user` and `goat` model can look like this:

```jsx
const initialUser = {
  name: '',
  email: '',
};

const initialGoat = {
  color: '',
  breed: '',
};
```

# Models in stores

To set up your app's models for RRF, it's recommended to use [`combineForms()`](../api/combineForms.md), which takes in the initial state (or custom reducers) of all your models:

```jsx
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import { combineForms } from 'react-redux-form';

const store = createStore(combineForms({
  user: initialUser,
  goat: initialGoat,
}), applyMiddleware(thunk));

export default store;
```

This works similar to `combineReducers()` in `redux`, and will create a single `reducer()` that converts each key/value pair in the object given to `combineForms()` into a [`modelReducer()`](../api/modelReducer.md), and also set up a single [`formReducer()`](../api/formReducer.md) under the `'forms'` key.

**Note:** Since `combineForms()` returns a single `reducer()` function, this can be nested however deep if you are already using `combineReducers()`. To nest it deep, you _must_ specify where the deep `combineForms()` reducer will live as a model string in the second argument to `combineForms(forms, model)`:

```jsx
const store = createStore(combineReducers({
  foo: fooReducer,
  bar: barReducer,
  deep: combineForms({
    user: initialUser,
    goat: initialGoat,
  }, 'deep'), // <== specify the deep model path here
}));
```

# Updating Models

Internally, the `modelReducer()` uses the `model` path to know which part of the state should be updated.

For example, given this state:

```jsx
const state = {
  user: {  
    firstName: 'John',
    lastName: 'Smith',
    phones: [
      { number: '5551234567', type: 'home' },
      { number: '5559876543', type: 'work' }
    ]
  }
}
```

A value from this object is retrieved with the path `'user.firstName'` and a value inside an array is retrieved with `'user.phones[1]'`. You can retrieve deep values as well, e.g. `'user.phones[1].number'`.

For example, to update the second phone number's type, you can dispatch a change to its model path:

```jsx
import { actions } from 'react-redux-form';

// wherever dispatch() is available
dispatch(actions.change('user.phones[1].type', 'mobile'))
```

# Using existing reducers

If you provide a custom reducer for a model's value inside `combineForms()`, that reducer will automatically be wrapped (decorated) using [`modeled()`](../api/modeled.md). The `modeled()` reducer will then be able to respond to model changes in React Redux Form. Here's an example:

```jsx
// ...
import myCustomReducer from './myCustomReducer.js';

const store = createStore(combineForms({
  user: initialUser,
  goat: initialGoat,
  custom: myCustomReducer, // <= will be modeled()
}), applyMiddleware(thunk));
// ...
```

You will then be able to pass your custom reducer's own actions and have it respond appropriately, and you will also be able to use RRF's `actions` to update the same model.



