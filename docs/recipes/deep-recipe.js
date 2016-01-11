import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

class DeepRecipe extends React.Component {
  render() {
    let { user6, dispatch } = this.props;

    return (
      <Recipe model="user6">
        <h2>Deep Forms</h2>
        <Field model="user6.firstName">
          <label htmlFor="">First Name</label>
          <input type="text" value={ user6.firstName }/>
        </Field>
        <label htmlFor="">Phones</label>
        { user6.phones.map((phone, i) =>         
          <Field model={`user6.phones[${i}]`} key={i}>
            <input type="text" />
          </Field>
        )}
        <button type="button" onClick={() => dispatch(actions.push('user6.phones', null))}>
          Add Phone
        </button>

        { user6.children.map((child, i) =>
          <div key={i}>    
            <Field model={`user6.children[${i}].name`}>
              <label htmlFor="">Child name</label>
              <input type="text" />
            </Field>
            <Field model={`user6.children[${i}].age`}>
              <label htmlFor="">Child age</label>
              <input type="text" />
            </Field>
          </div>
        )}
        <br/>
        <button type="button" onClick={() => dispatch(actions.push('user6.children', null))}>
          Add Child
        </button>
      </Recipe>
    );
  }
}

export default connect(s => s)(DeepRecipe);
