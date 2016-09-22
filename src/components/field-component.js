import React, { Component, PropTypes } from 'react';

import _get from '../utils/get';
import identity from 'lodash/identity';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import pick from 'lodash/pick';
import connect from 'react-redux/lib/components/connect';

import actions from '../actions';
import Control from './control-component';
import controlPropsMap from '../constants/control-props-map';
import deepCompareChildren from '../utils/deep-compare-children';
import shallowCompareWithoutChildren from '../utils/shallow-compare-without-children';
import getModel from '../utils/get-model';
import getFieldFromState from '../utils/get-field-from-state';
import resolveModel from '../utils/resolve-model';

const fieldPropTypes = {
  model: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]).isRequired,
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
  parser: PropTypes.func,
  updateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  changeAction: PropTypes.func,
  validators: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  asyncValidators: PropTypes.object,
  validateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  asyncValidateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  errors: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  mapProps: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  componentMap: PropTypes.object,
  dynamic: PropTypes.bool,
  dispatch: PropTypes.func,
  getter: PropTypes.func,

  // Calculated props
  fieldValue: PropTypes.object,
};

function mapStateToProps(state, props) {
  const {
    model,
  } = props;

  const modelString = getModel(model, state);
  const fieldValue = getFieldFromState(state, modelString);

  return {
    model: modelString,
    fieldValue,
  };
}

function getControlType(control, props, options) {
  const { controlPropsMap: _controlPropsMap } = options;

  const controlDisplayNames = Object.keys(_controlPropsMap)
    .filter((controlKey) => {
      const propsMap = _controlPropsMap[controlKey];

      if (isPlainObject(propsMap) && propsMap.component) {
        return control.type === propsMap.component;
      }

      return false;
    });

  if (controlDisplayNames.length) return controlDisplayNames[0];

  try {
    let controlDisplayName = control.constructor.displayName
      || control.type.displayName
      || control.type.name
      || control.type;

    if (controlDisplayName === 'input') {
      controlDisplayName = _controlPropsMap[control.props.type] ? control.props.type : 'text';
    }

    return _controlPropsMap[controlDisplayName] ? controlDisplayName : null;
  } catch (error) {
    return undefined;
  }
}

function createFieldClass(customControlPropsMap = {}, defaultProps = {}) {
  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap,
    },
  };

  class Field extends Component {
    shouldComponentUpdate(nextProps) {
      const { dynamic } = this.props;

      if (dynamic) {
        return deepCompareChildren(this, nextProps);
      }

      return shallowCompareWithoutChildren(this, nextProps);
    }

    createControlComponent(control) {
      const { props } = this;

      if (!control
        || !control.props
        || control instanceof Control) {
        return control;
      }

      const controlType = getControlType(control, props, options);
      const {
        mapProps = options.controlPropsMap[controlType],
      } = props;

      const controlProps = pick(props, Object.keys(fieldPropTypes));

      if (!mapProps) {
        return React.cloneElement(
          control,
          null,
          this.mapChildrenToControl(control.props.children)
        );
      }

      return (
        <Control
          {...controlProps}
          control={control}
          controlProps={control.props}
          component={control.type}
          mapProps={mapProps}
        />
      );
    }

    mapChildrenToControl(children) {
      if (React.Children.count(children) > 1) {
        return React.Children.map(
          children,
          (child) => this.createControlComponent(child));
      }

      return this.createControlComponent(children);
    }

    render() {
      const { props } = this;
      const {
        component,
        children, // eslint-disable-line react/prop-types
        fieldValue,
      } = props;


      const allowedProps = omit(props, Object.keys(fieldPropTypes));
      const renderableChildren = typeof children === 'function'
        ? children(fieldValue)
        : children;

      return React.createElement(
        component,
        allowedProps,
        React.Children.map(
          renderableChildren,
          (child) => this.createControlComponent(child)));
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    Field.propTypes = fieldPropTypes;
  }

  Field.defaultProps = {
    updateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: actions.change,
    dynamic: true,
    component: 'div',
    ...defaultProps,
  };

  return resolveModel(connect(mapStateToProps)(Field));
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
