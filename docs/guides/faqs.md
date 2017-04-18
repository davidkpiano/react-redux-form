# Frequently Asked Questions

This list will be updated frequently!

### How do you combine the reducer created by react-redux-form and `combineForms` with other reducers?

Use it along side the other reducers and call [combineForms](https://davidkpiano.github.io/react-redux-form/docs/api/combineForms.html) with the second argument set to the reducer key of your choice, `deep` in the following example):

```javascript
const store = createStore(combineReducers({
  nav: navReducer, // <== here
  foo: fooReducer,
  bar: barReducer,
  deep: combineForms({
    user: initialUserState,
    goat: initialGoatState,
  }, 'deep'),
}));
```

### How do you add conditional class names based on field state?

Use the `mapProps={\{...}}` property on `<Control>` components to set any props on the control component based on field state, like this:

```jsx
<Control.text
  model="user.firstName"
  mapProps={\{
    className: ({fieldValue}) => fieldValue.focus
      ? 'focused'
      : ''
  }}
/>
```

The props that are provided to each function value in your `mapProps` mapping are:
- `modelValue`
- `fieldValue`
- `onFocus`
- `onBlur`
- `onChange`

as well as other additional props:
- all props on the `<Control>`
- all props on the `controlProps={\{...}}` prop (if any)
- `onKeyPress`
- `viewValue`

### How do you validate across fields?

Validation across fields becomes a higher form-level concern, which follows Redux's general tree-structure data flow pattern. If you want a reusable group of fields that are validated, you can **nest forms** as long as you set the form's `component="..."` prop to something other than `"form"` (because you can't nest forms in HTML). [See this issue response for more information.](https://github.com/davidkpiano/react-redux-form/issues/545#issuecomment-261944846) Here's an example:

```jsx
import { Form, Control } from 'react-redux-form';

const isOver18 = (day, month, year) => { ... };

const BirthDate = ({forModel}) => (
  <Form
    model={`${forModel}.birth`}
    component="div"
    validators={\{
      '': ({day, month, year}) => isOver18(day, month, year),
    }}
  >
    <Control model=".day" placeholder="Day" />
    <Control model=".month" placeholder="Month" />
    <Control model=".year" placeholder="Year" />
  </Form>
);

export default BirthDate;
```

Also, see [./validation.md](the validation guide) for more information.

### How do I get the component instance? `ref={...}` doesn't work.

Use `getRef={(node) => ...}` in place of `ref`. This is due to the fact that React treats the `ref` prop as a "magic" prop that doesn't get propagated down through wrapped components.

You can use `getRef` on `<Field>`, `<Control>`, `<Form>`, or `<LocalForm>` components.

(since: version 1.3.2)

```jsx
<Control.text
  model="user.name"
  getRef={(node) => this.attach(node)}
/>
```

### How do I set up single/multiple-value checkboxes?

For a single checkbox that represents a model's boolean `true` or `false` value, you can use `<Control.checkbox>` as expected:

```jsx
// if checked, user.hasPets = true, otherwise false.
<Control.checkbox model="user.hasPets" />
```

For multiple checkboxes that represent multiple possible values for a model, append `[]` to the control to indicate that it is a multi-value model:

```jsx
// if dog and cat are checked, model will be:
// user.pets = ['dog', 'cat']
<Control.checkbox model="user.pets[]" value="dog" />
<Control.checkbox model="user.pets[]" value="cat" />
<Control.checkbox model="user.pets[]" value="goat" />
```

For single or multiple checkboxes that represent boolean keyed values in a model that's an object, use standard dot notation:

```jsx
// if dog and cat are checked, model will be
// user.pets = { dog: true, cat: true, goat: false }
<Control.checkbox model="user.pets.dog" />
<Control.checkbox model="user.pets.cat" />
<Control.checkbox model="user.pets.goat" />
```

### Other Questions and Answers
- https://github.com/davidkpiano/react-redux-form/issues/675#issuecomment-281164930
