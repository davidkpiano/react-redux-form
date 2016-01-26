import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

const code = `
import { Field, actions } from 'redux-simple-form';

// initial state of info:
// { phones: [ null ], children: [ null ] }

class InfoForm extends React.Component {
  render() {
    let { info, dispatch } = this.props;

    return (
      <form>
        <h2>Deep Forms</h2>
        <label htmlFor="">Phones</label>
        { info.phones.map((phone, i) =>         
          <Field model={\`info.phones[$\{i}]\`} key={i}>
            <input type="text" />
          </Field>
        )}

        <button type="button" onClick={() => dispatch(actions.push('info.phones', null))}>
          Add Phone
        </button>

        { info.children.map((child, i) =>
          <div key={i}>    
            <Field model={\`info.children[$\{i}].name\`}>
              <label htmlFor="">Child name</label>
              <input type="text" />
            </Field>
            <Field model={\`info.children[$\{i}].age\`}>
              <label htmlFor="">Child age</label>
              <input type="text" />
            </Field>
            <hr/>
          </div>
        )}

        <button type="button" onClick={() =>
          dispatch(actions.push('info.children', null))}>
          Add Child
        </button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return { info: state.info };
}

export default connect(mapStateToProps)(InfoForm);
`

class DeepRecipe extends React.Component {
  render() {
    let { info, dispatch } = this.props;

    return (
      <Recipe model="info" code={code}>
        <h2>Deep Forms</h2>
        <label htmlFor="">Phones</label>
        { info.phones.map((phone, i) =>         
          <Field model={`info.phones[${i}]`} key={i}>
            <input type="text" />
          </Field>
        )}
        <br/>
        <button type="button" onClick={() => dispatch(actions.push('info.phones', null))}>
          Add Phone
        </button>

        { info.children.map((child, i) =>
          <div key={i}>    
            <Field model={`info.children[${i}].name`}>
              <label htmlFor="">Child name</label>
              <input type="text" />
            </Field>
            <Field model={`info.children[${i}].age`}>
              <label htmlFor="">Child age</label>
              <input type="text" />
            </Field>
            <hr/>
          </div>
        )}
        <br/>
        <button type="button" onClick={() => dispatch(actions.push('info.children', null))}>
          Add Child
        </button>
      </Recipe>
    );
  }
}

export default connect(s => s)(DeepRecipe);
