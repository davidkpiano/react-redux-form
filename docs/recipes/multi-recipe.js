import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

const hobbies = [
  { id: 1, name: 'piano' },
  { id: 2, name: 'surfing' },
  { id: 3, name: 'coding' }
]

class MultiRecipe extends React.Component {
  render() {
    let { multiUser, dispatch } = this.props;

    return (
      <Recipe model="multiUser">
        <h2>Multiple Values</h2>
        <Field model="multiUser.hobbies[]">
          <label>
            <input type="checkbox" value={hobbies[0]}/>
            <span>First</span>
          </label>
          <label>
            <input type="checkbox" value={hobbies[1]}/>
            <span>Second</span>
          </label>
          <label>
            <input type="checkbox" value={hobbies[2]}/>
            <span>Third</span>
          </label>
        </Field>
        <pre>{ JSON.stringify(multiUser, null, 2) }</pre>
      </Recipe>
    );
  }
}

export default connect(s => s)(MultiRecipe);
