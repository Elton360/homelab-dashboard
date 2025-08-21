import axios from 'axios'

import { checkTokenExpiry } from '../helpers/auth.js'
import {
  CONTAINER_ALLOWLIST,
  PORTAINER_API_URL,
  PORTAINER_PASSWORD,
  PORTAINER_USERNAME,
  SHOW_ALL_CONTAINERS,
} from '../helpers/env.js'

let portainerToken = null

// Helper function to get Portainer authentication token
async function getPortainerToken() {
  try {
    const response = await axios.post(`${PORTAINER_API_URL}/api/auth`, {
      username: PORTAINER_USERNAME,
      password: PORTAINER_PASSWORD,
    })
    return response.data.jwt
  } catch (error) {
    console.error('Error getting Portainer token:', error)
    return null
  }
}

async function ensurePortainerToken() {
  if (!portainerToken || checkTokenExpiry(portainerToken)) {
    console.log('Refreshing Portainer token...')
    portainerToken = await getPortainerToken()
  }
}

// Helper for parsing containers data
function parseContainerData(data) {
  return data.map(
    ({ Image, Names, State, Ports, HostConfig, NetworkSettings, Status }) => {
      return {
        name: Names[0].replace('/', ''), // Remove leading "/" from name
        image: Image.split(':')[0], // Extract image name (without the tag)
        status: State === 'running' ? Status : 'Stopped',
        online: State === 'running',
        ports: Ports.filter((port) => port.PublicPort) // Filter out ports that are not public
          .map((port) => port.PublicPort), // Extract public ports
        network: HostConfig.NetworkMode, // Network mode
        ip:
          NetworkSettings.Networks[Object.keys(NetworkSettings.Networks)[0]]
            ?.IPAddress || 'N/A', // Extract IP address of the container
      }
    },
  )
}

export async function getContainers() {
  await ensurePortainerToken()
  if (!portainerToken) throw new Error('No token')
  try {
    const response = await axios.get(
      `${PORTAINER_API_URL}/api/endpoints/3/docker/containers/json`,
      {
        headers: { Authorization: `Bearer ${portainerToken}` },
      },
    )

    const containers = parseContainerData(response.data)
    if (SHOW_ALL_CONTAINERS || !CONTAINER_ALLOWLIST.length) return containers
    return containers.filter(({ name }) =>
      CONTAINER_ALLOWLIST.includes(name.toLowerCase()),
    )
  } catch (error) {
    console.error('Error fetching containers:', error)
    throw new Error('Failed to fetch containers')
  }
}
