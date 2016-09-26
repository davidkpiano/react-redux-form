import { Children } from 'react';
import shallowEqual from './shallow-equal';

export default function shallowCompareWithoutChildren(instance, nextProps) {
  return !shallowEqual(instance.props, nextProps, ['children'])
    || Children.count(instance.props.children) !== Children.count(nextProps.children);
}
