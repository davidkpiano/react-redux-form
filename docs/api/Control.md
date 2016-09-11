# Control Component

## `<Control>`

The `<Control>` component represents a form control, such as an `<input />`, `<select>`, `<textarea />`, etc.

It is a connected component, and will use the `model` prop to connect itself to the Redux store and dispatch the appropriate actions for each event handler.

The following pre-defined `<Control>`s are available:

- `<Control>` or `<Control.input>` for standard `<input />` controls
- `<Control.text>` for `<input type="text" />`
- `<Control.radio>` for `<input type="radio" />`
- `<Control.checkbox>` for `<input type="checkbox" />`
- `<Control.file>` for `<input type="file" />`
- `<Control.select>` for `<select></select>`

For making custom controls that work with React Redux Form, see the [custom controls documentation](../guides/custom-controls.md).

```js
import React from 'react';
import { Control } from 'react-redux-form';

class App extends React.Component {
  render() {
    return (
      <form>
        <label>Name:</label>
        <Control.text model="user.name" />

        <label>Favorite color:</label>
        <Control.select model="user.faveColor">
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

<h2 id="prop-model"></h2>
## `model="..."` (required)

_(String | Function)_: The string representing the model value in the store.
```js
// in store.js
export default createStore(combineForms({
  'user': { name: '' },
}));


// in component's render() method
<Field model="user.name">
  <input type="text" />
</Field>
```

It can also be a function that returns a string model. See [the documentation on tracking](../guides/tracking.md) for more information.

<h2 id="prop-updateOn"></h2>
## `updateOn="..."`
_(String | Array)_: A string/array of strings specifying when the component should dispatch a `change(...)` action, with one of these values:

- `"change"` - will dispatch in `onChange`
- `"blur"` - will dispatch in `onBlur`
- `"focus"` - will dispatch in `onFocus`

So, `<Control model="foo.bar" updateOn="blur">` will only dispatch the `change(...)` action on blur.

You can also specify `updateOn={['change', 'blur']}` as an array of one or more of the above values.

### Notes
- Use the `changeAction` prop if you want to dispatch custom actions along with the `actions.change(...)` action.

<h2 id="prop-validators"></h2>
## `validators={{...}}`
_(Object)_: A map where the keys are validation keys, and the values are the corresponding functions that determine the validity of each key, given the model's value.

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

### Notes
- If using ES2015 and you have validator functions, you can do this destructuring shortcut:

```js
const required = (val) => val && val.length;
const length = (val) => val.length > 8;

<Control.text
  model="user.username"
  validators={{ required, length }}
/>
```

<h2 id="prop-validateOn"></h2>
### `validateOn="..."`
_(String | Array)_: A string/array of strings specifying when validation should occur. By default, validation happens with whatever `updateOn` is set to. The `validateOn` property can have these values:
- `"change"` - validate on the `onChange` event handler
- `"blur"` - validate on the `onBlur` event handler
- `"focus"` - validate on the `onFocus` event handler

### Notes
- Validation will always occur **on load**; i.e., when the component is mounted. This is to ensure an accurate validation state for a new form.
- To avoid displaying error messages on load (as fields might be invalid), use the `.pristine` property of the field when conditionally showing error messages, or use the `<Errors>` component.

<h2 id="prop-asyncValidators"></h2>
### `asyncValidators={{...}}`
_(Object)_: A map where the keys are validation keys, and the values are the corresponding functions that (asynchronously) determine the validity of each key, given the model's value.

Each async validator function is called with 2 arguments:
- `value` - the model value
- `done(validity)` - a callback function that should be called with the calculated validity

For example, this control validates that a username is available via a promise:

```js
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

<h2 id="prop-asyncValidateOn"></h2>
### `asyncValidateOn="..."`
_(String | Array)_: A string/array of strings specifying when async validation should occur. By default, validation happens on `"blur"`. The `asyncValidateOn` property can have these values:
- `"change"` - validate on the `onChange` event handler
- `"blur"` (default) - validate on the `onBlur` event handler
- `"focus"` - validate on the `onFocus` event handler

<h2 id="prop-parser"></h2>
### `parser` prop
_(Function)_: A function that _parses_ the view value of the field before it is changed. It takes in two arguments:
- `value` - the view value that represents the _next_ model value
- `previous` (optional) - the current model value _before_ it is changed

**Example**
```js
function toAge(value) {
  return parseInt(value) || 0;
}

<Field model="user.age"
  parser={ toAge }>
  <input type="number" />
</Field>
```


