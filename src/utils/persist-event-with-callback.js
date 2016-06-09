export default function persistEventWithCallback(callback) {
  return (event) => {
    if (event && event.persist) {
      event.persist();
    }

    callback(event);
    return event;
  };
}
