'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelReducer = undefined;

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _icepick = require('icepick');

var _icepick2 = _interopRequireDefault(_icepick);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _toPath = require('lodash/toPath');

var _toPath2 = _interopRequireDefault(_toPath);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createModelReducer(model) {
  var initialState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var modelPath = (0, _toPath2.default)(model);

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    if (!action.model) return state;

    var path = (0, _toPath2.default)(action.model);

    if (!(0, _isEqual2.default)(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    var localPath = path.slice(modelPath.length);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (!localPath.length) {
          return action.value;
        }

        return _icepick2.default.setIn(state, localPath, action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return _icepick2.default.setIn(state, localPath, (0, _get2.default)(initialState, localPath));

      default:
        return state;
    }
  };
}

exports.createModelReducer = createModelReducer;