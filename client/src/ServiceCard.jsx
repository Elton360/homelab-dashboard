import React from 'react'
import { Tooltip } from 'react-tooltip'
import { css, styled } from 'styled-components'

import { firstUppercase } from './helpers/strings'

const SubCard = styled.a`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.8rem 1rem;
  border-radius: 12px;

  .top-row {
    display: flex;
    align-items: center;
    width: 100%;
    margin-left: 0.2rem;
    position: relative;
  }

  .right {
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
  }

  .title {
    font-weight: 600;
    font-size: 1rem;
  }

  .description {
    font-size: 0.85rem;
    color: #bbbbbb;
    margin-top: 0.2rem;
  }

  .bottom-stats {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 1rem;
  }

  .stat-box {
    text-align: center;
    flex: 1;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin: 0 0.2rem;
  }

  .stat-number {
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #bbbbbb;
  }

  opacity: ${({ $isObsure }) => $isObsure ? "0.1":"1"};

  ${({ href }) =>
    href &&
    css`
      cursor: pointer;
      &:hover {
        transform: scale(1.02);
        background: rgba(255, 255, 255, 0.08);
        transition:
          background-color 0.6s ease,
          transform 0.6s ease;
      }
    `}

  ${({ $grid }) =>
    $grid &&
    css`
      grid-column: ${$grid.column};
      grid-row: ${$grid.row};
    `}
`

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => props.color || '#00e676'};
  display: inline-block;
  margin-left: auto;
  margin-top: -3rem;
  position: absolute;
  right: 0;
`

const narrowThreshold = 2

const ServiceCard = ({ service, isDisabled }) => {
  const { title, description, icon, href, stats = [], grid, online } = service

  const isNarrow = stats.length <= narrowThreshold

  return (
    <SubCard
      href={isDisabled ? undefined : href}
      $grid={grid}
      target="_blank"
      rel="noopener noreferrer"
      $isNarrow={isNarrow}
      $isObsure={isDisabled}
    >
      <div className="top-row">
        {icon}
        <div className="right">
          <span className="title">{title}</span>
          <span className="description">{description}</span>
        </div>
        {online && <StatusDot color="#00e676" />}
      </div>
      <div className="bottom-stats">
        {stats.map(({ label, value }, i) => {
          const regex = /(?:[a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
          const match = `${value}`.match(regex)

          let displayName = ''
          if (match) {
            const domainParts = `${value}`.split('.')
            displayName = firstUppercase(domainParts[domainParts.length - 2])
          } else {
            displayName = value
          }

          return (
            <div className="stat-box" key={i}>
              <div className="stat-label">{label}</div>
              <div
                className="stat-number"
                data-tooltip-id="tooltip"
                data-tooltip-content={value}
              >
                {displayName}
              </div>
              <Tooltip id="tooltip" />
            </div>
          )
        })}
      </div>
    </SubCard>
  )
}

export default ServiceCard
