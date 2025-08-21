// Resolves to src/internal/services.jsx in `--mode internal` builds, and to
// src/internal.empty.js otherwise (see vite.config.js)
// eslint-disable-next-line import/no-unresolved
import addInternalServices from '@internal-services'

import {
  ImmichIcon,
  JellyfinIcon,
  NextcloudIcon,
  PiholeIcon,
  PortainerIcon,
  WarningIcon,
} from '../icons/Icons.jsx'

const BASE_URL = import.meta.env.VITE_BASE_URL

// Only Jellyfin is exposed as an external link on the public dashboard
const JELLYFIN_URL = `${BASE_URL}/jellyfin`

export const makeServicesConfig = (data) => {
  const containers = data?.containers || []
  const totalContainers = containers.length
  const onlineContainers = containers.filter((c) => c.online).length
  const offlineContainers = totalContainers - onlineContainers

  const pihole = data?.piholeSummary || {}

  const onlineContainerIds = new Set(
    containers.filter((c) => c.online).map((c) => c.name.toLowerCase()),
  )

  const jellyfin = data?.jellyfin || []

  const services = [
    {
      id: 'portainer',
      title: 'Portainer',
      description: 'All Containers found on the server',
      icon: <PortainerIcon />,
      grid: { column: '1 / span 4', row: '2' },
      stats: [
        { label: 'Running', value: onlineContainers },
        { label: 'Stopped', value: offlineContainers },
        { label: 'Total', value: totalContainers },
      ],
      online: onlineContainerIds.has('portainer'),
    },
    {
      id: 'pihole',
      title: 'Pi-Hole',
      description: 'Network-wide ad blocking',
      icon: <PiholeIcon />,
      grid: { column: '1 / span 4', row: '1' },
      stats: [
        { label: 'Total Queries', value: pihole.totalQueries || 0 },
        {
          label: 'Percent Blocked',
          value: Math.round(pihole.percentBlocked) || 0,
        },
        { label: 'Top Blocked', value: pihole.topBlocked || '-' },
        { label: 'Top Client', value: pihole.topClient || '-' },
      ],
      online: onlineContainerIds.has('pihole'),
    },
    {
      id: 'jellyfin',
      title: 'Jellyfin',
      description: 'Media Server: Anime, Cartoons, Movies, Shows etc.',
      icon: <JellyfinIcon />,
      href: JELLYFIN_URL,
      grid: { column: '1 / span 4', row: '3' },
      stats: jellyfin.map(({ count, name }) => ({ label: name, value: count })),
      online: onlineContainerIds.has('jellyfin'),
    },
    {
      id: 'immich',
      title: 'Immich',
      description: 'Photo and Video Backup Solution',
      icon: <ImmichIcon />,
      grid: { column: '5 / span 4', row: '3' },
      stats: [],
      online: onlineContainerIds.has('immich_server'),
    },
    {
      id: 'nextcloud',
      title: 'Nextcloud',
      description: 'Self-hosted file sync and share',
      icon: <NextcloudIcon />,
      grid: { column: '9 / span 4', row: '3' },
      stats: [],
      online: onlineContainerIds.has('nextcloud'),
    },
    {
      id: 'alerts',
      title: 'Alerts',
      description: 'Monitor and manage alerts',
      icon: <WarningIcon />,
      grid: { column: '1 / span 4', row: '4' },
      stats: [],
    },
  ]

  return addInternalServices(services, { BASE_URL, onlineContainerIds })
}
