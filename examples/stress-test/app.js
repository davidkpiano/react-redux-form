import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Provider, connect } from 'react-redux';
import {
  Control,
  Field,
  Form,
} from 'react-redux-form';

import store from './store.js';

const UPDATE_ON = 'change';

const Rows = connect(({ rows }) => ({ rows }))(class extends Component {
  constructor(props) {
    super(props);
    const { rows } = props;

    this.state = {
      rendered: rows.map((row, i) =>
            <tr key={i}>
              <td>
                <Control.text
                  updateOn={UPDATE_ON}
                  model={`rows[${i}].name`}
    />
              </td>
              <td>
                <Control.text
                  updateOn={UPDATE_ON}
                  model={`rows[${i}].email`}
    />
              </td>
              <td>
                <Field
                  updateOn={UPDATE_ON}
                  model={`rows[${i}].active`}
    >
                  <label>
                    <input type="radio" value />
                    Active
                  </label>
                  <label>
                    <input type="radio" value={false} />
                    Inactive
                  </label>
                </Field>
              </td>
            </tr>
          ),
    };
  }
  render() {
    const { rows } = this.props;

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
});

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
