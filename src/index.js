import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { combineReducers, createStore } from 'redux';

const testReducer = (state = {}, action) => {
  console.log(action);

  return state;
}

let store = createStore(combineReducers({ test: testReducer }));

const makeAction = (e, model) => {
  return {
    type: `rsf/${e.type}`,
    model,
    value: e.target.value
  }
}

function Field(props, state) {
  let { dispatch, test, model } = props;

  return (
    <div onChange={(e) => dispatch(makeAction(e, model))}>
      <input type="text" name="" id=""/>
    </div>
  )
}

let Foo = connect(s=>s)(Field);

class App extends React.Component {
  render() {
    console.log(this.props);

    return (
      <Provider store={store}>
        <Foo model="user.name"></Foo>
      </Provider>
    )
  }
}


ReactDOM.render(<App></App>, document.getElementById('app'));
