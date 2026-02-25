export function formatActivityStatus(isOnline: boolean, lastSeen: number): string {
  if (isOnline) {
    return 'online'
  }

  if (!lastSeen) {
    return 'offline'
  }

  const now = Date.now()
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
