import React, { useState } from 'react'
import { css, styled } from 'styled-components'

import { makeServicesConfig } from './helpers/servicesConfig.jsx'
import { ConditionalWrapper } from './helpers/Styles.js'
import { makeTimeSeriesConfig } from './helpers/timeSeriesConfig.js'
import { fuzzyCompare } from './helpers/utils.js'
import useDashboardData from './hooks/useDashboardData.jsx'
import ServiceCard from './ServiceCard.jsx'
import StoragePieChart from './StoragePieChart.jsx'
import TimeSeriesChart from './TimeSeriesChart.jsx'
import TopBar from './TopBar.jsx'

const Wrapper = styled.div`
  max-width: 120rem;
  font-family: 'Inter', sans-serif;
  color: white;
  min-height: 60rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;

  @media (min-width: 1400px) {
    padding: 2rem;
  }

  @media (min-width: 1920px) {
      margin: 4rem auto;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 1rem;
  padding: 1rem;

  @media (max-width: 1400px) {
    display: flex;
    flex-direction: ${({ $isSearchOn }) => $isSearchOn ? 'column-reverse': 'column'};

  }
`

const timeSeriesListView = css`
  & > div { 
    flex: 1;
    min-width: 16rem;
  }
`

const TimeSeriesSmallViewWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  overflow-x: scroll;

  ${({ $isSearchOn }) => $isSearchOn && timeSeriesListView}

  @media (max-width: 1400px) {
      ${timeSeriesListView}
  }
`

const App = () => {
  const { data, loading, error } = useDashboardData()
  const searchState = useState(null)
  const [searchValue] = searchState
  const isSmallWidth = (Number(window.innerWidth) < 1400)
  if (loading) return <Wrapper>Loading...</Wrapper>
  if (error) return <Wrapper>Error loading dashboard data.</Wrapper>

  const {
    system: {
      disks,
      cpu: { cpuHistory },
      network: { downloadHistory, uploadHistory },
    },
  } = data || {}

  const timeSeriesConfig = makeTimeSeriesConfig({
    cpuHistory,
    uploadHistory,
    downloadHistory,
  })

  const servicesConfigs = makeServicesConfig(data)

  return (
    <Wrapper>
      <TopBar data={data} searchState={searchState}/>
      <DashboardGrid $isSearchOn = {Boolean(searchValue)}>
        <ConditionalWrapper 
          wrapper ={
            x => 
            <TimeSeriesSmallViewWrapper $isSearchOn = {Boolean(searchValue)} >
              {x}
            </TimeSeriesSmallViewWrapper>
          } 
          condition={isSmallWidth} 
        >
          {timeSeriesConfig.map(({ type, data }) => (
            <TimeSeriesChart key={type} type={type} data={data} />
          ))}
          <StoragePieChart data={disks} />
        </ConditionalWrapper >
        {servicesConfigs
          .filter(({ title }) => isSmallWidth ? fuzzyCompare(title, searchValue) : true)
          .map((service) => (
            <ServiceCard 
            key={service.id} 
            service={service} 
            isDisabled={!isSmallWidth && !fuzzyCompare(service.title, searchValue)}/>
        ))}
      </DashboardGrid>
    </Wrapper>
  )
}

export default App
