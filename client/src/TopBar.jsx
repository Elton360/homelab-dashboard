import { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'

import { SystemInfoUsageMetric } from './SystemInfoUsageMetric.jsx'
import { CpuIcon, RamIcon, SearchIcon, StorageIcon } from './icons/Icons.jsx'

const TopBarStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1rem;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`

const SearchBar = styled.input`
  width: ${({$fullWidth}) => $fullWidth  ? '100%': '300px'};
  height: 3rem;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: none;
  outline: none;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(6px);

  &::placeholder {
    color: #aaaaaa;
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
  }
`

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    font-size: 4.2rem;
    font-weight: bold;
    margin-bottom: 0.3rem;
    margin-right: 4rem;
  }

  blockquote {
    position: relative;
    font-style: italic;
    color: #cccccc;
    font-size: 2rem;

    footer {
      margin-top: 0.5rem;
      font-size: 1.5rem;
      color: #aaaaaa;
    }

    cite {
      color: #00e676;
    }

    &::before {
      content: '“';
      font-family: inherit;
      font-size: 15rem;
      left: -6.8rem;
      line-height: 1;
      position: absolute;
      top: -3rem;
      z-index: -1;
    }
  }
`

const UpperBlock = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  flex-direction: ${({$isLargeView}) => $isLargeView  ? 'row': 'row-reverse' };

  .container {
    display: flex;
  }
`

const TopBar = ({ data, searchState }) => {
  const isLargeView = Number(window.innerWidth) > 1230
  const searchRef = useRef(null)
  const [showSearch, setShowSearch] = useState(isLargeView)
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [searchValue, setSearchValue] = searchState;
  const {
    system: {
      cpu: { usage },
      memory,
      disks,
    },
  } = data || {}

  const mainDiskUsage = disks.find((d) => d.isMainDisk)?.usagePercent || 0

  useEffect(() => {
    if (showSearch && !isFirstRender) {
      searchRef.current?.focus();
    }
  }, [showSearch, isFirstRender]);

  return (
    <TopBarStyled>
      <Header>
        <UpperBlock $isLargeView ={isLargeView}>
          {showSearch ? 
            <SearchBar 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..." 
              onBlur={isLargeView ? undefined : () => setShowSearch(x=> !x)} 
              ref={searchRef}
              $fullWidth = {!isLargeView}
            /> 
            :
            <div 
              onClick={() => { 
                  setShowSearch(x=> !x)
                  setIsFirstRender(false)
                }
              }
            >
              <SearchIcon />
            </div>
          }
          {(!showSearch || isLargeView) &&
            <div className="container">
              <SystemInfoUsageMetric usagePercent={usage} label="CPU">
                <CpuIcon />
              </SystemInfoUsageMetric>
              <SystemInfoUsageMetric
                usagePercent={memory.usagePercent}
                label="RAM"
              >
                <RamIcon />
              </SystemInfoUsageMetric>
              <SystemInfoUsageMetric usagePercent={mainDiskUsage} label="STORAGE">
                <StorageIcon />
              </SystemInfoUsageMetric>
            </div>
          }
        </UpperBlock>
        {isLargeView && 
          <TitleBlock>
            <h1>Icarus</h1>
            <blockquote>
              <p>We all make choices, but in the end our choices make us.</p>
              <footer>
                — Andrew Ryan, <cite>Bioshock</cite>
              </footer>
            </blockquote>
          </TitleBlock>
        }
      </Header>
    </TopBarStyled>
  )
}

export default TopBar
