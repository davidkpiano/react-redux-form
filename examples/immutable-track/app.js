import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

import { fromJS } from 'immutable';

import {
  Field,
  Control,
  Form,
  Fieldset,
  track,
  combineForms,
} from 'react-redux-form/immutable';

const initialUserState = fromJS({
  firstName: '',
  lastName: '',
  groups: [
    {
      id: 5,
      name: 'Group A',
    },
    {
      id: 6,
      name: 'Group B',
    },
  ],
});

const store = createStore(
  combineForms({
    user: initialUserState,
  }),
);

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupIndex: 0,
      groupId: 5,
    };
  }

  render() {
    return (
      <Form model="user" onSubmit={v => console.log(v.toJS())}>
        <div className="field">
          <label>First name:</label>
          <Control.text model=".firstName" />
        </div>

        <div className="field">
          <label>Last name:</label>
          <Control.text model=".lastName" />
        </div>

        <div className="field">
          <label>Group index</label>
          <input
            type="number"
            value={this.state.groupIndex}
            onChange={event =>
              this.setState({ groupIndex: event.target.value })}
          />
        </div>

        <div className="field">
          <label>Select Group by ID: </label>
          <input
            type="number"
            value={this.state.groupId}
            onChange={event => this.setState({ groupId: parseInt(event.target.value, 10) })}
          />
        </div>

        <Fieldset model={track(`.groups[]`, { id: this.state.groupId })}>
          <div className="field">
            <label>Group: </label>
            <div>
              ID: <Control.text model=".id" />
              <br />
              Name: <Control.text model=".name" />
            </div>
          </div>
        </Fieldset>

        <button type="submit">
          Submit (check console)
        </button>
      </Form>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <UserForm />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
