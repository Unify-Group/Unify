import { pool } from '../config/db.js'

// Mirror past events into an archive dataset so analytics/history can read from a dedicated table.
export const archivePastEvents = async () => {
  await pool.query(
    `
    UPDATE events
    SET archived_at = NOW()
    WHERE archived_at IS NULL
      AND datetime < NOW()
    `,
  )

  await pool.query(
    `
    INSERT INTO events_archive (
      source_event_id,
      title,
      datetime,
      location,
      description,
      image_url,
      attendee_limit,
      organizer_id,
      category_id,
      created_at,
      archived_at
    )
    SELECT
      e.id,
      e.title,
      e.datetime,
      e.location,
      e.description,
      e.image_url,
      e.attendee_limit,
      e.organizer_id,
      e.category_id,
      e.created_at,
      COALESCE(e.archived_at, NOW())
    FROM events e
    WHERE e.datetime < NOW()
    ON CONFLICT (source_event_id) DO UPDATE
    SET
      title = EXCLUDED.title,
      datetime = EXCLUDED.datetime,
      location = EXCLUDED.location,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      attendee_limit = EXCLUDED.attendee_limit,
      organizer_id = EXCLUDED.organizer_id,
      category_id = EXCLUDED.category_id,
      created_at = EXCLUDED.created_at,
      archived_at = EXCLUDED.archived_at
    `,
  )
}
