import { getJellyfinLibraries } from '../../api/jellyfin.js'
import { getPiholeSummary } from '../../api/pihole.js'
import { getContainers } from '../../api/portainer.js'
import { getSystemMetrics } from '../../api/prometheus.js'

export default {
  Query: {
    containers: () => getContainers(),
    piholeSummary: () => getPiholeSummary(),
    system: () => getSystemMetrics(),
    jellyfin: () => getJellyfinLibraries(),
  },
}
