# Validation

Validation occurs as the result of dispatching validation actions, such as `actions.setValidity(model, validity)` or `actions.setErrors(model, errors)`. That action updates the form validity and error state of your model, and allows you to:

- validate any part of the model state (however deep),
- validate any key on that model (such as `{ required: true, length: false }`)
- call validation only when the model has been updated.

## Simple Validation

Suppose you are validating `'user.email'`. At any point, you can dispatch `actions.setValidity()` to set the validity of that model on your form state:

```js
import { actions } from 'react-redux-form';

function emailIsValid(email) {
  // terrible validation, I know
  return email && email.length > 0;
}

// in the connected component's render() method...
const { dispatch, user } = this.props;

return
<input type="text"
  onChange={(e) => dispatch(actions.change('user.email', e))}
  onBlur={() => dispatch(actions.validate('user.email', emailIsValid))}
/>
```

## Multiple Validation Keys

You can also get more specific with validation by returning an object with validation keys. The API is the same -- this time, we'll use the excellent [validator](https://www.npmjs.com/package/validator) library to help us.

**Note:** React Redux Form can work with any validator function library!

```js
import { actions } from 'react-redux-form';
import validator from 'validator';

// wherever validation is occurring:
dispatch(actions.validate('user.email', {
  required: (value) => value && value.length,
  valid: validator.isEmail
});
```

## Updated Form State

Here's what happens when you set the validity of a model, via `dispatch(actions.setValidity(model, validity))`:

- The `.errors` property of the model's field is set:
  - if `validity` is boolean, `.errors = !validity`. If valid, `.errors = false`, and vice-versa
  - if `validity` is an object, `.errors` is set to the opposite of each validation key (see example below)
- The `.validity` property of the model's field is set as the inverse of `.errors`
- The `.valid` property of the model's field is set:
  - `.valid = true` if the validity is truthy or if each validation key value is truthy
  - `.valid = false` if the validity is falsey or if any validation key is falsey
- The `.valid` property of all parent forms of the model are set:
  - `.valid = true` if every field in the form is valid
  - `.valid = false` if any field in the form is invalid

Here's an example:

```js
import { actions } from 'react-redux-form';

// wherever validation occurs...
const { userForm, dispatch } = this.props;

dispatch(actions.setValidity('user.email', {
  required: true,
  isEmail: false
}); // user entered email but email is invalid

userForm.email.valid;
// => false

userForm.email.errors;
// => { required: false, isEmail: true }

userForm.$form.valid;
// => false
```

## Async Validity

There are multiple ways you can handle setting validity asynchronously. As long as a validation action such as `setValidity()` or `setErrors()` is dispatched, the validity will be updated. It's generally a good idea to dispatch `setPending(model, pending)` to indicate that the model is currently being validated.

Here's a solution using an action thunk creator (with `redux-thunk`):

```js
// username-actions.js
import { actions } from 'react-redux-form';

export function checkAvailability(username) {
  return (dispatch) => {
    dispatch(actions.setPending('user.username', true));

    // some asynchronous validation function that returns a promise
    asyncCheckUsername(username)
      .then((response) => {
         dispatch(actions.setValidity('user.username', {
           available: response.available
         });

         dispatch(actions.setPending('user.username', false));
      });
  }
}
```

Alternatively, the `asyncSetValidity(model, validator)` action thunk creator does the above by using the `done` callback as the second argument to `validator(value, done)`:

```js
import { actions } from 'react-redux-form';

// wherever validation occurs...
const { user, dispatch } = this.props;

dispatch(actions.setAsyncValidity('user.username', (value, done) => {
  asyncCheckUsername(value)
    .then((response) => done({ available: response.available });
}));
```

If you are working with **promises**, the `submit(model, promise)` action will automatically set the `.errors` of the `model` field if the promise is rejected:

```js
import { actions } from 'react-redux-form';

// your custom promise
import checkUsernamePromise from '../path/to/promise';

// wherever dispatch() is available...
dispatch(actions.submit('user', checkUsernamePromise));
```

If the promise you are working with can reject with errors for each individual field, such as:

```
{
  "email": ["The email address is invalid."],
  "firstName": ["Name contains illegal characters."]
}
```

then you can use `actions.submitFields('user', myPromise)`, which will set errors for each individual field (e.g., `"user.email"`, `"user.firstName"`), instead of just the `"user"` model.

## Validation with `<Field>` and `<Control>` components

The `<Field>` and `<Control>` components accept a few validation-specific props:

- `validators` - an object with key-value pairs:
  - **validation key** (string) and
  - **validator** (function) - a function that takes in the model `value` and returns a boolean (true/false if valid/invalid)
- `asyncValidators` - an object with key-value pairs:
  - **validation key** (string) and
  - **validator** (function) - a function that takes in the model `value` and the `done` callback, similar to `asyncSetValidity(value, done)`
- `validateOn` and `asyncValidateOn` - event to indicate when to validate:
  - `"change"` (default for `validators`)
  - `"blur"` (default for `asyncValidators`)
  - `"focus"`
  - or multiple values, such as `["change", "blur"]`

Here's an example with the above email and username fields:

```js
import { Control } from 'react-redux-form';
import { isEmail } from '../path/to/validators';

// in the component's render() method:
<Field
  model="user.email"
  validators={{
    required: (val) => val && val.length,
    isEmail,
  }}
  validateOn="blur"
>
  <input type="email" />
</Field>

<Control.text
  model="user.firstName"
  validators={{
    required: (val) => val && val.length,
  }}
  validateOn="change"
/>

<Field model="user.username"
  validators={{
    required: (val) => val && val.length
  }}
  asyncValidators={{
    available: (val, done) => asyncCheckUsername(val)
      .then(res => done(res.available))
  }}
  asyncValidateOn="blur"
>
  <input type="text" />
</Field>
```

## HTML5 Validation

[HTML Constraint Validation](http://www.html5rocks.com/en/tutorials/forms/constraintvalidation/) is recognized in RRF, and RRF will detect if the control's DOM node `.willValidate`. If so, then whenever validation occurs on the control, RRF will set the corresponding validation fields automatically.

This means that validation such as the examples below will _just work_:

```js
import { Field, Control } from 'react-redux-form';

// ...

<Field model="user.email">
  <input type="email" />
</Field>

<Control.text
  model="user.firstName"
  required
/>
```

If you want to disable HTML5 validation for a form, add a `novalidate` attribute to the form element:

```js
import { Form } from 'react-redux-form';

// email input will not be validated
<Form model="user" novalidate>
  <Control.email />
</Form>
```

## Custom Error Messages

Similar to how the `validators` prop and `setValidity()` action works, you can use the `errors` prop and `setErrors()` action to indicate errors. Keep in mind, these should express the _inverse_ validity state of the model. This means that anything _truthy_ indicates an error.

**Disclaimer:** I do _not_ recommend hard-coding error messages in your validators. Messages are view concerns, and a simple boolean `true` or `false` is more than enough to indicate the validity of a model. When in doubt, use `validators` and/or `setValidity`.

Here's how the `setErrors()` action works:

```js
import { actions } from 'react-redux-form';
import validator from 'validator';

// wherever dispatch() is available:
dispatch(actions.setErrors('user.email', {
  invalid: (val) => !validator.isEmail(val) && 'Not a valid email',
  length: (val) => val < 8 && 'Email is too short'
}));
```

If a form reducer exists for `'user'`, this will set various properties of the `userForm.fields.email` state:

```js
// Assuming a long but invalid email:

userForm.email.valid;
// => false

userForm.email.errors;
// => { invalid: 'Not a valid email', length: false }

userForm.email.validity;
// => { invalid: false, length: true }
```

Error validators can be defined in the `errors` prop of the `<Form>`, `<Field>`, and `<Control>` components, as well:

```js
import { Control } from 'react-redux-form';
import { isEmail } from '../path/to/validators';

// in the component's render() method:
<Field
  model="user.email"
  errors={{
    required: (val) => !val || !val.length,
    isEmail: (val) => !isEmail(val),
  }}
  validateOn="blur"
>
  <input type="email" />
</Field>

<Control.text
  model="user.firstName"
  errors={{
    required: (val) => !val || !val.length,
  }}
  validateOn="change"
/>
```
