import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

class AutofillRecipe extends React.Component {
  handleAutofill() {
    let { dispatch } = this.props;

    dispatch(actions.change('user5', {
      firstName: 'David',
      lastName: 'Khourshid',
      age: 25,
      occupation: 'Pianist'
    }));
  }
  render() {
    let { user5 } = this.props;

    return (
      <Recipe model="user5">
        <h2>Autofill Data</h2>
        <button type="button" onClick={() => this.handleAutofill()}>
          Autofill User
        </button>
        <Field model="user5.firstName">
          <label htmlFor="">First Name</label>
          <input type="text" value={user5.firstName}/>
        </Field>
        <Field model="user5.lastName">
          <label htmlFor="">Last Name</label>
          <input type="text" value={user5.lastName} />
        </Field>
        <Field model="user5.age">
          <label htmlFor="">Age</label>
          <input type="text" value={user5.age} />
        </Field>
        <Field model="user5.occupation">
          <label htmlFor="">Occupation</label>
          <input type="text" value={user5.occupation} />
        </Field>
      </Recipe>
    );
  }
}

export default connect(s => s)(AutofillRecipe);
