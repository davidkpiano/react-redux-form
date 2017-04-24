# Action Creators

- [Model Action Creators](#model-action-creators)
  - [`actions.change()`](#actions-change)
  - [`actions.reset()`](#actions-reset)
  - **Action thunk creators:**
    - [`actions.merge()`](#actions-merge)
    - [`actions.xor()`](#actions-xor)
    - [`actions.push()`](#actions-push)
    - [`actions.toggle()`](#actions-toggle)
    - [`actions.filter()`](#actions-filter)
    - [`actions.map()`](#actions-map)
    - [`actions.remove()`](#actions-remove)
    - [`actions.move()`](#actions-move)
    - [`actions.load()`](#actions-load)
    - [`actions.omit()`](#actions-omit)
- [Field Action Creators](#field-action-creators)
  - [`actions.focus()`](#actions-focus)
  - [`actions.blur()`](#actions-blur)
  - [`actions.setPristine()`](#actions-setPristine)
  - [`actions.setDirty()`](#actions-setDirty)
  - [`actions.setPending()`](#actions-setPending)
  - [`actions.setTouched()`](#actions-setTouched)
  - [`actions.setUntouched()`](#actions-setUntouched)
  - [`actions.setSubmitted()`](#actions-setSubmitted)
  - [`actions.setSubmitFailed()`](#actions-setSubmitFailed)
  - [`actions.setInitial()`](#actions-setInitial)
  - **Action thunk creators:**
    - [`actions.submit()`](#actions-submit)
    - [`actions.submitFields()`](#actions-submitFields)
- [Validation Action Creators](#validation-action-creators)
  - [`actions.setValidity()`](#actions-setValidity)
  - [`actions.setFieldsValidity()`](#actions-setFieldsValidity)
  - [`actions.setErrors()`](#actions-setErrors)
  - [`actions.setFieldsErrors()`](#actions-setFieldsErrors)
  - [`actions.resetValidity()`](#actions-resetValidity)
  - **Action thunk creators:**
    - [`actions.validate()`](#actions-validate)
    - [`actions.validateFields()`](#actions-validate)
    - [`actions.asyncSetValidity()`](#actions-asyncSetValidity)
    - [`actions.validateErrors()`](#actions-validateErrors)
    - [`actions.validateFieldsErrors()`](#actions-validateFieldsErrors)


# Model Action Creators

All model and field action creators can be imported via `import { actions } from 'react-redux-form'`. The action thunk creators require [redux-thunk middleware](https://github.com/gaearon/redux-thunk) to work, as they use thunks to get the current model state.

Also, all action creators are **trackable**, which means that the `model` argument can be a function, such as [`track()`](../guides/tracking.md), that returns a string model path given the store's state. For example:

```jsx
import { track, actions } from 'react-redux-form';

// this will dispatch a change() action for the
// user's goat with id === 123
dispatch(actions.change(
  track('user.goats[].color', {id: 123}),
  'black'));
```

## `actions.change(model, value, [options])` {#actions-change}

Returns an action that, when handled by a `modelReducer`, changes the value of the `model` to the `value`.

When the change action is handled by a [`formReducer`](./formReducer), the field model's `.dirty` state is set to `true` and its corresponding `.pristine` state is set to `false`.

**Note:** if using `track`, `redux-thunk` is required.

### Arguments
- `model` _(String | Function)_: the model whose value will be changed
- `value` _(any)_: the value the model will be changed to
- `options` _(object)_: an object containing options for the action creator:

### Options
- `.silent` _(boolean)_: if `true`, the `CHANGE` action will not trigger change-related operations in the form reducer, such as setting `.pristine = false`. Default: `false`

### Example
```jsx
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

## `actions.reset(model)` {#actions-reset}
Returns an action that, when handled by a `modelReducer`, changes the value of the respective model to its initial value.

### Arguments
- `model` _(String | Function)_: the model whose value will be reset to its initial value.

### Example
```jsx
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

## `actions.merge(model, values)` {#actions-merge}
Dispatches an `actions.change(...)` action that merges the `values` into the value specified by the `model`.

### Arguments
- `model` _(String | Function)_: the model to be merged with `values`.
- `values` _(Object | Object[] | Objects...)_: the values that will be merged into the object represented by the `model`.

### Notes
- Use this action to update multiple and/or deep properties into a model, if the model represents an object.
- This uses `icepick.merge(modelValue, values)` internally.

## `actions.xor(model, item)` {#actions-xor}
Dispatches an `actions.change(...)` action that applies an "xor" operation to the array represented by the `model`; that is, it "toggles" an item in an array.

If the model value contains `item`, it will be removed. If the model value doesn't contain `item`, it will be added.

### Arguments
- `model` _(String | Function)_: the array model where the `xor` will be applied.
- `item` _(any)_: the item to be "toggled" in the model value.

### Example

```jsx
import { actions } from 'react-redux-form';

// assume user.numbers = [1, 2, 3, 4, 5]

dispatch(actions.xor('user.numbers', 3));
// user.numbers = [1, 2, 4, 5]

dispatch(actions.xor('user.numbers', 6));
// user.numbers = [1, 2, 4, 5, 6]
```

### Notes
- This action is most useful for toggling a checkboxes whose values represent items in a model's array.

## `actions.push(model, item)` {#actions-push}
Dispatches an `actions.change(...)` action that "pushes" the `item` to the array represented by the `model`.

### Arguments
- `model` _(String | Function)_: the array model where the `item` will be pushed.
- `item` _(any)_: the item to be "pushed" in the model value.

### Notes
- This action does not mutate the model. It only simulates the mutable `.push()` method.

## `actions.toggle(model)` {#actions-toggle}
Dispatches an `actions.change(...)` action that sets the `model` to true if it is falsey, and false if it is truthy.

### Arguments
- `model` _(String | Function)_: the model whose value will be toggled.

### Notes
- This action is most useful for single checkboxes.

## `actions.filter(model, iteratee)` {#actions-filter}
Dispatches an `actions.change(...)` action that filters the array represented by the `model` through the `iteratee` function.

If no `iteratee` is specified, the identity function is used by default.

### Arguments
- `model` _(String | Function)_: the array model to be filtered.
- `iteratee` _(Function)_: the filter iteratee function that filters the array represented by the model.
  - default: `identity` (`a => a`)

## `actions.map(model, iteratee)` {#actions-map}
Dispatches an `actions.change(...)` action that maps the array represented by the `model` through the `iteratee` function.

If no `iteratee` is specified, the identity function is used by default.

### Arguments
- `model` _(String | Function)_: the array model to be mapped.
- `iteratee` _(Function)_: the map iteratee function that maps the array represented by the model.

## `actions.remove(model, index)` {#actions-remove}
Dispatches an `actions.change(...)` action that removes the item at the specified `index` of the array represented by the `model`.

### Arguments
- `model` _(String | Function)_: the array model to be updated.
- `index` _(Number)_: the index that should be removed from the array.

## `actions.move(model, fromIndex, toIndex)` {#actions-move}
Dispatches an `actions.change(...)` action that moves the item at the specified `fromIndex` of the array to the `toIndex` of the array represented by the `model`.

If `fromIndex` or `toIndex` are out of bounds, an error will be thrown.

### Arguments
- `model` _(String | Function)_: the array model to be updated.
- `fromIndex` _(Number)_: the index of the item that should be moved in the array.
- `toIndex` _(Number)_: the index to move the item to in the array.

### Example
```jsx
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

## `actions.load(model, value)` {#actions-load}
Dispatches an `actions.change(...)` action that loads (updates) the `model` with `value` silently. It does not trigger any effects of a `CHANGE` action in the form reducer.

It also sets the `.loadedValue` of the model's `field` to the dispatched `value`.

### Arguments
- `model` _(String | Function)_: the model whose value will be changed
- `value` _(any)_: the value to load (update) the model with

### Notes
- This action is useful when you need to set an initial model value asynchronously.
- If the initial model value is available at runtime, prefer setting it as part of the `initialState` of the `modelReducer` instead.
- This is different than calling `actions.change(model, value, { silent: true })`. Both are similar with one main difference: `actions.load` also updates the `.loadedValue`, whereas a silent change does not.

## `actions.omit(model, props)` {#actions-omit}
Dispatches an `actions.change(...)` action with the `model` value updated to not include any of the omitted `props`.

### Arguments
- `model` _(String | Function)_: the model to be modified with the omitted props
- `props` _(String | String[])_: the props to omit from the model value

### Example
```jsx
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

# Field Action Creators {#field-action-creators}

All model and field actions can be imported via `import { actions } from 'react-redux-form'`.

## `actions.focus(model)` {#actions-focus}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.focus` state of the field model in the form to `true`.

The "focus" state indicates that the field model is the currently focused field in the form.

### Arguments
- `model` _(String | Function)_: the model indicated as focused

### Example

```jsx
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

## `actions.blur(model)` {#actions-blur}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.focus` state to `false`. It also indicates that the field model has been `.touched`, and will set that state to `true`.

A "blurred" field indicates that the field model control is not currently focused.

### Arugments
- `model` _(String | Function)_: the model indicated as blurred (not focused)

## `actions.setPristine(model)` {#actions-setPristine}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.pristine` state of the field model in the form to `true`.

The "pristine" state indicates that the user has not interacted with this field model yet.

### Arguments
- `model` _(String | Function)_: the model indicated as pristine

### Notes
- Whenever a field is set to pristine, the entire form is set to:
  - pristine _if_ all other fields are pristine
  - otherwise, dirty.

## `actions.setDirty(model)` {#actions-setDirty}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.pristine` state to `false`.

A "dirty" field indicates that the model value has been changed, and is no longer pristine.

### Arguments
- `model` _(String | Function)_: the model indicated as not pristine (dirty)

### Notes
- Whenever a field is set to not pristine (dirty), the entire form is set to not pristine (dirty).

## `actions.setPending(model, [pending])` {#actions-setPending}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.pending` state of the field model in the form to `true`. It simultaneously sets the `.submitted` state to `false`.

### Arguments
- `model` _(String | Function)_: the model indicated as pending
- `pending` _(Boolean)_: whether the model is pending (`true`) or not (`false`).
  - default: `true`

### Notes
- This action is useful when asynchronously validating or submitting a model. It represents the state between the initial and final state of a field model's validation/submission.

## `actions.setTouched(model)` {#actions-setTouched}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.touched` state of the field model in the form to `true`. It simultaneously sets the `.untouched` state to `false`.

The "touched" state indicates that this model has been interacted with.

### Arguments
- `model`: (String) the model indicated as touched

### Notes
- Setting a `model` to touched also sets the entire form to touched.
- Touched also sets the `model` to not focused (blurred).

## `actions.setUntouched(model)` {#actions-setUntouched}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.touched` state to `false`.

An "untouched" field indicates that this model has not been interacted with yet.

### Arguments
- `model` _(String | Function)_: the model indicated as not touched (untouched)

### Notes
- This action is useful for conditionally displaying error messages based on whether the field has been touched.

## `actions.submit(model, [promise])` {#actions-submit}

Waits for a submission `promise` to be completed, then, if successful:
- Sets `.submitted` property of form for `model` to `true`
- Sets `.validity` property of form for `model` to the response (or `true` if the response is `undefined`).

If the promise fails, the action will:
- set `.submitFailed` property of form for `model` to `true`
- set `.errors` property of form for `model` to the response

If a promise is not provided, e.g.: `actions.submit('user')`, then dispatching the action will trigger a `<Form>` with the specified `model` to call its `onSubmit` handler.

### Arguments
- `model` _(String | Function)_: the model to be submitted
- `promise` _(Promise)_: the promise that the submit action will wait to be resolved or rejected
  - default: `undefined` - will trigger a submit in the `<Form>` component with the specified `model`.
- `options` _(Object)_: submit options:

### Options
- `.validate` _(Boolean)_: if `true` (default), will only submit the form if the form is valid. Default: `true`
- `.validators` or `.errors` _(Object|Function)_: will first validate the form against the `.validators` or the `.errors` (error validators).
  - If valid, the action will set the model's validity and proceed to submit the form.
  - If invalid, the action will set the model's validity and not submit the form.

### Example
```jsx
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

## `actions.submitFields(model, promise)` {#actions-submitFields}

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
```jsx
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

## `actions.setSubmitted(model, [submitted])` {#actions-setSubmitted}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.submitted` state of the field model in the form to `submitted` (`true` or `false`). It simultaneously sets the `.pending` state to the inverse of `submitted`.

The "submitted" state indicates that this model has been "sent off," or an action has been completed for the model.

### Arguments
- `model` _(String | Function)_: the model indicated as submitted
- `submitted` _(Boolean)_: whether the model has been submitted (`true`) or not (`false`).
  - default: `true`

### Example
```jsx
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

## `actions.setSubmitFailed(model)` {#actions-setSubmitFailed}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.submitFailed` state of the field model in the form to `true`. It simultaneously sets the `.pending` state to `false`, and the `.retouched` state to `false`.

### Arguments
- `model` _(String | Function)_: the model indicated as having failed a submit

### Notes

- If the form has not been submitted yet, `.submitFailed = false`
- If submitting (pending), `.submitFailed = false`
- If submit failed, `.submitFailed = true`
- If resubmitting, `.submitFailed = false` again.

## `actions.setInitial(model)` {#actions-setInitial}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the state of the field model in the form to its initial state.

Here is the default initial field state:

```jsx
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

## `actions.setValidity(model, validity, [options])` {#actions-setValidity}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.valid` state of the field model in the form to `true` or `false`, based on the `validity` (see below). It will also set the `.validity` state of the field model to the `validity`.

It also sets the `.errors` on the field model to the inverse of the `validity`.

### Arguments
- `model` _(String | Function)_: the model whose validity will be set
- `validity` _(Boolean | Object)_: a boolean value or an object indicating which validation keys of the field model are valid.
- _`options`_ _(Object)_: an object containing options for the action creator:

### Options
- `.errors` _(Boolean)_: if `true`, the validity will be set for `.errors` instead of `.validity` on the field. This is equivalent to `actions.setErrors()`.

### Example
```jsx
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

## `actions.setFieldsValidity(model, fieldsValidity)` {#actions-setFieldsValidity}
Returns an action that, when handled by a [`formReducer`](./formReducer), sets the `.validity` state of each sub-model key in the `fieldsValidity` object to that key's value.

It simultaneously sets the `.errors` on each sub-model to the inverse of its validity.

### Arguments
- `model` _(String | Function)_: the model whose sub-model's validities will be set
- `fieldsValidity` _(Object)_: an object whose keys are sub-models (e.g., `'name'` for `user.name`) and whose values are the validities for each sub-model.

## `actions.validate(model, validators)` {#actions-validate}
Returns an action thunk that calculates the `validity` of the `model` based on the function/object `validators`. Then, the thunk dispatches `actions.setValidity(model, validity)`.

A **validator** is a function that returns `true` if valid, and `false` if invalid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `validators` _(Function | Object)_: a validator function _or_ an object whose keys are validation keys (such as `'required'`) and values are validators.

### Example
```jsx
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

## `actions.asyncSetValidity(model, asyncValidator)` {#actions-asyncSetValidity}
Returns an action thunk that calculates the `validity` of the `model` based on the async function `asyncValidator`. That function dispatches `actions.setValidity(model, validity)` by calling `done(validity)`.

### Arguments
- `model` _(String | Function)_: the model whose validity will asynchronously be set
- `asyncValidator(value, done)` _(Function)_: a function that is given two arguments:
  - `value` - the value of the `model`
  - `done` - the callback where the calculated `validity` is passed in as the argument.

### Example
```jsx
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

## `actions.setErrors(model, errors)` {#actions-setErrors}
Returns an action that, when handled by a [`formReducer`](./formReducer), changes the `.valid` state of the field model in the form to `true` or `false`, based on the `errors` (see below). It will also set the `.errors` state of the field model to the `errors`.

It simultaneously sets the `.validity` on the field model to the inverse of the `errors`.

### Arguments
- `model` _(String | Function)_: the model whose validity will be set
- `errors` _(Boolean | Object | String)_: a truthy/falsey value or an object indicating which error keys of the field model are invalid.

### Example
```jsx
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

## `actions.setFieldsErrors(model, fieldsErrors)` {#actions-setFieldsErrors}
Returns an action that, when handled by a [`formReducer`](./formReducer), sets the `.errors` state of each sub-model key in the `fieldsErrors` object to that key's value.

It simultaneously sets the `.validity` on each sub-model to the inverse of its errors.

### Arguments
- `model` _(String | Function)_: the model whose sub-models validities will be set
- `fieldsErrors` _(Object)_: an object whose keys are sub-models (e.g., `'name'` for `user.name`) and whose values are the errors for each sub-model.

## `actions.validateErrors(model, errorValidators)` {#actions-validateErrors}
Returns an action thunk that calculates the `errors` of the `model` based on the function/object `errorValidators`. Then, the thunk dispatches `actions.setErrors(model, errors)`.

An **error validator** is a function that returns `true` or a truthy value (such as a string) if invalid, and `false` if valid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `errorValidators` _(Function | Object)_: an error validator _or_ an object whose keys are error keys (such as `'incorrect'`) and values are error validators.

### Example
```jsx
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

## `actions.validateFields(model, fieldValidators)` {#actions-validateFields}
Returns an action thunk that calculates the `validity` for each sub-model key of the `fieldValidators` object based on the value, which is a `validator`. Then, the thunk dispatches `actions.setValidity(model, validity)` for all of the sub-models.

A **validator** is a function that returns `true` or a truthy value (such as a string) if valid, and `false` if invalid.

### Arguments
- `model` _(String | Function)_: the model whose validity will be calculated
- `fieldValidators` _(Object)_: an object whose keys are sub-models, and whose values are validators for each sub-model (see example).

### Example
```jsx
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

## `actions.validateFieldsErrors(model, fieldErrorsValidators)` {#actions-validateFieldsErrors}
Returns an action thunk that calculates the `errors` for each sub-model key of the `fieldErrorsValidators` object based on the value, which is an `errorValidator`. Then, the thunk dispatches `actions.setErrors(model, errors)` for all of the sub-models.

An **error validator** is a function that returns `true` or a truthy value (such as a string) if invalid, and `false` if valid.

### Arguments
- `model` _(String | Function)_: the model whose errors will be calculated
- `fieldErrorsValidators` _(Object)_: an object whose keys are sub-models, and whose values are error validators for each sub-model (see example).

### Example
```jsx
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

## `actions.resetValidity(model, [omitKeys])` {#actions-resetValidity}
Resets the `.validity` and `.errors` for the field model to the `.validity` and `.errors` of the initial field state.

If `omitKeys` is specified as an array, it will only reset the validity to the omitted keys by removing them from the current validity/errors.

_Alias:_ `actions.resetErrors(model)`

### Arguments
- `model` _(String | Function)_: the model whose validity and errors will be reset.
- `omitKeys` _(Array)_: the keys to reset by omitting them. Default: `false` (will reset all keys)



