const EVENT_IMAGE_POOL = [
  '/Pictures/Tech%20Mixer.webp',
  '/Pictures/Yoga%20in%20the%20Park.jpeg',
  '/Pictures/Board%20Game%20Night.jpeg',
  '/Pictures/Career%20Fair%20Event.jpg',
  '/Pictures/Career%20Fair%20Event%202.avif',
  '/Pictures/Conference%20Event.png',
  '/Pictures/Conference%20Event%202.png',
  '/Pictures/Concert%20event.jpg',
  '/Pictures/Concert%20two%20event.jpg',
  '/Pictures/Club%20Event.webp',
  '/Pictures/Club%20two%20event.webp',
  '/Pictures/Club%20Three%20Event.webp',
  '/Pictures/Resume%20Review.jpeg',
]

const TITLE_IMAGE_RULES = [
  {
    pattern: /(board game|game night|tabletop)/i,
    image: '/Pictures/Board%20Game%20Night.jpeg',
  },
  {
    pattern: /(tech mixer|career fair|network|coding|developer|code)/i,
    image: '/Pictures/Tech%20Mixer.webp',
  },
  {
    pattern: /(yoga|wellness|fitness|workout)/i,
    image: '/Pictures/Yoga%20in%20the%20Park.jpeg',
  },
  {
    pattern: /(concert|live|music|showcase|dj|club|party)/i,
    image: '/Pictures/Concert%20event.jpg',
  },
  {
    pattern: /(panel|conference|talk|summit|forum)/i,
    image: '/Pictures/Conference%20Event.png',
  },
  {
    pattern: /(study|student|campus|mentor|school)/i,
    image: '/Pictures/Resume%20Review.jpeg',
  },
]

const getTitleMappedImage = (title) => {
  const normalizedTitle = String(title || '').trim()

  if (!normalizedTitle) {
    return null
  }

  const matchedRule = TITLE_IMAGE_RULES.find((rule) => rule.pattern.test(normalizedTitle))
  return matchedRule?.image || null
}

export const resolveEventImage = (event, fallbackIndex = 0, options = {}) => {
  const { preferTitleMatch = false } = options
  const titleImage = getTitleMappedImage(event?.title)

  if (preferTitleMatch && titleImage) {
    return titleImage
  }

  if (String(event?.image_url || '').trim()) {
    return event.image_url
  }

  if (titleImage) {
    return titleImage
  }

  return EVENT_IMAGE_POOL[fallbackIndex % EVENT_IMAGE_POOL.length]
}

export const getLandingSlideshowImages = (events = []) => {
  const resolvedFromEvents = events.map((event, index) => resolveEventImage(event, index, { preferTitleMatch: true }))
  return Array.from(new Set([...resolvedFromEvents, ...EVENT_IMAGE_POOL]))
}
