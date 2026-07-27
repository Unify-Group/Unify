export const handleError = (res, err, fallbackMessage) => {
  const status = err.status || 500
  const message = err.message || fallbackMessage

  return res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      details: err.details || null,
    },
  })
}
