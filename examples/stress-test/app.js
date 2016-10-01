import React, { Component } from 'react';
import ReactDOM from 'react-dom';

window.React = require('react/lib/ReactWithAddons');

import { Provider, connect } from 'react-redux';
import {
  Control,
  Field,
  Form,
} from 'react-redux-form';

import store from './store.js';

const UPDATE_ON = 'blur';

class Rows extends Component {
  constructor() {
    super();

    const rows = Array(100).fill({
        name: '',
        email: '',
        active: false,
      });

    this.state = {
      rows,
      rendered: rows.map((row, i) => (
        <tr key={i}>
          <td>
            <Control.text
              updateOn={UPDATE_ON}
              model={`rows[${i}].name`}
              placeholder="Name"
            />
            <Control.text
              updateOn={UPDATE_ON}
              model={`rows[${i}].email`}
              placeholder="Email"
            />
            <Control.checkbox
              model={`rows[${i}].active`}
            />
          </td>
        </tr>
      )),
    }
  }
  render() {
    return (
      <section>
        <table>
          <tbody>
            {this.state.rendered}
          </tbody>
        </table>
      </section>
    );
  }
};

class StressForm extends Component {
  render() {
    return (
      <Form model="rows">
        <Rows />
      </Form>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <StressForm />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
