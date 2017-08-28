/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';

import { testCreateStore, testRender } from './utils';

import {
  modelReducer,
  formReducer,
} from '../src';

import ComponentWrapper from '../src/components/control-strip-defaults-component';

describe('<ComponentWrapper> component', () => {
  describe('existence check', () => {
    it('should exist', () => {
      assert.ok(ComponentWrapper);
    });
  });
  describe('should give proper references', () => {
    const store = testCreateStore({
      test: modelReducer('test', {}),
      testForm: formReducer('test', {}),
    });

    let instance;

    function getRef(node) {
      instance = node;
    }

    it('should give a ref', () => {
      const control = testRender(
        <ComponentWrapper
          component="input"
          getRef={getRef}
        />, store);
      const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');

      assert.equal(instance, input);
    });
  });
  describe('should prevent the defaultValue and defaultChecked from propagating', () => {
    const store = testCreateStore({
      test: modelReducer('test', {}),
      testForm: formReducer('test', {}),
    });
    describe('Text components', () => {
      it('should still allow default values on basic input elements', () => {
        const control = testRender(
          <input
            defaultValue="blah"
          />, store);
        const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');
        assert.equal(input.defaultValue, 'blah');
      });
      it('should work on basic input component', () => {
        const control = testRender(
          <ComponentWrapper
            component="input"
            defaultValue="blah"
          />, store);
        const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');
        assert.equal(input.defaultValue, '');
      });
      const TEXT_TYPES = ['email', 'password', 'tel', 'text', 'url'];
      TEXT_TYPES.forEach((type) => {
        it(`should work on all text input component types: ${type}`, () => {
          const control = testRender(
            <ComponentWrapper
              component="input"
              type={type}
              defaultValue="blah"
            />, store);
          const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');
          assert.equal(input.defaultValue, '');
        });
      });
    });
    describe('Checkbox component', () => {
      it('should work on basic default checked checkbox component', () => {
        const control = testRender(
          <ComponentWrapper
            component="input"
            type="checkbox"
            defaultChecked
          />, store);
        const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');
        assert.equal(input.defaultChecked, false);
      });
      it('should work on basic default unchecked checkbox component', () => {
        const control = testRender(
          <ComponentWrapper
            component="input"
            type="checkbox"
            defaultChecked={false}
          />, store);
        const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');
        assert.equal(input.defaultChecked, false);
      });
    });
  });
});
