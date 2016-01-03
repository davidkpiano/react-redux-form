import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

function isAvailable(value, done) {
  setTimeout(() => {
    done(value !== 'davidkpiano')
  }, 1000);
}

class AsyncBlurValidationRecipe extends React.Component {
  render() {
    let { user4, user4Form } = this.props;

    return (
      <Recipe model="user4">
        <h2>Async Blur Validation</h2>
        <Field model="user4.username"
          validators={{
            required: (val) => false
          }}
          asyncValidators={{
            available: isAvailable
          }}
          asyncValidateOn="blur">
          <label htmlFor="">Username</label>
          <input type="text" name="" id=""/>
        </Field>
        { user4Form.field('user4.username').pending
          ? <div className="rsf-error">Checking username...</div>
          : user4Form.field('user4.username').errors.available
            ? <div className="rsf-error">Sorry, that username isn't available.</div>
            : user4Form.field('user4.username').touched
              && <div className="rsf-success">That username looks great!</div>
        }
      </Recipe>
    );
  }
}

export default connect(s => s)(AsyncBlurValidationRecipe);
