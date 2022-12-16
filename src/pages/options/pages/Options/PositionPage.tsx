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
import { useAddresses } from 'pages/options/constants/contractsNew'
import { TEXT } from 'pages/options/constants/text'
import { GetPayOffAvailable, GetPayOffbyId, GetStrategyData } from 'pages/options/state/GetOptionPrice'
import { GetOptionState } from 'pages/options/state/GetOptionState'
import { GetOwnerbyId } from 'pages/options/state/GetPositionManager'
import { GetStrike } from 'pages/options/state/GetStrike'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { OPERATIONALABI } from '../../constants/abis/OPERATIONALABI'
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

function LinkedCurrency({ chainId, currency }: { chainId?: number; currency?: Currency }) {
  const address = (currency as Token)?.address

  if (typeof chainId === 'number' && address) {
    return (
      <ExternalLink href={getExplorerLink(chainId, address, ExplorerDataType.TOKEN)}>
        <RowFixed>
          <CurrencyLogo currency={currency} size={'20px'} style={{ marginRight: '0.5rem' }} />
          <ThemedText.DeprecatedMain>{currency?.symbol} ↗</ThemedText.DeprecatedMain>
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

  const currencyIdA = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING //make check underlying type

  const addresses = useAddresses(chainId, currencyIdA, parsedTokenId)

  const underlying = useToken(addresses.underlyingAddress)
  const premium = useToken(addresses.premiumAddress)

  const negativepnl = addresses.negativepnl
  const formattedNegativePNL = (Math.floor(Number(negativepnl)) / 10e5).toFixed(3)

  const currencyUL = underlying ? underlying : undefined
  const currencyPR = premium ? premium : undefined

  const payOff = GetPayOffbyId(addresses.strategyAddress, parsedTokenId).payOff
  const formattedPayoff = (Math.floor(Number(payOff)) / 10e5).toFixed(3)

  const optionOwner = GetOwnerbyId(addresses.managerAddress, parsedTokenId).address
  const payOffAvailable = GetPayOffAvailable(
    addresses.strategyAddress,
    parsedTokenId,
    account?.toString(),
    optionOwner
  ).available

  const dataAmount = GetStrategyData(addresses.strategyAddress, parsedTokenId).amount
  const formattedAmount = (Math.floor(Number(dataAmount)) / 10e17).toFixed(6)
  const dataStrike = GetStrategyData(addresses.strategyAddress, parsedTokenId).strike
  const formattedStrike = (Math.floor(Number(dataStrike)) / 10e7).toFixed(2)
  const aggregatorPrice = GetStrike(addresses.aggregatorAddress ?? undefined).formattedStrike

  const addTransaction = useTransactionAdder()
  const active = payOffAvailable?.toString() === 'true'
  const ownsNFT = optionOwner === account

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <LightCard padding="12px 16px">
          <AutoColumn gap="md">
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={currencyPR} size={'20px'} style={{ marginRight: '0.5rem' }} />
                <ThemedText.DeprecatedMain>&nbsp;{formattedPayoff}</ThemedText.DeprecatedMain>
              </RowFixed>
              <ThemedText.DeprecatedMain>{currencyPR?.symbol}</ThemedText.DeprecatedMain>
            </RowBetween>
          </AutoColumn>
        </LightCard>
        <ThemedText.DeprecatedItalic>
          <Trans>
            When exercise an option, you will take the Unrealized PNL, then your option will be set inactive
          </Trans>
        </ThemedText.DeprecatedItalic>
        <ButtonPrimary onClick={exercise} width="100%">
          <Trans>Exercise</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }
  const [collecting, setCollecting] = useState<boolean>(false)
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  async function exercise() {
    if (!account && !parsedTokenId) return
    const operationalTreasury: Contract = new Contract(
      addresses.operationalAddress,
      OPERATIONALABI,
      provider?.getSigner()
    )
    await operationalTreasury.payOff(parsedTokenId, account).catch('error', console.error)
  }

  const getState = GetOptionState(addresses.operationalAddress, addresses.strategyAddress, parsedTokenId)

  let inactiveButtonText = 'Unexercisable'
  if (getState.isExpired) {
    inactiveButtonText = 'Expired'
  } else if (getState.isClaimed) {
    inactiveButtonText = 'Claimed'
  }

  //some formats
  const formattedFunctionperiod = getState.periodHexFix / 60 / 60 / 24
  const openingDate = new Date(
    (Math.floor(Number(addresses.expiration)) - getState.periodHexFix) * 10e2
  ).toLocaleString()
  const closingDate = new Date(Math.floor(Number(addresses.expiration)) * 10e2).toLocaleDateString()
  const netClaimedPNL = ((Math.floor(Number(getState.paidAmountHex)) - Math.floor(Number(negativepnl))) / 10e5).toFixed(
    3
  )

  //some test & formatted
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
            pendingText={<Trans>Collecting fees</Trans>}
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
                {ownsNFT && (
                  <RowFixed>
                    {!active || getState.isExpired || getState.isClaimed ? (
                      <ButtonGray
                        width="fit-content"
                        padding="6px 8px"
                        $borderRadius="12px"
                        style={{ marginRight: '8px' }}
                        disabled={true}
                      >
                        <Trans>{inactiveButtonText}</Trans>
                      </ButtonGray>
                    ) : null}
                    {active && !getState.isExpired && !getState.isClaimed ? (
                      <ResponsiveButtonPrimary
                        onClick={() => {
                          setShowConfirm(true)
                        }}
                        width="fit-content"
                        padding="6px 8px"
                        $borderRadius="12px"
                      >
                        <Trans>Exercise</Trans>
                      </ResponsiveButtonPrimary>
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
                        <Trans>Option type: {addresses.strategyType}</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>Option period: {formattedFunctionperiod} days</Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>
                          Expiration:&nbsp;
                          {closingDate}&nbsp;({getState.expired})
                        </Trans>
                      </ThemedText.DeprecatedLargeHeader>
                      <ThemedText.DeprecatedLargeHeader color={theme.deprecated_text1} fontSize="16px" fontWeight={200}>
                        <Trans>
                          Current market price:&nbsp;
                          {aggregatorPrice}&nbsp;
                          {currencyPR?.symbol}
                        </Trans>
                      </ThemedText.DeprecatedLargeHeader>
                    </AutoColumn>
                    <LightCard padding="12px 16px">
                      <AutoColumn gap="md">
                        <RowBetween>
                          <Trans>Underlying token:</Trans>
                          <LinkedCurrency chainId={chainId} currency={currencyUL} />
                        </RowBetween>
                        <RowBetween>
                          <Trans>Premium token:</Trans>
                          <LinkedCurrency chainId={chainId} currency={currencyPR} />
                        </RowBetween>
                      </AutoColumn>
                    </LightCard>
                  </AutoColumn>
                </DarkCard>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      <Label>
                        <Trans>Strike info</Trans>
                      </Label>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.DATE}</Trans>}>
                        <ThemedText.DeprecatedLargeHeader
                          color={theme.deprecated_text1}
                          fontSize="16px"
                          fontWeight={200}
                        >
                          <Trans>Strike date:&nbsp;{openingDate}</Trans>
                        </ThemedText.DeprecatedLargeHeader>
                      </MouseoverTooltip>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.COLLATERAL}</Trans>}>
                        <ThemedText.DeprecatedLargeHeader
                          color={theme.deprecated_text1}
                          fontSize="16px"
                          fontWeight={200}
                        >
                          <Trans>
                            Collateral:&nbsp;
                            {formattedAmount}&nbsp;
                            {currencyUL?.symbol}
                          </Trans>
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
                            {formattedStrike}&nbsp;
                            {currencyPR?.symbol}
                          </Trans>
                        </ThemedText.DeprecatedLargeHeader>
                      </MouseoverTooltip>
                    </AutoColumn>
                  </AutoColumn>
                </DarkCard>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      {!getState.isClaimed && (
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
                                {formattedPayoff}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_secondary1}
                              fontSize="16px"
                              fontWeight={400}
                            >
                              <Trans>
                                Paid:&nbsp;
                                {formattedNegativePNL}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                          </AutoColumn>
                        </RowBetween>
                      )}
                      {getState.isClaimed && (
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
                                {getState.paidAmountHexFix}&nbsp;
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
                                {netClaimedPNL}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.DeprecatedLargeHeader>
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.deprecated_secondary1}
                              fontSize="16px"
                              fontWeight={400}
                            >
                              <Trans>
                                Paid:&nbsp;{formattedNegativePNL}&nbsp;{currencyPR?.symbol}
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
