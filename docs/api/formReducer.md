# `formReducer(model, [initialState])`

Returns a form reducer that only responds to any actions on the model or model's child values.

The shape of the state returned from the `formReducer` is exactly the shape of the model it represents. Any non-primitive type (such as objects and arrays) will have a `$form` property with the form-specific state. All other types (such as numbers and strings) will be an object with their field-specific state.

```jsx
import { formReducer } from 'react-redux-form';

const initialState = {
  name: '',
  email: '',
  phones: ['5551111111', '5552222222'],
};

const userFormReducer = formReducer('user', initialState);

// the userFormReducer will now have this initial state:

// {
//   name: <field>,
//   email: <field>,
//   phones: {
//     0: <field>,
//     1: <field>,
//     $form: <field>,
//   },
// }

// where <field> has this shape:
// {
//   focus: false,
//   pending: false,
//   pristine: true,
//   submitted: false,
//   submitFailed: false,
//   retouched: false,
//   touched: false,
//   valid: true,
//   validating: false,
//   validated: false,
//   validity: {},
//   errors: {},
// };
```

If provided an `initialState`, the form reducer will initialize its fields based on the `initialState`.

### Arguments
- `model` _(String)_: the model whose form and field states the reducer will update.
- `initialState` _(any)_: the initial state of the model

### Example

```jsx
import { formReducer } from 'react-redux-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const userFormReducer = formReducer('user', initialUserState);


const formState = userFormReducer(undefined,
  actions.change('user.firstName', 'Bob'));

formState.firstName;
// => { touched: true, pristine: false, ... }

formState.lastName;
// => { touched: false, pristine: true, ... }

formState.$form;
// => { touched: true, pristine: false, ... }
```

### Notes
- It's a good idea to always provide the `initialState` for the form reducer. That way, you don't have to check if a field exists before trying to access it.
- **Forms can be infinitely nested.** You can have a form inside a form inside a form! Any sub-model inside a form that isn't a primitive value, such as an object or array, is considered a form. Its form state is accessed with `.$form`.
  - In the first example, the `user.phones` form state can be accessed via `userForm.phones.$form`, if the `formReducer` was mounted at `'userForm'`.


