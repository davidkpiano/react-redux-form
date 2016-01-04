import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import {
  Router,
  Route,
  IndexRoute,
  Link,
  hashHistory
} from 'react-router';
import kebabCase from 'lodash/string/kebabCase';
import startCase from 'lodash/string/startCase';

import IntroPage from './pages/intro-page';
import ActionsPage from './pages/actions-page';
import ApiPage from './pages/api-page';

import SyncValidationRecipe from './recipes/sync-validation-recipe';
import SubmitValidationRecipe from './recipes/submit-validation-recipe';
import BlurValidationRecipe from './recipes/blur-validation-recipe';
import AsyncBlurValidationRecipe from './recipes/async-blur-validation-recipe';
import AutofillRecipe from './recipes/autofill-recipe';
import DeepRecipe from './recipes/deep-recipe';
import MultiRecipe from './recipes/multi-recipe';
import MultiRecordRecipe from './recipes/multi-record-recipe';
import ParseRecipe from './recipes/parse-recipe';

import {
  createModelReducer,
  createFormReducer
} from 'redux-simple-form';

import './scss/main.scss';

const userReducer = (state, action) => {
  let model = createModelReducer('user', { firstName: 'david', sex: 'F', employed: true, notes: 'testing' })(state, action);

  return {
    ...model,
    fullName: model.firstName + ' ' + (model.lastName || '')
  }
}

const store = applyMiddleware(thunk)(createStore)(combineReducers({
  user: userReducer,
  syncValidUser: createModelReducer('syncValidUser'),
  syncValidUserForm: createFormReducer('syncValidUser'),
  submitValidUser: createModelReducer('submitValidUser'),
  submitValidUserForm: createFormReducer('submitValidUser'),
  user3: createModelReducer('user3'),
  user3Form: createFormReducer('user3'),
  user4: createModelReducer('user4'),
  user4Form: createFormReducer('user4'),
  user5: createModelReducer('user5'),
  user5Form: createFormReducer('user5'),
  user6: createModelReducer('user6', { phones: [ null ], children: [] }),
  userForm: createFormReducer('user'),
  multiUser: createModelReducer('multiUser'),
  multiRecord: createModelReducer('multiRecord', [ {} ]),
  parseUser: createModelReducer('parseUser', { phone: '' }),
  order: createModelReducer('order', {
    shipping: {},
    billing: {}
  }),
}));

const recipes = [
  'SyncValidationRecipe',
  'SubmitValidationRecipe',
  'BlurValidationRecipe',
  'AsyncBlurValidationRecipe',
  'AutofillRecipe',
  'DeepRecipe',
  'MultiRecipe',
  'MultiRecordRecipe',
  'ParseRecipe',
];

const recipeComponents = {
  SyncValidationRecipe,
  SubmitValidationRecipe,
  BlurValidationRecipe,
  AsyncBlurValidationRecipe,
  AutofillRecipe,
  DeepRecipe,
  MultiRecipe,
  MultiRecordRecipe,
  ParseRecipe,
};

const apiReference = [
  'action creators',
  'action thunk creators'
]

const Docs = (props) => (
  <main className="rsf-layout-page">
    <nav className="rsf-layout-nav">
      <h6 className="rsf-heading">Guides</h6>
      <ul className="rsf-list">
        <li className="rsf-item">
          <Link className="rsf-anchor" to="/">
            Getting Started
          </Link>
          <Link className="rsf-anchor" to="actions">
            RSF Actions
          </Link>
        </li>
      </ul>
      <h6 className="rsf-heading">API Reference</h6>
      <ul className="rsf-list">
        { apiReference.map((item) =>
          <li className="rsf-item">
            <Link className="rsf-anchor"
              to={`api/${item}`}>
              { startCase(item) }
            </Link>
          </li>
        )}
      </ul>
      <h6 className="rsf-heading">Recipes</h6>
      <ul className="rsf-list">
        { recipes.map((recipe) =>
          <li className="rsf-item">
            <Link className="rsf-anchor"
              to={`recipe/${kebabCase(recipe)}`}>
              { startCase(recipe) }
            </Link>
          </li>
        )}
      </ul>
    </nav>
    <section className="rsf-layout-content">
      { props.children }
    </section>
  </main>
);

const Recipes = (props) => <div>{props.children}</div>;

class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <Router history={ hashHistory }>
          <Route path="/" component={ Docs }>
            <IndexRoute component={ IntroPage } />
            <Route path="actions" component={ ActionsPage }/>
            <Route path="api/:item" component={ ApiPage } />
            <Route path="recipe" component={ Recipes }>
            { recipes.map((recipe) => 
              <Route path={kebabCase(recipe)}
                component={recipeComponents[recipe]} />
            )}
            </Route>
          </Route>
        </Router>
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
