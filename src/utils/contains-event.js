export default function containsEvent(events, event) {
  if (typeof events === 'string') {
    return events === event;
  }

  return !!~events.indexOf(event);
}
