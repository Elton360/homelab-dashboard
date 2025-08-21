import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { styled } from 'styled-components'

import { calcPercent } from './helpers/utils'

ChartJS.register(ArcElement, Tooltip, Legend)

const ChartContainer = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  grid-column: 11 / span 2;
  grid-row: 1 / span 2;
  padding: 0.5rem;
`

const ChartInner = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem auto 0 auto;
  width: 10rem;
  height: 10rem;

  span {
    font-size: 2rem;
    font-weight: bold;
    position: absolute;
    top: 45%;
    right: 50%;
    transform: translate(50%, -50%);

    &::after {
      position: absolute;
      font-size: 1rem;
      bottom: -40%;
      right: 50%;
      transform: translate(50%, -50%);
      content: '%';
      display: block;
    }
  }
`
const Labels = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  padding-left: 2rem;
`

const Label = styled.span`
  position: relative;
  font-size: 0.75rem;
  margin-bottom: 0.3rem;
  &::before {
    position: absolute;
    content: '';
    left: -1.5rem;
    width: 1rem;
    height: 1rem;
    background-color: ${({ $bg }) => $bg};
  }
`

const colors = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#A28CFF',
  '#FF5E7E',
  '#4DD0E1',
  '#FFD166',
  '#8BC34A',
]

export default function StorageDoughnutChart({ data }) {
  // Create a dataset for each disk showing percentage used (0-100)
  const datasets = data.map(({ name: label, used, total }, idx) => {
    const usedPercent = (used / total) * 100

    return {
      label,
      data: [usedPercent, 100 - usedPercent],
      backgroundColor: [colors[idx], '#e0e0e0'],
      borderWidth: 0,
      hoverOffset: 0,
      weight: 1,
    }
  })

  const chartData = {
    labels: [],
    datasets,
  }

  // Calculate total usage across all disks for center display
  const { allDisksTotal, allDisksUsed } = data.reduce(
    (acc, curr) => {
      acc.allDisksTotal += curr.total
      acc.allDisksUsed += curr.used
      return acc
    },
    { allDisksTotal: 0, allDisksUsed: 0 },
  )

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ({ datasetIndex }) => {
            const { used, total } = data[datasetIndex]
            const free = Math.round(total - used)
            return ` ${free} GB Free of ${Math.round(total)} GB`
          },
        },
      },
    },
  }

  return (
    <ChartContainer>
      <ChartInner>
        <Doughnut data={chartData} options={options} />
        <span>{`${calcPercent(allDisksUsed, allDisksTotal)}`}</span>
      </ChartInner>
      <Labels
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: '0.75rem',
        }}
      >
        {[...data]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, used, total }) => {
            // Find the original index to match colors
            const originalIdx = data.findIndex((d) => d.name === name)
            return (
              <Label
                key={name}
                $bg={colors[originalIdx]}
              >
                {`${name} - ${calcPercent(used, total)} % used`}
              </Label>
            )
          })}
      </Labels>
    </ChartContainer>
  )
}
