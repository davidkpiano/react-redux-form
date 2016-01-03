import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

class ParseRecipe extends React.Component {
  render() {
    let { parseUser, dispatch } = this.props;

    return (
      <Recipe model="parseUser">
        <h2>Parse View Values</h2>
        <Field model="parseUser.age"
          parse={(val) => +val}
          updateOn="blur">
          <input type="text" />
        </Field>
        <pre>{ JSON.stringify(parseUser, null, 2) }</pre>
      </Recipe>
    );
  }
}

export default connect(s => s)(ParseRecipe);
