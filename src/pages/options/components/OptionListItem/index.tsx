import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { DefaultCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Row, { RowBetween } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToken } from 'hooks/Tokens'
import RangeBadge from 'pages/options/components/OptionBadge/RangeBadge'
import SellingBadge from 'pages/options/components/OptionBadge/SellingBadge'
import { ADDRESSES } from 'pages/options/constants/addresses'
import { marketplaceDetail } from 'pages/options/constants/marketplaceDetail'
import { optionDetail } from 'pages/options/constants/optionDetail'
import { TEXT } from 'pages/options/constants/text'
import { useState } from 'react'
import { ArrowRight, ExternalLink } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { OptionDetails } from 'types/position'

import TypeBadge from '../OptionBadge/TypeBadge'

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
const SecondaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: right;
  > * {
    margin-right: 10px;
  }
`

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 14px;
  `};
`
const DataTextBig = styled.div`
  font-weight: 600;
  font-size: 20px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 14px;
  `};
`
const DataTextSmall = styled.div`
  font-weight: 600;
  font-size: 6px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 14px;
  `};
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;
    width: 100%:
  `};
`

interface OptionListItemProps {
  optionDetails: OptionDetails
}

export default function OptionListItem({ optionDetails }: OptionListItemProps) {
  const positionSummaryLink = '/pool/' + optionDetails.tokenId
  const tokenIdFromDetails = optionDetails.tokenId.toString()
  const { chainId, account } = useWeb3React()
  const theme = useTheme()
  const parsedTokenId = tokenIdFromDetails ? BigNumber.from(tokenIdFromDetails) : undefined

  const currencyIdA = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING //#TODO
  const idDetails = optionDetail(chainId, currencyIdA, parsedTokenId, account)

  const isOpen = idDetails.isOpen
  const underlying = useToken(idDetails.underlyingAddress)
  const premium = useToken(idDetails.premiumAddress)
  const currencyUL = underlying ? underlying : undefined
  const currencyPR = premium ? premium : undefined

  const marketplace = marketplaceDetail(idDetails.isExpired, idDetails.isClaimed, idDetails.active)

  let profitText = 'Unclaimed: ' + idDetails.formattedPayoff + ' ' + currencyPR?.symbol
  if (idDetails.isClaimed) {
    profitText = 'Claimed: ' + idDetails.netClaimedPNL + ' ' + currencyPR?.symbol
  } else if (idDetails.formattedPayoff === '0.000') {
    profitText = 'No profit'
  }
  const [showInfo, setShowInfo] = useState(true)
  function showInfos() {
    if (!showInfo) {
      setShowInfo(true)
    } else if (showInfo) {
      setShowInfo(false)
    }
  }
  return (
    <LinkRow to={''} onClick={() => showInfos()}>
      <RowBetween>
        <PrimaryPositionIdData>
          <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.ID}</Trans>}>
            <Badge>
              <Trans>
                {idDetails.formattedAmount}&nbsp;
                {currencyUL?.symbol}&nbsp;
              </Trans>
            </Badge>
          </MouseoverTooltip>
          <TypeBadge type={idDetails.strategyType} />
        </PrimaryPositionIdData>
        <AutoColumn gap="sm">
          <SecondaryPositionIdData>
            <RangeBadge removed={idDetails.isClaimed} inRange={!idDetails.isExpired} />
            <SellingBadge sellable={marketplace.sellable} isSell={marketplace.isSell} />
            <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.ID}</Trans>}>
              <Badge>
                <BadgeText>
                  <Trans>#{tokenIdFromDetails}</Trans>
                </BadgeText>
              </Badge>
            </MouseoverTooltip>
            <Row>
              <Badge>
                <BadgeText>
                  <Link style={{ textDecoration: 'none', width: 'fit-content' }} to={positionSummaryLink}>
                    <ExternalLink width={15} height={15} color={theme.deprecated_text2} />
                  </Link>
                </BadgeText>
              </Badge>
            </Row>
          </SecondaryPositionIdData>
        </AutoColumn>
      </RowBetween>
      {showInfo ? (
        ''
      ) : (
        <AutoColumn gap="sm" style={{ width: '100%' }}>
          <DataTextSmall>&nbsp;</DataTextSmall>
          <LightCard padding="5px 5px 5px 15px">
            <RowBetween>
              <AutoColumn gap="sm" style={{ width: '25%' }}>
                <RowBetween>
                  <PrimaryPositionIdData>
                    <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.STRIKE_PRICE}</Trans>}>
                      <Trans>
                        Strike:&nbsp;{idDetails.formattedStrike}&nbsp;{currencyPR?.symbol}
                      </Trans>
                    </MouseoverTooltip>
                  </PrimaryPositionIdData>
                </RowBetween>
                <RowBetween>
                  <PrimaryPositionIdData>
                    <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.STRIKE_DATE}</Trans>}>
                      <Trans>
                        Open:&nbsp;
                        {idDetails.openingLocaleDate}
                      </Trans>
                    </MouseoverTooltip>
                  </PrimaryPositionIdData>
                </RowBetween>
              </AutoColumn>
              <AutoColumn gap="sm" style={{ width: '5%' }}>
                <PrimaryPositionIdData>
                  <ArrowRight />
                </PrimaryPositionIdData>
              </AutoColumn>
              <AutoColumn gap="sm" style={{ width: '30%' }}>
                <RowBetween>
                  <PrimaryPositionIdData>
                    <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.CURRENT_PRICE}</Trans>}>
                      <Trans>
                        Price:&nbsp;
                        {idDetails.aggregatorPrice}&nbsp;
                        {currencyPR?.symbol}
                      </Trans>
                    </MouseoverTooltip>
                  </PrimaryPositionIdData>
                </RowBetween>
                <RowBetween>
                  <PrimaryPositionIdData>
                    <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.EXPIRATION}</Trans>}>
                      <Trans>Expiration:&nbsp;{idDetails.closingDate}</Trans>
                    </MouseoverTooltip>
                  </PrimaryPositionIdData>
                </RowBetween>
              </AutoColumn>
              <AutoColumn gap="sm" style={{ width: '38%', height: '100%' }}>
                <DefaultCard padding="12px 16px">
                  <RowBetween>
                    <RowBetween>
                      <DataText>{profitText}</DataText>
                    </RowBetween>
                  </RowBetween>
                  <RowBetween>
                    <RowBetween>
                      <Trans>
                        Time Left:&nbsp;
                        {idDetails.expired}
                      </Trans>
                    </RowBetween>
                  </RowBetween>
                </DefaultCard>
              </AutoColumn>
            </RowBetween>
          </LightCard>
        </AutoColumn>
      )}
    </LinkRow>
  )
}
