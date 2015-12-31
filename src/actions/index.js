import * as fieldActions from './field-actions';
import * as modelActions from './model-actions';

const actions = {
  ...fieldActions,
  ...modelActions
};

export default actions;
