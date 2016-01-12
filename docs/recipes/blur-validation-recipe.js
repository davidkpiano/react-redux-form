import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import validator from 'validator';

import Recipe from '../components/recipe-component';

const code = `
class UserForm extends React.Component {
  render() {
    let { user, userForm } = this.props;

    return (
      <form>
        <Field model="user.password">
          <label>Password</label>
          <input type="password" />
        </Field>

        <Field model="user.confirm_password"
          validators={{
            match: (val) => val === user.password
          }}
          validateOn="blur">
          <label>Confirm password</label>
          <input type="password" />

          { userForm.field('confirm_password').errors.match
            && <div>Passwords don't match.</div>
          }
        </Field>
      </form>
    );
  }
}

export default connect(s => s)(UserForm);
`

class BlurValidationRecipe extends React.Component {
  render() {
    let { user, userForm } = this.props;

    return (
      <Recipe model="user" code={ code }>
        <h2>Validate on Blur</h2>
        <p>Once you blur from the confirm-password field, if the passwords don't match, a validation error will appear.</p>
        <Field model="user.password">
          <label>Password</label>
          <input type="password" />
        </Field>

        <Field model="user.confirm_password"
          validators={{
            match: (val) => val === user.password
          }}
          validateOn="blur">
          <label>Confirm password</label>
          <input type="password" />
          { userForm.field('confirm_password').errors.match
            && <div className="rsf-error">Passwords don't match.</div>
          }
        </Field>
      </Recipe>
    );
  }
}

export default connect(s => s)(BlurValidationRecipe);
