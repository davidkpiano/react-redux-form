{% raw %}
# Frequently Asked Questions

This list will be updated frequently!

### How do I combine the reducer created by react-redux-form and `combineForms` with other reducers?

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

### How do I add conditional class names based on field state?

Use the `mapProps={{...}}` property on `<Control>` components to set any props on the control component based on field state, like this:

```jsx
<Control.text
  model="user.firstName"
  mapProps={{
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
- all props on the `controlProps={{...}}` prop (if any)
- `onKeyPress`
- `viewValue`

### How do I validate across fields?

Validation across fields becomes a higher form-level concern, which follows Redux's general tree-structure data flow pattern. If you want a reusable group of fields that are validated, you can **nest forms** as long as you set the form's `component="..."` prop to something other than `"form"` (because you can't nest forms in HTML). [See this issue response for more information.](https://github.com/davidkpiano/react-redux-form/issues/545#issuecomment-261944846) Here's an example:

```jsx
import { Form, Control } from 'react-redux-form';

const isOver18 = (day, month, year) => { ... };

const BirthDate = ({forModel}) => (
  <Form
    model={`${forModel}.birth`}
    component="div"
    validators={{
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

### How do I create a file upload form?
The second argument of the `<Form onSubmit={(values, event) => ...}>` prop provides the event emitted when the form was submitted. Adapted from the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects):

```jsx
class UploadForm extends Component {
  onSubmit = (values, event) => {
    const formData = new FormData(event.target);

    const request = new XMLHttpRequest();
    request.open('POST', '/upload', true);
    request.onload = function(oEvent) {
      if (request.status == 200) {
        console.log('Uploaded!');
      } else {
        console.log('Error uploading.');
      }
    };

    request.send(formData);
    event.preventDefault();
  }
  render() {
    return (
      <Form
        model="user"
        encType="multipart/form-data"
        onSubmit={this.onSubmit}
      >
        <Control.file model=".avatar" />
        <button>Upload!</button>
      </Form>
    );
  };
}
```

### How do I use HTML5 inputs of other types, such as email and password?

Simply pass the `type="email"` or `type="password"`, etc. type as a prop to `<Control>`:

```jsx
<Control type="email" />
<Control type="password" />

// also works
<Control.text type="email" />
<Control.text type="password" />
```

You will also get the native HTML5 constraint validation with these, as if you were using `<input type="email">`.

### How do I hide native HTML5 validation messages, and still prevent the form from submitting if invalid?

You might think that `noValidate` will solve this issue, but according to the [W3 spec for `noValidate`](https://dev.w3.org/html5/spec-preview/form-submission.html#attr-fs-novalidate), it does _not_ prevent a form from being submitted if the form is invalid due to HTML5 constraint validity. RRF follows the spec closely with regard to this behavior.

Instead, use the native `onInvalid` handler to prevent the native HTML5 validation message from displaying:

```jsx
<Control.text
  model="user.email"
  type="email"
  onInvalid={e => e.preventDefault()}
/>
```

### With partial models, how do I get the fully resolved model string?

You can always grab the fully resolved model string from the `<Control>`-specific props through `mapProps`:

```jsx
<Control.text

  model=".firstName"
  mapProps={{ model: ({ model }) => model }}
/>
// model will be the fully resolved model,
// e.g., "user.firstName"
```

This is especially useful for custom components, such as a checkbox wrapped in a label, that need the fully resolved model name.

### Other Questions and Answers
- https://github.com/davidkpiano/react-redux-form/issues/675#issuecomment-281164930
{% endraw %}
