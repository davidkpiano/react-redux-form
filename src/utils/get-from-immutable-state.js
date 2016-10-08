import toPath from './to-path';

export default function immutableGetFromState(state, modelString) {
  const path = toPath(modelString);

  return path.reduce((subState, subPath) => {
    if (!subState || typeof subState === 'string') return subState;

    // Current subState is immutable
    if ('get' in subState) {
      return subState.get(subPath);
    }

    // Current subState is a plain object/array
    return subState[subPath];
  }, state);
}
