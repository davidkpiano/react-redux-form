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

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _toPath = require('lodash/toPath');

var _toPath2 = _interopRequireDefault(_toPath);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createModelReducer(model) {
  var initialState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    var path = (0, _toPath2.default)(action.model);

    if (path[0] !== model) {
      return state;
    }

    var localPath = path.slice(1);
    var immutableState = (0, _seamlessImmutable2.default)(state);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (action.model === model) {
          return action.value;
        }

        return immutableState.setIn(localPath, action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return immutableState.setIn(localPath, (0, _get2.default)(initialState, localPath));

      default:
        return immutableState;
    }
  };
}

exports.createModelReducer = createModelReducer;