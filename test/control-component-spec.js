// /* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
// import { assert } from 'chai';
// import React, { Component, PropTypes } from 'react';
// import TestUtils from 'react-addons-test-utils';
// import { applyMiddleware, combineReducers, createStore } from 'redux';
// import { Provider } from 'react-redux';
// import thunk from 'redux-thunk';

// import { controls, createFieldClass, formReducer, modelReducer, Control } from '../src';

// function createTestStore(reducers) {
//   return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
// }

// describe('<Control> component', () => {
//   it('should exist as a function', () => {
//     assert.ok(Control);
//   });

//   it.only('should work as expected with a model (happy path)', () => {
//     const store = createTestStore({
//       test: modelReducer('test', { foo: 'bar' }),
//       testForm: formReducer('test', { foo: 'bar' }),
//     });

//     const form = TestUtils.renderIntoDocument(
//       <Provider store={store}>
//         <Control model="test.foo" mapProps={controls.text} component={React.DOM.input} />
//       </Provider>
//     );

//     const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

//     console.log(input);

//   })
// });
