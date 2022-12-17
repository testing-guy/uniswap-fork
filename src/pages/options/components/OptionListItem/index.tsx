import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { RowBetween } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import RangeBadge from 'pages/options/components/OptionBadge/RangeBadge'
import SellingBadge from 'pages/options/components/OptionBadge/SellingBadge'
import { ADDRESSES } from 'pages/options/constants/addresses'
import { marketplaceDetail } from 'pages/options/constants/marketplaceDetail'
import { optionDetail } from 'pages/options/constants/optionDetail'
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
  const positionSummaryLink = '/pool/' + optionDetails.tokenId
  const tokenIdFromDetails = optionDetails.tokenId.toString()
  const { chainId, account } = useWeb3React()
  const parsedTokenId = tokenIdFromDetails ? BigNumber.from(tokenIdFromDetails) : undefined

  const currencyIdA = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING //#TODO
  const idDetails = optionDetail(chainId, currencyIdA, parsedTokenId, account)

  const underlying = useToken(idDetails.underlyingAddress)
  const premium = useToken(idDetails.premiumAddress)
  const currencyUL = underlying ? underlying : undefined
  const currencyPR = premium ? premium : undefined

  const marketplace = marketplaceDetail(idDetails.isExpired, idDetails.isClaimed, idDetails.active)

  return (
    <LinkRow to={positionSummaryLink}>
      <RowBetween>
        <PrimaryPositionIdData>
          <DataText>
            {idDetails.formattedAmount}&nbsp;{currencyUL?.symbol}&nbsp;{idDetails.strategyType}
          </DataText>
          <Badge>
            <BadgeText>
              <Trans>Id: {tokenIdFromDetails}</Trans>
            </BadgeText>
          </Badge>
        </PrimaryPositionIdData>
        <PrimaryPositionIdData>
          <RangeBadge removed={idDetails.isClaimed} inRange={!idDetails.isExpired} />
          <SellingBadge sellable={marketplace.sellable} isSell={marketplace.isSell} />
        </PrimaryPositionIdData>
      </RowBetween>
      <RangeLineItem>
        <RowBetween>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>
                Premium:&nbsp;{idDetails.formattedNegativePNL}&nbsp;{currencyPR?.symbol}
              </Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>
                Strike:&nbsp;{idDetails.formattedStrike}&nbsp;{currencyPR?.symbol}
              </Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>Opened:&nbsp;{idDetails.openingLocaleDate}</Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <PrimaryPositionIdData>
            <RangeLineItem>
              <Trans>Closing:&nbsp;{idDetails.closingDate}</Trans>
            </RangeLineItem>
          </PrimaryPositionIdData>
          <Badge>
            <BadgeText>
              <Trans>
                PNL:&nbsp;{idDetails.formattedPayoff}&nbsp;{currencyPR?.symbol}
              </Trans>
            </BadgeText>
          </Badge>
        </RowBetween>
      </RangeLineItem>
    </LinkRow>
  )
}
