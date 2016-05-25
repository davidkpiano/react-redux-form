// export default function compareKeys(prevObject, nextObject) {
//   const keys = {};
//   const removeKeys = [];
//   const addKeys = [];

//   Object.keys(prevObject).forEach((key) => {
//     // potentially non-existing key
//     keys[key] = false;
//   });

//   Object.keys(nextObject).forEach((key) => {
//     if (!{}.hasOwnProperty.call(keys, key)) {
//       // new key
//       addKeys.push(key);
//     } else {
//       // existing key
//       keys[key] = true;
//     }
//   });

//   Object.keys(keys).forEach((key) => {
//     const existing = keys[key];

//     if (!existing) {
//       removeKeys.push(key);
//     }
//   });

//   return {
//     remove: removeKeys,
//     add: addKeys,
//   };
// }
