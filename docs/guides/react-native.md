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

## Native `<Control>`

The following React Native iOS form controls are available:

- `<Control.DatePickerIOS>`
- `<Control.MapView>`
- `<Control.Picker>`
- `<Control.SegmentedControlIOS>`
- `<Control.Slider>` (note: `SliderIOS` is deprecated.)
- `<Control.Switch>`
- `<Control.TextInput>`

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
