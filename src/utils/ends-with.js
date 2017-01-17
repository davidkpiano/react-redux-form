export default function endsWith(string, subString) {
  if (typeof string !== 'string') return false;

  const lastIndex = string.lastIndexOf(subString);

  return lastIndex !== -1 && lastIndex + subString.length === string.length;
}
