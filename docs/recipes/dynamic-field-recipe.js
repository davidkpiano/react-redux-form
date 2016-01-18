import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

class DynamicFieldRecipe extends React.Component {
  render() {
    let { user, dispatch } = this.props;

    return (
      <Recipe model="user">
        <h2>Dynamic Fields</h2>
        <Field model="user.customField">
          <label>Field name:</label>
          <input type="text" />
        </Field>
        { user.customField &&
          <Field model={`user.${ user.customField }`}>
            <label>Edit user.{ user.customField }:</label>
            <input type="text" value={ user[user.customField] }/>
          </Field>
        }
      </Recipe>
    );
  }
}

export default connect(s => s)(DynamicFieldRecipe);
