import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import { ButtonGray, ButtonPrimary } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { MouseoverTooltip } from 'components/Tooltip'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { useToken } from 'hooks/Tokens'
import { useOptionFromTokenId } from 'hooks/useV3Positions'
import { ADDRESSES } from 'pages/options/constants/addresses'
import { marketplaceDetail } from 'pages/options/constants/marketplaceDetail'
import { optionDetail } from 'pages/options/constants/optionDetail'
import { TEXT } from 'pages/options/constants/text'
import { useRef, useState } from 'react'
import { AlertCircle } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { OPERATIONALABI } from '../../constants/abis/OPERATIONALABI'
import { GreenButtonPrimary, RedButtonPrimary } from './styleds'
import { LoadingRows } from './styleds'

const PageWrapper = styled.div<{ navBarFlag: boolean }>`
  padding: ${({ navBarFlag }) => (navBarFlag ? '68px 8px 0px' : '0px')};

  min-width: 800px;
  max-width: 960px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: ${({ navBarFlag }) => (navBarFlag ? '48px 8px 0px' : '0px 8px 0px')};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: ${({ navBarFlag }) => (navBarFlag ? '20px' : '0px')};
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 680px;
    max-width: 680px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    min-width: 600px;
    max-width: 600px;
  `};

  @media only screen and (max-width: 620px) {
    min-width: 500px;
    max-width: 500px;
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    min-width: 340px;
    max-width: 340px;
  `};
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
`

// responsive text
// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <ThemedText.DeprecatedLabel {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 16px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 14px;
  text-align: center;
  margin-right: 4px;
  font-weight: 500;
`

const HoverText = styled(ThemedText.DeprecatedMain)`
  text-decoration: none;
  color: ${({ theme }) => theme.deprecated_text3};
  :hover {
    color: ${({ theme }) => theme.deprecated_text1};
    text-decoration: none;
  }
`

const DoubleArrow = styled.span`
  color: ${({ theme }) => theme.deprecated_text3};
  margin: 0 1rem;
`
const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;
    width: 100%:
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 49%;
  `};
`

const ResponsiveGreenButtonPrimary = styled(GreenButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 49%;
  `};
`

const ResponsiveRedButtonPrimary = styled(RedButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 49%;
  `};
`

const NFTGrid = styled.div`
  display: grid;
  grid-template: 'overlap';
  min-height: 400px;
`

const NFTCanvas = styled.canvas`
  grid-area: overlap;
`

const NFTImage = styled.img`
  grid-area: overlap;
  height: 400px;
  /* Ensures SVG appears on top of canvas. */
  z-index: 1;
`

function CurrentPriceCard({
  inverted,
  pool,
  currencyQuote,
  currencyBase,
}: {
  inverted?: boolean
  pool?: Pool | null
  currencyQuote?: Currency
  currencyBase?: Currency
}) {
  if (!pool || !currencyQuote || !currencyBase) {
    return null
  }

  return (
    <LightCard padding="12px ">
      <AutoColumn gap="8px" justify="center">
        <ExtentsText>
          <Trans>Current price</Trans>
        </ExtentsText>
        <ThemedText.DeprecatedMediumHeader textAlign="center">
          {(inverted ? pool.token1Price : pool.token0Price).toSignificant(6)}{' '}
        </ThemedText.DeprecatedMediumHeader>
        <ExtentsText>
          <Trans>
            {currencyQuote?.symbol} per {currencyBase?.symbol}
          </Trans>
        </ExtentsText>
      </AutoColumn>
    </LightCard>
  )
}

function LinkedCurrency({ chainId, currency, amount }: { chainId?: number; currency?: Currency; amount?: string }) {
  const address = (currency as Token)?.address

  if (typeof chainId === 'number' && address) {
    return (
      <ExternalLink href={getExplorerLink(chainId, address, ExplorerDataType.TOKEN)}>
        <RowFixed>
          <CurrencyLogo currency={currency} size={'20px'} style={{ marginRight: '0.5rem' }} />
          <ThemedText.DeprecatedMain>
            &nbsp;{amount}
            &nbsp;{currency?.symbol} ↗
          </ThemedText.DeprecatedMain>
        </RowFixed>
      </ExternalLink>
    )
  }

  return (
    <RowFixed>
      <CurrencyLogo currency={currency} size={'20px'} style={{ marginRight: '0.5rem' }} />
      <ThemedText.DeprecatedMain>{currency?.symbol}</ThemedText.DeprecatedMain>
    </RowFixed>
  )
}

function getRatio(
  lower: Price<Currency, Currency>,
  current: Price<Currency, Currency>,
  upper: Price<Currency, Currency>
) {
  try {
    if (!current.greaterThan(lower)) {
      return 100
    } else if (!current.lessThan(upper)) {
      return 0
    }

    const a = Number.parseFloat(lower.toSignificant(15))
    const b = Number.parseFloat(upper.toSignificant(15))
    const c = Number.parseFloat(current.toSignificant(15))

    const ratio = Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100)

    if (ratio < 0 || ratio > 100) {
      throw Error('Out of range')
    }

    return ratio
  } catch {
    return undefined
  }
}

// snapshots a src img into a canvas
function getSnapshot(src: HTMLImageElement, canvas: HTMLCanvasElement, targetHeight: number) {
  const context = canvas.getContext('2d')

  if (context) {
    let { width, height } = src

    // src may be hidden and not have the target dimensions
    const ratio = width / height
    height = targetHeight
    width = Math.round(ratio * targetHeight)

    // Ensure crispness at high DPIs
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    context.scale(devicePixelRatio, devicePixelRatio)

    context.clearRect(0, 0, width, height)
    context.drawImage(src, 0, 0, width, height)
  }
}

function NFT({ image, height: targetHeight }: { image: string; height: number }) {
  const [animate, setAnimate] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  return (
    <NFTGrid
      onMouseEnter={() => {
        setAnimate(true)
      }}
      onMouseLeave={() => {
        // snapshot the current frame so the transition to the canvas is smooth
        if (imageRef.current && canvasRef.current) {
          getSnapshot(imageRef.current, canvasRef.current, targetHeight)
        }
        setAnimate(false)
      }}
    >
      <NFTCanvas ref={canvasRef} />
      <NFTImage
        ref={imageRef}
        src={image}
        hidden={!animate}
        onLoad={() => {
          // snapshot for the canvas
          if (imageRef.current && canvasRef.current) {
            getSnapshot(imageRef.current, canvasRef.current, targetHeight)
          }
        }}
      />
    </NFTGrid>
  )
}
export function PositionPage() {
  const navBarFlag = useNavBarFlag()
  const navBarFlagEnabled = navBarFlag === NavBarVariant.Enabled
  const { tokenId: tokenIdFromUrl } = useParams<{ tokenId?: string }>()
  const { chainId, account, provider } = useWeb3React()
  const theme = useTheme()
  const parsedTokenId = tokenIdFromUrl ? BigNumber.from(tokenIdFromUrl) : undefined

  const { loading, option: optionDetails } = useOptionFromTokenId(parsedTokenId)

  const currencyIdA = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING //#TODO
  const idDetails = optionDetail(chainId, currencyIdA, parsedTokenId, account)

  const underlying = useToken(idDetails.underlyingAddress)
  const premium = useToken(idDetails.premiumAddress)
  const currencyUL = underlying ? underlying : undefined
  const currencyPR = premium ? premium : undefined

  const addTransaction = useTransactionAdder()

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <LightCard padding="12px 16px">
          <AutoColumn gap="md">
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={currencyPR} size={'20px'} style={{ marginRight: '0.5rem' }} />
                <ThemedText.DeprecatedMain>&nbsp;{idDetails.formattedPayoff}</ThemedText.DeprecatedMain>
              </RowFixed>
              <ThemedText.DeprecatedMain>{currencyPR?.symbol}</ThemedText.DeprecatedMain>
            </RowBetween>
          </AutoColumn>
        </LightCard>
        <ThemedText.DeprecatedItalic>
          <Trans>{TEXT.MODALS.EXERCISE}</Trans>
        </ThemedText.DeprecatedItalic>
        <ButtonPrimary onClick={exercise} width="100%">
          <Trans>Exercise</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }
  function modalHeaderBuy() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <ThemedText.DeprecatedItalic>
          <Trans>{TEXT.MODALS.BUY}</Trans>
        </ThemedText.DeprecatedItalic>
        <ButtonPrimary onClick={buysell} width="100%">
          <Trans>Buy</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }
  function modalHeaderSell() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <ThemedText.DeprecatedItalic>
          <Trans>{TEXT.MODALS.SELL}</Trans>
        </ThemedText.DeprecatedItalic>
        <ButtonPrimary onClick={buysell} width="100%">
          <Trans>Sell</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }
  const [collecting, setCollecting] = useState<boolean>(false)
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showBuy, setShowBuy] = useState<boolean>(false)
  const [showSell, setShowSell] = useState<boolean>(false)

  async function exercise() {
    if (!account && !parsedTokenId) return
    const operationalTreasury: Contract = new Contract(
      idDetails.operationalAddress,
      OPERATIONALABI,
      provider?.getSigner()
    )
    await operationalTreasury.payOff(parsedTokenId, account).catch('error', console.error)
  }
  async function buysell() {
    console.log('#TODO')
  }

  const marketplace = marketplaceDetail(idDetails.isExpired, idDetails.isClaimed, idDetails.active)

  const test = ''
  return loading ? (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  ) : (
    <Trace page={PageName.POOL_PAGE} shouldLogImpression>
      <>
        <PageWrapper navBarFlag={navBarFlagEnabled}>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={() => setShowConfirm(false)}
            attemptingTxn={collecting}
            hash={collectMigrationHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Exercise your option</Trans>}
                onDismiss={() => setShowConfirm(false)}
                topContent={modalHeader}
              />
            )}
            pendingText={<Trans>Exercise your option</Trans>}
          />
          <TransactionConfirmationModal
            isOpen={showBuy}
            onDismiss={() => setShowBuy(false)}
            attemptingTxn={collecting}
            hash={collectMigrationHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Buy this option</Trans>}
                onDismiss={() => setShowBuy(false)}
                topContent={modalHeaderBuy}
              />
            )}
            pendingText={<Trans>Buy this option</Trans>}
          />
          <TransactionConfirmationModal
            isOpen={showSell}
            onDismiss={() => setShowSell(false)}
            attemptingTxn={collecting}
            hash={collectMigrationHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Sell this option</Trans>}
                onDismiss={() => setShowSell(false)}
                topContent={modalHeaderSell}
              />
            )}
            pendingText={<Trans>Sell this option</Trans>}
          />
          <AutoColumn gap="md">
            <AutoColumn gap="sm">
              <Link
                data-cy="visit-pool"
                style={{ textDecoration: 'none', width: 'fit-content', marginBottom: '0.5rem' }}
                to="/pool"
              >
                <HoverText>
                  <Trans>← Back to list</Trans>
                </HoverText>
              </Link>
              <ResponsiveRow>
                <RowFixed>
                  <Trans>ID:&nbsp;{parsedTokenId?.toString()}&nbsp;</Trans>
                </RowFixed>
                {idDetails.ownsNFT && (
                  <RowFixed>
                    {!idDetails.active || idDetails.isExpired || idDetails.isClaimed ? (
                      <ButtonGray
                        width="fit-content"
                        padding="6px 8px"
                        $borderRadius="12px"
                        style={{ marginRight: '8px' }}
                        disabled={true}
                      >
                        <Trans>{idDetails.inactiveButtonText}</Trans>
                      </ButtonGray>
                    ) : null}
                    {idDetails.active && !idDetails.isExpired && !idDetails.isClaimed ? (
                      <ResponsiveButtonPrimary
                        onClick={() => {
                          setShowConfirm(true)
                        }}
                        width="fit-content"
                        padding="6px 8px"
                        style={{ marginRight: '8px' }}
                        $borderRadius="12px"
                      >
                        <Trans>Exercise</Trans>
                      </ResponsiveButtonPrimary>
                    ) : null}
                    {marketplace.isSell || !idDetails.active || idDetails.isExpired || idDetails.isClaimed ? (
                      <MouseoverTooltip text={<Trans>{TEXT.BUTTONS.SELLDISABLED}</Trans>}>
                        <ButtonGray
                          width="fit-content"
                          padding="6px 8px"
                          $borderRadius="12px"
                          style={{ marginRight: '8px' }}
                          disabled={true}
                        >
                          <Trans>Sell</Trans>
                        </ButtonGray>
                      </MouseoverTooltip>
                    ) : null}
                    {!marketplace.isSell && idDetails.active && !idDetails.isExpired && !idDetails.isClaimed ? (
                      <ResponsiveRedButtonPrimary
                        onClick={() => {
                          setShowSell(true)
                        }}
                        width="fit-content"
                        padding="6px 8px"
                        style={{ marginRight: '8px' }}
                        $borderRadius="12px"
                      >
                        <Trans>Sell</Trans>
                      </ResponsiveRedButtonPrimary>
                    ) : null}
                  </RowFixed>
                )}
                {!idDetails.ownsNFT && (
                  <RowFixed>
                    {!marketplace.isSell || !idDetails.active || idDetails.isExpired || idDetails.isClaimed ? (
                      <MouseoverTooltip text={<Trans>{TEXT.BUTTONS.BUYDISABLED}</Trans>}>
                        <ButtonGray
                          width="fit-content"
                          padding="6px 8px"
                          $borderRadius="12px"
                          style={{ marginRight: '8px' }}
                          disabled={true}
                        >
                          <Trans>Buy</Trans>
                        </ButtonGray>
                      </MouseoverTooltip>
                    ) : null}
                    {marketplace.isSell && idDetails.active && !idDetails.isExpired && !idDetails.isClaimed ? (
                      <ResponsiveGreenButtonPrimary
                        onClick={() => {
                          setShowBuy(true)
                        }}
                        width="fit-content"
                        padding="6px 8px"
                        style={{ marginRight: '8px' }}
                        $borderRadius="12px"
                      >
                        <Trans>Buy</Trans>
                      </ResponsiveGreenButtonPrimary>
                    ) : null}
                  </RowFixed>
                )}
              </ResponsiveRow>
            </AutoColumn>
            <ResponsiveRow align="flex-start">
              <DarkCard
                width="100%"
                height="100%"
                style={{
                  marginRight: '12px',
                  minWidth: '340px',
                }}
              >
                <RowBetween>
                  <Label>
                    <Trans>
                      test:
                      {test}
                    </Trans>
                  </Label>
                </RowBetween>
              </DarkCard>
              <AutoColumn gap="sm" style={{ width: '100%', height: '100%' }}>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      <Label>
                        <Trans>Option info</Trans>
                      </Label>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>Option type: {idDetails.strategyType}</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>Option period: {idDetails.formattedFunctionperiod} days</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>
                          Expiration:&nbsp;
                          {idDetails.closingDate}&nbsp;({idDetails.expired})
                        </Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>
                          Current market price:&nbsp;
                          {idDetails.aggregatorPrice}&nbsp;
                          {currencyPR?.symbol}
                        </Trans>
                      </ThemedText.DeprecatedLargeHeader>
                    </AutoColumn>
                  </AutoColumn>
                </DarkCard>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      <Label>
                        <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.INTRO}</Trans>}>
                          <AlertCircle width={14} height={14} />
                          &nbsp;
                          <Trans>Strike info</Trans>
                        </MouseoverTooltip>
                      </Label>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.DATE}</Trans>}>
                        <ThemedText.DeprecatedLargeHeader
                          color={theme.deprecated_text1}
                          fontSize="16px"
                          fontWeight={200}
                        >
                          <Trans>Strike date:&nbsp;{idDetails.openingDate}</Trans>
                        </ThemedText.DeprecatedLargeHeader>
                      </MouseoverTooltip>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.PRICE}</Trans>}>
                        <ThemedText.DeprecatedLargeHeader
                          color={theme.deprecated_text1}
                          fontSize="16px"
                          fontWeight={200}
                        >
                          <Trans>
                            Strike price:&nbsp;
                            {idDetails.formattedStrike}&nbsp;
                            {currencyPR?.symbol}
                          </Trans>
                        </ThemedText.DeprecatedLargeHeader>
                      </MouseoverTooltip>
                    </AutoColumn>
                    <LightCard padding="12px 16px">
                      <AutoColumn gap="md">
                        <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.COLLATERAL}</Trans>}>
                          <RowBetween>
                            <Trans>Collateral:</Trans>
                            <LinkedCurrency
                              chainId={chainId}
                              currency={currencyUL}
                              amount={idDetails.formattedAmount}
                            />
                          </RowBetween>
                        </MouseoverTooltip>
                        <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.PREMIUM}</Trans>}>
                          <RowBetween>
                            <Trans>Premium Paid:</Trans>
                            <LinkedCurrency
                              chainId={chainId}
                              currency={currencyPR}
                              amount={idDetails.formattedNegativePNL}
                            />
                          </RowBetween>
                        </MouseoverTooltip>
                      </AutoColumn>
                    </LightCard>
                  </AutoColumn>
                </DarkCard>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      {!idDetails.isClaimed && (
                        <RowBetween style={{ alignItems: 'flex-start' }}>
                          <AutoColumn gap="md">
                            <Label>
                              <Trans>Unrealized PNL</Trans>
                            </Label>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_text1}
                              fontSize="36px"
                              fontWeight={500}
                            >
                              <Trans>
                                {idDetails.formattedPayoff}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_secondary1}
                              fontSize="16px"
                              fontWeight={400}
                            >
                              <Trans>
                                Unrealized net PNL:&nbsp;
                                {idDetails.unrealizedPNL}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                          </AutoColumn>
                        </RowBetween>
                      )}
                      {idDetails.isClaimed && (
                        <RowBetween style={{ alignItems: 'flex-start' }}>
                          <AutoColumn gap="md">
                            <Label>
                              <Trans>Claimed PNL</Trans>
                            </Label>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_text1}
                              fontSize="36px"
                              fontWeight={500}
                            >
                              <Trans>
                                {idDetails.paidAmountHexFix}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_secondary1}
                              fontSize="16px"
                              fontWeight={400}
                            >
                              <Trans>
                                Net profit:&nbsp;
                                {idDetails.netClaimedPNL}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                          </AutoColumn>
                        </RowBetween>
                      )}
                    </AutoColumn>
                  </AutoColumn>
                </DarkCard>
              </AutoColumn>
            </ResponsiveRow>
          </AutoColumn>
        </PageWrapper>
        <SwitchLocaleLink />
      </>
    </Trace>
  )
}
