# React Redux Form
[![Build Status](https://travis-ci.org/davidkpiano/react-redux-form.svg?branch=master)](https://travis-ci.org/davidkpiano/react-redux-form)

## [Read the Full Documentation](http://davidkpiano.github.io/react-redux-form)

Redux Simple Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

`npm install react-redux-form --save`

## Quick Start

```js
import React from 'react';
import { createStore, combineReducers } from 'redux';
import  { Provider } from 'react-redux';
import { createModelReducer, createFormReducer } from 'react-redux-form';

import MyForm from './components/my-form-component';

const store = createStore(combineReducers({
  user: createModelReducer('user', { name: '' }),
  userForm: createFormReducer('user')
};

class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <MyForm />
      </Provider>
    );
  }
}
```

```js
// ./components/my-form-component.js'
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'react-redux-form';

class MyForm extends React.Component {
  render() {
    let { user } = this.props;
    
    return (
      <form>
        <h1>Hello, { user.name }!</h1>
        <Field model="user.name">
          <input type="text" />
        </Field>
      </form>
    );
  }
}

export default connect(state => ({ user: state.user }))(MyForm);
```

# API
## `<Field>...</Field>` Component

```js
import { Field } from 'react-redux-form';

// inside a component's render() method ...
<Field model="user.name">
  <input type="text" />
</Field>

// a required field
<Field model="user.email"
  updateOn="blur"
  validators={{
    required: (val) => val.length
  }}>
  <input type="email" />
</Field>
```

The `<Field />` component is a helper component that wraps one or more controls and maps actions for the specified `model` to events on the controls. The supported controls are:

- `<input />` - any text type
- `<textarea />`
- `<input type="checkbox" />`
- `<input type="radio" />`
- `<select />`
- `<select multiple/>`

The only required prop is `model`, which is a string that represents the model value in the store. The allowed props (including optional props) are:

- `model` (String) - the string representing the store model value
- `updateOn` (String | Function) - a function that decorates the default `onChange` function, or a string:
  - "change"
  - "blur"
  - "focus"
- `validators` (Object) - a validation object with key-validator pairs (see below)
- `asyncValidators` (Object) - an async validation object with key-asyncValidator pairs (see below)
- `parser` (Function) - a function that parses the value before updating the model.

## `<Field />` Component properties

### `model` property

The string representing the model value in the store.

```js
// in store.js
export default createStore(combineReducers({
  'user': createModelReducer('user', { name: '' })
}));

// in component's render() method
<Field model="user.name">
  <input type="text" />
</Field>
```

### `updateOn` property

A string or function specifying when the component should dispatch a `change(...)` action. If a string, `updateOn` can be one of these values:

- `"change"` - will dispatch in `onChange`
- `"blur"` - will dispatch in `onBlur`
- `"focus"` - will dispatch in `onFocus`

So, `<Field model="foo.bar" updateOn="blur">` will only dispatch the `change(...)` action on blur.

If `updateOn` is a function, the function given will be called with the `change` action creator. The function given will be called in `onChange`. For example:

```js
import debounce from 'lodash/debounce';

<Field model="test.bounce"
  updateOn={(change) => debounce(change, 1000)}
  <input type="text" />
</Field>
```

### `validators` property

A map where the keys are validation keys, and the values are the corresponding functions that determine the validity of each key, given the model's value.

For example, this field validates that a username exists and is longer than 4 characters:

```js
<Field model="user.username"
  validators={{
    required: (val) => val.length,
    length: (val) => val.length > 4
  }}>
  <input type="text" />
</Field>
```

## Action Creators

### `actions.change(model, value)`
Returns an action object that, when handled by a `modelReducer`, changes the value of the respective model to the new `value`.

When the change action is handled by a `formReducer`, the field model's `dirty` state is set to `true` and its corresponding `pristine` state is set to `false`.

**Arguments:**
- `model`: (String) the model whose value will be changed
- `value`: (*) the value the model will be changed to

```js
import {
  createModelReducer,
  actions
} from 'react-redux-form';

const userReducer = createModelReducer('user');

let initialState = { name: '', age: 0 };

userReducer(initialState, actions.change('user.name', 'Billy'));
// => { name: 'Billy', age: 0 }
```

### `actions.reset(model)`
Returns an action object that, when handled by a `modelReducer`, changes the value of the respective model to its initial `value`.

**Arguments:**
- `model`: (String) the model whose value will be reset

```js
import {
  createModelReducer,
  actions
} from 'react-redux-form';

const counterReducer = createModelReducer('counter');

let initialState = { count: 10 };

let nextState = counterReducer(initialState,
  actions.change('counter.count', 42));
// => { count: 42 }

let resetState = counterReducer(nextState,
  actions.reset('counter.count'));
// => { count: 10 }
```

### `actions.focus(model)`
Returns an action object that, when handled by a `formReducer`, changes the `focus` state of the field model in the form to `true`, as well as the corresponding `blur` state to `false`.

The "focus" state indicates that the field model is the currently focused field in the form.

**Arguments:**
- `model`: (String) the model indicated as focused

```js
import {
  actions
} from 'react-redux-form';

// assuming this is a connected component
const Newsletter = (props) => {
  let { newsletterForm, dispatch } = props;

  return (
    <form>
      <input type="email"
        onFocus={() => dispatch(actions.focus('newsletter.email'))} />
      { newsletterForm.field('email').focus &&
        <div>We're focused on emailing you stuff!</div>
      }
    </form>
  );
}
```

### `actions.blur(model)`
Returns an action object that, when handled by a `formReducer`, changes the `blur` state of the field model in the form to `true`, as well as the corresponding `focus` state to `false`. It also indicates that the field model has been `touched`, and will set that state to `true` and the `untouched` state to `false`.

The "blur" state indicates that the field model is not focused.

**Arguments:**
- `model`: (String) the model indicated as blurred

### `actions.setPristine(model)`
Returns an action object that, when handled by a `formReducer`, changes the `pristine` state of the field model in the form to `true`, as well as the corresponding `dirty` state to `false`.

The "pristine" state indicates that the user has not interacted with this field model yet.

**Arguments:**
- `model`: (String) the model indicated as pristine

### `actions.setDirty(model)`
Returns an action object that, when handled by a `formReducer`, changes the `dirty` state of the field model in the form to `true`, as well as the corresponding `pristine` state to `false`.

The "dirty" state indicates that the model value has been changed.

**Arguments:**
- `model`: (String) the model indicated as dirty

### `actions.setPending(model)`
Returns an action object that, when handled by a `formReducer`, changes the `pending` state of the field model in the form to `true`. It simultaneously sets the `submitted` state to `false`.

This action is useful when asynchronously validating or submitting a model, and is representative of the state between the initial and final state of a field model.

**Arguments:**
- `model`: (String) the model indicated as pending

### `actions.setValidity(model, validity)`
Returns an action object that, when handled by a `formReducer`, changes the `valid` state of the field model in the form to `true` or `false`, based on the `validity` (see below). It simultaneously sets the `errors` on the field model to the inverse of the `validity`.

The `validity` can be an object or a boolean value, indicating which aspects of the field model are valid. A validity object is a key/value pair where the values are functions that return a truthy (if valid) or falsey (if invalid) value.

**Example:**
```js
let val = 'testing123';

dispatch(actions.setValidity('user.password', {
  required: (val) => val && val.length,
  correct: (val) => val === 'hunter2'
}));

// Field model errors will now look like:
// errors: {
//   required: false,
//   correct: true
// }
```

**Arguments:**
- `model`: (String) the model indicated as pending
- `validity`: (Boolean | Object) the validity of the model
`,

'reducers': `
## Reducers

### `createModelReducer(model, initialState = {})`
Returns a model reducer that only responds to `change()` and `reset()` actions on the model or model's child values.

**Note:** if using the `<Field />` component or any action thunk creators, the `model` _must be the same as_ the property given to the reducer in `combineReducers({...})`.

**Arguments:**
- `model`: (String) the model that the reducer will update
- `initialState`: (Any) the initial state of the model

**Example:**
```js
import { createModelReducer } from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const userReducer = createModelReducer('user', initialUserState);

export default userReducer;
```

### `createFormReducer(model)`
Returns a form reducer that only responds to any actions on the model or model's child values. The reducer's state has the shape of `initialFormState`, with a `fields` property where each field has the shape of `initialFieldState`.

**Arguments:**
- `model`: (String) the model whose form state (and child field states) the reducer will update.

**Example:**
```js
import { createFormReducer } from 'react-redux-form';

const userFormReducer = createFormReducer('user');

export default userFormReducer;
```

## Action Thunk Creators

These action creators require [redux-thunk-middleware](https://github.com/gaearon/redux-thunk) to work, as they use thunks to determine the next state.

### `actions.merge(model, values)`
Dispatches a `change` action that merges the `values` into the value specified by the `model`.

**Arguments:**
- `model`: (String) the object model to be updated.
- `values`: (Object | Object[] | Objects...) the values that will be merged into the object represented by the `model`.

### `actions.xor(model, item)`
Dispatches a `change` action that applies an "xor" operation to the array represented by the `model`; that is, it "toggles" an item in an array.

If the model value contains `item`, it will be removed. If the model value doesn't contain `item`, it will be added.

**Arguments:**
- `model`: (String) the array model where the `xor` will be applied.
- `item`: (*) the item to be "toggled" in the model value.

### `actions.push(model, item)`
Dispatches a `change` action that "pushes" the `item` to the array represented by the `model`.

**Arguments:**
- `model`: (String) the array model where the `item` will be pushed.
- `item`: (*) the item to be "pushed" in the model value.

### `actions.toggle(model)`
Dispatches a `change` action that sets the `model` to true if it is falsey, and false if it is truthy.

**Arguments:**
- `model`: (String) the model whose value will be toggled.

### `actions.filter(model, iteratee)`
Dispatches a `change` action that filters the array represented by the `model` through the `iteratee` function. This action works similar to [lodash's `_.filter` method](https://lodash.com/docs#filter).

If no `iteratee` is specified, the identity function is used by default.

**Arguments:**
- `model`: (String) the array model to be filtered.
- `iteratee = identity`: (Function) the filter iteratee function that filters the array represented by the model.

### `actions.map(model, iteratee)`
Dispatches a `change` action that maps the array represented by the `model` through the `iteratee` function. This action works similar to [lodash's `_.map` method](https://lodash.com/docs#map).

If no `iteratee` is specified, the identity function is used by default.

**Arguments:**
- `model`: (String) the array model to be maped.
- `iteratee = identity`: (Function) the map iteratee function that maps the array represented by the model.

### `actions.remove(model, index)`
Dispatches a `change` action that removes the item at the specified `index` of the array represented by the `model`.

**Arguments:**
- `model`: (String) the array model to be updated.
- `index`: (Number) the index that should be removed from the array.

