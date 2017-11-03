# React Redux Form Upgrade Guide

## v0.14.3 to v1.0.0 Beta

### Goals

- **Simplicity**
- **Performance**
- **Flexibility**
- **Features**

### Quick Start - v0.x to v1.3.0+

**Creating the store - version 0.x:**
_Note:_ This way will still work in v1.0!
```js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { modelReducer, formReducer } from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const store = createStore(combineReducers({
  user: modelReducer('user', initialUserState),
  userForm: formReducer('user', initialUserState)
}));

export default store;
```

**:new: Creating the store - version 1.x:**
```js
import { createStore, applyMiddleware } from 'redux';
import { combineForms } from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const store = createStore(combineForms({
  user: initialUserState,
}));

export default store;
```

**Setting up the form - v0.x:**
_Note:_ This way will still work in v1.0!

```js
import { Field } from 'react-redux-form';
// ...

<Field model="user.firstName">
  <label>First name:</label>
  <input type="text" />
</Field>
```

**Setting up the form - v1.x:**
```js
import { Control } from 'react-redux-form';
// ...

<div>
  <label>First name:</label>
  <Control.text model="user.firstName" />
</div>
```

### Breaking Changes

- For simplicity and performance, the form state structure has changed:

```diff
// Assume this model shape for userForm:
// {
//   user: {
//     name: 'John Doe',
//     address: {
//       city: 'Orlando',
//       state: 'FL',
//     },
//     phones: [
//       '5551234',
//       '5550000',
//     ],
//   },
// };

// Form state
- user;
+ user.$form;

// Field state
- user.fields.name;
+ user.name;

// Deep Field State
- user.fields['phones.0']
+ user.phones[0]

- user.fields['address.city']
+ user.address.city

// Deep Form State
- user.fields.address
+ user.address.$form

- user.fields.phones
+ user.phones.$form
```

To summarize:
- If accessing an object or an array (i.e., a _subForm_), the form state is in `model.path.$form`.
- If accessing a plain field (e.g., a string, boolean, number, etc.), the field state is in `model.path`.

**Batch Action Enhancements**
- Batching a single action now dispatches that action, instead of unnecessarily wrapping it in a `batch()` action.

**Field Action Enhancements**
- 🆕 `actions.setValidating(model[, validating])` will change the field's `.validating` state to `validating` (or `true` if not provided).
  - This is useful for distinguishing between `.pending` (a form/subForm is being submitted) and `.validating` (a field is asynchronously being validated).
- 🆕 Of course, there is a new `actionTypes.SET_VALIDATING` action type.
- `actions.setSubmitFailed(model[, submitFailed])` now takes in a `submitFailed` parameter (defaults to `true`).
