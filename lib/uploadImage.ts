/**
 * Upload an image file to the server.
 * Returns the public URL path (e.g. "/uploads/menu_123.jpg")
 * which works consistently on localhost AND on VPS.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error || 'Upload failed')
  }

  const data = await res.json()
  return data.url as string
}

/**
 * Delete an old image from the server when replacing it.
 * Only deletes files inside /uploads/ — safe.
 */
export async function deleteImage(url: string): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return

  await fetch('/api/delete-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).catch(() => {
    // Non-critical — don't throw if delete fails
    console.warn('Could not delete old image:', url)
  })
}
