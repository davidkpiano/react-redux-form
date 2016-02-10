import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

chai.use(chaiSubset);

const { assert } = chai;

import {
  Field,
  createFieldClass,
  actions,
  createFormReducer,
  createModelReducer,
  controlPropsMap
} from '../lib';

describe('custom <Field /> components', () => {
  const CustomField = createFieldClass({
    'CustomText': (props) => ({
      customOnChange: props.onChange
    })
  });

  class CustomText extends React.Component {
    handleChange(e) {
      let { customOnChange } = this.props;
      let value = e.target.value.toUpperCase();

      customOnChange(value);
    }
    render() {
      let { customOnChange } = this.props;

      return (
        <div>
          <input onChange={(e) => this.handleChange(e)} />
        </div>
      );
    }
  }

  it('should handle custom prop mappings', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { foo: 'bar' })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <CustomText />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'TESTING');
  });
})
