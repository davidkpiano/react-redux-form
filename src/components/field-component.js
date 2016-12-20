import React, { Component, PropTypes } from 'react';

import _get from '../utils/get';
import identity from '../utils/identity';
import omit from '../utils/omit';
import isPlainObject from '../utils/is-plain-object';
import pick from '../utils/pick';
import { connect } from 'react-redux';
import invariant from 'invariant';

import actions from '../actions';
import Control from './control-component';
import controlPropsMap from '../constants/control-props-map';
import deepCompareChildren from '../utils/deep-compare-children';
import shallowCompareWithoutChildren from '../utils/shallow-compare-without-children';
import getModel from '../utils/get-model';
import getFieldFromState from '../utils/get-field-from-state';
import resolveModel from '../utils/resolve-model';
import initialFieldState from '../constants/initial-field-state';

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
  getRef: PropTypes.func,

  // Calculated props
  fieldValue: PropTypes.object,
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),
};

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

const defaultStrategy = {
  Control,
  controPropTypes: fieldPropTypes,
  getFieldFromState,
  actions,
};

function createFieldClass(customControlPropsMap = {}, s = defaultStrategy) {
  // Use the fieldPropTypes if no controlProptypes have been defined to
  // maintain backwards compatibiltiy.
  const controlPropTypes = s.controPropTypes || fieldPropTypes;

  function mapStateToProps(state, props) {
    const {
      model,
    } = props;

    const modelString = getModel(model, state);
    const fieldValue = s.getFieldFromState(state, modelString)
      || initialFieldState;

    return {
      model: modelString,
      fieldValue,
    };
  }

  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap,
    },
  };

  // TODO: refactor
  const defaultControlPropsMap = {
    checkbox: {
      changeAction: s.actions.checkWithValue,
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

      const controlProps = pick(props, Object.keys(controlPropTypes));

      if (!mapProps) {
        return React.cloneElement(
          control,
          null,
          this.mapChildrenToControl(control.props.children)
        );
      }

      return React.createElement(
        s.Control,
        {
          ...controlProps,
          control,
          controlProps: control.props,
          component: control.type,
          mapProps,
          ...(defaultControlPropsMap[controlType] || {}),
        });
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
      const {
        component,
        children, // eslint-disable-line react/prop-types
        fieldValue,
      } = this.props;


      const allowedProps = omit(this.props, Object.keys(controlPropTypes));
      const renderableChildren = typeof children === 'function'
        ? children(fieldValue)
        : children;

      if (!component) {
        invariant(React.Children.count(renderableChildren) === 1,
          'Empty wrapper components for <Field> are only possible'
          + 'when there is a single child. Please check the children'
          + `passed into <Field model="${this.props.model}">.`);

        return this.createControlComponent(renderableChildren);
      }

      return React.createElement(
        component,
        allowedProps,
        this.mapChildrenToControl(renderableChildren));
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
  };

  return resolveModel(connect(mapStateToProps)(Field));
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
