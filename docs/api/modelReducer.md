# `modelReducer(model, initialState)`

Creates a `modelReducer` instance function that responds to these actions:

- `actionTypes.CHANGE`
- `actionTypes.LOAD`
- `actionTypes.RESET`

and updates the state accordingly.

### Arguments

1. `model` _(String)_: A string representation of this model's path in the store.
2. `initialState` _(Any)_: The initial state of the model.

### Returns

_(Function)_: A reducer which updates the state in reaction to the above actions.

### Notes

- The `model` provided to `modelReducer` _must_ be the exact path in the state to the model. For most use-case scenarios, this is sufficient:

```js
const initialUserState = {};

const store = createStore(combineReducers({
  user: modelReducer('user', initialUserState),
}));
```

However, for deeper models, the full path string must be provided:

```js
const initialUserState = {};

const store = createStore(combineReducers({
  deep: combineReducers({
    user: modelReducer('deep.user', initialUserState),
  }),
}));
```
