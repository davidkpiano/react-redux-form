import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';

import Select from 'react-select';

import Recipe from '../components/recipe-component';

const code = `
import { connect } from 'react-redux';
import { actions } from 'redux-simple-form';
import Select from 'react-select';

const options = [
    { value: 'haskell', label: 'Haskell' },
    { value: 'elm', label: 'Elm' },
    { value: 'ocaml', label: 'OCaml' },
    { value: 'elixir', label: 'Elixir' }
];

class UserForm extends React.Component {
  render() {
    let { user, dispatch } = this.props;

    return (
      <form>
        <h2>Custom Components</h2>

      <Select
          name="form-field-name"
          placeholder="Select a language..."
          value={ user.language }
          options={options}
          onChange={(val) => dispatch(actions.change('user.language', val))}
      />
      </form>
    );
  }
}

export default connect(s => s)(UserForm);
`

class CustomComponentRecipe extends React.Component {
  render() {
    let { user, dispatch } = this.props;
    let options = [
        { value: 'haskell', label: 'Haskell' },
        { value: 'elm', label: 'Elm' },
        { value: 'ocaml', label: 'OCaml' },
        { value: 'elixir', label: 'Elixir' }
    ];

    return (
      <Recipe model="user" code={ code }>
        <h2>Custom Components</h2>

      <Select
          name="form-field-name"
          placeholder="Select a language..."
          value={ user.language }
          options={options}
          onChange={(val) => dispatch(actions.change('user.language', val))}
      />
      </Recipe>
    );
  }
}

export default connect(s => s)(CustomComponentRecipe);
