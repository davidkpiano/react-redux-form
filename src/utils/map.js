import arrayMap from 'lodash/_arrayMap';
import baseMap from 'lodash/_baseMap';

export default function map(values, iteratee) {
  const func = Array.isArray(values)
    ? arrayMap
    : baseMap;

  return func(values, iteratee);
}
