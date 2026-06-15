const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)$/

export type ContentImage = {
  alt: string
  src: string
}

export type ContentSegment =
  | { type: 'markdown'; value: string }
  | { type: 'gallery'; images: ContentImage[] }

/** Split markdown into text blocks and consecutive image galleries. */
export function parseContentSegments(content: string): ContentSegment[] {
  const blocks = content.split(/\n\n+/)
  const segments: ContentSegment[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    const images: ContentImage[] = []
    let allImages = true

    for (const line of lines) {
      const match = line.match(IMAGE_LINE)
      if (match) {
        images.push({ alt: match[1], src: match[2] })
      } else {
        allImages = false
        break
      }
    }

    if (allImages && images.length > 0) {
      segments.push({ type: 'gallery', images })
    } else {
      segments.push({ type: 'markdown', value: block })
    }
  }

  return segments
}
