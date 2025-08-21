export const oneDayAsMinutes = 24 * 60

export const bytesToMB = (bytes, int) =>
  (bytes / (1024 * 1024)).toFixed(int ? 0 : 2)

export const bytesToGB = (bytes, int) =>
  (bytes / (1024 * 1024 * 1024)).toFixed(int ? 0 : 2)

export const getPercentUsed = (total, free) =>
  total > 0 ? (((total - free) / total) * 100).toFixed(2) : 'N/A'

export const bytesToMbps = (bytes, int) => {
  const bits = bytes * 8
  const megabits = bits / 1_000_000
  return megabits.toFixed(int ? 0 : 2)
}

export const nowInSeconds = () => Math.floor(Date.now() / 1000)
