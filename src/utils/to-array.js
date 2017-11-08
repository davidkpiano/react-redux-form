export default function toArray(object) {
  const result = [];
  Object.keys(object).forEach(key => {
    if (object.hasOwnProperty(key)) {
      result.push(object[key]);
    }
  });
  return result;
}
