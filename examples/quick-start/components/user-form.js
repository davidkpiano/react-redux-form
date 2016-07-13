import React from 'react';
import { connect } from 'react-redux';
import { Field, Form, actions } from 'react-redux-form';

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
    const { user } = this.props;

    return (
      <Form model="user" onSubmit={this.handleSubmit}>
        <Field model="user.firstName">
          <label>First name:</label>
          <input type="text" />
        </Field>

        <Field model="user.lastName">
          <label>Last name:</label>
          <input type="text" />
        </Field>

        <button type="submit">
          Finish registration, {user.firstName} {user.lastName}!
        </button>
      </Form>
    );
  }
}

UserForm.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  user: React.PropTypes.shape({
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(UserForm);
