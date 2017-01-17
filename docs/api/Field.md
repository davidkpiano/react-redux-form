# Field Component

The `<Field>` component recursively checks its children to see if they can be made into a [`<Control>`](./Control.md). It then maps all of its props over to each created child `<Control>`.

Example:
```jsx
<Field model="user.favoriteColors">
  <select>
    <option value="red">red</option>
    <option value="green">green</option>
    <option value="blue">blue</option>
  </select>
</Field>
```

The `<Field>` component takes in the same props as `<Control>`. For more information, see the documentation on the [`<Control>` component](./Control.md).

# Field-specific Prop Types

## `dynamic={...}`
_(Boolean)_: specifies whether the children inside `<Field>` are dynamic; that is, whether they are subject to change based on outside values.

Default value: `true`. To optimize for performance, set `dynamic={false}` for any `<Field>` that does not have dynamic children.

Examples:
```jsx
// Does NOT have dynamic children
<Field model="user.favoriteColors" dynamic={false}>
  <select>
    <option value="red">red</option>
    <option value="green">green</option>
    <option value="blue">blue</option>
  </select>
</Field>

// DOES have dynamic children
<Field model="user.favoriteColors">
  <select>
    {showWhite && <option value="white">white</option>}
    <option value="red">red</option>
    <option value="green">green</option>
    <option value="blue">blue</option>
  </select>
</Field>

// Does NOT have dynamic children
<Field model="user.state" mapProps={...} dynamic={false}>
  <StatePicker />
</Field>

// DOES have dynamic children
const { showTerritories } = this.props;

<Field model="user.state" mapProps={...}>
  <StatePicker territories={showTerritories} />
</Field>
```

### `getRef={() => ...}`
_(Function)_: Calls the callback provided to the `getRef` prop with the node instance. Similar to `ref`.

```jsx
<Control.text
  model="user.name"
  getRef={(node) => this.attach(node)}
/>
```
