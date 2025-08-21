import axios from 'axios'

import {
  JELLYFIN_API_URL,
  JELLYFIN_PASSWORD,
  JELLYFIN_USERNAME,
} from '../helpers/env.js'

async function getJellyfinToken(jellyfinServerUrl, username, password) {
  try {
    const response = await axios.post(
      `${jellyfinServerUrl}/Users/AuthenticateByName`,
      {
        Username: username,
        Pw: password,
        Password: password,
      },
      {
        headers: {
          'X-Emby-Authorization':
            'MediaBrowser Client="Home-Server", Device="YourDevice", DeviceId="home-lab-708", Version="1.0.0"',
        },
      },
    )

    const accessToken = response.data.AccessToken
    const userId = response.data.User.Id
    return { accessToken, userId }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Authentication failed: Invalid username or password.')
    } else {
      console.error('An error occurred during authentication:', error.message)
    }
    return null
  }
}

const appState = {
  serverUrl: JELLYFIN_API_URL,
  username: JELLYFIN_USERNAME,
  password: JELLYFIN_PASSWORD,
  token: null,
  userId: null,
}

/**
 * A wrapper function to handle authenticated Jellyfin API requests.
 * On a 401 it re-authenticates once and retries the request.
 */
async function makeAuthenticatedRequest(
  method,
  endpoint,
  data,
  isRetry = false,
) {
  if (!appState.token) {
    console.log('No token found. Attempting to authenticate...')
    const authResult = await getJellyfinToken(
      appState.serverUrl,
      appState.username,
      appState.password,
    )
    if (!authResult) {
      console.error('Initial authentication failed. Cannot proceed.')
      return null
    }
    appState.token = authResult.accessToken
    appState.userId = authResult.userId
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Emby-Authorization': `MediaBrowser Token=${appState.token}, MediaBrowser Client="Home-Server", Device="YourDevice", DeviceId="home-lab-708", Version="1.0.0"`,
  }

  try {
    const response = await axios({
      method,
      url: `${appState.serverUrl}${endpoint}`,
      data,
      headers,
    })
    return response.data
  } catch (error) {
    // only attempt to re-authenticate if we haven't already retried
    if (error.response?.status === 401 && !isRetry) {
      console.error(
        'Request failed with 401 Unauthorized. Token may be invalid. Attempting to re-authenticate...',
      )

      // The token is invalid, so clear it and try again.
      appState.token = null
      const reAuthResult = await getJellyfinToken(
        appState.serverUrl,
        appState.username,
        appState.password,
      )

      if (reAuthResult) {
        // We successfully got a new token. Store it and retry the original request.
        appState.token = reAuthResult.accessToken
        appState.userId = reAuthResult.userId
        console.log(
          'Successfully re-authenticated. Retrying original request...',
        )
        return makeAuthenticatedRequest(method, endpoint, data, true)
      } else {
        console.error('Re-authentication failed. credentials may be incorrect.')
        return null
      }
    } else {
      console.error(`An error occurred during the request: ${error.message}`)
      return null
    }
  }
}

/**
 * Fetches the name and item count for each library folder using a hybrid approach
 * for accuracy.
 */
export async function getJellyfinLibraries() {
  const libraries = await makeAuthenticatedRequest(
    'get',
    '/Library/MediaFolders',
  )

  if (!libraries || !libraries.Items) {
    console.error('Could not retrieve media folders.')
    return []
  }

  const libraryCounts = []
  let hasMoviesFolder = false

  // Step 2: Get the accurate total movie count from the /Items/Counts endpoint.
  const globalCountsResponse = await makeAuthenticatedRequest(
    'get',
    '/Items/Counts',
  )
  let movieCount = 0
  if (globalCountsResponse && globalCountsResponse.MovieCount) {
    movieCount = globalCountsResponse.MovieCount
  }

  // Step 3: Iterate through each folder to get the item count.
  for (const folder of libraries.Items) {
    const folderId = folder.Id
    const folderName = folder.Name

    // Skip the "Movies" folder as we will use the accurate global count.
    if (folderName === 'Movies') {
      hasMoviesFolder = true
      continue
    }

    // Make a new request to the /Items endpoint for each folder.
    const itemsResponse = await makeAuthenticatedRequest(
      'get',
      `/Users/${appState.userId}/Items?ParentId=${folderId}`,
    )

    if (itemsResponse) {
      // The total number of items is in the TotalRecordCount property.
      const itemCount = itemsResponse.TotalRecordCount
      libraryCounts.push({ name: folderName, count: itemCount })
    }
  }

  // Add the "Movies" library with its accurate global count.
  if (hasMoviesFolder) libraryCounts.push({ name: 'Movies', count: movieCount })

  return libraryCounts
}
