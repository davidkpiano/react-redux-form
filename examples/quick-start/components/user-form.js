import React from 'react';
import { Form, actions, Control } from 'react-redux-form';

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
      <Form model="user" onSubmit={v => console.log(v)}>
        <div>
          <label>First name:</label>
          <Control.text model="user.firstName" />
        </div>

        <div>
          <label>Last name:</label>
          <Control.text model="user.lastName" />
        </div>

        <button type="submit">
          Finish registration!
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

export default UserForm;
