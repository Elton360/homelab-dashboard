import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT_DIR = path.resolve(__dirname, '..')

// Environment variables with validation
function getEnvVar(name, defaultValue = undefined) {
  const value = process.env[name]
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not defined`)
  }
  return value || defaultValue
}

// Jellyfin
export const JELLYFIN_API_URL = getEnvVar('JELLYFIN_API_URL')
export const JELLYFIN_USERNAME = getEnvVar('JELLYFIN_USERNAME')
export const JELLYFIN_PASSWORD = getEnvVar('JELLYFIN_PASSWORD')

// Portainer
export const PORTAINER_API_URL = getEnvVar('PORTAINER_API_URL')
export const PORTAINER_USERNAME = getEnvVar('PORTAINER_USERNAME')
export const PORTAINER_PASSWORD = getEnvVar('PORTAINER_PASSWORD')

// Prometheus
export const PROMETHEUS_API_URL = getEnvVar('PROMETHEUS_API_URL')

// Pi-hole (optional: the integration is skipped when the URL is empty)
export const PIHOLE_API_URL = getEnvVar('PIHOLE_API_URL', '')
export const PIHOLE_PASSWORD = getEnvVar('PIHOLE_PASSWORD', '')

// Containers exposed by the API. Filtering is skipped when the allowlist is
// empty or SHOW_ALL_CONTAINERS=true (the internal instance)
export const CONTAINER_ALLOWLIST = getEnvVar('CONTAINER_ALLOWLIST', '')
  .split(',')
  .map((name) => name.trim().toLowerCase())
  .filter(Boolean)
export const SHOW_ALL_CONTAINERS =
  getEnvVar('SHOW_ALL_CONTAINERS', 'false') === 'true'
