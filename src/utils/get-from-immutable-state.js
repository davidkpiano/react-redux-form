import toPath from './to-path';

export default function immutableGetFromState(state, modelString, defaultValue) {
  const path = toPath(modelString);

  let val = path.reduce((subState, subPath) => {
    if (!subState || typeof subState === 'string') return subState;

    // Current subState is immutable
    if (typeof subState === 'object' && 'get' in subState) {
      return subState.get(subPath);
    }

    // Current subState is a plain object/array
    return subState[subPath];
  }, state);

  return val === undefined ? defaultValue : val;
}
