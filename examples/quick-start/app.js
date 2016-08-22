import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import {
  Field,
  Form,
  Control,
  actions,
  combineForms,
} from 'react-redux-form';

const initialState = {
  to: '',
  message: '',
};

const unclaimed = combineForms({
  inviteManager: initialState,
}, 'shared.unclaimed');

const store = createStore(combineReducers({
  shared: combineReducers({
    unclaimed,
  }),
}), applyMiddleware(createLogger(), thunk));

class App extends Component {
  handleSubmit(values) {
    alert(JSON.stringify(values));
  }
  render() {
    return (
      <Form model="shared.unclaimed.inviteManager" onSubmit={this.handleSubmit}>
        <Field model="shared.unclaimed.inviteManager.to"
          validateOn="blur"
          validators={{
            required: (val) => val && val.length,
          }}
        >
          <label>Email Or Mobile Number</label>
          <input type="text" />
        </Field>
        <button>Submit</button>
      </Form>
    );
  }
}

ReactDOM.render(<Provider store={store}>
  <App />
</Provider>, document.getElementById('app'));
