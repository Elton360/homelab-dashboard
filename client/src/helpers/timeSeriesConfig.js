export const makeTimeSeriesConfig = ({
  cpuHistory,
  downloadHistory,
  uploadHistory,
}) => [
  {
    type: 'cpuHistory',
    data: [
      {
        label: 'CPU Usage',
        data: cpuHistory,
        backgroundColor: 'rgba(0,128,0,1)',
      },
    ],
  },
  {
    type: 'networkHistory',
    data: [
      {
        label: 'Download',
        data: downloadHistory,
        backgroundColor: 'rgb(0, 136, 254)',
      },
      {
        label: 'Upload',
        data: uploadHistory,
        backgroundColor: 'rgb(255, 187, 40)',
      },
    ],
  },
]
