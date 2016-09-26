export default function getModel(model, state) {
  return (typeof model === 'function' && state)
    ? model(state)
    : model;
}
