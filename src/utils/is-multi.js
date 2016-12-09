import endsWith from './ends-with';

export default function isMulti(model) {
  return endsWith(model, '[]');
}
