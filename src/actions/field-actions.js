import get from 'lodash/object/get';

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

const setPending = (model, pending = true) => ({
  type: 'rsf/setPending',
  model,
  pending
});

const setValidity = (model, validity) => ({
  type: 'rsf/setValidity',
  model,
  validity
});

const asyncSetValidity = (model, validator) => {
  return (dispatch, getState) => {
    let value = get(getState(), model);

    dispatch(setPending(model, true));

    const done = (validity) => {
      dispatch(setValidity(model, validity));
      dispatch(setPending(model, false));
    };

    let immediateResult = validator(value, done);

    if (typeof immediateResult !== 'undefined') {
      done(immediateResult);
    }
  }
}

const setSubmitted = (model, submitted = true) => ({
  type: 'rsf/setSubmitted',
  model,
  submitted
});

export {
  focus,
  blur,
  validate,
  setPristine,
  setDirty,
  setInitial,
  setValidity,
  asyncSetValidity,
  setPending,
  setSubmitted
}
