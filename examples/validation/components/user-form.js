import React from 'react';
import { connect } from 'react-redux';
import { Field, Form, Errors, actions } from 'react-redux-form';

import SubmitButton from './submit-button';

const isRequired = (val) => val && val.length > 0;

class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(user) {
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
        onSubmit={ this.handleSubmit }
      >
        <Field model="user.firstName" validators={{ isRequired }}>
          <label>First name: </label>
          <input type="text" />
          <Errors
            wrapper="span"
            show={{ touched: true, focus: false }}
            model="user.firstName"
            messages={{
              isRequired: "Please provide a first name.",
            }}/>
        </Field>

        <Field model="user.lastName" validators={{ isRequired }}>
          <label>Last name: </label>
          <input type="text" />
          <Errors
            wrapper="span"
            show={{ touched: true, focus: false }}
            model="user.lastName"
            messages={{
              isRequired: "Please provide a last name.",
            }}/>
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
