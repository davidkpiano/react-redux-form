import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import validator from 'validator';

import Recipe from '../components/recipe-component';

const isRequired = (value) => !validator.isNull(value);

class BlurValidationRecipe extends React.Component {
  render() {
    let { user3, user3Form } = this.props;

    return (
      <Recipe model="user3">
        <h2>Blur Validation</h2>
        <Field model="user3.password">
          <label htmlFor="">Password</label>
          <input type="password" name="" id=""/>
        </Field>
        <Field model="user3.confirm_password"
          validators={{
            match: (val) => val === user3.password
          }}
          validateOn="blur">
          <label htmlFor="">Confirm password</label>
          <input type="password" name="" id=""/>
          { user3Form.field('user3.confirm_password').errors.match
            && <div className="rsf-error">Passwords don't match.</div>
          }
        </Field>
      </Recipe>
    );
  }
}

export default connect(s => s)(BlurValidationRecipe);
