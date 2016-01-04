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

class ParseRecipe extends React.Component {
  render() {
    let { parseUser, dispatch } = this.props;

    return (
      <Recipe model="parseUser">
        <h2>Parse View Values</h2>
        <Field model="parseUser.age"
          parse={(val) => +val}
          updateOn="blur">
          <label>Age</label>
          <input type="text" />
        </Field>
        <Field model="parseUser.phone"
          parse={(val) => val.replace(/\D+/g, '').substring(0, 10)}>
          <label>Phone Number</label>
          <input type="text" value={ formatPhone(parseUser.phone) }/>
        </Field>
        <pre>{ JSON.stringify(parseUser, null, 2) }</pre>
      </Recipe>
    );
  }
}

export default connect(s => s)(ParseRecipe);
