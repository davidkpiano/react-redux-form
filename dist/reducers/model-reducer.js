'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var action = arguments[1];

  console.log(action);

  var newState = _extends({}, state);

  switch (action.type) {
    case 'rsf/change':
      if (action.multi) {
        var collection = get(newState, action.model, []);

        set(newState, action.model, xor(collection, [action.value]));
      } else {
        set(newState, action.model, action.value);
      }
  }

  return newState;
};