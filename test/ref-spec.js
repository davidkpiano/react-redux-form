/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { clearGetFormCache } from '../src/utils/get-form';

import { testCreateStore, testRender } from './utils';

import {
  modelReducer,
  formReducer,
  Control,
  Form,
  LocalForm,
} from '../src';

describe('getRef()', () => {
  const components = [
    [Control, 'input'],
    [Form, 'form'],
    [LocalForm, 'form'],
  ];

  const store = testCreateStore({
    test: modelReducer('test', {}),
    testForm: formReducer('test', {}),
  });

  beforeEach(() => {
    clearGetFormCache();
  });

  components.forEach(([RRFComponent, tag]) => {
    it(`should retrieve a component instance from ${RRFComponent.displayName}`, () => {
      let instance;

      function getRef(node) {
        instance = node;
      }

      const control = testRender(
        <RRFComponent
          model="test"
          getRef={getRef}
        />, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(
        control, tag);

      assert.equal(instance, input);
    });
  });
});
