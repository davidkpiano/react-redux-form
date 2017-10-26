import actions from '../actions';
import _get from '../utils/get';
import getFieldFromState from '../utils/get-field-from-state';
import createControlClass from './control-component-factory';
import { findDOMNode } from 'react-dom';

const defaultStrategy = {
  get: _get,
  getFieldFromState,
  actions,
  findDOMNode,
};


export {
  createControlClass,
};
export default createControlClass(defaultStrategy);
