export const Spinner = ({ label = 'Loading...', size = 'md', centered = false }) => {
  return (
    <div className={`spinner-wrap ${centered ? 'is-centered' : ''}`} role='status' aria-live='polite'>
      <span className={`spinner spinner-${size}`} aria-hidden='true' />
      <span className='spinner-label'>{label}</span>
    </div>
  )
}
