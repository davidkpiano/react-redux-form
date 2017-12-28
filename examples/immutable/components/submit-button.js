import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

const SubmitButton = ({ user }) => // user is an Immutable Map
  <button type="submit">
    Finish registration, {user.get('firstName')} {user.get('lastName')}!
  </button>;

SubmitButton.propTypes = {
  user: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const mapStateToProps = (state) => {
  // Enable one of the two:
  return { user: state.user };  // Enable when using redux
  // return { user: state.get('user') };  // Enable when using redux-immutablejs
};

export default connect(mapStateToProps)(SubmitButton);