import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import RangeBadge from 'components/OptionBadge/RangeBadge'
import { RowBetween } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import { ADDRESSES } from 'pages/CreateOption/constants/addresses'
import { GetStrategyAddressbyId } from 'pages/CreateOption/state/GetStrategy'
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
  const { chainId } = useWeb3React()
  let operationalAddress = ''
  let underlyingAddress = ''
  if (chainId ?? undefined == '420') {
    operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
    underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
  } else if (chainId ?? undefined == '5') {
    operationalAddress = ADDRESSES.GOERLI.WETH.TREASURY
    underlyingAddress = ADDRESSES.GOERLI.WETH.UNDERLYING
  }

  const underlying = useToken(underlyingAddress)

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
  let outOfRange = false //expired
  let removed = false //exercised
  if (state == '0') {
    outOfRange = true
    removed = true
  } else if (state == '1') {
    outOfRange = false
    removed = false
  }

  const negativepnl = getStrategy.negativepnl
  const positivepnl = getStrategy.positivepnl

  const netPNL = Math.floor(Number(getStrategy.negativepnl)) - Math.floor(Number(getStrategy.positivepnl))
  const currencyBase0 = underlying
  const formattedExpiration = (Math.floor(Number(getStrategy.expiration)) / 1000 / 60 / 60 / 24).toFixed(2)
  const formattedNegativePNL = (Math.floor(Number(negativepnl)) / 10e5).toFixed(3)
  const formattedProfit = (Math.floor(Number(netPNL)) / 10e5).toFixed(3)
  return (
    <LinkRow to={positionSummaryLink}>
      <RowBetween>
        <PrimaryPositionIdData>
          <DataText>
            &nbsp;{currencyBase0?.symbol} {strategyType}
          </DataText>
          <Badge>
            <BadgeText>
              <Trans>Id: {optionTokenId}</Trans>
            </BadgeText>
          </Badge>
        </PrimaryPositionIdData>
        <RangeBadge removed={removed} inRange={!outOfRange} />
      </RowBetween>
      <RangeLineItem>
        <Trans> NegativePNL: {negativepnl} </Trans>
        <Trans>; PositivePNL: {positivepnl} </Trans>
        <Trans>; Expiration (epoch): {formattedExpiration} days</Trans>
      </RangeLineItem>
      <RangeLineItem>
        <DataText>
          Option Cost: &nbsp;{formattedNegativePNL}&nbsp;$, Current Profit: &nbsp;{formattedProfit}&nbsp;$
        </DataText>
      </RangeLineItem>
    </LinkRow>
  )
}
