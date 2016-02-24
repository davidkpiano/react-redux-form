'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelReducer = exports.createModeler = undefined;

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

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

function icepickSet(state, path, value) {
  return _icepick2.default.setIn(state, path, value);
}

function createModeler() {
  var getter = arguments.length <= 0 || arguments[0] === undefined ? _get3.default : arguments[0];
  var setter = arguments.length <= 1 || arguments[1] === undefined ? icepickSet : arguments[1];
  var initialModelState = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return function createModelReducer(model) {
    var initialState = arguments.length <= 1 || arguments[1] === undefined ? initialModelState : arguments[1];

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

          if ((0, _isEqual2.default)(getter(state, localPath), action.value)) {
            return state;
          }

          return setter(state, localPath, action.value);

        case actionTypes.RESET:
          if (!localPath.length) {
            return initialState;
          }

          if ((0, _isEqual2.default)(getter(state, localPath), getter(initialState, localPath))) {
            return state;
          }

          return setter(state, localPath, getter(initialState, localPath));

        default:
          return state;
      }
    };
  };
}

var createModelReducer = createModeler();

exports.createModeler = createModeler;
exports.createModelReducer = createModelReducer;