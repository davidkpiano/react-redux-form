# Custom Controls

Sometimes you want to use 3rd-party component libraries, such as [Material-UI](http://www.material-ui.com), [React Bootstrap](https://react-bootstrap.github.io), or better yet, creating your own custom components. It is straightforward to map RRF's actions to event handlers on any kind of custom component:

```jsx
// ...
import { actions } from 'react-redux-form';

// existing custom component
import CustomInput from '../path/to/custom-input-component';

// wrapper component
// (should be connected to redux store)
class MyCustomInput extends React.Component {
  render() {
    const { model, dispatch } = this.props;

    return (
      <CustomInput
        onCustomChange={e => dispatch(actions.change(model, e))}
      />
    );
  }
}

// ...

// Usage:
<MyCustomInput model="user.name" />
```

However, this can get a bit tedious, especially for complex controls. Thankfully, there's an easier way.

## Custom Controls with `<Control>`

With the `<Control>` component, a custom component can be passed into the `component={...}` prop, and standard control props and event handlers (such as `onChange`, `onBlur`, `onFocus`, `value`, etc.) will be mapped as expected:

```jsx
import { Control } from 'react-redux-form';

const MyTextInput = (props) => <input className="my-input" {...props} />;

// usage inside render():
<Control
  model="user.firstName"
  component={MyTextInput}
/>
```

The mapping standard props to custom controls can be specified by the type of `<Control>` component you are using:

```jsx
// custom radio button
<Control.radio
  model="user.gender"
  component={MyRadio}
  value="F"
/>

// custom checkbox
<Control.checkbox
  model="user.active"
  component={MyCheckbox}
/>

// ... etc.
```

By default, any props on `<Control>` that are _not_ part of the `Control.propTypes` will be passed down to the custom component. To prevent naming collisions or for more predictable prop-passing behavior, you can also specify the props in the `controlProps={...}` prop:

```jsx
<Control.checkbox
  model="user.active"
  component={MyCheckbox}
  label="Is user active?" // will be passed to MyCheckbox
/>

<Control.checkbox
  model="user.active"
  component={MyCheckbox}
  controlProps={\{
    label: 'Is user active?', // will also be passed to MyCheckbox
  }}
/>
```

## Model and View Values

One important thing to keep in mind is that there is no single `value` for a `<Control>`; rather, there are two types of values (that are equivalent, more often than not):

- `modelValue` - the exact value of the model in the store's state
- `viewValue` - the _displayed_ value of the model in the component's state

For example, if a text control has `updateOn="blur"`, its `viewValue` will represent what is being typed in the input, whereas the `modelValue` will represent the persisted value, once the input is blurred.

Because of this, you will want to map the `viewValue` to a custom control's `value` if you wish to externally update the value:

```jsx
const CustomInput = (props) => (
  <div className="custom-input">
    <input type="text" {...props} />
  </div>
);

const CustomInputControl = (props) => (
  <Control
    component={CustomInput}
    mapProps={\{
      value: (props) => props.viewValue,
    }}
    {...props}
  />
);
```

Alternatively, you can just _assign_ existing mapped props to your custom control:

```jsx
// the prop mapping of Control.text is used below:
const CustomInputControl = (props) => (
  <Control.text component={CustomInput} />
);
```

## Advanced Custom Controls

Some custom controls won't have prop keys that match up exactly with the standard event handler props, such as `onChangeText` in React Native's `<TextInput>` component corresponding to `onChange`. You can specify a prop mapping in the `mapProps={\{...}}` prop to specify the mapping:

```jsx
<Control
  model="..."
  component={DatePickerIOS}
  mapProps={\{
    date: (props) => props.modelValue,
    onDateChange: (props) => props.onChange,
  }}
/>
```

In `mapProps`, the **key** corresponds to the _custom_ control's prop key, and the **value** is a function that takes in the standard `props` applied to `<Control>` and returns the prop value that the custom prop should map to.

