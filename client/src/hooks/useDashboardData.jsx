import { useContext } from 'react'

import DashboardContext from '../providers/DashboardContext.jsx'

const useDashboardData = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardProvider')
  }
  return context
}

export default useDashboardData
