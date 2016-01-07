import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import validator from 'validator';

import Recipe from '../components/recipe-component';

const isRequired = (value) => !validator.isNull(value);

class BlurValidationRecipe extends React.Component {
  render() {
    let { user, userForm } = this.props;

    console.log(userForm);
    return (
      <Recipe model="user">
        <h2>Blur Validation</h2>
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
