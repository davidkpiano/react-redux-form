import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'react-redux-form';

import Recipe from '../components/recipe-component';

const code = `
class UserForm extends React.Component {
  render() {
    let { user, dispatch } = this.props;

    return (
      <form>
        <h2>Dynamic Fields</h2>
        <Field model="user.customField">
          <label>Field name:</label>
          <input type="text" />
        </Field>

        { user.customField &&
          <Field model={\`user.$\{ user.customField }\`}>
            <label>Edit user.{ user.customField }:</label>
            <input type="text" value={ user[user.customField] }/>
          </Field>
        }
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(UserForm);
`;

class DynamicFieldRecipe extends React.Component {
  render() {
    let { user, dispatch } = this.props;

    return (
      <Recipe model="user" code={code}>
        <h2>Dynamic Fields</h2>
        <p>Enter a custom field name, and then enter a value for the field.</p>
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

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(DynamicFieldRecipe);
