import toPath from 'lodash/toPath';

export default function pathStartsWith(pathString, subPathString) {
  if (pathString === subPathString) return true;

  const path = toPath(pathString);
  const subPath = toPath(subPathString);

  const startsWithSubPath = subPath.every((segment, index) =>
    path[index] === segment);

  return startsWithSubPath;
}
