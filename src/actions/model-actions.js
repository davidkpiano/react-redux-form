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
  method: 'change',
  model,
  value: getValue(value),
  multi: isMulti(model)
}));

const toggle = (model, value) => ({
  type: `rsf/change`,
  method: 'toggle',
  model,
  value: getValue(value)
})

const filter = (model, iteratee = (a) => a) => ({
  type: `rsf/change`,
  method: 'filter',
  model,
  iteratee
});

const map = (model, iteratee = (a) => a) => ({
  type: `rsf/change`,
  method: 'map',
  model,
  iteratee
});

export {
  change,
  toggle,
  filter,
  map
}
