{% raw %}
# Control Component

**Prop Types**
- [`model` (required)](#prop-model)
- [`mapProps`](#prop-mapProps)
- [`updateOn`](#prop-updateOn)
- [`debounce`](#prop-debounce)
- [`validators`](#prop-validators)
- [`validateOn`](#prop-validateOn)
- [`asyncValidators`](#prop-asyncValidators)
- [`asyncValidateOn`](#prop-asyncValidateOn)
- [`errors`](#prop-errors)
- [`parser`](#prop-parser)
- [`changeAction`](#prop-changeAction)
- [`controlProps`](#prop-controlProps)
- [`component`](#prop-component)
- [`ignore`](#prop-ignore)
- [`disabled`](#prop-disabled)
- [`getRef`](#prop-getRef)
- [`persist`](#prop-persist)
- [`getValue`](#prop-getValue)
- [`isToggle`](#prop-isToggle)

## `<Control>`

The `<Control>` component represents a form control, such as an `<input />`, `<select>`, `<textarea />`, etc.

It is a connected component, and will use the `model` prop to connect itself to the Redux store and dispatch the appropriate actions for each event handler.

The following pre-defined `<Control>`s are available:

- `<Control>` or `<Control.input>` for standard `<input />` controls
- `<Control.custom>` for controls without any default prop mapping
- `<Control.text>` for `<input type="text" />`
- `<Control.textarea>` for `<textarea></textarea>`
- `<Control.radio>` for `<input type="radio" />`
- `<Control.checkbox>` for `<input type="checkbox" />`
- `<Control.file>` for `<input type="file" />`
- `<Control.select>` for `<select></select>`
- `<Control.button>` for `<button></button>`
- `<Control.reset>` for `<button type="reset"></button>`

You can add other input types to the basic `<Control>` component as an attribute:
`<Control type="password">`

For making custom controls that work with React Redux Form, see the [custom controls documentation](../guides/custom-controls.md).

**Note:** Any standard valid control props, such as `name, disabled, onChange, onBlur, onFocus, onKeyPress`, etc. will be passed directly to the control, so feel free to use them.

```jsx
import React from 'react';
import { Control } from 'react-redux-form';

class App extends React.Component {
  render() {
    return (
      <form>
        <label htmlFor="user.name">Name:</label>
        <Control.text model="user.name" id="user.name" />

        <label htmlFor="user.faveColor">Favorite color:</label>
        <Control.select model="user.faveColor" id="user.faveColor">
          <option value="red">red</option>
          <option value="green">green</option>
          <option value="blue">blue</option>
        </Control.select>
      </form>
    );
  }
}

export default App; // no need to connect
```

# Prop Types

## `model="..."` (required) {#prop-model}

_(String | Function)_: The string representing the model value in the store.
```jsx
// in store.js
export default createStore(combineForms({
  'user': { name: '' },
}));


// in component's render() method
<Control.text model="user.name" />
```

It can also be a function that returns a string model. See [the documentation on tracking](../guides/tracking.md) for more information.

## `mapProps={{...}}` {#prop-mapProps}
_(Object | Function)_: A custom mapping from props provided by `Control` to props received by the component. Can be:

- An object, where each value is a function from original props to corresponding value in result props.
- A function from original props to result props.

Examples:
```jsx
<Control
  mapProps={{
    customChange: (props) => props.change,
  }}
  model="..."
/>
<Control
  mapProps={({change}) => { return {customChange: change}; }}
  model="..."
/>
```

See [the documentation on custom controls](../guides/custom-controls.md) for more information.

## `updateOn="..."` {#prop-updateOn}
_(String | Array)_: A string/array of strings specifying when the component should dispatch a `change(...)` action, with one of these values:

- `"change"` - will dispatch in `onChange`
- `"blur"` - will dispatch in `onBlur`
- `"focus"` - will dispatch in `onFocus`

So, `<Control model="foo.bar" updateOn="blur">` will only dispatch the `change(...)` action on blur.

You can also specify `updateOn={['change', 'blur']}` as an array of one or more of the above values.

### Notes
- Use the `changeAction` prop if you want to dispatch custom actions along with the `actions.change(...)` action.

## `validators={{...}}` {#prop-validators}
_(Object)_: A map where the keys are validation keys, and the values are the corresponding functions that determine the validity of each key, given the model's value.

For example, this control validates that a username exists and is longer than 4 characters:

```jsx
<Control.text
  model="user.username"
  validators={{
    required: (val) => val.length,
    length: (val) => val.length > 4
  }}
/>
```

### Notes
- If using ES2015 and you have validator functions, you can do this destructuring shortcut:

```jsx
const required = (val) => val && val.length;
const length = (val) => val.length > 8;

<Control.text
  model="user.username"
  validators={{ required, length }}
/>
```

## `debounce={...}` {#prop-debounce}
_(Number)_: The time in milliseconds, by which the change action will be debounced. 

## `validateOn="..."` {#prop-validateOn}
_(String | Array)_: A string/array of strings specifying when validation should occur. By default, validation happens with whatever `updateOn` is set to. The `validateOn` property can have these values:
- `"change"` - validate on the `onChange` event handler
- `"blur"` - validate on the `onBlur` event handler
- `"focus"` - validate on the `onFocus` event handler

### Notes
- Validation will always occur **on load**; i.e., when the component is mounted. This is to ensure an accurate validation state for a new form.
- To avoid displaying error messages on load (as controls might be invalid), use the `.pristine` property of the control when conditionally showing error messages, or use the `<Errors>` component.

## `asyncValidators={{...}}` {#prop-asyncValidators}
_(Object)_: A map where the keys are validation keys, and the values are the corresponding functions that (asynchronously) determine the validity of each key, given the model's value.

Each async validator function is called with 2 arguments:
- `value` - the model value
- `done(validity)` - a callback function that should be called with the calculated validity

For example, this control validates that a username is available via a promise:

```jsx
// function that returns a promise
import isAvailable from '../path/to/is-available';

<Control.text model="user.username"
  asyncValidators={{
    isAvailable: (value, done) => {
      isAvailable(value)
        .then((result) => done(result));
    }
  }} />
```

### Notes
- Async validators will run on `blur`, unless you specify otherwise in the `asyncValidateOn="..."` prop.

## `asyncValidateOn="..."` {#prop-asyncValidateOn}
_(String | Array)_: A string/array of strings specifying when async validation should occur. By default, validation happens on `"blur"`. The `asyncValidateOn` property can have these values:
- `"change"` - validate on the `onChange` event handler
- `"blur"` (default) - validate on the `onBlur` event handler
- `"focus"` - validate on the `onFocus` event handler

## `errors={{...}}` {#prop-errors}
_(Object)_: A map where the keys are error keys, and the values are the corresponding error validator functions that determine the invalidity of each key, given the model's value.

An **error validator** is a function that returns `true` or a truthy value (such as a string) if invalid, and `false` if valid.

For example, this control validates that a username exists and is longer than 4 characters:

```jsx
<Control.text
  model="user.username"
  errors={{
    isEmpty: (val) => !val.length,
    tooLong: (val) => val.length > 16,
  }}
/>
```

## `parser={() => ...}` {#prop-parser}
_(Function)_: A function that _parses_ the view value of the control before it is changed. It takes in two arguments:
- `value` - the view value that represents the _next_ model value
- `previous` (optional) - the current model value _before_ it is changed

**Example**
```jsx
function toAge(value) {
  return parseInt(value) || 0;
}

<Control.text
  type="number"
  model="user.age"
  parser={ toAge }
>
```

## `changeAction={() => ...}` {#prop-changeAction}
An action creator (function) that specifies which action the `<Control>` component should use when dispatching a change to the model. For example, this action is similar to:

- `actions.change(model, value)` for text input controls
- `actions.toggle(model, value)` for checkboxes (single-value models)
- `actions.xor(model, value)` for checkboxes (multi-value models)

The action creator takes in two arguments:

- `model` - the model that is being changed
- `value` - the value that the model is being changed to

### Example

To create a custom `<Control>` that submits the form on blur:

```jsx
import { Control, actions } from 'react-redux-form';

const submitPromise = ... // a promise

function changeAndSubmit(model, value) {
  return (dispatch) => {
    dispatch(actions.change(model, value));
    dispatch(actions.submit('user', submitPromise));
  };
}

// Then, in your <Control> components...
<Control.text
  type="email"
  model="user.name"
  changeAction= { changeAndSubmit }
  updateOn="blur"
/>
```

### Notes
- Use `changeAction` to do any other custom actions whenever your value is to change.
- Since `changeAction` expects an action creator and `redux-thunk` is used, you can asynchronously dispatch actions (like the example above).

## `controlProps={{...}}` {#prop-controlProps}
_(Object)_: A mapping of control-specific props that will be applied directly to the rendered control. In some cases, this can be a safer way of applying props, especially if there are naming conflicts between `<Control>`-specific props (such as `"model"`) and props that need to go on the rendered control (e.g., `<input {...props} />`).

The normal behavior is that any extraneous props on `<Control>` that are not part of `Control.propTypes` (which are documented here) will be given to the rendered input.

Example:
```jsx
// Suppose your <CustomInput> takes in an "errors" prop:

<Control.text
  model="..."
  component={CustomInput}
  controlProps={{errors: 'errors for CustomInput'}}
/>
```

## `component={...}` {#prop-component}
_(Function | String | Node)_: A custom component can be passed into the `component={...}` prop, and standard control props and event handlers (such as `onChange`, `onBlur`, `onFocus`, `value`, etc.) will be mapped as expected:

```jsx
import { Control } from 'react-redux-form';

const MyTextInput = (props) => <input className="my-input" {...props} />;

// usage inside render():
<Control
  model="user.firstName"
  component={MyTextInput}
/>
```

## `ignore={[...]}` {#prop-ignore}
_(String | Array)_: The event(s) that you want the `<Control>` to ignore. This can be good for performance and/or for de-cluttering the console log.

For instance, if you don't care whether a `<Control>` is focused or blurred:

```jsx
// will ignore onFocus and onBlur
<Control
  model="..."
  ignore={['focus', 'blur']}
/>
```

## `disabled={...}` {#prop-disabled}
_(Any)_: The `disabled` prop works just like you'd expect for controls that support the HTML5 `disabled` attribute.

However, in `<Control>`, it can be a boolean, or a function, string, or object as a [Lodash iteratee](https://lodash.com/docs#iteratee).

```jsx
// Disable the submit button when the form is invalid
<Control.button
  model="user"
  disabled={{ valid: false }}
>
  Submit!
</Control.button>
```

For example:
- `disabled={true}` or `disabled={false}` will disable or enable the control respectively, as will any other primitive value, such as `undefined`, `null`, or a number
- `disabled="touched"` will disable if the field is `touched` (works with any property on the field)
- `disabled={{ valid: false, touched: true }}` will disable if the field is both `touched` and not `valid`
- `disabled={(fieldValue) => !fieldValue.valid}` will call the function provided with the `fieldValue` to determine its `disabled` state.

(since: version 1.3.0)

## `getRef={() => ...}` {#prop-getRef}
_(Function)_: Calls the callback provided to the `getRef` prop with the node instance. Similar to `ref`.

```jsx
<Control.text
  model="user.name"
  getRef={(node) => this.attach(node)}
/>
```

## `persist={false}` {#prop-persist}
_(Boolean)_: Signifies that the field state (validation, etc.) should not persist when the component is unmounted. Default: `false`

```jsx
// If user.name is less than 8 characters and persist == true, its validity will be:
// { length: false }
// even when the control is unmounted.
<Control.text
  model="user.name"
  validators={{ length: (value) => value.length > 8 }}
  persist
/>
```

## `getValue={(event, props) => ...}` {#prop-getValue}
_(Function)_: Determines the value given the `event` (from `onChange`) and optionally the control component's `props`.

By default, the `getValue` function returns the value by checking if the `event` is a DOM event.
- If so, it returns `event.target.value`
- If not, it returns the `event`.

For `<Control.checkbox />`, the default `getValue` function is:
- the original `value={...}` passed into the control, for multi-checkboxes (e.g., `model="user.hobbies[]"`)
- the inverse boolean value of the `modelValue`.

```jsx
<Control.text
  model="user.name"
  getValue={(event) => event.target.value}
/>
```

## `isToggle={false}` {#prop-isToggle}
_(Boolean)_: Signifies that the control is a toggle (e.g., a checkbox or a radio). If `true`, then some optimizations are made.

Default: `true` for `<Control.radio>` and `<Control.checkbox>`, `false` for all other controls.
{% endraw %}
