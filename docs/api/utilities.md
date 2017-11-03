# Utilities

## `isValid(form, [options])`

Returns `true` if the form state `form` and all of its subfields are `valid`; `false` otherwise.

### Arguments
- `form` _(Object)_: the form state retrieved from the store (contains `$form` prop)
- `options` _(Object)_:
  - `async` _(Boolean)_: whether to include async validity in determining whether a form is valid or not. If `false`, async validity will be ignored.

### Example
```jsx
import { isValid } from 'react-redux-form';

// inside a connected component

// `forms` is retrieved directly from the store, e.g.:
// connect(state => ({
//  forms: state.forms
// }))(YourComponent)
const { forms } = this.props;

// true if form and all subfields are valid
const valid = isValid(forms);

// true if form and all subfields are valid, ignoring async validity
const syncValid = isValid(forms, { async: false })
```
