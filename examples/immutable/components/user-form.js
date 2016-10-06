import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { Field, Form, Errors, actions } from 'react-redux-form/immutable';

import SubmitButton from './submit-button';


const isRequired = (val) => val && val.length > 0;
const lessThan10 = (val) => {
  const lessThan = 10;
  if (!(val < 10)) {
    return { lessThan };
  }
  return false;
};

class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(user) {  // user is an Immutable Map
    const { dispatch } = this.props;

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
    const somePromise = new Promise((resolve) => {
      /* eslint-disable no-console */
      console.log(user.toJS());
      /* eslint-enable no-console */
      setTimeout(() => { resolve(true); }, 1000);
    });
    dispatch(actions.submit('user', somePromise));
  }

  render() {
    return (
      <Form
        model="user"
        onSubmit={this.handleSubmit}
      >
        <Field model="user.firstName" validators={{ isRequired }}>
          <label>First name: </label>
          <input type="text" />
          <Errors
            wrapper="span"
            show={{ touched: true, focus: false }}
            model="user.firstName"
            messages={{
              isRequired: 'Please provide a first name.',
            }}
          />
        </Field>

        <Field model="user.lastName" validators={{ isRequired }}>
          <label>Last name: </label>
          <input type="text" />
          <Errors
            wrapper="span"
            show={{ touched: true, focus: false }}
            model="user.lastName"
            messages={{
              isRequired: 'Please provide a last name.',
            }}
          />
        </Field>

        <Field model="user.dob" errors={{ lessThan10 }} validateOn="change">
          <label>A number less than 10: </label>
          <input type="number" />
          <Errors
            wrapper="span"
            show={{ pristine: false }}
            model="user.dob"
            messages={{
              lessThan10: (value, { lessThan }) => `Error: ${value} is not less than ${lessThan}`,
            }}
          />
        </Field>

        <SubmitButton />
      </Form>
    );
  }
}

UserForm.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(UserForm);

