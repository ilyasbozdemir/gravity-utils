export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })
  
  export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
  }
  
  export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)
    return {
      width:  Math.abs(Math.cos(rotRad) * width)  + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width)  + Math.abs(Math.cos(rotRad) * height),
    }
  }

  /**
   * Estimate the final JPEG file size in bytes based on:
   * - pixel count (w × h)
   * - JPEG quality factor (0–1)
   *
   * Empirical formula: ~0.2–0.4 bytes/pixel at quality 0.9 for natural photos.
   * We use 0.3 bytes/pixel as the baseline at q=1.0, scaled by quality.
   *
   * This is an approximation; actual size varies with image complexity.
   */
  export function estimateJpegSize(width: number, height: number, quality: number): number {
    const pixels = width * height
    // Coefficients tuned for typical natural photos
    // At q=0.95 → ~0.28 B/px, at q=0.7 → ~0.12 B/px, at q=0.5 → ~0.07 B/px
    const bytesPerPixel = 0.30 * quality * quality // quadratic: quality has more impact at higher values
    return Math.round(pixels * bytesPerPixel)
  }

  export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    targetWidth?: number,
    targetHeight?: number,
    quality = 0.92
  ): Promise<string | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
  
    if (!ctx) return null
  
    const rotRad = getRadianAngle(rotation)
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)
  
    canvas.width  = bBoxWidth
    canvas.height = bBoxHeight
  
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.translate(-image.width / 2, -image.height / 2)
    ctx.drawImage(image, 0, 0)
  
    const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)
  
    if (targetWidth && targetHeight) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width  = pixelCrop.width
      tempCanvas.height = pixelCrop.height
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return null
      tempCtx.putImageData(data, 0, 0)
  
      canvas.width  = targetWidth
      canvas.height = targetHeight
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)
    } else {
      canvas.width  = pixelCrop.width
      canvas.height = pixelCrop.height
      ctx.putImageData(data, 0, 0)
    }
  
    return canvas.toDataURL('image/jpeg', quality)
  }
  
  export async function getFittedImg(
    imageSrc: string,
    targetWidth: number,
    targetHeight: number,
    quality = 0.92
  ): Promise<string | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
  
    canvas.width  = targetWidth
    canvas.height = targetHeight
  
    ctx.filter = 'blur(20px)'
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
    ctx.filter = 'none'
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, targetWidth, targetHeight)
  
    const scale = Math.min(targetWidth / image.width, targetHeight / image.height)
    const x = (targetWidth / 2)  - (image.width / 2)  * scale
    const y = (targetHeight / 2) - (image.height / 2) * scale
  
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width * scale, image.height * scale)
  
    return canvas.toDataURL('image/jpeg', quality)
  }
  
  export async function getMultiPartImg(
    imageSrc: string,
    aspectRatio: number,
    targetWidth?: number,
    targetHeight?: number,
    quality = 0.92
  ): Promise<string[]> {
    const image = await createImage(imageSrc)
    const results: string[] = []
    
    const partWidth = image.height * aspectRatio
    const totalParts = Math.ceil(image.width / partWidth)
    
    for (let i = 0; i < totalParts; i++) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      
      const outW = targetWidth  || Math.round(partWidth)
      const outH = targetHeight || image.height
      
      canvas.width  = outW
      canvas.height = outH

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, i * partWidth, 0, partWidth, image.height, 0, 0, outW, outH)
      
      results.push(canvas.toDataURL('image/jpeg', quality))
    }
    
    return results
  }
