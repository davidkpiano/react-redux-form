import React from 'react';
import { connect } from 'react-redux';
import { Field, Form, actions } from 'react-redux-form/immutable';

import SubmitButton from './submit-button';


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
      console.log(user);
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
        <Field model="user.firstName">
          <label>First name: </label>
          <input type="text" />
        </Field>

        <Field model="user.lastName">
          <label>Last name: </label>
          <input type="text" />
        </Field>

        <Field model="user.dob">
          <label>A number: </label>
          <input type="number" />
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

