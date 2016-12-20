import toPath from './to-path';

export default function immutableGetFromState(state, modelString, defaultValue) {
  const path = toPath(modelString);

  const val = path.reduce((subState, subPath) => {
    if (!subState || typeof subState === 'string') return subState;

    // Current subState is immutable
    if (typeof subState === 'object' && 'get' in subState) {
      return subState.get(subPath);
    }

    return subState[subPath];
  }, state);

  return val === undefined ? defaultValue : val;
}
