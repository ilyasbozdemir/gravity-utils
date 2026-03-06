import Tesseract from 'tesseract.js'

export async function extractText(
  imageSource: string | File | Blob,
  lang = 'eng'
): Promise<string> {
  const { data } = await Tesseract.recognize(imageSource, lang, {
    logger: () => {}, // log kapatıldı, UI'a progress göndermek istersen bunu aç
  })
  return data.text
}

export async function extractTextWithProgress(
  imageSource: string | File | Blob,
  onProgress: (pct: number) => void,
  lang = 'eng'
): Promise<string> {
  const { data } = await Tesseract.recognize(imageSource, lang, {
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })
  return data.text
}
