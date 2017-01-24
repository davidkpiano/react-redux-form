export default function persistEventWithCallback(callback) {
  return (event, ...args) => {
    if (event && event.persist) {
      event.persist();
    }

    callback(event, ...args);
    return event;
  };
}
