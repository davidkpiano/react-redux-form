# Action Creators

- [Model Action Creators](#model-action-creators)
  - [`actions.change()`](#actions-change)
  - [`actions.reset()`](#actions-reset)
  - [`actions.merge()`](#actions-merge)
  - [`actions.xor()`](#actions-xor)
  - [`actions.toggle()`](#actions-toggle)
  - [`actions.filter()`](#actions-filter)
  - [`actions.map()`](#actions-map)
  - [`actions.remove()`](#actions-remove)
  - [`actions.move()`](#actions-move)
  - [`actions.load()`](#actions-load)
  - [`actions.load()`](#actions-omit)
- [Field Action Creators](#field-action-creators)
  - [`actions.focus()`](#actions-focus)
  - [`actions.blur()`](#actions-blur)
  - [`actions.setPristine()`](#actions-setPristine)
  - [`actions.setDirty()`](#actions-setDirty)
  - [`actions.setPending()`](#actions-setPending)
  - [`actions.setTouched()`](#actions-setTouched)
  - [`actions.setUntouched()`](#actions-setUntouched)
  - [`actions.submit()`](#actions-submit)
  - [`actions.submitFields()`](#actions-submitFields)
  - [`actions.setSubmitted()`](#actions-setSubmitted)
  - [`actions.setSubmitFailed()`](#actions-setSubmitFailed)
  - [`actions.setInitial()`](#actions-setInitial)
- [Validation Action Creators](#validation-action-creators)
  - [`actions.setValidity()`](#actions-setValidity)
  - [`actions.setFieldsValidity()`](#actions-setFieldsValidity)
  - [`actions.validate()`](#actions-validate)
  - [`actions.validateFields()`](#actions-validate)
  - [`actions.asyncSetValidity()`](#actions-asyncSetValidity)
  - [`actions.setErrors()`](#actions-setErrors)
  - [`actions.setFieldsErrors()`](#actions-setFieldsErrors)
  - [`actions.validateErrors()`](#actions-validateErrors)
  - [`actions.validateFieldsErrors()`](#actions-validateFieldsErrors)
  - [`actions.resetValidity()`](#actions-resetValidity)



# Model Action Creators

All model and field action creators can be imported via `import { actions } from 'react-redux-form'`. The action thunk creators require [redux-thunk middleware](https://github.com/gaearon/redux-thunk) to work, as they use thunks to get the current model state.

Also, all action creators are **trackable**, which means that the `model` argument can be a function, such as [`track()`](TODO), that returns a string model path given the store's state. For example:

```js
import { track, actions } from 'react-redux-form';

// this will dispatch a change() action for the
// user's goat with id === 123
dispatch(actions.change(
  track('user.goats[].color', {id: 123}),
  'black'));
```

<h2 id="actions-change"></h2>
## `actions.change(model, value, [options])`

Returns an action that, when handled by a `modelReducer`, changes the value of the `model` to the `value`.

When the change action is handled by a [`formReducer`](TODO), the field model's `.dirty` state is set to `true` and its corresponding `.pristine` state is set to `false`.

### Arguments
- `model` _(String | Function)_: the model whose value will be changed
- `value` _(any)_: the value the model will be changed to
- `options` _(object)_: an object containing options for the action creator:

### Options
- `.silent` _(boolean)_: if `true`, the `CHANGE` action will not trigger change-related operations in the form reducer, such as setting `.pristine = false`. Default: `false`

### Example
```js
import {
  modelReducer,
  actions
} from 'react-redux-form';

const userReducer = modelReducer('user');

const initialState = { name: '', age: 0 };

userReducer(initialState, actions.change('user.name', 'Billy'));
// => { name: 'Billy', age: 0 }
```

### Notes
- The `model` path can be as deep as you want. E.g. `actions.change('user.phones[0].type', 'home')`

<h2 id="actions-reset"></h2>
## `actions.reset(model)`
Returns an action that, when handled by a `modelReducer`, changes the value of the respective model to its initial value.

### Arguments
- `model` _(String | Function)_: the model whose value will be reset to its initial value.

### Example
```js
import {
  modelReducer,
  actions
} from 'react-redux-form';

const initialState = { count: 10 };

const counterReducer = modelReducer('counter', initialState);

const nextState = counterReducer(initialState,
  actions.change('counter.count', 42));
// => { count: 42 }

const resetState = counterReducer(nextState,
  actions.reset('counter.count'));
// => { count: 10 }
```

### Notes
- This action will reset both the model value in the model reducer, _and_ the model field state in the form reducer (if it exists).
- To reset just the field state (in the form reducer), use `actions.setInitial(model)`.

<h2 id="actions-merge"></h2>
## `actions.merge(model, values)`
Dispatches an `actions.change(...)` action that merges the `values` into the value specified by the `model`.

### Arguments
- `model` _(String | Function)_: the model to be merged with `values`.
- `values` _(Object | Object[] | Objects...)_: the values that will be merged into the object represented by the `model`.

### Notes
- Use this action to update multiple and/or deep properties into a model, if the model represents an object.
- This uses `icepick.merge(modelValue, values)` internally.

<h2 id="actions-xor"></h2>
## `actions.xor(model, item)`
Dispatches an `actions.change(...)` action that applies an "xor" operation to the array represented by the `model`; that is, it "toggles" an item in an array.

If the model value contains `item`, it will be removed. If the model value doesn't contain `item`, it will be added.

### Arguments
- `model` _(String | Function)_: the array model where the `xor` will be applied.
- `item` _(any)_: the item to be "toggled" in the model value.

### Example

```js
import { actions } from 'react-redux-form';

// assume user.numbers = [1, 2, 3, 4, 5]

dispatch(actions.xor('user.numbers', 3));
// user.numbers = [1, 2, 4, 5]

dispatch(actions.xor('user.numbers', 6));
// user.numbers = [1, 2, 4, 5, 6]
```

### Notes
- This action is most useful for toggling a checkboxes whose values represent items in a model's array.

## `actions.push(model, item)`
Dispatches an `actions.change(...)` action that "pushes" the `item` to the array represented by the `model`.

### Arguments
- `model` _(String | Function)_: the array model where the `item` will be pushed.
- `item` _(any)_: the item to be "pushed" in the model value.

### Notes
- This action does not mutate the model. It only simulates the mutable `.push()` method.

<h2 id="actions-toggle"></h2>
## `actions.toggle(model)`
Dispatches an `actions.change(...)` action that sets the `model` to true if it is falsey, and false if it is truthy.

### Arguments
- `model` _(String | Function)_: the model whose value will be toggled.

### Notes
- This action is most useful for single checkboxes.

<h2 id="actions-filter"></h2>
## `actions.filter(model, iteratee)`
Dispatches an `actions.change(...)` action that filters the array represented by the `model` through the `iteratee` function.

If no `iteratee` is specified, the identity function is used by default.

### Arguments
- `model` _(String | Function)_: the array model to be filtered.
- `iteratee` _(Function)_: the filter iteratee function that filters the array represented by the model.
  - default: `identity` (`a => a`)

<h2 id="actions-map"></h2>
## `actions.map(model, iteratee)`
Dispatches an `actions.change(...)` action that maps the array represented by the `model` through the `iteratee` function.

If no `iteratee` is specified, the identity function is used by default.

### Arguments
- `model` _(String | Function)_: the array model to be mapped.
- `iteratee` _(Function)_: the map iteratee function that maps the array represented by the model.

<h2 id="actions-remove"></h2>
## `actions.remove(model, index)`
Dispatches an `actions.change(...)` action that removes the item at the specified `index` of the array represented by the `model`.

### Arguments
- `model` _(String | Function)_: the array model to be updated.
- `index` _(Number)_: the index that should be removed from the array.

<h2 id="actions-move"></h2>
## `actions.move(model, fromIndex, toIndex)`
Dispatches an `actions.change(...)` action that moves the item at the specified `fromIndex` of the array to the `toIndex` of the array represented by the `model`.

If `fromIndex` or `toIndex` are out of bounds, an error will be thrown.

### Arguments
- `model` _(String | Function)_: the array model to be updated.
- `fromIndex` _(Number)_: the index of the item that should be moved in the array.
- `toIndex` _(Number)_: the index to move the item to in the array.

### Example
```js
// Assuming this state:
// {
//  foo: {
//     bar: [1, 2, 3, 4]
//   }
// }

dispatch(actions.move('foo.bar', 2, 0));
// the new foo.bar state:
// => [3, 1, 2, 4]
```

<h2 id="actions-load"></h2>
## `actions.load(model, value)`
Dispatches an `actions.change(...)` action that loads (updates) the `model` with `value` silently. It does not trigger any effects of a `CHANGE` action in the form reducer.

### Arguments
- `model` _(String | Function)_: the model whose value will be changed
- `value` _(any)_: the value to load (update) the model with

### Notes
- This action is useful when you need to set an initial model value asynchronously.
- If the initial model value is available at runtime, prefer setting it as part of the `initialState` of the `modelReducer` instead.
- This is equivalent to calling `actions.change(model, value, { silent: true })`.

<h2 id="actions-omit"></h2>
## `actions.omit(model, props)`
Dispatches an `actions.change(...)` action with the `model` value updated to not include any of the omitted `props`.

### Arguments
- `model` _(String | Function)_: the model to be modified with the omitted props
- `props` _(String | String[])_: the props to omit from the model value

### Example
```js
// Assuming this state:
// {
//   test: {
//     foo: 1,
//     bar: 2, 
//     baz: 3
//   }
// }

dispatch(actions.omit('test', 'foo'));
// the new test state: 
// => { test: { bar: 2, baz: 3 } }

dispatch(actions.omit('test', ['foo', 'baz']);
// the new test state:
// => { test: { bar: 2 } }
```

# Field Action Creators

All model and field actions can be imported via `import { actions } from 'react-redux-form'`.

<h2 id="actions-focus"></h2>
## `actions.focus(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.focus` state of the field model in the form to `true`.

The "focus" state indicates that the field model is the currently focused field in the form.

### Arguments
- `model` _(String | Function)_: the model indicated as focused

### Example

```js
import { actions } from 'react-redux-form';

// in a connect()-ed component:
const Newsletter = (props) => {
  const { newsletterForm, dispatch } = props;
  
  return <form>
    <input type="email"
      onFocus={() => dispatch(actions.focus('newsletter.email'))} />
    { newsletterForm.fields.email.focus &&
      <div>Sweet, you're signing up!</div>
    }
  </form>;
}
```

### Notes
- If possible, RRF will actually call `.focus()` on the DOM node if it is focusable.

<h2 id="actions-blur"></h2>
## `actions.blur(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.focus` state to `false`. It also indicates that the field model has been `.touched`, and will set that state to `true`.

A "blurred" field indicates that the field model control is not currently focused.

### Arugments
- `model` _(String | Function)_: the model indicated as blurred (not focused)

<h2 id="actions-setPristine"></h2>
## `actions.setPristine(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.pristine` state of the field model in the form to `true`.

The "pristine" state indicates that the user has not interacted with this field model yet.

### Arguments
- `model` _(String | Function)_: the model indicated as pristine

### Notes
- Whenever a field is set to pristine, the entire form is set to:
  - pristine _if_ all other fields are pristine
  - otherwise, dirty.

<h2 id="actions-setDirty"></h2>
## `actions.setDirty(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.pristine` state to `false`.

A "dirty" field indicates that the model value has been changed, and is no longer pristine.

### Arguments
- `model` _(String | Function)_: the model indicated as not pristine (dirty)

### Notes
- Whenever a field is set to not pristine (dirty), the entire form is set to not pristine (dirty).

<h2 id="actions-setPending"></h2>
## `actions.setPending(model, [pending])`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.pending` state of the field model in the form to `true`. It simultaneously sets the `.submitted` state to `false`.

### Arguments
- `model` _(String | Function)_: the model indicated as pending
- `pending` _(Boolean)_: whether the model is pending (`true`) or not (`false`).
  - default: `true`

### Notes
- This action is useful when asynchronously validating or submitting a model. It represents the state between the initial and final state of a field model's validation/submission.

<h2 id="actions-setTouched"></h2>
## `actions.setTouched(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.touched` state of the field model in the form to `true`. It simultaneously sets the `.untouched` state to `false`.

The "touched" state indicates that this model has been interacted with.

### Arguments
- `model`: (String) the model indicated as touched

### Notes
- Setting a `model` to touched also sets the entire form to touched.
- Touched also sets the `model` to not focused (blurred).

<h2 id="actions-setUntouched"></h2>
## `actions.setUntouched(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.touched` state to `true`.

An "untouched" field indicates that this model has not been interacted with yet.

### Arguments
- `model` _(String | Function)_: the model indicated as not touched (untouched)

### Notes
- This action is useful for conditionally displaying error messages based on whether the field has been touched.

<h2 id="actions-submit"></h2>
## `actions.submit(model, promise)`

Waits for a submission `promise` to be completed, then, if successful:
- Sets `.submitted` property of form for `model` to `true`
- Sets `.validity` property of form for `model` to the response (or `true` if the response is `undefined`).

If the promise fails, the action will:
- set `.submitFailed` property of form for `model` to `true`
- set `.errors` property of form for `model` to the response

### Arguments
- `model` _(String | Function)_: the model to be submitted
- `promise` _(Promise)_: the promise that the submit action will wait to be resolved or rejected
- `options` _(Object)_: submit options:

### Options
- `.validate` _(Boolean)_: if `true` (default), will only submit the form if the form is valid. Default: `true`
- `.validators` or `.errors` _(Object|Function)_: will first validate the form against the `.validators` or the `.errors` (error validators).
  - If valid, the action will set the model's validity and proceed to submit the form.
  - If invalid, the action will set the model's validity and not submit the form.

### Example
```js
import { actions } from 'react-redux-form';

// somewhere with dispatch()

// promise
const postUser = api.post({/* user data */})
  // API success
  .then(() => true) // validity = true
  // API failure
  .catch((err) => err) // errors = err

dispatch(actions.submit('user', postUser));
```

<h2 id="actions-submitFields"></h2>
## `actions.submitFields(model, promise)`

Waits for a submission `promise` to be completed, then, if successful:
- Sets `.submitted` property of form for `model` to `true`
- Each key in the response, which represents a sub-model (e.g., `"name"` for `users.name`) will have its `.validity` set to its value.

If the promise fails, the action will:
- set `.submitFailed` property of form for `model` to `true`
- Each key in the response, which represents a sub-model (e.g., `"name"` for `users.name`) will have its `.errors` set to its value. (See example)

### Arguments
- `model` _(String | Function)_: the model to be submitted
- `promise` _(Promise)_: the promise that the submit action will wait to be resolved or rejected
- _`options`_ _(Object)_: submit options (see [`actions.submit`](#actions-submit))

### Example
```js
import { actions } from 'react-redux-form';

// somewhere with dispatch()

// promise
const postUser = api.post({/* user data */})
  // API success
  .then(() => true) // validity = true
  // API failure
  .catch((err) => err) // errors = err

// Assume the API (or promise) returns these errors:
// {
//  "email": ["This email is already taken."],
//  "phone": ["Invalid area code.", "Invalid format."],
// }

dispatch(actions.submitFields('user', postUser));

// The errors for `user.email` and `user.phone` will be set
// to the above values.
```

<h2 id="actions-setSubmitted"></h2>
## `actions.setSubmitted(model, [submitted])`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.submitted` state of the field model in the form to `submitted` (`true` or `false`). It simultaneously sets the `.pending` state to the inverse of `submitted`.

The "submitted" state indicates that this model has been "sent off," or an action has been completed for the model.

### Arguments
- `model` _(String | Function)_: the model indicated as submitted
- `submitted` _(Boolean)_: whether the model has been submitted (`true`) or not (`false`).
  - default: `true`

### Example
```js
import { actions } from 'react-redux-form';

// action thunk creator
export default function submitUser(data) {
  return (dispatch) => {
    dispatch(actions.setPending('user', true));
    
    fetch('...', { body: data })
      .then((response) => {
        // handle the response, then...
        dispatch(actions.setSubmitted('user', true));
      });
  }
}
```

### Notes
- Use the `setPending()` and `setSubmitted()` actions together to update the state of the field model during some async action.

<h2 id="actions-setSubmitFailed"></h2>
## `actions.setSubmitFailed(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.submitFailed` state of the field model in the form to `true`. It simultaneously sets the `.pending` state to `false`, and the `.retouched` state to `false`.

### Arguments
- `model` _(String | Function)_: the model indicated as having failed a submit

### Notes

- If the form has not been submitted yet, `.submitFailed = false`
- If submitting (pending), `.submitFailed = false`
- If submit failed, `.submitFailed = true`
- If resubmitting, `.submitFailed = false` again.

<h2 id="actions-setInitial"></h2>
## `actions.setInitial(model)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the state of the field model in the form to its initial state.

Here is the default initial field state:

```js
const initialFieldState = {
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  touched: false,
  valid: true,
  validating: false,
  viewValue: null,
  validity: {},
  errors: {},
};
```

### Arguments
- `model` _(String | Function)_: the model to be reset to its initial state

### Notes
- This action will reset the field state, but will _not_ reset the `model` value in the model reducer. To reset both the field and model, use `actions.reset(model)`.

# Validation Action Creators

<h2 id="actions-setValidity"></h2>
## `actions.setValidity(model, validity, [options])`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.valid` state of the field model in the form to `true` or `false`, based on the `validity` (see below). It will also set the `.validity` state of the field model to the `validity`.

It also sets the `.errors` on the field model to the inverse of the `validity`.

### Arguments
- `model` _(String | Function)_: the model whose validity will be set
- `validity` _(Boolean | Object)_: a boolean value or an object indicating which validation keys of the field model are valid.
- _`options`_ _(Object)_: an object containing options for the action creator:

### Options
- `.errors` _(Boolean)_: if `true`, the validity will be set for `.errors` instead of `.validity` on the field. This is equivalent to `actions.setErrors()`.

### Example
```js
import { actions } from 'react-redux-form';

// somewhere with dispatch():
dispatch(actions.setValidity('user.email', true));

// email field:
// {
//   valid: true,
//   validity: true,
//   errors: false
// }

const val = 'testing123';

dispatch(actions.setValidity('user.password', {
  required: val && val.length,
  correct: val === 'hunter2'
}));

// password field:
// {
//   valid: false,
//   validity: { required: true, correct: false },
//   errors: { required: false, correct: true }
// }
```

### Notes
- If you _really_ want to set error messages instead, use `actions.setErrors(model, errors)`.
- Since arrays are objects, the `validity` argument _can_ be an array. Only do this if your use case requires it.

<h2 id="actions-setFieldsValidity"></h2>
## `actions.setFieldsValidity(model, fieldsValidity)`
Returns an action that, when handled by a [`formReducer`](TODO), sets the `.validity` state of each sub-model key in the `fieldsValidity` object to that key's value.

It simultaneously sets the `.errors` on each sub-model to the inverse of its validity.

### Arguments
- `model` _(String | Function)_: the model whose sub-model's validities will be set
- `fieldsValidity` _(Object)_: an object whose keys are sub-models (e.g., `'name'` for `user.name`) and whose values are the validities for each sub-model.

<h2 id="actions-validate"></h2>
## `actions.validate(model, validators)`
Returns an action thunk that calculates the `validity` of the `model` based on the function/object `validators`. Then, the thunk dispatches `actions.setValidity(model, validity)`.

A **validator** is a function that returns `true` if valid, and `false` if invalid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `validators` _(Function | Object)_: a validator function _or_ an object whose keys are validation keys (such as `'required'`) and values are validators.

### Example
```js
import { actions } from 'react-redux-form';

const isEmail = (value) => // ... check if email is valid

// assume user.email = "foo@gmail"

// somewhere with dispatch():
dispatch(actions.validate('user.email', isEmail));
// will dispatch actions.setValidity('user.email', false)

dispatch(actions.validate('user.email', {
  isEmail,
  available: (email) => email !== 'foo@gmail.com'
});
// will dispatch actions.setValidity('user.email', {
//  isEmail: false,
//  available: true
// });
```

<h2 id="actions-asyncSetValidity"></h2>
## `actions.asyncSetValidity(model, asyncValidator)`
Returns an action thunk that calculates the `validity` of the `model` based on the async function `asyncValidator`. That function dispatches `actions.setValidity(model, validity)` by calling `done(validity)`.

### Arguments
- `model` _(String | Function)_: the model whose validity will asynchronously be set
- `asyncValidator(value, done)` _(Function)_: a function that is given two arguments:
  - `value` - the value of the `model`
  - `done` - the callback where the calculated `validity` is passed in as the argument.

### Example
```js
import { actions } from 'react-redux-form';

// async function
function isEmailAvailable(email, done) {
  fetch('...', { body: email })
    .then((response) => {
      done(response); // true or false
    });
}

// somewhere with dispatch():
dispatch(actions.asyncSetValidity('user.email', isEmailAvailable));
// => 1. will set .pending to true, then eventually...
// => 2. will set .validity to response and .pending to false
```

### Notes
- This action is useful for general-purpose asynchronous validation using callbacks.  If you are using _promises_, using `actions.submit(model, promise)` is a simpler pattern.

<h2 id="actions-setErrors"></h2>
## `actions.setErrors(model, errors)`
Returns an action that, when handled by a [`formReducer`](TODO), changes the `.valid` state of the field model in the form to `true` or `false`, based on the `errors` (see below). It will also set the `.errors` state of the field model to the `errors`.

It simultaneously sets the `.validity` on the field model to the inverse of the `errors`.

### Arguments
- `model` _(String | Function)_: the model whose validity will be set
- `errors` _(Boolean | Object | String)_: a truthy/falsey value or an object indicating which error keys of the field model are invalid.

### Example
```js
import { actions } from 'react-redux-form';

// somewhere with dispatch():
dispatch(actions.setErrors('user.email', true));

// email field:
// {
//   valid: false,
//   validity: false,
//   errors: true
// }

dispatch(actions.setErrors('user.email', 'So many errors!'));

// email field:
// {
//   valid: false,
//   validity: false,
//   errors: 'So many errors!'
// }

const val = 'testing123';

dispatch(actions.setErrors('user.password', {
  empty: !(val && val.length) && 'Password is required!',
  incorrect: val !== 'hunter2' && 'The password is wrong'
}));

// password field:
// {
//   valid: false,
//   errors: { empty: false, incorrect: 'The password is wrong' }
// }
```

### Notes
- If you aren't hard-coding error messages, use `actions.setValidity(model, validity)` instead. It's a cleaner pattern.
- You can set `errors` to a boolean, object, array, string, etc. Remember: truthy values indicate errors in `errors`.

<h2 id="actions-setFieldsErrors"></h2>
## `actions.setFieldsErrors(model, fieldsErrors)`
Returns an action that, when handled by a [`formReducer`](TODO), sets the `.errors` state of each sub-model key in the `fieldsErrors` object to that key's value.

It simultaneously sets the `.validity` on each sub-model to the inverse of its errors.

### Arguments
- `model` _(String | Function)_: the model whose sub-models validities will be set
- `fieldsErrors` _(Object)_: an object whose keys are sub-models (e.g., `'name'` for `user.name`) and whose values are the errors for each sub-model.

<h2 id="actions-validateErrors"></h2>
## `actions.validateErrors(model, errorValidators)`
Returns an action thunk that calculates the `errors` of the `model` based on the function/object `errorValidators`. Then, the thunk dispatches `actions.setErrors(model, errors)`.

An **error validator** is a function that returns `true` or a truthy value (such as a string) if invalid, and `false` if valid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `errorValidators` _(Function | Object)_: an error validator _or_ an object whose keys are error keys (such as `'incorrect'`) and values are error validators.

### Example
```js
import { actions } from 'react-redux-form';
import { isEmail } from 'validator';

// assume user.email = "foo@gmail"

// somewhere with dispatch():
dispatch(actions.validateErrors('user.email', (val) => {
  return !isEmail(val) && 'Not an email!'
}));
// will dispatch actions.setErrors('user.email', 'Not an email!')

dispatch(actions.validateErrors('user.email', {
  notAnEmail: (val) => !isEmail(val) && 'Not an email!',
  unavailable: (email) => email == 'foo@gmail.com' && 'Use a different email'
});
// will dispatch actions.setErrors('user.email', {
//  notAnEmail: 'Not an email!',
//  unavailable: false
// });
```

### Notes
- As previously stated, if you aren't using error messages, use `actions.validate(model, validators)` as a cleaner pattern.

<h2 id="actions-validateFields"></h2>
## `actions.validateFields(model, fieldValidators)`
Returns an action thunk that calculates the `validity` for each sub-model key of the `fieldValidators` object based on the value, which is a `validator`. Then, the thunk dispatches `actions.setValidity(model, validity)` for all of the sub-models.

A **validator** is a function that returns `true` or a truthy value (such as a string) if valid, and `false` if invalid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `fieldValidators` _(Object)_: an object whose keys are sub-models, and whose values are validators for each sub-model (see example).

### Example
```js
import { actions } from 'react-redux-form';
import { isEmail } from 'validator';

const required = (val) => !!(value && value.length);

dispatch(actions.validateFields('user', {
  email: {
    isEmail,
    required,
  },
  username: {
    goodLength: (val) => val.length <= 8,
  },
}));
```

<h2 id="actions-validateFieldsErrors"></h2>
## `actions.validateFieldsErrors(model, fieldErrorsValidators)`
Returns an action thunk that calculates the `errors` for each sub-model key of the `fieldErrorsValidators` object based on the value, which is an `errorValidator`. Then, the thunk dispatches `actions.setErrors(model, errors)` for all of the sub-models.

An **error validator** is a function that returns `true` or a truthy value (such as a string) if invalid, and `false` if valid.

### Arguments
- `model` _(String | Function)_: the model whose errors will be calculated
- `fieldErrorsValidators` _(Object)_: an object whose keys are sub-models, and whose values are error validators for each sub-model (see example).

### Example
```js
import { actions } from 'react-redux-form';
import { isEmail } from 'validator';

dispatch(actions.validateFieldsErrors('user', {
  email: {
    isMissing: (val) => !val || !val.length,
    invalidEmail: (val) !isEmail(val),
  },
  username: {
    tooLong: (val) => val.length > 8,
  },
}));
```

<h2 id="actions-resetValidity"></h2>
## `actions.resetValidity(model)`
Resets the `.validity` and `.errors` for the field model to the `.validity` and `.errors` of the initial field state.

_Alias:_ `actions.resetErrors(model)`

### Arguments
- `model` _(String | Function)_: the model whose validity and errors will be reset.



