import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

const SubmitButton = ({ user }) => // user is an Immutable Map
  <button type="submit">
    Finish registration, {user.get('firstName')} {user.get('lastName')}!
  </button>;

SubmitButton.propTypes = {
  user: React.PropTypes.instanceOf(Immutable.Map).isRequired,
};

const mapStateToProps = (state) => ({ user: state.get('user') });

export default connect(mapStateToProps)(SubmitButton);

