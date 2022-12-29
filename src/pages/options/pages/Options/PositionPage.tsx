import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import AddressInputPanel from 'components/AddressInputPanel'
import { sendEvent } from 'components/analytics'
import Badge from 'components/Badge'
import { ButtonGray, ButtonPrimary, ButtonSecondary } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { filterTimeAtom } from 'components/Tokens/state'
import { MouseoverTooltip } from 'components/Tooltip'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { NONFUNGIBLE_OPTION_MANAGER_ADDRESSES, OPERATIONAL_TREASURY_WETH_ADDRESSES } from 'constants/addresses'
import { nativeOnChain } from 'constants/tokens'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { useTokenQuery } from 'graphql/data/Token'
import { CHAIN_NAME_TO_CHAIN_ID, validateUrlChainParam } from 'graphql/data/util'
import { useToken } from 'hooks/Tokens'
import { useOptionFromTokenId } from 'hooks/useV3Positions'
import { useAtomValue } from 'jotai/utils'
import { ADDRESSES, METHODS } from 'pages/options/constants/addresses'
import { marketplaceDetail } from 'pages/options/constants/marketplaceDetail'
import { optionDetail } from 'pages/options/constants/optionDetail'
import { TEXT } from 'pages/options/constants/text'
import { Field } from 'pages/options/state/actions'
import { GetTransactionHash } from 'pages/options/state/GetStrategy'
import { address64, value64 } from 'pages/options/state/lib/base64'
import { useState } from 'react'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Plus } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import { useDerivedMintInfo } from 'state/mint/hooks'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import ChartSection from '../../components/Chart/optionChart/ChartSection'
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
const ResponsiveButtonSecondary = styled(ButtonSecondary)`
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

export const TokenDetailsLayout = styled.div`
  display: flex;
  padding: 0 8px;
  justify-content: center;
  width: 100%;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    gap: 16px;
    padding: 0 16px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    gap: 20px;
    padding: 48px 20px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xl}px) {
    gap: 40px;
  }
`

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

function LinkedTransactionhash({ chainId, txhash }: { chainId?: number; txhash?: string }) {
  if (typeof chainId === 'number' && txhash) {
    return (
      <ExternalLink href={getExplorerLink(chainId, txhash, ExplorerDataType.TRANSACTION)}>
        <RowFixed>
          <ThemedText.DeprecatedMain>&nbsp;{txhash} ↗</ThemedText.DeprecatedMain>
        </RowFixed>
      </ExternalLink>
    )
  }

  return (
    <RowFixed>
      <ThemedText.DeprecatedMain>{txhash}</ThemedText.DeprecatedMain>
    </RowFixed>
  )
}

function LinkedAccount({ chainId, owner }: { chainId?: number; owner?: string }) {
  if (typeof chainId === 'number' && owner) {
    return (
      <ExternalLink href={getExplorerLink(chainId, owner, ExplorerDataType.ADDRESS)}>
        <RowFixed>
          <ThemedText.DeprecatedMain>&nbsp;{owner} ↗</ThemedText.DeprecatedMain>
        </RowFixed>
      </ExternalLink>
    )
  }

  return (
    <RowFixed>
      <ThemedText.DeprecatedMain>{owner}</ThemedText.DeprecatedMain>
    </RowFixed>
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
        <ButtonPrimary onClick={onExercise} width="100%">
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

  const [typed, setTyped] = useState('')
  function handleRecipientType(val: string) {
    setTyped(val)
  }
  let invalidAddress = false
  if (!typed || typed === account) {
    invalidAddress = true
  }

  console.log(typed)
  function modalHeaderTransfer() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <AddressInputPanel value={typed} onChange={handleRecipientType} />
        <ButtonPrimary onClick={onTransfer} width="100%" disabled={invalidAddress}>
          <Trans>Transfer</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }
  const { currencies } = useDerivedMintInfo(underlying ?? undefined, premium ?? undefined)

  const [exercising, setExercise] = useState<boolean>(false)
  const [txExerciseHash, setExerciseHash] = useState<string>('')
  const isExercisePending = useIsTransactionPending(txExerciseHash ?? undefined)
  const [showExercise, setShowExercise] = useState<boolean>(false)

  const [transfering, setTransfer] = useState<boolean>(false)
  const [txTransferHash, setTransferHash] = useState<string>('')
  const isTransferPending = useIsTransactionPending(txTransferHash ?? undefined)
  const [showTransfer, setShowTransfer] = useState<boolean>(false)

  const [buysellTODO, setBuySell] = useState<boolean>(false)
  const [txBuySellHashTODO, setBuySellHash] = useState<string | null>(null)
  const isBuySellPending = useIsTransactionPending(txBuySellHashTODO ?? undefined)
  const [showBuy, setShowBuy] = useState<boolean>(false)
  const [showSell, setShowSell] = useState<boolean>(false)

  async function onExercise() {
    if (!chainId || !provider || !account) return

    const token = parsedTokenId?.toString() ? parsedTokenId?.toString() : undefined
    const topics0 = METHODS.PAYOFF
    const topics1 = value64(token)
    const topics2 = address64(account)

    const calldata = topics0 + topics1 + topics2
    const value = '0x0'
    const txn: { to: string; data: string; value: string } = {
      to: OPERATIONAL_TREASURY_WETH_ADDRESSES[chainId],
      data: calldata,
      value,
    }
    setExercise(true)

    provider
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }
        return provider
          .getSigner()
          .sendTransaction(newTxn)
          .then((response: TransactionResponse) => {
            setExercise(false)
            addTransaction(response, {
              type: TransactionType.EXERCISE,
              tokenId: token,
              account,
              underlying: idDetails.underlyingAddress,
            })
            setExerciseHash(response.hash)
            sendEvent({
              category: 'Exercise',
              action: 'exercise',
              label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
            })
          })
      })
      .catch((error) => {
        console.error('Failed to send transaction', error)
        setExercise(false)
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  async function buysell() {
    console.log('#TODO')
    setBuySell(true)
    setBuySellHash('response.hash')
  }

  async function onTransfer() {
    if (!chainId || !provider || !account || !typed) return

    const token = parsedTokenId?.toString() ? parsedTokenId?.toString() : undefined
    const topics0 = METHODS.TRANSFER
    const topics1 = address64(account)
    const topics2 = address64(typed)
    const topics3 = value64(token)

    const calldata = topics0 + topics1 + topics2 + topics3

    const value = '0x0'
    const txn: { to: string; data: string; value: string } = {
      to: NONFUNGIBLE_OPTION_MANAGER_ADDRESSES[chainId],
      data: calldata,
      value,
    }
    setTransfer(true)

    provider
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }
        return provider
          .getSigner()
          .sendTransaction(newTxn)
          .then((response: TransactionResponse) => {
            setTransfer(false)
            addTransaction(response, {
              type: TransactionType.TRANSFER,
              account,
              receiver: typed,
              tokenId: token,
              underlying: idDetails.underlyingAddress,
            })
            setTransferHash(response.hash)
            sendEvent({
              category: 'Transfer',
              action: 'transfer',
              label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
            })
          })
      })
      .catch((error) => {
        console.error('Failed to send transaction', error)
        setTransfer(false)
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const marketplace = marketplaceDetail(idDetails.isExpired, idDetails.isClaimed, idDetails.active)
  const tx = GetTransactionHash(parsedTokenId, idDetails.strategyAddress)

  const { tokenAddress: chainName } = useParams<{ tokenAddress?: string; chainName?: string }>()
  const currentChainName = validateUrlChainParam(chainName)
  const pageChainId = CHAIN_NAME_TO_CHAIN_ID[currentChainName]
  const nativeCurrency = nativeOnChain(pageChainId)
  const timePeriod = useAtomValue(filterTimeAtom)
  const [tokenQueryData, prices] = useTokenQuery(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ?? '',
    'ETHEREUM',
    timePeriod
  )

  function StrategyTypeImg() {
    let strategyImage
    if (idDetails.strategyType === 'CALL') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_green1}>
          <ArrowUpRight width={50} height={50} />
        </ThemedText.DeprecatedLargeHeader>
      )
    } else if (idDetails.strategyType === 'PUT') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_red1}>
          <ArrowDownRight width={50} height={50} />
        </ThemedText.DeprecatedLargeHeader>
      )
    }

    return <RowBetween>{strategyImage}</RowBetween>
  }
  let idLink = '#'
  if (typeof chainId === 'number') {
    idLink = getExplorerLink(chainId, '', ExplorerDataType.TOKEN) + idDetails.managerAddress + '?a=' + parsedTokenId
  }
  const createLink = 'http://localhost:3000/#/add/v2/0xEFCAae996a6b6848802d172F542a7Ff09B1690Eb'

  console.log('State: ' + idDetails.state)
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
            isOpen={showExercise}
            onDismiss={() => setShowExercise(false)}
            attemptingTxn={exercising}
            hash={txExerciseHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Exercise your option</Trans>}
                onDismiss={() => setShowExercise(false)}
                topContent={modalHeader}
              />
            )}
            pendingText={<Trans>Exercise your option</Trans>}
          />
          <TransactionConfirmationModal
            isOpen={showBuy}
            onDismiss={() => setShowBuy(false)}
            attemptingTxn={buysellTODO}
            hash={txBuySellHashTODO ?? ''}
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
            attemptingTxn={buysellTODO}
            hash={txBuySellHashTODO ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Sell this option</Trans>}
                onDismiss={() => setShowSell(false)}
                topContent={modalHeaderSell}
              />
            )}
            pendingText={<Trans>Sell this option</Trans>}
          />
          <TransactionConfirmationModal
            isOpen={showTransfer}
            onDismiss={() => setShowTransfer(false)}
            attemptingTxn={transfering}
            hash={txTransferHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Transfer option id: {tokenIdFromUrl}</Trans>}
                onDismiss={() => setShowTransfer(false)}
                topContent={modalHeaderTransfer}
              />
            )}
            pendingText={<Trans>Transfering option id: {tokenIdFromUrl}</Trans>}
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
                  <ExternalLink href={idLink}>
                    <ResponsiveButtonPrimary
                      width="fit-content"
                      padding="6px 8px"
                      style={{ marginRight: '8px' }}
                      $borderRadius="12px"
                    >
                      <Trans>ID:&nbsp;{parsedTokenId?.toString()}&nbsp;↗</Trans>
                    </ResponsiveButtonPrimary>
                  </ExternalLink>
                  <ExternalLink href={createLink}>
                    <ResponsiveButtonSecondary
                      width="fit-content"
                      padding="6px 8px"
                      style={{ marginRight: '8px' }}
                      $borderRadius="12px"
                    >
                      <Plus size={'18px'} />
                    </ResponsiveButtonSecondary>
                  </ExternalLink>
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
                          setShowExercise(true)
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
                    {!marketplace.isSell ? (
                      <ResponsiveButtonPrimary
                        onClick={() => {
                          setShowTransfer(true)
                        }}
                        width="fit-content"
                        padding="6px 8px"
                        style={{ marginRight: '8px' }}
                        $borderRadius="12px"
                      >
                        <Trans>Transfer</Trans>
                      </ResponsiveButtonPrimary>
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
                  {tokenQueryData && (
                    <ChartSection
                      token={tokenQueryData}
                      nativeCurrency={nativeCurrency}
                      prices={prices}
                      underlying={idDetails.underlyingAddress}
                      tokenId={parsedTokenId}
                    />
                  )}
                </RowBetween>
              </DarkCard>
              <AutoColumn gap="sm" style={{ width: '100%', height: '80%' }}>
                <DarkCard>
                  <AutoColumn gap="sm" style={{ width: '100%', paddingBottom: '20px' }}>
                    <RowBetween>
                      <AutoColumn gap="sm" style={{ width: '10%' }}>
                        <CurrencyLogo currency={currencyUL} size={'50px'} />
                      </AutoColumn>
                      <AutoColumn gap="sm" style={{ width: '20%' }}>
                        <StrategyTypeImg />
                      </AutoColumn>
                      <AutoColumn gap="sm" style={{ width: '55%' }}>
                        <RowBetween>
                          <ThemedText.DeprecatedLargeHeader
                            color={theme.deprecated_text1}
                            fontSize="26px"
                            fontWeight={600}
                          >
                            <Trans>{idDetails.strategyType}</Trans>
                          </ThemedText.DeprecatedLargeHeader>
                          <ThemedText.DeprecatedSubHeader
                            color={theme.deprecated_text2}
                            fontSize="16px"
                            fontWeight={400}
                          >
                            <Badge>
                              <BadgeText>
                                <Trans>{idDetails.formattedFunctionperiod}&nbsp; days</Trans>
                              </BadgeText>
                            </Badge>
                          </ThemedText.DeprecatedSubHeader>
                        </RowBetween>
                        <ThemedText.SubHeaderSmall color={theme.deprecated_text2} fontSize="14px" fontWeight={200}>
                          <Trans>
                            {idDetails.closingDate}&nbsp;({idDetails.expiredLeft})
                          </Trans>
                        </ThemedText.SubHeaderSmall>
                      </AutoColumn>
                    </RowBetween>
                  </AutoColumn>
                  <LightCard>
                    <AutoColumn gap="md">
                      {!idDetails.isClaimed && (
                        <AutoColumn gap="md">
                          <ThemedText.SubHeader color={theme.deprecated_text2} fontSize="14px" fontWeight={200}>
                            <Trans>Unrealized PNL</Trans>
                          </ThemedText.SubHeader>
                          <ThemedText.DeprecatedLargeHeader
                            color={theme.deprecated_text1}
                            fontSize="36px"
                            fontWeight={500}
                          >
                            <Trans>
                              {idDetails.formattedPayoff}&nbsp;
                              {currencyPR?.symbol}
                            </Trans>
                            <ThemedText.SubHeader color={theme.deprecated_secondary1} fontSize="16px" fontWeight={300}>
                              <Trans>
                                Unrealized net PNL:&nbsp;
                                {idDetails.unrealizedPNL}&nbsp;
                                {currencyPR?.symbol}
                              </Trans>
                            </ThemedText.SubHeader>
                          </ThemedText.DeprecatedLargeHeader>
                        </AutoColumn>
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
                  </LightCard>
                </DarkCard>
                <DarkCard>
                  <AutoColumn gap="md" style={{ width: '100%' }}>
                    <AutoColumn gap="md">
                      <ThemedText.DeprecatedLargeHeader
                        color={theme.deprecated_secondary1}
                        fontSize="16px"
                        fontWeight={600}
                      >
                        <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.INTRO}</Trans>}>
                          <AlertCircle width={14} height={14} />
                          &nbsp;
                          <Trans>Strike info</Trans>
                        </MouseoverTooltip>
                      </ThemedText.DeprecatedLargeHeader>
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
                            {currencyPR?.symbol}&nbsp;→&nbsp;{idDetails.aggregatorPrice}&nbsp;
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
              </AutoColumn>
            </ResponsiveRow>
            <ResponsiveRow align="flex-start">
              <AutoColumn gap="sm" style={{ width: '100%', height: '100%' }}>
                <LightCard padding="12px 16px">
                  <AutoColumn gap="md">
                    <RowBetween>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.PREMIUM}</Trans>}>
                        <RowBetween>
                          <Trans>Minted at:</Trans>
                          <LinkedTransactionhash chainId={chainId} txhash={tx.txhash} />
                        </RowBetween>
                      </MouseoverTooltip>
                    </RowBetween>
                    <RowBetween>
                      <MouseoverTooltip text={<Trans>{TEXT.STRIKE_INFO.PREMIUM}</Trans>}>
                        <RowBetween>
                          <Trans>Owner:</Trans>
                          <LinkedAccount chainId={chainId} owner={idDetails.optionOwner} />
                        </RowBetween>
                      </MouseoverTooltip>
                    </RowBetween>
                  </AutoColumn>
                </LightCard>
              </AutoColumn>
            </ResponsiveRow>
          </AutoColumn>
        </PageWrapper>
        <SwitchLocaleLink />
      </>
    </Trace>
  )
}
