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
- `<Control.select>` for '<select></select>'

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

## Prop Types

### `model="..."` (required)
_(String | Function)_: the string representing the path to the model in the store's state, or a tracking function (see [documentation on tracking](../guides/tracking.md)).
