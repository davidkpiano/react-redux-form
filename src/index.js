import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { createModelReducer } from './reducers/model-reducer';


const testReducer = (state = {user: {name: 'Bob', 'password': 123, preferences: []}}, action) => {
  console.log(action)
  if (action.type == 'CLEAR_ODD') {
    console.log(state.user.preferences.filter(p => {console.log(p);return p!=='5'}))
    return {...state, user: { ...state.user, preferences: state.user.preferences.filter(p => !(+p%2))}};
  }

  return modelReducer(state, action);
}

let store = createStore(combineReducers({
  user: createModelReducer('user', {
    preferences: []
  })
}));

import * as actions from './actions/model-actions';

import Field from './components/field-component';

function form(props) {
  let change = (...args) => (e) => {
    e.persist();
    console.log(e);
    store.dispatch(actions.change(...args, e));
  }

  let { user, dispatch } = props;

  console.log(user);

  return (
    <div>
      <input type="text" onChange={change('user.name')} value={user.name}/>
      <input type="password" onBlur={change('user.password')} defaultValue={user.password}/>
      <div>{ user.name }</div>
      <div>{ user.password }</div>
      <div>{ user.preferences.join(',') }</div>
      <div>
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
            <input type="checkbox" value="3" />
          </Field>
          <span>Item 3</span>
        </label>
      </div>
      <label>
        <Field model="user.preferences[]">
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


ReactDOM.render(<App></App>, document.getElementById('app'));
