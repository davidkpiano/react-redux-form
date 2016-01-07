import React from 'react';
import { connect } from 'react-redux';
import { Field, Form, getField, actions } from 'redux-simple-form';

import validator from 'validator';

import Recipe from '../components/recipe-component';

class VariousControlsRecipe extends React.Component {
  render() {
    let { user, userForm, dispatch } = this.props;

    return (
      <Recipe model="user" onSubmit={(e) => this.handleSubmit(e)}>
        <h2>Various Controls</h2>
        <Field model="user.favoriteColor">
          <label>Favorite Color</label>
          <label>
            <input type="radio" value="red"/>
            <span>Red</span>
          </label>
          <label>
            <input type="radio" value="white"/>
            <span>White</span>
          </label>
          <label>
            <input type="radio" value="blue"/>
            <span>Blue</span>
          </label>
        </Field>
        <button type="button" onClick={() => dispatch(actions.change('user.favoriteColor', 'red'))}>
          Change color to Red
        </button>

        <Field model="user.languages[]">
          <label>Languages</label>
          <label>
            <input type="checkbox" value="EN"/>
            <span>English</span>
          </label>
          <label>
            <input type="checkbox" value="ES" />
            <span>Spanish</span>
          </label>
          <label>
            <input type="checkbox" value="FR"/>
            <span>French</span>
          </label>
        </Field>

        <button type="button" onClick={() => dispatch(actions.xor('user.languages', 'EN'))}>
          Toggle English
        </button>

        <Field model="user.state">
          <select>
            <option value="">Select one</option>
            <option value="AK">Alaska</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
          </select>
        </Field>

        <button type="button" onClick={() => dispatch(actions.change('user.state', 'FL'))}>
          Choose Florida
        </button>
      </Recipe>
    );
  }
}

export default connect(s => s)(VariousControlsRecipe);
