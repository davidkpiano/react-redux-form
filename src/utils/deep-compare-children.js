import React from 'react';
import shallowCompare from 'react/lib/shallowCompare';
import shallowEqual from './shallow-equal';

function compareChildren(props, nextProps) {
  const { children } = props;
  const { children: nextChildren } = nextProps;

  // If the number of children changed, then children are different.
  // If there are no children, use shallowCompare in parent function
  // to determine if component should update (false && true == false)
  if ((React.Children.count(children) !== React.Children.count(nextChildren))
    || !React.Children.count(children)
    || !React.Children.count(nextChildren)) {
    return true;
  }

  const childrenArray = React.Children.toArray(children);
  const nextChildrenArray = React.Children.toArray(nextChildren);

  return [].concat(childrenArray)
    .some((child, i) => {
      const nextChild = nextChildrenArray[i];

      if (!child.props || !nextChild.props) {
        return !shallowEqual(child, nextChild);
      }

      /* eslint-disable no-use-before-define */
      return deepCompareChildren(child, nextChild.props, nextChild.state);
    });
}

export default function deepCompareChildren(instance, nextProps, nextState) {
  if (!instance.props.children) return shallowCompare(instance, nextProps, nextState);

  return shallowCompare(instance, nextProps, nextState)
    && compareChildren(instance.props, nextProps);
}
