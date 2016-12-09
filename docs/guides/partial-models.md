# Partial Models

React Redux Form does not rely on context to fully function, but the parent `model` from `<Form>` components is made available to child components, such as `<Field>` and `<Control>`, via context. This can save you some typing:

```jsx
// before...
<Form model="user">
  <Control.text model="user.firstName" />
  <Control.text model="user.lastName" />
</Form>

// after, using partial models
<Form model="user">
  <Control.text model=".firstName" />
  <Control.text model=".lastName" />
</Form>
```

Resolving partial models also works with:
- arrays, such as `"[1].foo"`
- a tracker as the parent model, e.g.:
  - parent: `track('user.friends[]', {id: 123})`
  - child: `".email"`
- a tracker as the child model, e.g.:
  - parent: `"user"`
  - child: `track('.friends[].email', {id: 123})`
- a tracker as both the parent and child models, e.g.:
  - parent: `track('user.friends[]', {id: 123})`
  - child: `track('.goats[].name', {id: 202})`

## Reusable Fields and Controls

With partial models, you can easily make reusable fields and controls:

```jsx
const AddressFields = () => (
  <div>
    <Control.text model=".address1" />
    <Control.text model=".address2" />
    <Control.text model=".city" />
    <Control.select model=".state">
      // ...
    </Control.select>
    <Control.text model=".zip" maxLength={5} />
  </div>
);

// in other forms
<Form model="user">
  <AddressFields />
</Form>

<Form model={track('user.friends[]', {id: 123})}>
  <AddressFields />
</Form>
```

## Deeply Resolved Models

With [`<Fieldset>`](../api/Fieldset), you can deeply resolve models:

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

This makes it even easier to create reusable groups of controls.
