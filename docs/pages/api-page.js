import React from 'react';
import Code from '../components/code-component';
import Markdown, { js } from '../components/markdown-component';

const itemMap = {
'action creators': `
## Action Creators

### \`actions.change(model, value)\`
Returns an action object that, when handled by a \`modelReducer\`, changes the value of the respective model to the new \`value\`.

When the change action is handled by a \`formReducer\`, the field model's \`dirty\` state is set to \`true\` and its corresponding \`pristine\` state is set to \`false\`.

**Arguments:**
- \`model\`: (String) the model whose value will be changed
- \`value\`: (*) the value the model will be changed to

${js`
import {
  createModelReducer,
  actions
} from 'redux-simple-form';

const userReducer = createModelReducer('user');

let initialState = { name: '', age: 0 };

userReducer(initialState, actions.change('user.name', 'Billy'));
// => { name: 'Billy', age: 0 }
`}

------

### \`actions.focus(model)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`focus\` state of the field model in the form to \`true\`, as well as the corresponding \`blur\` state to \`false\`.

The "focus" state indicates that the field model is the currently focused field in the form.

**Arguments:**
- \`model\`: (String) the model indicated as focused

${js`
import {
  actions
} from 'redux-simple-form';

// assuming this is a connected component
const Newsletter = (props) => {
  let { newsletterForm, dispatch } = props;

  return <form>
    <input type="email"
      onFocus={() => dispatch(actions.focus('newsletter.email'))} />
    { newsletterForm.field('email').focus &&
      <div>We're focused on emailing you stuff!</div>
    }
  </form>;
}
`}

------

### \`actions.blur(model)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`blur\` state of the field model in the form to \`true\`, as well as the corresponding \`focus\` state to \`false\`. It also indicates that the field model has been \`touched\`, and will set that state to \`true\` and the \`untouched\` state to \`false\`.

The "blur" state indicates that the field model is not focused.

**Arguments:**
- \`model\`: (String) the model indicated as blurred

------

### \`actions.setPristine(model)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`pristine\` state of the field model in the form to \`true\`, as well as the corresponding \`dirty\` state to \`false\`.

The "pristine" state indicates that the user has not interacted with this field model yet.

**Arguments:**
- \`model\`: (String) the model indicated as pristine

------

### \`actions.setDirty(model)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`dirty\` state of the field model in the form to \`true\`, as well as the corresponding \`pristine\` state to \`false\`.

The "dirty" state indicates that the model value has been changed.

**Arguments:**
- \`model\`: (String) the model indicated as dirty

------

### \`actions.setPending(model)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`pending\` state of the field model in the form to \`true\`. It simultaneously sets the \`submitted\` state to \`false\`.

This action is useful when asynchronously validating or submitting a model, and is representative of the state between the initial and final state of a field model.

**Arguments:**
- \`model\`: (String) the model indicated as pending

------

### \`actions.setValidity(model, validity)\`
Returns an action object that, when handled by a \`formReducer\`, changes the \`valid\` state of the field model in the form to \`true\` or \`false\`, based on the \`validity\` (see below). It simultaneously sets the \`errors\` on the field model to the inverse of the \`validity\`.

The \`validity\` can be an object or a boolean value, indicating which aspects of the field model are valid. A validity object is a key/value pair where the values are functions that return a truthy (if valid) or falsey (if invalid) value.

**Example:**
${js`
let val = 'testing123';

dispatch(actions.setValidity('user.password', {
  required: (val) => val && val.length,
  correct: (val) => val === 'hunter2'
}));

// Field model errors will now look like:
// errors: {
//   required: false,
//   correct: true
// }
`}

**Arguments:**
- \`model\`: (String) the model indicated as pending
- \`validity\`: (Boolean | Object) the validity of the model
`,

'reducers': `
## Reducers

### \`createModelReducer(model, initialState = {})\`
Returns a model reducer that only responds to \`change()\` and \`reset()\` actions on the model or model's child values.

**Note:** if using the \`<Field />\` component or any action thunk creators, the \`model\` _must be the same as_ the property given to the reducer in \`combineReducers({...})\`.

**Arguments:**
- \`model\`: (String) the model that the reducer will update
- \`initialState\`: (Any) the initial state of the model

**Example:**
${js`
import { createModelReducer } from 'redux-simple-form';

const initialUserState = {
  firstName: '',
  lastName: ''
};

const userReducer = createModelReducer('user', initialUserState);

export default userReducer;
`}

### \`createFormReducer(model)\`
Returns a form reducer that only responds to any actions on the model or model's child values. The reducer's state has the shape of \`initialFormState\`, with a \`fields\` property where each field has the shape of \`initialFieldState\`.

**Arguments:**
- \`model\`: (String) the model whose form state (and child field states) the reducer will update.

**Example:**
${js`
import { createFormReducer } from 'redux-simple-form';

const userFormReducer = createFormReducer('user');

export default userFormReducer;
`}
`
}

export default function ApiPage(props) {
  let { params: { item } } = props;

  return <Markdown content={itemMap[item]} />
}
