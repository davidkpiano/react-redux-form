import fieldActions from './field-actions';
import modelActions from './model-actions';
import batch from './batch-actions';

const actions = {
  ...fieldActions,
  ...modelActions,
  batch,
};

export default actions;
