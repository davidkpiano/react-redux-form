function flatten(data) {
  const result = {};
  const delimiter = '.';

  function recurse(cur, prop = '') {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      if (!cur.length) result[prop] = [];

      cur.forEach((item, i) => {
        recurse(cur[i], prop
          ? [prop, i].join(delimiter)
          : `${i}`);
      });
    } else {
      let isEmpty = true;

      for (const key in cur) {
        if (Object.hasOwnProperty.call(cur, key)) {
          isEmpty = false;
          recurse(cur[key], prop
            ? [prop, key].join(delimiter)
            : key);
        }
      }
      if (isEmpty) result[prop] = {};
    }
  }

  recurse(data);

  return result;
}

export default flatten;
