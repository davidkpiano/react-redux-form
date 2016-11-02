import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { connect, Provider } from 'react-redux';
import {
  Form,
  Control,
  Errors,
  actions,
  combineForms,
} from 'react-redux-form';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
// import isEmpty from 'validator/lib/isEmpty';

const store = createStore(combineForms({
  user: {
    name1: '',
    name2: '',
  },
}), applyMiddleware(thunk, createLogger()));

const isRequired = value => !!value && value.length;
const namesNotEqual = ({name1, name2}) => {
  console.log("namesNotEqual(): Name1: %s, Name2: %s", name1, name2);
  return name1 !== name2;
};

class App extends Component {
  handleSubmit(vals) {
    console.log("handleSubmit(): %O", vals);
  }
  
  render() {
    return (
      <Form
        model="user"
        onSubmit={(vals) => this.handleSubmit(vals)}
        validators={{'': {namesNotEqual}}}
      >
        <Errors show={true} model="user" messages={{namesNotEqual: "No equal names allowed!"}} />
        <br />
        
        <label>Name1:</label>
        <Control.text model=".name1" validators={{isRequired}} />
        <Errors show={true} model=".name1" messages={{isRequired: "Please enter a name!"}}/>
        <br />
        
        <label>Name2:</label>
        <Control.text model=".name2" validators={{isRequired}} />
        <Errors show={true} model=".name2" messages={{isRequired: "Please enter a name!"}}/>
        <br />
        
        <button>Submit!</button>
      </Form>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
, document.querySelector('#app'));
