import fieldActions from './field-actions';
import modelActions from './model-actions';
import batchActions from './batch-actions';

const actions = {
  ...fieldActions,
  ...modelActions,
  ...batchActions,
};

export default actions;
