export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
      image.src = url
    })
  
  export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
  }
  
  /**
   * Returns the new bounding area of a rotated rectangle.
   */
  export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)
  
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }
  
  /**
   * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
   */
  export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  targetWidth?: number,
  targetHeight?: number
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  if (targetWidth && targetHeight) {
    // Create a temp canvas to hold the cropped data
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = pixelCrop.width
    tempCanvas.height = pixelCrop.height
    const tempCtx = tempCanvas.getContext('2d')
    
    if (!tempCtx) return null
    tempCtx.putImageData(data, 0, 0)

    // Resize on final canvas
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)
  } else {
    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0)
  }

  // As Base64 string
  return canvas.toDataURL('image/jpeg', 0.95)
}

export async function getFittedImg(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  fillColor = '#000000'
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = targetWidth
  canvas.height = targetHeight

  // Draw background (blur effect or color)
  // For now, let's just do a blurred version of the image as background
  ctx.filter = 'blur(20px)'
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  ctx.filter = 'none'

  // Draw overlay (semi-transparent black to darken blur)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(0, 0, targetWidth, targetHeight)

  // Calculate scaling to fit
  const scale = Math.min(targetWidth / image.width, targetHeight / image.height)
  const x = (targetWidth / 2) - (image.width / 2) * scale
  const y = (targetHeight / 2) - (image.height / 2) * scale

  ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width * scale, image.height * scale)

  return canvas.toDataURL('image/jpeg', 0.95)
}

export async function getMultiPartImg(
  imageSrc: string,
  aspectRatio: number,
  targetWidth?: number,
  targetHeight?: number
): Promise<string[]> {
  const image = await createImage(imageSrc)
  const results: string[] = []
  
  // Calculate how many parts we need
  // Assuming we want to split the *width* based on height and aspect ratio.
  // Part width = Image Height * Aspect Ratio
  const partWidth = image.height * aspectRatio
  const totalParts = Math.ceil(image.width / partWidth)
  
  if (totalParts <= 1) {
      // Just return the image resized or cropped to center? 
      // Actually if it's 1 part, it might just be a normal crop.
      // But let's return the whole image as one part if it fits roughly.
      // Or just 1 slice.
      // Let's force generate cuts.
  }

  for (let i = 0; i < totalParts; i++) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    
    // Determine dimensions for this slice
    // We take a slice of 'partWidth' from the source
    // If we are at the end, we might need to handle overflow, but usually carousels are strict.
    // Let's just crop exactly 'partWidth' x 'image.height' for each section
    
    // Output size
    const outW = targetWidth || partWidth
    const outH = targetHeight || image.height
    
    canvas.width = outW
    canvas.height = outH
    
    // Check if we have enough image left?
    // If not, we might stop or fill. 
    // Standard behavior: Split equally? No, usually 1080x1080 squares.
    // If the last part is too small, we might center it or just crop what's possible.
    
    // Source x
    const srcX = i * partWidth
    // If srcX + partWidth > image.width, we have a partial slice.
    // Most users prefer not to have a tiny slice. 
    // But let's just cut it.
    
    // Draw
    ctx.drawImage(image, 
        srcX, 0, partWidth, image.height, // Source
        0, 0, outW, outH // Dest
    )
    
    results.push(canvas.toDataURL('image/jpeg', 0.95))
  }
  
  return results
}
