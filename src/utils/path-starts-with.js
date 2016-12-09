import toPath from 'lodash.topath';

export default function pathStartsWith(pathString, subPathString) {
  if (pathString === subPathString) return true;

  const path = toPath(pathString);
  const subPath = toPath(subPathString);

  const startsWithSubPath = subPath.every((segment, index) =>
    path[index] === segment);

  return startsWithSubPath;
}

export function pathDifference(pathString, subPathString) {
  if (pathString === subPathString) return [];

  const path = toPath(pathString);
  const subPath = toPath(subPathString);

  const difference = path.reduce((acc, segment, index) => {
    if (segment === subPath[index]) return acc;

    acc.push(segment);

    return acc;
  }, []);

  return difference;
}
