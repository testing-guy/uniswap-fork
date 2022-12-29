import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { ElementName, Event, EventName } from 'analytics/constants'
import { TraceEvent } from 'analytics/TraceEvent'
import { sendEvent } from 'components/analytics'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Row, { RowBetween, RowFlat } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { filterTimeAtom } from 'components/Tokens/state'
import FilterOption from 'components/Tokens/TokenTable/FilterOption'
import { WIDGET_WIDTH } from 'components/Widget'
import { OPERATIONAL_TREASURY_WETH_ADDRESSES } from 'constants/addresses'
import { nativeOnChain } from 'constants/tokens'
import { useTokenQuery } from 'graphql/data/Token'
import { CHAIN_NAME_TO_CHAIN_ID, validateUrlChainParam } from 'graphql/data/util'
import { useCurrency, useToken } from 'hooks/Tokens'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useAtomValue } from 'jotai/utils'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import ChartSection from 'pages/options/components/Chart/creationChart/ChartSection'
import { HEX, METHODS } from 'pages/options/constants/addresses'
import { GetOptionLimit } from 'pages/options/state/GetOptionLimit'
import { address64, amount64, value64 } from 'pages/options/state/lib/base64'
import { darken } from 'polished'
import React, { useCallback, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Calendar, Check, ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useToggleWalletModal } from 'state/application/hooks'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useCurrencyBalance, useTokenBalance } from 'state/connection/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { currencyId } from 'utils/currencyId'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import AppBody from '../../../AppBody'
import { ConfirmAddModalBottom } from '../../components/ConfirmAddModalBottom'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { useAddresses } from '../../constants/contracts'
import { ApprovalState, useApprovePremiumCallback } from '../../hooks/ApproveCallback/useApproveCallback'
import { useTreasuryContract } from '../../hooks/useContract'
import { Field, strategyOptions, StrategyType, timeOptions, TimePeriod } from '../../state/actions'
import { GetOptionPricePrice } from '../../state/GetOptionPrice'
import { GetStrike } from '../../state/GetStrike'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/hooks'
import { Dots, Wrapper } from '../Options/styleds'
import CurrencyInputPanel from './currencyInputPanelOptions'
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
export const PanelLeft = styled.div`
  display: none;
  flex-direction: column;
  gap: 20px;
  width: 50%;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    display: flex;
  }
`
export const PanelRight = styled.div`
  display: none;
  flex-direction: column;
  gap: 20px;
  width: ${WIDGET_WIDTH}px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    display: flex;
  }
`
const InternalMenuItem = styled.div`
  flex: 1;
  padding: 8px;
  color: ${({ theme }) => theme.textPrimary};
  border-radius: 8px;

  :hover {
    cursor: pointer;
    text-decoration: none;
  }
`
const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;

  @media only screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    width: 72px;
  }
`
const StyledMenuContent = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  border: none;
  width: 100%;
  vertical-align: middle;
`
const Chevron = styled.span<{ open: boolean }>`
  padding-top: 1px;
  color: ${({ open, theme }) => (open ? theme.accentActive : theme.textSecondary)};
`
const MenuTimeFlyout = styled.span`
  min-width: 140px;
  max-height: 300px;
  overflow: auto;
  background-color: ${({ theme }) => theme.backgroundSurface};
  box-shadow: ${({ theme }) => theme.deepShadow};
  border: 0.5px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  position: absolute;
  top: 48px;
  z-index: 100;
  left: 0px;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    right: 0px;
    left: unset;
  }
`
const InternalLinkMenuItem = styled(InternalMenuItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 8px;
  justify-content: space-between;
  text-decoration: none;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.hoverState};
    text-decoration: none;
  }
`
const NetworkFilterOption = styled(FilterOption)``
const NetworkLabel = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`
const Logo = styled.img`
  height: 20px;
  width: 20px;
`
const CheckContainer = styled.div`
  display: flex;
  flex-direction: flex-end;
`
const FancyButton = styled.button`
  color: ${({ theme }) => theme.deprecated_text1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  outline: none;
  background: ${({ theme }) => theme.deprecated_bg1};
  :hover {
    border: 1px solid ${({ theme }) => theme.deprecated_bg4};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.deprecated_primary1};
  }
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean; redesignFlag: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  border-radius: ${({ redesignFlag }) => redesignFlag && '12px'};
  flex: 1;
  border: ${({ theme, active, warning }) =>
    active
      ? `1px solid ${warning ? theme.deprecated_red1 : theme.deprecated_primary1}`
      : warning && `1px solid ${theme.deprecated_red1}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.deprecated_red1) : darken(0.1, theme.deprecated_primary1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`
const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `}
`

export default function CreateOption() {
  const { underlyingCurrency } = useParams<{ underlyingCurrency?: string }>()
  const navigate = useNavigate()
  const { account, chainId, provider } = useWeb3React()
  const toggleWalletModal = useToggleWalletModal()
  const addTransaction = useTransactionAdder()

  const [strategyType, setStrategyType] = useState<StrategyType>(StrategyType.CALL)
  const { operationalAddress, aggregatorAddress, strategy, premiumCurrency } = useAddresses(
    chainId ?? undefined,
    underlyingCurrency ?? undefined,
    strategyType ?? undefined
  )
  const operationalTreasury = useTreasuryContract(operationalAddress)
  const underlyingToken = useCurrency(underlyingCurrency)
  const premiumToken = useCurrency(premiumCurrency)
  const premiumToken2 = useToken(premiumCurrency)

  const unsupportedUnderlying = false //#TODO: unsupported tokens

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const { dependentField, currencies, parsedAmounts, error } = useDerivedMintInfo(
    underlyingToken ?? undefined,
    premiumToken ?? undefined
  )

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, premiumToken ?? undefined)
  const tokenBalance = useTokenBalance(account ?? undefined, premiumToken2 ?? undefined)
  const { formattedStrike } = GetStrike(aggregatorAddress ?? undefined)
  const formattedTypedAmount = Math.floor(Number(parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)) * 10e17).toString()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.SevenDays)
  const { pnl, decimalPNL } = GetOptionPricePrice(
    strategy ?? undefined,
    formattedTypedAmount ?? undefined,
    timePeriod ?? undefined
  )

  let availableOption = true
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amount pnl
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: availableOption ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const premiumAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    decimalPNL,
    currencies[Field.CURRENCY_B]
  )
  const [approval, approveBCallback] = useApprovePremiumCallback(premiumAmount, operationalTreasury?.address)

  const timePeriodFixed = Math.floor(Number(timePeriod) / 60) / 60 / 24

  const balance = formatCurrencyAmount(selectedCurrencyBalance, 20).replace(',', '')
  const balanceNumb = Math.floor(Number(balance))
  const pnlNumb = Math.floor(Number(decimalPNL))
  const insufficientBalance = pnlNumb > balanceNumb

  let limit = GetOptionLimit(strategy, timePeriod).limit
  if (!limit) {
    limit = '0'
  }
  const amountNumb = Math.floor(Number(formattedTypedAmount))
  const limitNumb = Math.floor(Number(limit))
  const insufficientLiquidity = amountNumb > limitNumb

  if (insufficientLiquidity || insufficientBalance) {
    availableOption = false
  }
  const { onFieldAInput } = useMintActionHandlers(availableOption)

  const modalHeader = () => {
    return availableOption ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" $borderRadius="20px" marginBottom={20}>
          <Text fontSize="14px" fontWeight={500} lineHeight="12px" marginRight={10}>
            {'ISIN'}
          </Text>
          <RowFlat>
            <Text fontSize="34px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {currencies[Field.CURRENCY_A]?.symbol + strategyType + formattedStrike + 'D' + timePeriodFixed}
            </Text>
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <ThemedText.DeprecatedItalic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
          <Trans>Output is estimated. If the price changes by more than *** your transaction will revert.</Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        pnl={decimalPNL}
        strike={formattedStrike}
        period={timePeriod}
        onAdd={onBuy}
      />
    )
  }

  const pendingText = (
    <ThemedText.DeprecatedLink fontSize={'15px'} fontWeight={200} color={'deprecated_text2'}>
      <Trans>
        Creating new {strategyType} Option for {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}{' '}
        {currencies[Field.CURRENCY_A]?.symbol} at price of {decimalPNL} {currencies[Field.CURRENCY_B]?.symbol} for{' '}
        {timePeriodFixed} days. Price Strike: {formattedStrike} {currencies[Field.CURRENCY_B]?.symbol}
      </Trans>
    </ThemedText.DeprecatedLink>
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    if (txHash) {
      onFieldAInput('')
      navigate('/pool')
    }
    setTxHash('')
  }, [navigate, onFieldAInput, txHash])

  const handleCurrencyASelect = useCallback(
    (underlyingToken: Currency) => {
      const underlying = currencyId(underlyingToken)
      navigate(`/add/v2/${underlying}`)
    },
    [premiumToken, navigate, underlyingCurrency]
  )

  //chart input
  const { tokenAddress: chainName } = useParams<{ tokenAddress?: string; chainName?: string }>()
  const currentChainName = validateUrlChainParam(chainName)
  const pageChainId = CHAIN_NAME_TO_CHAIN_ID[currentChainName]
  const nativeCurrency = nativeOnChain(pageChainId)
  const timePeriodValue = useAtomValue(filterTimeAtom)
  const [tokenQueryData, prices] = useTokenQuery(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ?? '',
    'ETHEREUM',
    timePeriodValue
  )

  async function onBuy() {
    if (!chainId || !provider || !account) return

    const topics0 = METHODS.BUY
    const topics1 = address64(strategy)
    const topics2 = address64(account)
    const topics3 = amount64(formattedTypedAmount)
    const topics4 = value64(timePeriod)
    const topics5 = HEX[64].slice(2) + 'a0'
    const topics6 = HEX[64]

    const calldata = topics0 + topics1 + topics2 + topics3 + topics4 + topics5 + topics6
    const value = '0x0'
    const additional = ['']
    const txn: { to: string; data: string; value: string } = {
      to: OPERATIONAL_TREASURY_WETH_ADDRESSES[chainId],
      data: calldata,
      value,
    }
    setAttemptingTxn(true)

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
            setAttemptingTxn(false)
            addTransaction(response, {
              type: TransactionType.CREATE,
              strategyAddress: strategy,
              account,
              collateral: formattedTypedAmount,
              period: timePeriod,
              additional,
              underlying: underlyingCurrency,
            })
            setTxHash(response.hash)
            sendEvent({
              category: 'Create',
              action: 'create',
              label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
            })
          })
      })
      .catch((error) => {
        console.error('Failed to send transaction', error)
        setAttemptingTxn(false)
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  //new test dropdown
  const theme = useTheme()
  const node = useRef<HTMLDivElement | null>(null)

  const openTime = useModalIsOpen(ApplicationModal.TIME_SELECTOR)
  const toggleMenu = useToggleModal(ApplicationModal.TIME_SELECTOR)

  const openStrat = useModalIsOpen(ApplicationModal.STRATEGY)
  const toggleMenuStrat = useToggleModal(ApplicationModal.STRATEGY)

  useOnClickOutside(node, openTime ? toggleMenu : undefined)

  const formattedTimePeriod = Math.floor(Number(timePeriod) / 60 / 60 / 24) + 'D'

  function StrategyTypeImg() {
    let strategyImage
    if (strategyType === 'CALL') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_green1}>
          <ArrowUpRight />
        </ThemedText.DeprecatedLargeHeader>
      )
    } else if (strategyType === 'PUT') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_red1}>
          <ArrowDownRight />
        </ThemedText.DeprecatedLargeHeader>
      )
    }

    return <RowBetween>{strategyImage}</RowBetween>
  }
  function StrategyPeriodImg() {
    let strategyImage
    if (formattedTimePeriod === '7D') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_blue1}>
          <Calendar />
        </ThemedText.DeprecatedLargeHeader>
      )
    } else if (formattedTimePeriod === '14D') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_blue1}>
          <Calendar />
        </ThemedText.DeprecatedLargeHeader>
      )
    } else if (formattedTimePeriod === '30D') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_blue1}>
          <Calendar />
        </ThemedText.DeprecatedLargeHeader>
      )
    } else if (formattedTimePeriod === '45D') {
      strategyImage = (
        <ThemedText.DeprecatedLargeHeader color={theme.deprecated_blue1}>
          <Calendar />
        </ThemedText.DeprecatedLargeHeader>
      )
    }

    return <RowBetween>{strategyImage}</RowBetween>
  }
  return (
    <TokenDetailsLayout>
      <>
        <PanelLeft>
          <Wrapper>
            <RowBetween>
              {tokenQueryData && (
                <ChartSection
                  token={tokenQueryData}
                  nativeCurrency={nativeCurrency}
                  prices={prices}
                  underlying={underlyingCurrency}
                  strike={formattedStrike}
                  optionCost={decimalPNL}
                  strategyType={strategyType}
                  collateral={formattedAmounts[Field.CURRENCY_A]}
                />
              )}
            </RowBetween>
            <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
              <Trans>Aggregator Price (Strike): {formattedStrike} $</Trans>
            </ThemedText.DeprecatedLink>
          </Wrapper>
          {/* <AppBody>
            <Wrapper>
              <ThemedText.DeprecatedLink fontWeight={200} color={'deprecated_primary1'}>
                <Trans>Read data:</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*Option size: {formattedTypedAmount}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*Amount to Approve: {formattedTypedAmount}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*Token selected: {currencies[independentField]?.symbol}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*PNL: {pnl}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*formattedAmount e18: {formattedTypedAmount}</Trans>
              </ThemedText.DeprecatedLink>
            </Wrapper>
            <Wrapper>
              <ThemedText.DeprecatedLink fontWeight={200} color={'deprecated_primary1'}>
                <Trans>Output data:</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>USDC: {premiumCurrency}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>TimePeriod: {timePeriod}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>Amount: {formattedAmounts[Field.CURRENCY_A]}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>Strategy Type: {strategyType}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>ChainId: {chainId}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>Operational: {operationalAddress}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>Strategy: {strategy}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>Aggregator: {aggregatorAddress}</Trans>
              </ThemedText.DeprecatedLink>
            </Wrapper>
          </AppBody> */}
        </PanelLeft>
        <PanelRight>
          <AppBody>
            <Wrapper>
              <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                  <ConfirmationModalContent
                    title={<Trans>Your option details</Trans>}
                    onDismiss={handleDismissConfirmation}
                    topContent={modalHeader}
                    bottomContent={modalBottom}
                  />
                )}
                pendingText={pendingText}
              />
              <AutoColumn gap="20px">
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_A]}
                  strategy={strategy}
                  period={timePeriod}
                  onUserInput={onFieldAInput}
                  onCurrencySelect={handleCurrencyASelect}
                  currency={currencies[Field.CURRENCY_A] ?? null}
                  currencyPR={currencies[Field.CURRENCY_B] ?? null}
                  id="add-liquidity-input-tokena"
                  showCommonBases
                  cost={decimalPNL}
                  balance={formatCurrencyAmount(selectedCurrencyBalance, 8)}
                />
                <ColumnCenter>
                  <RowBetween>
                    <StyledMenu ref={node}>
                      <NetworkFilterOption onClick={toggleMenuStrat} aria-label={`networkFilter`} active={openStrat}>
                        <StyledMenuContent>
                          <StrategyTypeImg />
                          {strategyType}
                          <Chevron open={openStrat}>
                            {openStrat ? (
                              <ChevronUp width={20} height={15} viewBox="0 0 24 20" />
                            ) : (
                              <ChevronDown width={20} height={15} viewBox="0 0 24 20" />
                            )}
                          </Chevron>
                        </StyledMenuContent>
                      </NetworkFilterOption>
                      {openStrat && (
                        <MenuTimeFlyout>
                          {strategyOptions.map((strategy) => (
                            <InternalLinkMenuItem
                              key={strategy.value}
                              onClick={() => {
                                setStrategyType(strategy.value)
                                toggleMenuStrat()
                              }}
                            >
                              <div>{strategy.label}</div>
                              {strategy.label === strategyType && <Check color={theme.accentAction} size={16} />}
                            </InternalLinkMenuItem>
                          ))}
                        </MenuTimeFlyout>
                      )}
                    </StyledMenu>
                    <StyledMenu ref={node}>
                      <FilterOption onClick={toggleMenu} aria-label={`timeOptions`} active={openTime}>
                        <StyledMenuContent>
                          <StrategyPeriodImg />
                          {formattedTimePeriod}
                          <Chevron open={openTime}>
                            {openTime ? (
                              <ChevronUp width={20} height={15} viewBox="0 0 24 20" />
                            ) : (
                              <ChevronDown width={20} height={15} viewBox="0 0 24 20" />
                            )}
                          </Chevron>
                        </StyledMenuContent>
                      </FilterOption>
                      {openTime && (
                        <MenuTimeFlyout>
                          {timeOptions.map((timeOptions) => (
                            <InternalLinkMenuItem
                              key={timeOptions.value}
                              onClick={() => {
                                setTimePeriod(timeOptions.value)
                                toggleMenu()
                              }}
                            >
                              <div>{timeOptions.label}</div>
                              {timeOptions.label === formattedTimePeriod && (
                                <Check color={theme.accentAction} size={16} />
                              )}
                            </InternalLinkMenuItem>
                          ))}
                        </MenuTimeFlyout>
                      )}
                    </StyledMenu>
                  </RowBetween>
                </ColumnCenter>
                {unsupportedUnderlying ? (
                  <ButtonPrimary disabled={true}></ButtonPrimary>
                ) : !account ? (
                  <TraceEvent
                    events={[Event.onClick]}
                    name={EventName.CONNECT_WALLET_BUTTON_CLICKED}
                    properties={{ received_swap_quote: false }}
                    element={ElementName.CONNECT_WALLET_BUTTON}
                  >
                    <ButtonLight onClick={toggleWalletModal}>
                      <Trans>Connect Wallet</Trans>
                    </ButtonLight>
                  </TraceEvent>
                ) : (
                  <AutoColumn gap={'md'}>
                    {isValid && (
                      <RowBetween>
                        {approval !== ApprovalState.APPROVED && (
                          <ButtonPrimary
                            onClick={approveBCallback}
                            disabled={approval === ApprovalState.PENDING}
                            width={'100%'}
                          >
                            {approval === ApprovalState.PENDING ? (
                              <Dots>
                                <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                              </Dots>
                            ) : (
                              <Trans>
                                Approve {decimalPNL} {currencies[Field.CURRENCY_B]?.symbol}
                              </Trans>
                            )}
                          </ButtonPrimary>
                        )}
                      </RowBetween>
                    )}
                    {!insufficientBalance && !insufficientLiquidity && (
                      <ButtonError
                        disabled={approval !== ApprovalState.APPROVED}
                        onClick={() => {
                          setShowConfirm(true)
                        }}
                        error={!isValid}
                      >
                        <Text fontSize={20} fontWeight={500}>
                          {error ?? <Trans>Mint {strategyType} Option</Trans>}
                        </Text>
                      </ButtonError>
                    )}
                    {insufficientBalance && !insufficientLiquidity && (
                      <ButtonError disabled={insufficientBalance} error={!isValid}>
                        <Text fontSize={20} fontWeight={500}>
                          {error ?? <Trans>Insufficient {currencies[Field.CURRENCY_B]?.symbol} balance</Trans>}
                        </Text>
                      </ButtonError>
                    )}
                    {insufficientLiquidity && (
                      <ButtonError disabled={insufficientLiquidity} error={!isValid}>
                        <Text fontSize={20} fontWeight={500}>
                          {error ?? <Trans>Insufficient {currencies[Field.CURRENCY_A]?.symbol} liquidity</Trans>}
                        </Text>
                      </ButtonError>
                    )}
                  </AutoColumn>
                )}
              </AutoColumn>
            </Wrapper>
          </AppBody>
          <SwitchLocaleLink />
        </PanelRight>
      </>
    </TokenDetailsLayout>
  )
}
