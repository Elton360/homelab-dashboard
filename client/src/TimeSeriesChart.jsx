import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { css, styled } from 'styled-components'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);

  ${({ $type }) => {
    if ($type === 'networkHistory') {
      return css`
        grid-column: 8 / span 3;
        grid-row: 1 / span 2;
      `
    }
    if ($type === 'cpuHistory') {
      return css`
        grid-column: 5 / span 3;
        grid-row: 1 / span 2;
      `
    }

    return ''
  }}
`

const formatTime = (unformattedDate) => {
  const maxSingleDigit = 9
  const date = new Date(unformattedDate)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const formattedMinutes = minutes <= maxSingleDigit ? `0${minutes}` : minutes
  return `${hours}:${formattedMinutes}`
}

const getDynamicBounds = (datasets) => {
  const allValues = datasets.flatMap((ds) =>
    ds.data.map((point) => point.value),
  )
  const min = Math.min(...allValues) * 0.9
  const max = Math.max(...allValues) * 1.1
  return { min, max }
}

const TimeSeriesChart = ({ data = [], type }) => {
  if (!data.length || !data[0].data) return null

  const yAxisLabel =
    type === 'cpuHistory' ? 'CPU Usage' : 'Network Traffic (Mbps)'

  const labels = data[0].data.map((point) => formatTime(point.time))
  const { min, max } = getDynamicBounds(data)

  const chartData = {
    labels,
    datasets: data.map((dataset, index) => ({
      label: dataset.label || `Series ${index + 1}`,
      data: dataset.data.map((point) => point.value),
      borderColor: dataset.backgroundColor || `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor:
        dataset.backgroundColor || `hsla(${index * 60}, 70%, 50%, 0.2)`,
      tension: 0.1,
      fill: true,
    })),
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}`
          },
        },
      },
      legend: {
        labels: {
          color: '#fff',
        },
        onClick: (e, legendItem, legend) => {
          const chart = legend.chart
          const index = legendItem.datasetIndex
          const meta = chart.getDatasetMeta(index)

          meta.hidden = meta.hidden === null ? true : null

          const visibleData = chart.data.datasets
            .map((ds, i) => {
              const dsMeta = chart.getDatasetMeta(i)
              return !dsMeta.hidden ? ds.data : null
            })
            .filter(Boolean)
            .flat()

          if (visibleData.length) {
            const values = visibleData.map((v) => v)
            const min = Math.min(...values) * 0.9
            const max = Math.max(...values) * 1.1

            chart.options.scales.y.min = min
            chart.options.scales.y.max = max
          }

          chart.update()
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          color: '#fff',
        },
        ticks: {
          color: '#fff',
          beginAtZero: true,
        },
        min,
        max,
      },
    },
    elements: {
      line: {
        borderWidth: 2.5,
      },
    },
  }

  return (
    <ChartContainer $type={type}>
      <Line data={chartData} options={chartOptions} />
    </ChartContainer>
  )
}

export default TimeSeriesChart
