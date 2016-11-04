import React, { PropTypes } from 'react';
import Form from './form-component';
import combineForms from '../reducers/forms-reducer';
import { createStore } from 'redux';

class LocalForm extends React.Component {
  constructor(props) {
    super(props);

    this.store = props.store || createStore(combineForms({
      [props.model]: props.initialState,
    }));
  }

  render() {
    return (
      <Form store={this.store} {...this.props} component="div" />
    );
  }
}

LocalForm.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),

  // provided props
  initialState: PropTypes.any,
  model: PropTypes.string.isRequired,
};

LocalForm.defaultProps = {
  initialState: {},
  model: 'local',
};

export default LocalForm;
