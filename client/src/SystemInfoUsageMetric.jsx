import { styled } from 'styled-components'

export const SystemInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  width: 17rem;
  color: #ffffff;

  .icon {
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metrics {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info {
    width: 100%;
  }

  .percentage {
    font-size: 1rem;
  }

  .label {
    font-size: 1rem;
    font-weight: 600;
  }

  .progress-bar {
    margin-top: 0.25rem;
    width: 100%;
    height: 4px;
    background-color: #333;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #00e676;
    width: ${(props) => props.$load || 0}%;
    transition: width 0.3s ease;
  }

  @media(max-width: 900px) {
    width: 10rem;
    .label {
      display: none;
    }
  }
  @media(max-width: 600px) {
    width: 6rem;
   
  }
`

export const SystemInfoUsageMetric = ({ usagePercent, label, children }) => {
  const usage = Math.round(usagePercent)
  return (
    <SystemInfo $load={usage}>
      <div className="icon">{children}</div>
      <div className="info">
        <div className="metrics">
          <span className="percentage">{`${usage} %`}</span>
          <span className="label">{label}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
      </div>
    </SystemInfo>
  )
}
