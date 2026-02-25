export function formatActivityStatus(isOnline: boolean, lastSeen: number): string {
  // Treat as "online" only when the user reports online and their lastSeen
  // timestamp is very recent (within ONLINE_THRESHOLD_MS). This avoids
  // showing accounts as online long after they were created or when the
  // client that set them online never cleared the status.
  const ONLINE_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutes
  const now = Date.now()
  if (isOnline && lastSeen && now - lastSeen <= ONLINE_THRESHOLD_MS) {
    return 'online'
  }

  if (!lastSeen) {
    return 'offline'
  }

  const diff = now - lastSeen
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'active now'
  }
  if (minutes < 60) {
    return `active ${minutes}m ago`
  }
  if (hours < 24) {
    return `active ${hours}h ago`
  }
  if (days < 7) {
    return `active ${days}d ago`
  }

  // For older timestamps, show the time
  return `active ${new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}
