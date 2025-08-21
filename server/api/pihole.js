import axios from 'axios'

import { nowInSeconds } from '../helpers/conversion.js'
import { PIHOLE_API_URL, PIHOLE_PASSWORD } from '../helpers/env.js'

// Pi-hole v6 API. Any failure resolves to null so an unreachable or
// misconfigured Pi-hole never breaks the rest of the dashboard
const piholeApi = axios.create({
  baseURL: `${PIHOLE_API_URL}/api`,
  timeout: 5000,
})

let piholeSession = null
let loginPromise = null

async function login() {
  const { data } = await piholeApi.post('/auth', { password: PIHOLE_PASSWORD })
  const { sid, validity } = data.session
  piholeSession = { sid, expiresAt: nowInSeconds() + validity }
}

// Reuses the current session, and shares one login between parallel requests
// so Pi-hole's session limit isn't used up
function ensureSession() {
  if (piholeSession && nowInSeconds() < piholeSession.expiresAt) return null
  loginPromise ??= login().finally(() => {
    loginPromise = null
  })
  return loginPromise
}

async function piholeGet(endpoint, params, isRetry = false) {
  await ensureSession()
  const { sid } = piholeSession

  try {
    const { data } = await piholeApi.get(endpoint, {
      params,
      headers: sid ? { 'X-FTL-SID': sid } : {},
    })
    return data
  } catch (error) {
    // Pi-hole drops sessions on restart, so log in again once
    if (error.response?.status === 401 && !isRetry) {
      if (piholeSession?.sid === sid) piholeSession = null
      return piholeGet(endpoint, params, true)
    }
    throw error
  }
}

const topEntry = (entries) =>
  [...(entries ?? [])].sort((a, b) => b.count - a.count)[0]

export async function getPiholeSummary() {
  if (!PIHOLE_API_URL) return null

  try {
    const summary = await piholeGet('/stats/summary')

    // The top lists are extras: if one fails, still show the summary
    const [topDomains, topBlocked, topClients] = await Promise.allSettled([
      piholeGet('/stats/top_domains', { count: 1 }),
      piholeGet('/stats/top_domains', { blocked: true, count: 1 }),
      piholeGet('/stats/top_clients', { blocked: true, count: 1 }),
    ])
    const topClient = topEntry(topClients.value?.clients)

    return {
      totalQueries: summary.queries?.total ?? null,
      blocked: summary.queries?.blocked ?? null,
      percentBlocked: summary.queries?.percent_blocked ?? null,
      activeClients: summary.clients?.active ?? null,
      gravitySize: summary.gravity?.domains_being_blocked ?? null,
      topDomain: topEntry(topDomains.value?.domains)?.domain ?? null,
      topBlocked: topEntry(topBlocked.value?.domains)?.domain ?? null,
      topClient: topClient?.name || topClient?.ip || null,
    }
  } catch (error) {
    console.error('Error fetching Pi-hole stats:', error.message)
    return null
  }
}
