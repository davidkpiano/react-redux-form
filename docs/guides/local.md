# Local Forms

As of version `1.2.0`, React Redux Form supports **local forms**. What does this mean? Here's an example:

```jsx
import React from 'react';
import { LocalForm, Control } from 'react-redux-form';

export default class MyApp extends React.Component {
  handleChange(values) { ... }
  handleUpdate(form) { ... }
  handleSubmit(values) { ... }
  render() {
    return (
      <LocalForm
        onUpdate={(form) => this.handleUpdate(form)}
        onChange={(values) => this.handleChange(values)}
        onSubmit={(values) => this.handleSubmit(values)}
      >
        <Control.text model=".username" />
        <Control.text model=".password" />
      </LocalForm>
    );
  }
}
```

And just like that, you have a fully functioning form with controls that do everything that RRF's normal forms and controls already do -- handling of model updates on change/blur, updating focus, pristine, touched, validity, submitted, pending, etc. and more -- **without needing to setup Redux\***.

The `<LocalForm>` component takes all the [props from the `<Form>` component](../api/Form.md), with four important props:

- `model="..."` _(String)_: the name of the model in the internal state. This is completely optional, as the model is _not_ related to any external Redux store (default: `"local"`)
- `onUpdate={(formValue) => ...}` _(Function)_: a handler that is called whenever the form value is updated
- `onChange={(modelValue) => ...}` _(Function)_: a handler that is called whenever the form's model value is changed
- `initialState={...}` _(Any)_: the initial state of the model (default: `{}`)
- `getDispatch={(dispatch) => ...}` _(Function)_: provides the Local Form store's `dispatch` to the callback once - when the component is initially mounted. (since 1.4.0)
  - This prop is exclusive to `<LocalForm>`.

### Notes
- `redux` and `react-redux` _are_ still required as peer dependencies. This just allows you to not have to set up the boilerplate; e.g., the store and reducers.
- As with any React component, whenever the `<LocalForm>` is unmounted, the component's internal state is _gone_. This can be desirable (or undesirable) depending on your use case, so take this into consideration.
- Just like with `<Form>`, the props `onSubmit` and `onSubmitFailed` will work as expected.

## Updating the model externally
With the `getDispatch` prop, you have access to the internal dispatcher, which accepts RRF-specific action creators and action thunk creators. To use it:

1. In `getDispatch`, store a reference to the dispatcher on your parent component.
2. Call that dispatcher anywhere that you have reference to it.

```jsx
import React from 'react';
import {
  LocalForm,
  Control,
  actions
} from 'react-redux-form';

class MyForm extends React.Component {
  attachDispatch(dispatch) {
    this.formDispatch = dispatch;
  }
  changeFooToBar() {
    this.formDispatch(actions.change('user.foo', 'bar'));
  }
  render() {
    return (
      <LocalForm
        model="user"
        getDispatch={(dispatch) => this.attachDispatch(dispatch)}
        initialState={{ foo: '' }}
      >
        <Control.text model=".foo" />

        <button onClick={() => this.changeFooToBar()}>
          Change user.foo to "bar"
        </button>
      </LocalForm>
    )
  }
}
```

## `getDispatch={(dispatch) => ...}`
_(Function)_ Provides the dispatcher for the `<Form>`'s store.

(since: 1.4.0)

```jsx
<Form
  model="user"
  getDispatch={(dispatch) => this.formDispatch = dispatch}
/>
```
