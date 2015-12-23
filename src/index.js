import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import defaults from 'lodash/object/defaults';
import {endsWith} from 'lodash/string';
import {curry} from 'lodash/function';
import {contains} from 'lodash/collection';

import { createModelReducer } from './reducers/model-reducer';

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(event) {
  return isEvent(event)
    ? event.target.value
    : event;
}

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

const actions = {
  change: curry((model, value) => ({
    type: `rsf/change`,
    model: model,
    value: getValue(value),
    multi: endsWith(model, '[]')
  }))
}

function form(props) {
  let change = (model) => (e) => {
    e.persist();
    console.log(e);
    store.dispatch(actions.change(model, e));
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
      <div onChange={change('user.preferences[]')}>
        <label>
          <input type="checkbox" value="1"/>
          <span>Item 1</span>
        </label>
        <label>
          <input type="checkbox" value="2"/>
          <span>Item 2</span>
        </label>
        <label>
          <input type="checkbox" value="3"/>
          <span>Item 3</span>
        </label>
        <label>
          <input type="checkbox" value="4"/>
          <span>Item 4</span>
        </label>
        <label>
          <input type="checkbox" onChange={(e)=>{e.preventDefault();dispatch(actions.change('user.preferences[]', 5))}}/>
          <span>Item 5</span>
        </label>
      </div>
      <input type="text" onChange={change('user.phone')}/>
      <button onClick={() => props.dispatch({type:'CLEAR_ODD'})}>clear odd</button>
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
