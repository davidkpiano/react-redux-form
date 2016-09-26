import endsWith from 'lodash/endsWith';

export default function isMulti(model) {
  return endsWith(model, '[]');
}
