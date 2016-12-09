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
- `getDispatch={(dispatch) => ...}` _(Function)_: provides the Local Form store's `dispatch` to the callback once - when the component is initially mounted.

### Notes
- `redux` and `react-redux` _are_ still required as peer dependencies. This just allows you to not have to set up the boilerplate; e.g., the store and reducers.
- As with any React component, whenever the `<LocalForm>` is unmounted, the component's internal state is _gone_. This can be desirable (or undesirable) depending on your use case, so take this into consideration.
- Just like with `<Form>`, the props `onSubmit` and `onSubmitFailed` will work as expected.
