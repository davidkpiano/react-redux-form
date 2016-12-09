# Fieldset Component

The `<Fieldset>` component is a way to contain related fields. This might not sound like much, but it's incredibly useful when creating **reusable groups of controls**. Here's an example:

```jsx
// in render():
<Form model="user">
  <Fieldset model=".address">
    <Control.text model=".city" />
    <Control.text model=".state" />
    <Control.text model=".zip" />
  </Fieldset>
</Form>
```

If you extract the `<Fieldset model=".address">` out into its own component, you can then reuse it inside any other `<Form>`:

```jsx
const Address = () => (
  <Fieldset model=".address">
    <Control.text model=".city" />
    <Control.text model=".state" />
    <Control.text model=".zip" />
  </Fieldset>
);

// in render():
<Form model="user">
  <Address />
</Form>

<Form model="admin">
  <Address />
</Form>
```

# Prop Types

## `model="..."` (required)
_(String | Function)_: The string or [tracker](../guides/tracking) representing the model value of the entire form in the store.

You can also use [partial models](../guides/partial-models) for `<Control>`, `<Field>`, and `<Errors>` components inside of `<Fieldset>` - they will be resolved to the fieldset's model.

In addition, you can use a partial model for `<Fieldset>` itself - it will resolve to the parent `<Fieldset>` (yes, you can nest fieldsets) or `<Form>` models.

## `component={...}`
_(Any)_ The `component` that the `<Fieldset>` should be rendered to (default: `"div"`).

- For React Native, the `View` component is used to render the fieldset, if you `import { Fieldset } from 'react-redux-form/native'`.
