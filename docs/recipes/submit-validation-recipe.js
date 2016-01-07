import React from 'react';
import { connect } from 'react-redux';
import { Field, Form, getField, actions } from 'redux-simple-form';

import validator from 'validator';

import Recipe from '../components/recipe-component';

const isRequired = (value) => !validator.isNull(value);

function usernameIsAvailable(username, done) {
  setTimeout(() => done(!~['John', 'Paul', 'George', 'Ringo'].indexOf(username)), 2000);
}

function fooAsyncSubmit(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let errors = {};

      if (!~['John', 'Paul', 'George', 'Ringo'].indexOf(data.username)
        || data.password !== 'password') {
        console.log(!!~['John', 'Paul', 'George', 'Ringo'].indexOf(data.username), data.password);
        return reject();
      } 

      return resolve();
    }, 1000);
  });
}

function fooSubmitAction(data) {
  return (dispatch) => {
    dispatch(actions.asyncSetValidity('submitValidUser', (_, done) => {
      fooAsyncSubmit(data)
        .then((res) => {
          done({
            credentials: true
          });
          dispatch(actions.setSubmitted('submitValidUser'));
        })
        .catch(() => {
          done({
            credentials: false
          });
        });
    }));
  }
}

class SyncValidationRecipe extends React.Component {
  handleSubmit(e) {
    e.preventDefault();

    this.props.dispatch(fooSubmitAction(this.props.submitValidUser));
  }

  render() {
    let { submitValidUser, submitValidUserForm } = this.props;

    return (
      <Recipe model="submitValidUser" onSubmit={(e) => this.handleSubmit(e)}>
        <h2>Submit Validation</h2>
        <Field model="submitValidUser.username">
          <label>Username</label>
          <input type="text" />
        </Field>
        { submitValidUserForm.field('submitValidUser.username').pending &&
          <span>Validating...</span>
        }
        { submitValidUserForm.field('submitValidUser.username').errors.available &&
          <span>Sorry, that username is taken.</span>
        }
        <Field model="submitValidUser.password">
          <label>Password</label>
          <input type="password" />
        </Field>
        { submitValidUserForm.field('submitValidUser').errors.credentials
          && <div className="rsf-error">Those credentials are incorrect.</div>
        }
        {
          submitValidUserForm.field('submitValidUser').submitted
          ? <div>You are now logged in.</div>
          : <button disabled={ submitValidUserForm.field('submitValidUser').pending }>
              Submit
            </button>
        }
      </Recipe>
    );
  }
}

export default connect(s => s)(SyncValidationRecipe);
