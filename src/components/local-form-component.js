import React from 'react';
import PropTypes from 'prop-types';
import Form from './form-component';
import combineForms from '../reducers/forms-reducer';
import { createStore } from 'redux';
import omit from '../utils/omit';

class LocalForm extends React.Component {
  constructor(props) {
    super(props);

    this.store = props.store || createStore(combineForms({
      [props.model]: props.initialState,
    }));

    this.dispatch = (action) => {
      if (typeof action === 'function') {
        return action(this.dispatch, this.store.getState);
      }

      return this.store.dispatch(action);
    };
  }

  componentDidMount() {
    if (this.props.getDispatch) {
      this.props.getDispatch(this.dispatch);
    }
  }

  render() {
    const allowedProps = omit(this.props, ['store', 'initialState']);

    return (
      <Form store={this.store} {...allowedProps} />
    );
  }
}

LocalForm.displayName = 'LocalForm';

LocalForm.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),

  // provided props
  initialState: PropTypes.any,
  model: PropTypes.string.isRequired,
  getDispatch: PropTypes.func,
};

LocalForm.defaultProps = {
  initialState: {},
  model: 'local',
};

export default LocalForm;
