# `createForms(forms, [model], [options])`

```jsx
import { combineReducers } from 'redux';
import { createForms } from 'react-redux-form';

const initialUserState = {};
const initialGoatState = {};

const reducer = combineReducers({
  foo: fooReducer,
  bar: barReducer,
  ...createForms({
    user: initialUserState,
    goat: initialGoatState,
  }),
});

// reducer state shape will be:
// {
//   foo: fooReducer,
//   bar: barReducer,
//   user: modelReducer('user', initialUserState),
//   goat: modelReducer('goat', initialGoatState),
//   forms: formReducer(''),
// }
```

The `createForms()` helper function takes a `forms` object where:

- each key is a string model path
- each value is either:
  - _(Any)_ an initial state, or
  - _(Function)_ an existing reducer

and turns it into an **object** where:

- each key/value pair is a `modelReducer()`
- a `'forms'` key on the same object is a single `formReducer()` that handles all forms for all models. (configurable in `options`)

### Arguments

1. `forms` _(Object)_: An object whose keys correspond to relative string model paths and whose values correspond to:
  - _(Any)_ an initial state for the model, or
  - _(Function)_ an existing reducer for the model.
2. `[model = '']` _(String)_: The string representation of the parent model containing the child models in the `forms` object. Defaults to an empty string.
3. `[options]` _(Object)_: An options object to override the default options for `combineForms()`:

  - `key` _(String)_: The single `formReducer` key. Defaults to `'forms'`.
  - `plugins` _(Array<Function>)_: An array of plugins to pass into the `formReducer()`. Defaults to no plugins.

### Returns

_(Object)_: An object that is the mapping of each reducer or initial state to a `modelReducer()` and a `.forms` prop that contains the `formReducer`.

### Notes

- The `createForms()` function is meant to be used with [`combineReducers()`](http://redux.js.org/docs/api/combineReducers.html) from `redux`. Use it when you want a flatter combined reducer structure.
