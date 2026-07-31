export const parseInterestList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const formatRelativeTime = (dateValue, now = new Date()) => {
  if (!dateValue) {
    return 'just now'
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'just now'
  }

  const diffMs = now.getTime() - parsedDate.getTime()

  if (diffMs <= 0) {
    return 'just now'
  }

  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m ago`
  }

  if (diffHours < 24) {
    return `${Math.max(1, diffHours)}h ago`
  }

  if (diffDays < 7) {
    return `${Math.max(1, diffDays)}d ago`
  }

  return `${Math.max(1, Math.floor(diffDays / 7))}w ago`
}

export const buildRecentActivity = ({ attendingEvents = [], hostedEvents = [], interests = [], userCreatedAt = null, now = new Date() }) => {
  const activityItems = []

  if (attendingEvents[0]) {
    activityItems.push({
      text: `You're attending ${attendingEvents[0].title}`,
      timestamp: attendingEvents[0].rsvp_created_at || attendingEvents[0].datetime || now.toISOString(),
    })
  }

  if (hostedEvents[0]) {
    activityItems.push({
      text: `${hostedEvents[0].title} is one of your hosted events`,
      timestamp: hostedEvents[0].created_at || hostedEvents[0].datetime || now.toISOString(),
    })
  }

  if (interests.length > 0) {
    activityItems.push({
      text: `Recommendations are tuned to ${interests.slice(0, 2).join(' and ')}`,
      timestamp: userCreatedAt || now.toISOString(),
    })
  }

  if (activityItems.length === 0) {
    return [
      {
        text: 'Your next event activity will show up here.',
        timestamp: now.toISOString(),
      },
      {
        text: 'Invite friends to start building your community.',
        timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
      },
      {
        text: 'Recommended events will appear after you join an event.',
        timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
      },
    ]
  }

  return activityItems.slice(0, 3).map((item) => ({
    ...item,
    relativeTime: formatRelativeTime(item.timestamp, now),
  }))
}
