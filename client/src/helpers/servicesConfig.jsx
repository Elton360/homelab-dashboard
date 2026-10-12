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
const IS_INTERNAL_BUILD = import.meta.env.MODE === 'internal'

// noah.attlocal.net -> noah; IP addresses are left as they are
const shortHostname = (name) =>
  name && !/^[\d.]+$/.test(name) ? name.split('.')[0] : name

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
      description: 'Ad blocking DNS',
      icon: <PiholeIcon />,
      grid: { column: '1 / span 4', row: '1' },
      stats: [
        // '-' rather than 0 when Pi-hole couldn't be read
        { label: 'Total Queries', value: pihole.totalQueries ?? '-' },
        {
          label: 'Percent Blocked',
          value:
            pihole.percentBlocked == null
              ? '-'
              : Math.round(pihole.percentBlocked),
        },
        // Per-device details stay off the public dashboard
        ...(IS_INTERNAL_BUILD
          ? [
              { label: 'Top Blocked', value: pihole.topBlocked || '-' },
              {
                label: 'Top Client',
                value: pihole.topClient || '-',
                display: shortHostname(pihole.topClient),
              },
            ]
          : []),
      ],
      online: onlineContainerIds.has('pihole'),
    },
    {
      id: 'immich',
      title: 'Immich',
      description: 'Photo and Video Backup Solution',
      icon: <ImmichIcon />,
      grid: { column: '1 / span 4', row: '3' },
      stats: [],
      online: onlineContainerIds.has('immich_server'),
    },
    {
      id: 'nextcloud',
      title: 'Nextcloud',
      description: 'Self-hosted file sync and share',
      icon: <NextcloudIcon />,
      grid: { column: '5 / span 4', row: '3' },
      stats: [],
      online: onlineContainerIds.has('nextcloud'),
    },
    {
      id: 'jellyfin',
      title: 'Jellyfin',
      description: 'Media Server: Anime, Cartoons, Movies, Shows etc.',
      icon: <JellyfinIcon />,
      href: JELLYFIN_URL,
      grid: { column: '9 / span 4', row: '3' },
      // Library counts only on the internal dashboard
      stats: IS_INTERNAL_BUILD
        ? jellyfin.map(({ count, name }) => ({ label: name, value: count }))
        : [],
      online: onlineContainerIds.has('jellyfin'),
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
