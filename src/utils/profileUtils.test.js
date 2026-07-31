import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRecentActivity, parseInterestList } from './profileUtils.js'

test('parseInterestList trims and filters comma-separated interests', () => {
  assert.deepEqual(parseInterestList(' music, gaming ,   art '), ['music', 'gaming', 'art'])
  assert.deepEqual(parseInterestList(''), [])
})

test('buildRecentActivity uses real timestamps for recent activity entries', () => {
  const now = new Date('2026-07-30T12:00:00.000Z')

  const activity = buildRecentActivity({
    attendingEvents: [{ title: 'Sunset Picnic', rsvp_created_at: '2026-07-30T11:30:00.000Z' }],
    hostedEvents: [{ title: 'Open Mic Night', created_at: '2026-07-30T10:00:00.000Z' }],
    interests: ['music', 'art'],
    userCreatedAt: '2026-07-29T08:00:00.000Z',
    now,
  })

  assert.equal(activity[0].text, "You're attending Sunset Picnic")
  assert.equal(activity[0].relativeTime, '30m ago')
  assert.equal(activity[1].relativeTime, '2h ago')
  assert.equal(activity[2].relativeTime, '1d ago')
})
