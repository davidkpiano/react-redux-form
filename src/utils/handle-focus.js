import isNative from './is-native';

let currentFocusedModel = '';

function handleFocus(fieldValue, node) {
  if (!fieldValue || isNative) return;

  if (fieldValue.focus) {
    if (currentFocusedModel !== fieldValue.model) {
      if (document
        && document.activeElement !== node
        && node.focus
      ) {
        currentFocusedModel = fieldValue.model;
        node.focus();
      }
    }
  }
}

handleFocus.clearCache = () => currentFocusedModel = ''; // eslint-disable-line no-return-assign

export default handleFocus;
