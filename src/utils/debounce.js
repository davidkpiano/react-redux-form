export default function debounce(func, delay) {
  let timeout;

  return (...args) => {
    const later = () => {
      timeout = null;
      func.apply(null, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}
