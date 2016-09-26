export default function compose(...reducers) {
  return (state, action) => reducers.reduceRight((prevState, reducer) =>
    reducer(prevState, action), state);
}
