export const resizeImageFile = (file, options = {}) => {
  const maxSize = options.maxSize || 960
  const quality = options.quality || 0.84

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Could not read that image file.'))
    reader.onload = () => {
      const image = new Image()

      image.onerror = () => reject(new Error('Could not process that image file.'))
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('Could not prepare image editing.'))
          return
        }

        canvas.width = width
        canvas.height = height
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }

      image.src = typeof reader.result === 'string' ? reader.result : ''
    }

    reader.readAsDataURL(file)
  })
}
