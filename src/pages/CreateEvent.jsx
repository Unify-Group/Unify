export const CreateEvent = () => {
  return (
    <form action=''>
      <label htmlFor='title'>Title</label>
      <input type='text' id='title' name='title' maxLength={80} required />

      <label htmlFor='location'>Location</label>
      <input type='text' id='location' name='location' maxLength={255} required />

      <label htmlFor='datetime'>Date & Time</label>
      <input type='datetime-local' id='datetime' name='datetime' required />

      <label htmlFor='description'>Description</label>
      <textarea id='description' name='description' required></textarea>
      <button type='submit'>Create Event</button>
    </form>
  )
}
