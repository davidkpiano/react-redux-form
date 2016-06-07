export default function compose(...reducers) {
  const nullAction = { type: null };
  const initialState = reducers[reducers.length - 1](undefined, nullAction);

  return (state, action) => reducers.reduceRight((prevState, reducer) =>
    reducer(prevState, action), state);
}
