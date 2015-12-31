
const focus = (model) => ({
  type: 'rsf/focus',
  model
});

const blur = (model) => ({
  type: 'rsf/blur',
  model
});

const validate = (model) => ({
  type: 'rsf/validate',
  model
});

const setPristine = (model) => ({
  type: 'rsf/setPristine',
  model
});

const setDirty = (model) => ({
  type: 'rsf/setDirty',
  model
});

const setInitial = (model) => ({
  type: 'rsf/setInitial',
  model
});

export {
  focus,
  blur,
  validate,
  setPristine,
  setDirty,
  setInitial
}
