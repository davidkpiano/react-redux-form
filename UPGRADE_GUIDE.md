# React Redux Form Upgrade Guide

## v0.14.3 to v1.0.0 Beta

### Goals

- **Simplicity**
- **Performance**
- **Flexibility**
- **Features**

### Breaking Changes

- For simplicity and performance, the form state structure has changed:

```diff
// Assume this model shape for userForm:
// {
//   user: {
//     name: 'John Doe',
//     address: {
//       city: 'Orlando',
//       state: 'FL',
//     },
//     phones: [
//       '5551234',
//       '5550000',
//     ],
//   },
// };

// Form state
- user;
+ user.$form;

// Field state
- user.fields.name;
+ user.name;

// Deep Field State
- user.fields['phones.0']
+ user.phones[0]

- user.fields['address.city']
+ user.address.city

// Deep Form State
- user.fields.address
+ user.address.$form

- user.fields.phones
+ user.phones.$form
```

To summarize:
- If accessing an object or an array (i.e., a _subForm_), the form state is in `model.path.$form`.
- If accessing a plain field (e.g., a string, boolean, number, etc.), the field state is in `model.path`.
    
- For performance reasons, any form/field data that can be derived has been removed from the form/field state. For more information: http://redux.js.org/docs/recipes/ComputingDerivedData.html
- You can use the `form()` selector to get this derived data:

```diff
+ import { form } from 'react-redux-form';

class MyUserForm extends Component {
  // ...
  // in connected render():
  const { userForm } = this.props;
  
  userForm.valid;
  userForm.touched;
  userForm.pristine;
  userForm.retouched;
  // etc.
}

// ...
export default connect((state) => ({
- userForm: state.userForm,
+ userForm: form(state.userForm),
})(<MyUserForm />);
```

- Alternatively, you can use individual utility functions:

```diff
+ import { isValid, isTouched, isPristine } from 'react-redux-form/lib/form';

- userForm.valid;
+ isValid(userForm);

- userForm.touched;
+ isTouched(userForm);

- userForm.pristine;
+ isPristine(userForm);
```

**Batch Action Enhancements**
- Batching a single action now dispatches that action, instead of unnecessarily wrapping it in a `batch()` action.

**Field Action Enhancements**
- 🆕 `actions.setValidating(model[, validating])` will change the field's `.validating` state to `validating` (or `true` if not provided).
  - This is useful for distinguishing between `.pending` (a form/subForm is being submitted) and `.validating` (a field is asynchronously being validated).
- 🆕 Of course, there is a new `actionTypes.SET_VALIDATING` action type.
- `actions.setSubmitFailed(model[, submitFailed])` now takes in a `submitFailed` parameter (defaults to `true`).
