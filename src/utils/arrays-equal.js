export default function arraysEqual(firstArray, secondArray) {
  return firstArray && secondArray
    && firstArray.length === secondArray.length
    && firstArray.every((item, index) => item === secondArray[index]);
}
