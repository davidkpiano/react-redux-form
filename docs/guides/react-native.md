# React Native

From version 1.0, React Redux Form provides mapped `<Control>` components for all React Native iOS form controls. To use RRF in React Native, import from `react-redux-form/native`:

```jsx
import React, { View } from 'react-native';
import { Control } from 'react-redux-form/native';

// assuming your store is defined and
// your App is wrapped in a <Provider store={store}>
// from react-redux...

class App extends React.Component {
  render() {
    return (
      <View>
        <Control.TextInput model="user.name" />
      </View>
    );
  }
}

// no need to connect!
export default App;
```

<a name="native-controls"/>
## Native `<Control>`

The following React Native iOS form controls are available:

- `<Control.DatePickerIOS>`
- `<Control.MapView>`
- `<Control.Picker>`
- `<Control.SegmentedControlIOS>`
- `<Control.Slider>` (note: `SliderIOS` is deprecated.)
- `<Control.Switch>`
- `<Control.TextInput>`

See [below](#examples) for examples.

The `model` prop is required for these controls to work with React Redux Form.

For most controls, the original `onFocus` and `onBlur` props are mapped to:
- `onResponderGrant` for `onFocus`
- `onResponderRelease` for `onBlur`

The use of `updateOn="blur"` will work as expected for the controls, and is set by default on `<Control.MapView>` for performance reasons.

**Important:** The use of `<Field>` in RRF Native is no longer necessary, and is deprecated. `<Control>` provides a much cleaner, succinct solution without superfluous React warnings about prop types.

## Native `<Form>`

By default, the `<Form>` component is rendered as a `<View>`. It handles validity as expected, as well as partial models for child `<Control>` components, but it does not have an `onSubmit` mechanism.

```jsx
import { Form, Control } from 'react-redux-form/native';

// render...
<Form model="user" onSubmit={/* ... */}>
  <Control.TextInput model=".firstName" />
  <Control.TextInput model=".lastName" />
</Form>
```

To submit a React Native form programmatically:

1. Ensure that the `<Form model="foo">` component has an `onSubmit={(values) => ...}` callback.
2. Dispatch a submit action for the form's model (and no other arguments): `dispatch(actions.submit('foo'))`

```jsx
<Form model="user" onSubmit={(vals) => console.log(vals)}>
  <Control.TextInput model=".firstName" />
  <Control.TextInput model=".lastName" />

  <Button onPress={() => dispatch(actions.submit('user'))} />
</Form>
```

## Native `<Errors>`

By default, the `<Errors>` component will render:
- the wrapper component as a `<View>`
- and each error component as `<Text>`.

Of course, you can override this by specifying the component in the `wrapper={...}` and `component={...}` props of `<Errors />`.

<a name="examples"></a>
## Control.Picker with Picker.Items
Simply import `Picker` from `react-native`, and pass the `Picker.Item`s in as children.

```jsx
import React, { Picker } from 'react-native';
import { Form, Control } from 'react-redux-form/native';

class Form extends React.Component {
  render() {
    return (
      <Form model="user">
        <Control.Picker model=".gender">
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Control.Picker>
      </Form>
    );
  }
}

export default Form;
```

## Using Custom Form Components
To use a third-party form control component select the appropriate `Control` type (e.g., `Control.TextInput`) and override the `component` prop with your custom component. The custom component must resolve to one of the supported React Native form control types. See the supported types [here](#native-controls). 

```jsx
import React from 'react-native';
import { Form, Control } from 'react-redux-form/native';
import { Input } from 'native-base';

class Form extends React.Component {
  render() {
    return (
      <Form model="user">
        <Control.TextInput
          placeholder="Last Name"
          model=".last_name"
          component={Input}
        />
      </Form>
    );
  }
}

export default Form;
```

## Using Non-Supported Custom Form Components
If you are using a non-standard form control that does not implement one of the standard React Native iOS form controls ([listed here](#native-controls)), you will need to manually redefine `mapProps` for the control's event handlers.

Below is an example of a custom `Picker` component with `mapProps` redefined.

```jsx
import React from 'react-native';
import { Form, Control } from 'react-redux-form/native';
import { Picker } from 'custom-form-library';

class Form extends React.Component {
  render() {
    return (
      <Form model="user">
        <Control
          component={Picker}
          mapProps={{
            onResponderGrant: ({ onFocus }) => onFocus,
            onResponderRelease: ({ onBlur }) => onBlur,
            selectedValue: ({ modelValue }) => modelValue,
            onValueChange: ({ onChange }) => onChange,
            onChange: undefined,
          }}
          model=".relationship"
        >
          <Picker.Item label="Select relationship" value="select" />
          <Picker.Item label="Spouse" value="spouse" />
          <Picker.Item label="Child" value="child" />
          <Picker.Item label="Sibling" value="sibling" />
          <Picker.Item label="Parent" value="parent" />
          <Picker.Item label="Grandparent" value="grandparent" />
          <Picker.Item label="Other" value="other" />
        </Control>
      </Form>
    );
  }
}

export default Form;
```

Below is an example of a custom `Input` component. Note that an additional method is defined to handle coercing inputs to string format.

```jsx
import React from 'react-native';
import { Form, Control } from 'react-redux-form/native';
import { Input } from 'custom-form-library';

function getTextValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`;
  }

  return '';
}

class Form extends React.Component {
  render() {
    return (
      <Form model="user">
        <Control
          placeholder="First Name"
          model=".first_name"
          component={Input}
          validators={{
            required: val => val && val.length,
          }}
          mapProps={{
            onResponderGrant: ({ onFocus }) => onFocus,
            value: _props => ((! _props.defaultValue && 
              ! _props.hasOwnProperty('value'))
              ? getTextValue(_props.viewValue)
              : _props.value),
            onChangeText: ({ onChange }) => onChange,
            onChange: undefined,   
            onBlur: ({ onBlur, viewValue }) => () => onBlur(viewValue),
            onFocus: ({ onFocus }) => onFocus,
          }}
        />
      </Form>
    );
  }
}

export default Form;
```