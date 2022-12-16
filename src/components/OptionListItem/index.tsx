import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import RangeBadge from 'components/OptionBadge/RangeBadge'
import { RowBetween } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import { useOperationalTreasuryWethContract } from 'hooks/useContract'
import { ADDRESSES } from 'pages/options/constants/addresses'
import { GetPayOffAvailable, GetPayOffbyId, GetStrategyData } from 'pages/options/state/GetOptionPrice'
import { GetOwnerbyId } from 'pages/options/state/GetPositionManager'
import { GetStrategyAddressbyId } from 'pages/options/state/GetStrategy'
import { GetStrike } from 'pages/options/state/GetStrike'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { OptionDetails } from 'types/position'

const LinkRow = styled(Link)`
  align-items: center;
  border-radius: 20px;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;

  justify-content: space-between;
  color: ${({ theme }) => theme.deprecated_text1};
  margin: 8px 0;
  padding: 16px;
  text-decoration: none;
  font-weight: 500;
  background-color: ${({ theme }) => theme.deprecated_bg1};

  &:last-of-type {
    margin: 8px 0 0 0;
  }
  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.deprecated_bg2};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 12px;
  `};
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 12px;
  `};
`

const DataLineItem = styled.div`
  font-size: 14px;
`

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-top: 4px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  background-color: ${({ theme }) => theme.deprecated_bg2};
    border-radius: 12px;
    padding: 8px 0;
`};
`

const DoubleArrow = styled.span`
  margin: 0 2px;
  color: ${({ theme }) => theme.deprecated_text3};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin: 4px;
    padding: 20px;
  `};
`

const RangeText = styled.span`
  /* background-color: ${({ theme }) => theme.deprecated_bg2}; */
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.deprecated_text3};
  font-size: 14px;
  margin-right: 4px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 14px;
  `};
`

interface OptionListItemProps {
  optionDetails: OptionDetails
}

export default function OptionListItem({ optionDetails }: OptionListItemProps) {
  const { tokenId } = optionDetails
  const positionSummaryLink = '/pool/' + optionDetails.tokenId
  const optionTokenId = optionDetails.tokenId.toString()
  //if operationaladdress == blabla, set underlying
  const { chainId, account } = useWeb3React()
  let operationalAddress = ''
  let managerAddress = ''
  let underlyingAddress = ''
  let premiumAddress = ''
  let aggregatorAddress = ''
  if (chainId ?? undefined == '420') {
    operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
    underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
    premiumAddress = ADDRESSES.OPTIMISMGOERLI.USDC
    managerAddress = ADDRESSES.OPTIMISMGOERLI.WETH.MANAGER
    aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WETH.AGGREGATOR
  } else if (chainId ?? undefined == '5') {
    operationalAddress = ADDRESSES.GOERLI.WETH.TREASURY
    underlyingAddress = ADDRESSES.GOERLI.WETH.UNDERLYING
    premiumAddress = ADDRESSES.GOERLI.USDC
    managerAddress = ADDRESSES.GOERLI.WETH.MANAGER
    aggregatorAddress = ADDRESSES.GOERLI.WETH.AGGREGATOR
  }

  const underlying = useToken(underlyingAddress)
  const premium = useToken(premiumAddress)

  const getStrategy = GetStrategyAddressbyId(operationalAddress, tokenId)
  let strategyType = ''
  let strategy = ''
  if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.CALL) {
    strategyType = 'CALL'
    strategy = getStrategy.strategy
  } else if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.PUT) {
    strategyType = 'PUT'
    strategy = getStrategy.strategy
  }

  const state = getStrategy.state
  let outOfRange = false
  let removed = false
  let optionState = ''
  let isClaimed = false
  if (state == '0') {
    outOfRange = true
    removed = true
    optionState = 'Inactive'
    isClaimed = true
  } else if (state == '1') {
    outOfRange = false
    removed = false
    optionState = 'Active'
    isClaimed = false
  }

  const negativepnl = getStrategy.negativepnl
  const positivepnl = getStrategy.positivepnl

  const netPNL = Math.floor(Number(getStrategy.negativepnl)) - Math.floor(Number(getStrategy.positivepnl))
  const currencyBase0 = underlying
  const formattedExpiration = (Math.floor(Number(getStrategy.expiration)) / 1000 / 60 / 60 / 24).toFixed(2)
  const formattedNegativePNL = (Math.floor(Number(negativepnl)) / 10e5).toFixed(3)
  const formattedProfit = (Math.floor(Number(netPNL)) / 10e5).toFixed(3)

  const currencyUL = underlying ? underlying : undefined
  const currencyPR = premium ? premium : undefined

  const payOff = GetPayOffbyId(strategy, tokenId).payOff
  const formattedPayoff = (Math.floor(Number(payOff)) / 10e5).toFixed(2)

  const optionOwner = GetOwnerbyId(managerAddress, tokenId).address
  const payOffAvailable = GetPayOffAvailable(strategy, tokenId, account?.toString(), optionOwner).available

  const dataAmount = GetStrategyData(strategy, tokenId).amount
  const formattedAmount = (Math.floor(Number(dataAmount)) / 10e17).toFixed(4)
  const dataStrike = GetStrategyData(strategy, tokenId).strike
  const formattedStrike = (Math.floor(Number(dataStrike)) / 10e7).toFixed(2)
  const aggregatorPrice = GetStrike(aggregatorAddress ?? undefined).formattedStrike

  const active = payOffAvailable?.toString() === 'true'

  const currentTimestamp = () => new Date().getTime() / 10e2
  const period = Math.floor(Number(getStrategy.expiration)) - currentTimestamp()
  const formattedPeriod = (period / 60 / 60 / 24).toFixed(2)

  const operationalTreasury = useOperationalTreasuryWethContract()
  const functionPeriod = operationalTreasury?.interface.decodeFunctionData(
    'buy',
    '0x0e5024d700000000000000000000000045d5b5073e422d636eddf6ca7cac775533be19cf000000000000000000000000bc6f67ace4d4ab0d307c56c29ced9721805fd3e500000000000000000000000000000000000000000000000013b4da79fd0e0000000000000000000000000000000000000000000000000000000000000012750000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
  ).period //TODO TX HASH

  const optionDuration = functionPeriod
  const openingDate = new Date((Math.floor(Number(getStrategy.expiration)) - optionDuration) * 10e2).toLocaleString()
  const closingDate = new Date(Math.floor(Number(getStrategy.expiration)) * 10e2).toLocaleString()

  let isExpired
  let expired = 'Expiration: ' + formattedPeriod + ' days'
  const determinateExpiration = Array.from(period.toString())[0]
  if (determinateExpiration === '-') {
    isExpired = 'true'
  }
  if (isExpired === 'true') {
    expired = 'Expired!'
  }

  let inactiveButtonText = ''
  if (isExpired) {
    inactiveButtonText = 'Expired'
    outOfRange = true
  } else if (isClaimed) {
    inactiveButtonText = 'Claimed'
  } else if (!active) {
    inactiveButtonText = 'Unexercisable'
  }

  return (
    <LinkRow to={positionSummaryLink}>
      <RowBetween>
        <PrimaryPositionIdData>
          <DataText>
            {formattedAmount}&nbsp;{currencyUL?.symbol}&nbsp;{strategyType}
          </DataText>
          <Badge>
            <BadgeText>
              <Trans>Id: {optionTokenId}</Trans>
            </BadgeText>
          </Badge>
          <Badge>
            <BadgeText>
              <Trans>Events: {}</Trans>
            </BadgeText>
          </Badge>
        </PrimaryPositionIdData>
        <RangeBadge removed={removed} inRange={!outOfRange} />
      </RowBetween>
      <RangeLineItem>
        <RowBetween>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>Expiration:&nbsp;{formattedPeriod}&nbsp;days</Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>
                Premium:&nbsp;{formattedNegativePNL}&nbsp;{currencyPR?.symbol}
              </Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>
                Strike:&nbsp;{formattedStrike}&nbsp;{currencyPR?.symbol}
              </Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>Opened:&nbsp;{openingDate}</Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>Closing:&nbsp;{closingDate}</Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <Badge>
            <BadgeText>
              <Trans>
                PNL:&nbsp;{formattedPayoff}&nbsp;{currencyPR?.symbol}
              </Trans>
            </BadgeText>
          </Badge>
        </RowBetween>
      </RangeLineItem>
    </LinkRow>
  )
}
