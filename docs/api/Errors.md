# Errors Component

## `<Errors />`

The `<Errors />` component provides a handy way of displaying form errors for a given `model`.

```jsx
// in render...
<Control.text
  type="email"
  model="user.email"
  validators={{ isEmail, isRequired }}
/>

<Errors
  model="user.email"
  messages={{
    isRequired: 'Please provide an email address.',
    isEmail: (val) => `${val} is not a valid email.`,
  }}
/>
```

By default, `<Errors />` will display a `<div>` with each error message wrapped in a `<span>` as children:

```html
<div>
  <span>foo@bar is not a valid email.</span>
  <!-- ... other error messages -->
</div>
```

There are many configurable props that will let you control:
- when error messages should be shown
- custom error messages based on the model value
- the wrapper component (default: `<div>`)
- the message component (default: `<span>`)

# Prop Types

## `model="..."` (required)

_(String | Function)_: the string representation of the model path to show the errors for that model. A tracking function may be provided, as well.

### Notes
- If you want to display form-wide errors, just use the form model! For example, if you have a form-wide `passwordsMatch` validator on the `user` form, you can display an error message like so:

```jsx
<Errors
  model="user"
  messages={{
    passwordsMatch: 'Passwords do not match.',
  }}
/>
```

## `messages={{...}}`

_(Object)_: a plain object mapping where:
- the keys are error keys (such as `"required"`)
- the values are either strings or functions.

If the message value is a function, it will be called with the model value.

### Example

```jsx
<Errors
  model="user.email"
  messages={{
    required: 'Please enter an email address.',
    length: 'The email address is too long.',
    invalid: (val) => `${val} is not a valid email address.',
  }}
/>
```

### Notes
- The `messages` prop is a great place to keep custom error messages that can vary based on the location in the UI, instead of hardcoding error messages in validation fuctions.
- If a message is _not_ provided for an error key, the message will default to the key value in the control's `.errors` property.
  - This means if you're using `actions.setErrors` or the `errors={{...}}` prop in `<Control>` or `<Field>` to set error messages, they will automatically be shown in `<Errors />`.

## `show={...}`

_(Any)_: The `show` prop determines when error messages should be shown, based on the model's field state (determined by the form reducer).

It can be a boolean, or a function, string, or object as a [Lodash iteratee](https://lodash.com/docs#iteratee). 


### Examples
- `show={true}` will always show the errors if they exist
- `show={(field) => field.touched && !field.focus}` will show errors if the model's field is touched and not focused
- `show={{touched: true, focus: false}}` is the same as above
- `show="touched"` will show errors if the model's field is touched

### Notes
- For the greatest amount of control, use `show` as a function.
- Use `show` as a boolean if you want to calculate when an error should be shown based on external factors, such as form state.

## `wrapper={...}`

_(String | Function | Element)_: The `wrapper` component, which is the component that wraps all errors, can be configured using this prop. Default: `"div"`.

### Examples
- `wrapper="ul"` will wrap all errors in an `<ul>`
- `wrapper={(props) => <div className="errors">{props.children}</div>}` will render the specified functional component, with all the props from `<Errors>` and some computed props:
  - `modelValue` - the current value of the `model`
  - `fieldValue` - the current field state of the `model`
- `wrapper={CustomErrors}` will wrap all errors in a `<CustomErrors>` component, which will receive the same props as above.

## `component={...}`

_(String | Function | Element)_: The `component`, which is the component for each error message, can be configured using this prop. Default: `"span"`.

### Examples 
- `component="li"` will wrap all errors in a `<li>`
- `component={(props) => <div className="error">{props.children}</div>}` will render the error message in the specified functional component, with these props:
  - `modelValue` - the current value of the `model`
  - `fieldValue` - the current field state of the `model`
  - `children` - the error message (text).
- `component={CustomError}` will wrap the error in a `<CustomError>` component, which will receive the same props as above.
