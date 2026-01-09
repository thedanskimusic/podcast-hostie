/**
 * Utility functions for audio URL handling
 */

/**
 * Resolves audio URL for playback
 * For R2 URLs, returns as-is since they're publicly accessible via R2.dev domain
 * For external URLs, returns as-is
 * 
 * Future: Could add signed URL generation for private buckets
 */
export function getAudioUrl(audioUrl: string): string {
  // Check if it's an R2 URL (contains .r2.dev)
  if (audioUrl.includes(".r2.dev")) {
    // R2 public URLs work directly
    return audioUrl;
  }

  // External URLs work directly
  return audioUrl;
}

/**
 * Check if an audio URL is from internal R2 storage
 */
export function isInternalAudio(audioUrl: string): boolean {
  return audioUrl.includes(".r2.dev") || audioUrl.includes("/uploads/");
}
