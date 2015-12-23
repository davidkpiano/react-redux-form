import {curry} from 'lodash/function';
import {endsWith} from 'lodash/string';

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(event) {
  return isEvent(event)
    ? event.target.value
    : event;
}

function isMulti(model) {
  return endsWith(model, '[]');
}

const change = curry((model, value) => ({
  type: `rsf/change`,
  model: model,
  value: getValue(value),
  multi: isMulti(model)
}));

const filter = (model, iteratee = (a) => a) => ({
  type: `rsf/filter`,
  model,
  iteratee: iteratee
});

const map = (model, iteratee = (a) => a) => ({
  type: `rsf/map`,
  model,
  iteratee: iteratee
});

export {
  change,
  filter,
  map
}
