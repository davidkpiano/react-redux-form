import React, { PropTypes } from 'react';
import Form from './components/form-component';
import combineForms from './reducers/forms-reducer';
import { createStore } from 'redux';

class LocalForm extends React.Component {
  constructor(props) {
    super(props);

    this.store = props.store || createStore(combineForms({
      local: {},
    }));
  }

  render() {
    return (
      <Form model="local" store={this.store} {...this.props} />
    );
  }
}

LocalForm.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),
};

export default LocalForm;
