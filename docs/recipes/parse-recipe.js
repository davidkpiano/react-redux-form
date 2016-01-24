import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

const formatPhone = (val) => {
  var firstThree  = val.substring(0,3);
  var secondThree = val.substring(3,6);
  var thirdFour   = val.substring(6,10);

  if (firstThree) {
      val = '(' + firstThree;
  }

  if (secondThree) {
      val += (') ' + secondThree);
  }

  if (thirdFour) {
      val += ('-' + thirdFour);
  }

  return val;
}

const code = `
import { Field } from 'redux-simple-form';

function formatPhone(phone) { /* ... */ }

class UserForm extends React.Component {
  render() {
    let { user } = this.props;

    return (
      <Recipe model="user">
        <h2>Parse View Values</h2>
        <Field model="user.age"
          parser={(val) => +val}
          updateOn="blur">
          <label>Age</label>
          <input type="text" />
        </Field>

        <Field model="user.phone"
          parser={(val) => val.replace(/\D+/g, '').substring(0, 10)}>
          <label>Phone Number</label>
          <input type="text" value={ formatPhone(user.phone) }/>
        </Field>
      </Recipe>
    );
  }
}
`

class ParseRecipe extends React.Component {
  render() {
    let { parseUser } = this.props;

    return (
      <Recipe model="parseUser" code={ code }>
        <h2>Parse View Values</h2>
        <Field model="parseUser.age"
          parser={(val) => +val}
          updateOn="blur">
          <label>Age</label>
          <input type="text" />
        </Field>
        <p>Age will be parsed as a number on blur.</p>
        <Field model="parseUser.phone"
          parser={(val) => val.replace(/\D+/g, '').substring(0, 10)}>
          <label>Phone Number</label>
          <input type="text" value={ formatPhone(parseUser.phone) }/>
        </Field>
        <p>Phone will be parsed as a string and non-numbers will be removed.</p>
      </Recipe>
    );
  }
}

export default connect(s => s)(ParseRecipe);
