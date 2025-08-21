import { useQuery } from '@apollo/client/react'

import dashboardSummary from '../graphql/dashboardSummary.gql'
import DashboardContext from './DashboardContext.jsx'

const DashboardProvider = ({ children }) => {
  const { data, loading, error } = useQuery(dashboardSummary)

  return (
    <DashboardContext.Provider value={{ data, loading, error }}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardProvider
