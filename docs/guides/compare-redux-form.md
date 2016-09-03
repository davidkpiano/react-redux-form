# Compare to [Redux-Form](http://redux-form.com/)

### Simple Form Example

Source: [http://redux-form.com/6.0.2/examples/simple/](http://redux-form.com/6.0.2/examples/simple/)

**Redux-Form:**
```js
import { Field } from 'redux-form';

<Field
  name="firstName"
  component="input"
  type="text"
  placeholder="First Name"
/>

<Field
  name="email"
  component="input"
  type="email"
  placeholder="Email"
/>

<Field name="notes" component="textarea" />

// ...

export default reduxForm({
  form: 'simple'  // a unique identifier for this form
})(SimpleForm)
```

**React-Redux-Form:**
```js
import { Control } from 'react-redux-form';

<Control.text
  model="simple.firstName"
  placeholder="First Name"
/>

<Control
  model="simple.email"
  type="email"
  placeholder="Email"
/>

<Control.textarea model="simple.notes" />
```

---

**Redux-Form:**
```js
import { Field } from 'redux-form';

<div>
  <label><Field name="sex" component="input" type="radio" value="male"/> Male</label>
  <label><Field name="sex" component="input" type="radio" value="female"/> Female</label>
</div>
```

**React-Redux-Form:**
```js
import { Field } from 'react-redux-form';

<Field model="simple.sex">
  <label><input type="radio" value="male"/> Male</label>
  <label><input type="radio" value="female"/> Female</label>
</Field>
```

---

**Redux-Form:**
```js
import { Field } from 'redux-form';

<Field name="favoriteColor" component="select">
  <option></option>
  <option value="ff0000">Red</option>
  <option value="00ff00">Green</option>
  <option value="0000ff">Blue</option>
</Field>
```

**React-Redux-Form:**
```js
import { Control } from 'react-redux-form';

<Control.select model="simple.favoriteColor">
  <option></option>
  <option value="ff0000">Red</option>
  <option value="00ff00">Green</option>
  <option value="0000ff">Blue</option>
</Control>
```

---

**Redux-Form:**
```js
import { Field } from 'redux-form';

<Field name="employed" id="employed" component="input" type="checkbox"/>
```

**React-Redux-Form:**
```js
import { Control } from 'react-redux-form';

<Control.checkbox model="simple.employed" id="employed" />
```

### Sync Validation

Source: [http://redux-form.com/6.0.2/examples/syncValidation/](http://redux-form.com/6.0.2/examples/syncValidation/)

**Redux-Form:**
```js
import { Field, reduxForm } from 'redux-form'

const validate = values => {
  const errors = {}
  if (!values.username) {
    errors.username = 'Required'
  }

  return errors
}

const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <input {...input} placeholder={label} type={type}/>
    {touched && error && <span>{error}</span>}
  </div>
)

const SyncValidationForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props
  return (
    <form onSubmit={handleSubmit}>
      <Field name="username" type="text" component={renderField} label="Username"/>
    </form>
  )
}

export default reduxForm({
  form: 'syncValidation',  // a unique identifier for this form
  validate                 // <--- validation function given to redux-form
})(SyncValidationForm)
```

**React-Redux-Form:**
```js
import { Form, Control, Errors } from 'react-redux-form';

const required = (val) => !!(val && val.length);

const SyncValidationForm = () => (
  <Form model="syncValidation" onSubmit={...}>
    <div>
      <label>Username</label>
      <Control.text
        placeholder="Username"
        validators={{ required }}
      />
      <Errors messages={{ required: 'Required' }} />
    </div>
  </Form>
);

// no need to connect!
export default SyncValidationForm;
```

### Initialize From State

Source: [http://redux-form.com/6.0.2/examples/initializeFromState/](http://redux-form.com/6.0.2/examples/initializeFromState/)

**Redux-Form:**
```js
// Too lengthy to display. See source above.
```

**React-Redux-Form:**
```js
import { connect } from 'react-redux';
import { actions } from 'react-redux-form';

// external data to load
const data = { /* ... */ };

const InitializeFromStateForm = (props) => {
  const { dispatch } = this.props;

  return (
    <form>
      <button type="button" onClick={() => dispatch(actions.load(data))}>
        Load Account
      </button>
      {/* ... */}
    </form>
  );
}

export default connect(null)(InitializeFromStateForm);
```

### Selecting Form Values

Source: [http://redux-form.com/6.0.2/examples/selectingFormValues/](http://redux-form.com/6.0.2/examples/selectingFormValues/)

**Redux-Form:**
```js
import { formValueSelector } from 'redux-form';
import { connect } from 'react-redux';

const UserForm = // ...

// ...
const selector = formValueSelector('user') // <-- same as form name
export default connect(
  state => {
    // can select values individually
    const hasEmailValue = selector(state, 'hasEmail')
    const favoriteColorValue = selector(state, 'favoriteColor')
    // or together as a group
    const { firstName, lastName } = selector(state, 'firstName', 'lastName')
    return {
      hasEmailValue,
      favoriteColorValue,
      fullName: `${firstName || ''} ${lastName || ''}`
    }
  }
)(UserForm)
```

**React-Redux-Form:**
```js
import { connect } from 'react-redux';

const UserForm = // ...

export default connect(({ user }) => ({
  hasEmail: user.hasEmail,
  favoriteColorValue: user.favoriteColorValue,
  fullName: `${user.firstName} ${user.lastName}`
}))(UserForm);
```

### Field Arrays

Source: [http://redux-form.com/6.0.2/examples/fieldArrays/](http://redux-form.com/6.0.2/examples/fieldArrays/)

**Redux-Form:**
```js
// Too lengthy to display. See source above.
```

**React-Redux-Form:**
```js
import { Control } from 'react-redux-form';

const initialMember = { firstName: '', lastName: '' };
const initialHobby = '';

const ClubForm = ({ club, dispatch }) => (
  <Form model="club">
    <Field model="club.name">
      <label>Club Name</label>
      <input type="text" required />
    </Field>

    <button
      type="button"
      onClick={() => dispatch(actions.push('club.members', initialMember))}
    />
      Add Member
    </button>

    {club.members.map((member, i) =>
      <div key={i}>
        <div>Member #{i+1}</div>
        <Field model={`club.members[${i}].firstName`}>
          <label>First Name</label>
          <input type="text" required />
        </Field>
        <Field model={`club.members[${i}].lastName`}>
          <label>Last Name</label>
          <input type="text" required />
        </Field>
        <button
          type="button"
          onClick={() => dispatch(actions.push(`club.members[${i}].hobbies`, initialHobby))}
        />
          Add Hobby
        </button>
        {member.hobbies.map((hobby, j) =>
          <Field model={`club.members[${i}].hobbies[${j}]`} key={j}>
            <label>Hobby #{j+1}</label>
            <input type="text" required />
          </Field>
        )}
      </div>
    )}
  </Form>
);

export default connect(({club}) => ({club}))(ClubForm);
```

