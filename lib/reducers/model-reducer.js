'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelReducer = undefined;

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _toPath = require('lodash/toPath');

var _toPath2 = _interopRequireDefault(_toPath);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

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
    var newState = (0, _cloneDeep2.default)(state);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (!localPath.length) {
          return action.value;
        }

        return (0, _set2.default)(newState, localPath, action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return (0, _set2.default)(newState, localPath, (0, _get2.default)(initialState, localPath));

      default:
        return newState;
    }
  };
}

exports.createModelReducer = createModelReducer;