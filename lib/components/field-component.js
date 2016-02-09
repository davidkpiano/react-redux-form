'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _capitalize = require('lodash/capitalize');

var _capitalize2 = _interopRequireDefault(_capitalize);

var _identity = require('lodash/identity');

var _identity2 = _interopRequireDefault(_identity);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _partial = require('lodash/partial');

var _partial2 = _interopRequireDefault(_partial);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _modelActions = require('../actions/model-actions');

var _fieldActions = require('../actions/field-actions');

var _controlComponent = require('./control-component');

var _controlComponent2 = _interopRequireDefault(_controlComponent);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function selector(state, _ref) {
  var model = _ref.model;

  return {
    model: model,
    modelValue: (0, _get2.default)(state, model)
  };
}

var controlPropsMap = {
  'text': function text(props) {
    return {
      name: props.model,
      defaultValue: props.modelValue
    };
  },
  'textarea': function textarea(props) {
    return {
      name: props.model,
      defaultValue: props.modelValue
    };
  },
  'checkbox': function checkbox(props) {
    return {
      name: props.model,
      checked: (0, _utils.isMulti)(props.model) ? (props.modelValue || []).filter(function (item) {
        return (0, _isEqual2.default)(item, props.value);
      }).length : !!props.modelValue
    };
  },
  'radio': function radio(props) {
    return {
      name: props.model,
      checked: (0, _isEqual2.default)(props.modelValue, props.value),
      value: props.value
    };
  },
  'select': function select(props) {
    return {
      name: props.model,
      value: props.modelValue
    };
  },
  'default': function _default(props) {
    return {};
  }
};

var changeMethod = function changeMethod(model, value) {
  var action = arguments.length <= 2 || arguments[2] === undefined ? _modelActions.change : arguments[2];
  var parser = arguments.length <= 3 || arguments[3] === undefined ? _identity2.default : arguments[3];

  return (0, _redux.compose)((0, _partial2.default)(action, model), parser, _utils.getValue);
};

var isReadOnlyValue = function isReadOnlyValue(control) {
  return control.type == 'input' && ~['radio', 'checkbox'].indexOf(control.props.type);
};

var controlActionMap = {
  'checkbox': function checkbox(props) {
    return (0, _utils.isMulti)(props.model) ? _modelActions.xor : _modelActions.toggle;
  },
  'default': function _default() {
    return _modelActions.change;
  }
};

function getControlType(control, mapping) {
  var mappedControlType = mapping[control.type.name] || control.type;

  var controlType = mappedControlType === 'input' ? control.props.type : mappedControlType;

  if (!controlType || !(0, _isString2.default)(controlType)) {
    controlType = control.type.propTypes && control.type.propTypes.onChange ? 'text' : null;
  }

  if (!controlPropsMap[controlType]) {
    controlType = control.type === 'input' ? 'text' : null;
  }

  return controlType;
}

function createFieldProps(control, props, mapping) {
  var model = props.model;
  var modelValue = props.modelValue;

  var value = control.props.value;

  var defaultProps = {};

  var controlType = props.type || getControlType(control, mapping);

  if (!controlType) {
    return false;
  }

  var controlProps = _extends({}, defaultProps, controlPropsMap[controlType]({
    model: model,
    modelValue: modelValue,
    value: value
  }), sequenceEventActions(control, props, mapping));

  return controlProps;
}

function sequenceEventActions(control, props, mapping) {
  var dispatch = props.dispatch;
  var model = props.model;

  var controlType = props.type || getControlType(control, mapping);
  var value = control.props.value;

  var updateOn = typeof props.updateOn === 'function' ? 'onChange' : 'on' + (0, _capitalize2.default)(props.updateOn || 'change');
  var validateOn = 'on' + (0, _capitalize2.default)(props.validateOn || 'change');
  var asyncValidateOn = 'on' + (0, _capitalize2.default)(props.asyncValidateOn || 'blur');

  var updaterFn = typeof updater === 'function' ? updater : _identity2.default;

  var eventActions = {
    onFocus: [function () {
      return dispatch((0, _fieldActions.focus)(model));
    }],
    onBlur: [function () {
      return dispatch((0, _fieldActions.blur)(model));
    }],
    onChange: []
  };

  var controlAction = (controlActionMap[controlType] || controlActionMap.default)(props);

  var controlChangeMethod = changeMethod(model, props.value, controlAction, props.parser);

  var dispatchChange = control.props.hasOwnProperty('value') && isReadOnlyValue(control) ? function () {
    return dispatch(controlChangeMethod(value));
  } : function (e) {
    return dispatch(controlChangeMethod(e));
  };

  eventActions[updateOn].push(updaterFn(dispatchChange));

  if (props.validators) {
    var dispatchValidate = function dispatchValidate(value) {
      var validity = (0, _mapValues2.default)(props.validators, function (validator) {
        return validator((0, _utils.getValue)(value));
      });

      dispatch((0, _fieldActions.setValidity)(model, validity));

      return value;
    };

    eventActions[validateOn].push(dispatchValidate);
  }

  if (props.asyncValidators) {
    var dispatchAsyncValidate = function dispatchAsyncValidate(value) {
      (0, _mapValues2.default)(props.asyncValidators, function (validator, key) {
        return dispatch((0, _fieldActions.asyncSetValidity)(model, function (_, done) {
          var outerDone = function outerDone(valid) {
            return done(_defineProperty({}, key, valid));
          };

          validator((0, _utils.getValue)(value), outerDone);
        }));
      });

      return value;
    };

    eventActions[asyncValidateOn].push(dispatchAsyncValidate);
  }

  return (0, _mapValues2.default)(eventActions, function (actions) {
    return _redux.compose.apply(undefined, _toConsumableArray(actions));
  });
}

function createField(control, props, mapping) {
  if (!control || !control.props || Object.hasOwnProperty(control.props, 'modelValue')) return control;

  var controlProps = createFieldProps(control, props, mapping);
  var eventActions = sequenceEventActions(control, props, mapping);

  if (!controlProps) {
    return _react2.default.cloneElement(control, {
      children: _react2.default.Children.map(control.props.children, function (child) {
        return createField(child, _extends({}, props, child.props), mapping);
      })
    });
  }

  return _react2.default.createElement(_controlComponent2.default, _extends({}, controlProps, {
    modelValue: props.modelValue,
    control: control }));
}

var Field = function (_React$Component) {
  _inherits(Field, _React$Component);

  function Field() {
    _classCallCheck(this, Field);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Field).call(this));

    _this.controlMapping = {};
    return _this;
  }

  _createClass(Field, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var props = this.props;


      if (props.children.length > 1) {
        return _react2.default.createElement(
          'div',
          props,
          _react2.default.Children.map(props.children, function (child) {
            return createField(child, props, _this2.controlMapping);
          })
        );
      }

      return createField(_react2.default.Children.only(props.children), props, this.controlMapping);
    }
  }]);

  return Field;
}(_react2.default.Component);

Field.propTypes = {
  model: _react2.default.PropTypes.string.isRequired,
  updateOn: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.oneOf(['change', 'blur', 'focus'])]),
  validators: _react2.default.PropTypes.object,
  asyncValidators: _react2.default.PropTypes.object,
  parser: _react2.default.PropTypes.func,
  control: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.oneOf(Object.keys(controlPropsMap))])
};

Field.mapControls = function (mapping) {
  return (0, _reactRedux.connect)(selector)(function (_Field) {
    _inherits(CustomField, _Field);

    function CustomField() {
      _classCallCheck(this, CustomField);

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(CustomField).call(this));

      _this3.controlMapping = mapping;
      return _this3;
    }

    return CustomField;
  }(Field));
};

exports.default = (0, _reactRedux.connect)(selector)(Field);