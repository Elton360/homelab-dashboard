import jwt from 'jsonwebtoken'

export const checkTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token)
    const expiry = decoded.exp * 1000
    const currentTime = Date.now()
    return currentTime >= expiry
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}
