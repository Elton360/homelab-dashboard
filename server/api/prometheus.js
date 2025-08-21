import axios from 'axios'

import {
  bytesToGB,
  bytesToMB,
  bytesToMbps,
  getPercentUsed,
  oneDayAsMinutes,
} from '../helpers/conversion.js'
import { PROMETHEUS_API_URL } from '../helpers/env.js'

const axiosInstance = axios.create({
  baseURL: `${PROMETHEUS_API_URL}/api/v1`,
  timeout: 5000,
})

const promQuery = async (query, type = 'query', options = {}) => {
  const url = type === 'range' ? '/query_range' : '/query'
  try {
    const { data } = await axiosInstance.get(url, {
      params: { query, ...options },
    })

    if (data.status !== 'success') return []
    return data.data.result
  } catch (err) {
    console.error(`promQuery error (${type}):`, err.message)
    return []
  }
}

const promQLSingle = async (query) => {
  const results = await promQuery(query, 'query')
  return results.length ? parseFloat(results[0].value[1]) : null
}

const promQLAll = async (query) => {
  const results = await promQuery(query, 'query')
  return results.map((r) => ({
    ...r.metric,
    value: parseFloat(r.value[1]),
  }))
}

const promRange = async (query, minutes = oneDayAsMinutes * 3, step = '1h') => {
  const end = Math.floor(Date.now() / 1000)
  const start = end - minutes * 60

  const results = await promQuery(query, 'range', { start, end, step })
  return results[0]?.values.map(([ts, val]) => [ts, parseFloat(val)]) || []
}

const getTimeStampAndValue =
  (formatValue = (val) => val) =>
  ([ts, val]) => ({
    time: new Date(ts * 1000).toISOString(),
    value: formatValue(parseFloat(val)),
  })

const getDiskNameFromMountpoint = (mountpoint) => {
  if (!mountpoint || mountpoint === '/') return 'Main'
  const segments = mountpoint.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  return last.charAt(0).toUpperCase() + last.slice(1)
}

export const getSystemMetrics = async () => {
  try {
    const [
      load = 0,
      cpuUsage = 0,
      totalMem = 0,
      freeMem = 0,
      diskSizes = 0,
      diskFrees = 0,
      uptimeSec = 0,
      cpuTemp = 0,
      cpuHistory = [],
      down = [],
      up = [],
    ] = await Promise.all([
      promQLSingle('node_load1 / count(node_cpu_seconds_total)'),
      promQLSingle(
        '100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)',
      ),
      promQLSingle('node_memory_MemTotal_bytes'),
      promQLSingle('node_memory_MemAvailable_bytes'),
      promQLAll('node_filesystem_size_bytes{fstype!=""}'),
      promQLAll('node_filesystem_avail_bytes{fstype!=""}'),
      promQLSingle('node_time_seconds - node_boot_time_seconds'),
      promQLSingle('node_hwmon_temp_celsius'),
      promRange(
        '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)',
      ),
      promRange(
        'sum(rate(node_network_receive_bytes_total{device!~"^(lo|docker.*|veth.*|br-.*)"}[1m]))',
      ),
      promRange(
        'sum(rate(node_network_transmit_bytes_total{device!~"^(lo|docker.*|veth.*|br-.*)"}[1m]))',
      ),
    ])

    const disks = diskSizes
      .map(({ value, mountpoint, device }) => {
        const free =
          diskFrees.find((f) => f.mountpoint === mountpoint)?.value || 0
        const name = getDiskNameFromMountpoint(mountpoint)
        return {
          name,
          device,
          total: bytesToGB(value),
          free: bytesToGB(free),
          used: bytesToGB(value - free),
          usagePercent: getPercentUsed(value, free),
          isMainDisk: mountpoint === '/',
        }
      })
      .filter(({ total, device }) => total > 5 && device !== '/dev/sr1') // remove noise/disc readers

    return {
      cpu: {
        load: load?.toFixed(2) ?? null,
        usage: cpuUsage !== null ? cpuUsage.toFixed(2) : null,
        temperature: cpuTemp !== null ? cpuTemp.toFixed(1) + ' °C' : 'N/A',
        cpuHistory: cpuHistory.map(getTimeStampAndValue()),
      },

      memory: {
        totalMB: bytesToMB(totalMem, true),
        freeMB: bytesToMB(freeMem, true),
        usedMB: bytesToMB(totalMem - freeMem, true),
        usagePercent: getPercentUsed(totalMem, freeMem),
      },
      disks,
      uptime: {
        seconds: Math.floor(uptimeSec),
        hours: (uptimeSec / 3600).toFixed(1),
        days: (uptimeSec / 86400).toFixed(1),
      },
      network: {
        downloadHistory: down.map(getTimeStampAndValue(bytesToMbps)),
        uploadHistory: up.map(getTimeStampAndValue(bytesToMbps)),
      },
    }
  } catch (err) {
    console.error('Error fetching system metrics:', err)
    throw new Error('Failed to fetch system metrics')
  }
}
