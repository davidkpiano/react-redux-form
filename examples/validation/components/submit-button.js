import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

const SubmitButton = ({ user }) =>
  <button type="submit">
    Finish registration, {user.firstName} {user.lastName}!
  </button>;

SubmitButton.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(SubmitButton);