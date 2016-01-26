import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

const hobbies = [
  { id: 1, name: 'piano' },
  { id: 2, name: 'surfing' },
  { id: 3, name: 'coding' }
]

const code = `
import { Field } from 'redux-simple-form';

const hobbies = [
  { id: 1, name: 'piano' },
  { id: 2, name: 'surfing' },
  { id: 3, name: 'coding' }
]

class HobbyForm extends React.Component {
  render() {
    return (
      <form>
        <h2>Complex Values</h2>
        <Field model="user.hobbies[]">
          <label>
            <input type="checkbox" value={ hobbies[0] }/>
            <span>A creative hobby</span>
          </label>
          <label>
            <input type="checkbox" value={ hobbies[1] }/>
            <span>A physical hobby</span>
          </label>
          <label>
            <input type="checkbox" value={ hobbies[2] }/>
            <span>A thinking hobby</span>
          </label>
        </Field>
      </form>
    );
  }
}
`

class MultiRecipe extends React.Component {
  render() {
    return (
      <Recipe model="user" code={code}>
        <h2>Complex Values</h2>
        <p>Each input <code>value</code> attribute is a plain JS object, not a string. Redux Simple Form uses <em>that</em> raw value to set the model, without converting it to a string.</p>
        <Field model="user.hobbies[]">
          <label>
            <input type="checkbox" value={ hobbies[0] }/>
            <span>A creative hobby</span>
          </label>
          <label>
            <input type="checkbox" value={ hobbies[1] }/>
            <span>A physical hobby</span>
          </label>
          <label>
            <input type="checkbox" value={ hobbies[2] }/>
            <span>A thinking hobby</span>
          </label>
        </Field>
      </Recipe>
    );
  }
}

export default connect(s => s)(MultiRecipe);
