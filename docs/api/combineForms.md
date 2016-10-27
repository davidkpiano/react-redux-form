# `combineForms(forms, [model], [options])`

Similar to [`combineReducers()`](http://redux.js.org/docs/api/combineReducers.html) in `redux`, the `combineForms()` helper function takes a `forms` object where:

- each key is a string model path
- each value is either:
  - _(Any)_ an initial state, or
  - _(Function)_ an existing reducer

and turns it into a single reducing function (using `combineReducers()` internally) where essentially:

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

_(Function)_: A reducer which updates both the model state and the form state for each of the models inside `forms`.

### Notes

- The `model` provided to `combineForms()` _must_ be the exact path in the state to the _parent_ model. For most use-case scenarios, this is sufficient:

```jsx
const initialUserState = {};
const initialGoatState = {};

const store = createStore(combineForms({
  user: initialUserState,
  goat: initialGoatState,
}));
```

However, for deeper parent models, the full path string must be provided:

```jsx
const initialUserState = {};
const initialGoatState = {};

const store = createStore(combineReducers({
  deep: combineForms({
    user: initialUserState,
    goat: initialGoatState,
  }, 'deep'),
}));

// user model state accessed via 'deep.user'
// form state accessed via 'deep.forms'
// user form state accessed via 'deep.forms.user'
```
