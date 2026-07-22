export const createEvent = async (eventData) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  }

  await fetch('/api/events', options)
}
