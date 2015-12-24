import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { createModelReducer } from './reducers/model-reducer';
import { createFieldReducer } from './reducers/field-reducer';

import { isPristine, isFocused } from './utils';

const userReducer = (state = { firstName: 'David', preferences: [] }, action) => {
  const modelReducer = createModelReducer('user');

  let model = modelReducer(state, action);

  return {
    ...model,
    fullName: model.firstName + ' ' + model.lastName
  }
}

let store = createStore(combineReducers({
  user: userReducer,
  userFields: createFieldReducer('user')
}));

import * as actions from './actions/model-actions';
import * as fieldActions from './actions/field-actions';


import Field from './components/field-component';

export {
  createModelReducer,
  createFieldReducer,
  actions as modelActions,
  fieldActions,
  Field
}


function form(props) {
  let change = (...args) => (e) => {
    e.persist();
    console.log(e);
    store.dispatch(actions.change(...args, e));
  }

  let { user, userFields, dispatch } = props;

  console.log(userFields);

  return (
    <div>
      <Field model="user.firstName">
        <input type="text" />
      </Field>
      <Field model="user.lastName" updateOn="blur">
        <input type="text" />
      </Field>
      <Field model="user.password">
        <input type="password" />
      </Field>
      <div style={{color: isFocused(userFields.firstName) ? 'green' : 'black'}}>
        { user.fullName }
        { isPristine(userFields.password) ? 'Pristine!' : 'Not pristine.' }
      </div>
      <div>{ user.color }</div>
      <div>{ user.preferences.join(',') }</div>
      <button onClick={() => dispatch(actions.toggle('user.preferences[]', 3))}>Toggle the third one.</button>
      <div>
        <select onChange={change('user.color')}>
          <option></option>
          <option value="ff0000">Red</option>
          <option value="00ff00">Green</option>
          <option value="0000ff">Blue</option>
        </select>
        <label>
          <Field model="user.choice">
            <input type="radio" value="first" />
          </Field>
          <span>First</span>
        </label>
        <label>
          <Field model="user.choice">
            <input type="radio" value="second" />
          </Field>
          <span>Second</span>
        </label>
        <label>
          <Field model="user.preferences[]">
            <input type="checkbox" value="1" />
          </Field>
          <span>Item 1</span>
        </label>
        <label>
          <Field model="user.preferences[]">
            <input type="checkbox" value="2" />
          </Field>
          <span>Item 2</span>
        </label>
        <label>
          <Field model="user.preferences[]">
            <input type="checkbox" value={3} />
          </Field>
          <span>Item 3</span>
        </label>
      </div>
      <label>
        <Field model="user.preferences[]" updateOn="blur">
          <input type="checkbox" value="4" />
        </Field>
        <span>Item 4</span>
      </label>
      <label>
        <Field model="user.preferences[]">
          <input type="checkbox" value={5}/>
        </Field>
        <span>Item 5</span>
      </label>
      <input type="text" onChange={change('user.phone')}/>
      <button onClick={() => dispatch(actions.filter('user.preferences[]', (p) => !(+p % 2)))}>only even</button>
      <button onClick={() => dispatch(actions.map('user.preferences[]', (p) => p * 2 + ""))}>double them</button>
    </div>
  )
}

let Form = connect(s => s)(form);

class App extends React.Component {
  render() {

    return (
      <Provider store={store}>
        <Form />
      </Provider>
    )
  }
}


// ReactDOM.render(<App></App>, document.getElementById('app'));
