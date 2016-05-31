import React from 'react';
import { connect } from 'react-redux';

const SubmitButton = ({ user }) =>
  <button type="submit">
    Finish registration, { user.firstName } { user.lastName }!
  </button>;

SubmitButton.propTypes = {
  user: React.PropTypes.shape({
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(SubmitButton);
