import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { ElementName, Event, EventName } from 'analytics/constants'
import { TraceEvent } from 'analytics/TraceEvent'
import clsx from 'clsx'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Row, { RowBetween, RowFlat } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { WIDGET_WIDTH } from 'components/Widget'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import React, { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import { useToggleWalletModal } from 'state/application/hooks'
import { useCurrencyBalance } from 'state/connection/hooks'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import AppBody from '../../../AppBody'
import { Box } from '../../components/Box'
import { ConfirmAddModalBottom } from '../../components/ConfirmAddModalBottom'
import { AddRemoveTabs } from '../../components/OptionsTabs'
import { OPERATIONALABI } from '../../constants/abis/OPERATIONALABI'
import { useAddresses } from '../../constants/contracts'
import { useTreasuryContract } from '../../hooks/useContract'
import { Field, Sub } from '../../state/actions'
import { GetOptionPricePrice } from '../../state/GetOptionPrice'
import { GetStrike } from '../../state/GetStrike'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/hooks'
import * as styles from '../../styles/Explore.css'
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
export const Panel = styled.div`
  display: none;
  flex-direction: column;
  gap: 20px;
  width: ${WIDGET_WIDTH}px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    display: flex;
  }
`
const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export enum TimePeriod {
  SevenDays = '604800',
  FourTeenDays = '1209600',
  ThirtyDays = '2592000',
  FortyFiveDays = '3888000',
}

export enum StrategyType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export default function CreateOption() {
  const { currencyIdA } = useParams<{ currencyIdA?: string }>()
  const navigate = useNavigate()
  const { account, chainId, provider, isActive } = useWeb3React()
  const theme = useTheme()

  const [strategyType, setStrategyType] = useState<StrategyType>(StrategyType.CALL)

  const { operationalAddress, aggregatorAddress, strategy, premiumCurrency } = useAddresses(
    chainId ?? undefined,
    currencyIdA ?? undefined,
    strategyType ?? undefined
  )

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(premiumCurrency)

  //match currency A and search operational treasury string

  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    currencyBalances,
    parsedAmounts,
    parsedPNL,
    price,
    noLiquidity,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  //aggregator state
  const { formattedStrike } = GetStrike(aggregatorAddress ?? undefined)

  //pnl state
  const formattedTypedAmount = Math.floor(Number(parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)) * 10e17).toString()
  const timeOptions: { label: string; value: TimePeriod }[] = [
    { label: '7 days', value: TimePeriod.SevenDays },
    { label: '14 days', value: TimePeriod.FourTeenDays },
    { label: '30 days', value: TimePeriod.ThirtyDays },
    { label: '45 days', value: TimePeriod.FortyFiveDays },
  ]
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.SevenDays)
  const { pnl, formattedPNL, decimalPNL } = GetOptionPricePrice(
    strategy ?? undefined,
    formattedTypedAmount ?? undefined,
    timePeriod ?? undefined
  )

  const treasury = useTreasuryContract()

  const { onFieldAInput, onPNLInput } = useMintActionHandlers(noLiquidity)

  function pnlUpdate() {
    onPNLInput(formattedPNL)
  }

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE) // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amountspnl
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  async function buy() {
    if (!account) return
    const operationalTreasury: Contract = new Contract(operationalAddress, OPERATIONALABI, provider?.getSigner())
    await operationalTreasury.buy(strategy, account, formattedTypedAmount, timePeriod, []).catch('error', console.error)
  }

  // check whether the user has approved the router on the tokens TODO = parsedPNL[Field.CURRENCY_B]
  const independentAmount2: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    formattedPNL,
    currencies[independentField]
  )
  const independentAmount3: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    '0',
    currencies[independentField]
  )
  const parsedPNL2: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount3 : independentAmount3,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? independentAmount3 : independentAmount2,
    }
  }, [independentAmount2, independentAmount2, independentField])
  const formattedTypedAmount2 = parsedPNL2[Field.CURRENCY_B]?.toSignificant(8)
  const [approvalB, approveBCallback] = useApproveCallback(parsedPNL2[Sub.CURRENCY_B], treasury?.address)

  async function onCreate() {
    if (!chainId || !provider || !account || !treasury) return
  }

  const timePeriodFixed = Math.floor(Number(timePeriod) / 60) / 60 / 24

  const modalHeader = () => {
    return noLiquidity ? (
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
          <Trans>
            Output is estimated. If the price changes by more than {allowedSlippage.toSignificant(4)}% your transaction
            will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        pnl={decimalPNL}
        strike={formattedStrike}
        period={timePeriod}
        noLiquidity={noLiquidity}
        onAdd={buy}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = (
    <Trans>
      Supplying {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencies[Field.CURRENCY_A]?.symbol} and{' '}
      {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencies[Field.CURRENCY_B]?.symbol}
    </Trans>
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const { pathname } = useLocation()
  const isCreate = pathname.includes('/create')

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const strategyOptions: { label: string; value: StrategyType }[] = [
    { label: 'CALL', value: StrategyType.CALL },
    { label: 'PUT', value: StrategyType.PUT },
  ]

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currencyB ?? undefined)

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      navigate(`/add/v2/${newCurrencyIdA}`)
    },
    [currencyB, navigate, currencyIdA]
  )
  return (
    <TokenDetailsLayout>
      <>
        <Panel>
          <AppBody>
            <AddRemoveTabs creating={isCreate} adding={true} defaultSlippage={DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE} />
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
                currencyToAdd={pair?.liquidityToken}
              />
              <AutoColumn gap="20px">
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_A]}
                  strategy={strategy}
                  period={timePeriod}
                  onUserInput={onFieldAInput}
                  onMax={() => {
                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  }}
                  onCurrencySelect={handleCurrencyASelect}
                  showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                  currency={currencies[Field.CURRENCY_A] ?? null}
                  id="add-liquidity-input-tokena"
                  showCommonBases
                />
                <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                  <Trans>Aggregator Price (Strike): {formattedStrike} $</Trans>
                </ThemedText.DeprecatedLink>
                <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                  <Trans>
                    Option Price (Premium): {decimalPNL} {currencies[Field.CURRENCY_B]?.symbol}
                  </Trans>
                </ThemedText.DeprecatedLink>
                <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                  <Trans>USDC Balance: {formatCurrencyAmount(selectedCurrencyBalance, 4)}</Trans>
                </ThemedText.DeprecatedLink>
                <ColumnCenter>
                  <Box className={styles.trendingOptions}>
                    {timeOptions.map((timeOption) => {
                      return (
                        <span
                          className={clsx(
                            styles.trendingOption,
                            timeOption.value === timePeriod && styles.trendingOptionActive
                          )}
                          key={timeOption.value}
                          onClick={() => setTimePeriod(timeOption.value)}
                        >
                          {timeOption.label}
                        </span>
                      )
                    })}
                  </Box>
                  <Box className={styles.trendingOptions}>
                    {strategyOptions.map((strategyOption) => {
                      return (
                        <span
                          className={clsx(
                            styles.trendingOption,
                            strategyOption.value === strategyType && styles.trendingOptionActive
                          )}
                          key={strategyOption.value}
                          onClick={() => setStrategyType(strategyOption.value)}
                        >
                          {strategyOption.label}
                        </span>
                      )
                    })}
                  </Box>
                  <ButtonPrimary onClick={pnlUpdate} disabled={approvalB === ApprovalState.PENDING} width={'100%'}>
                    <Trans>Change UL {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                  </ButtonPrimary>
                </ColumnCenter>
                {addIsUnsupported ? (
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
                        {approvalB !== ApprovalState.APPROVED && (
                          <ButtonPrimary
                            onClick={approveBCallback}
                            disabled={approvalB === ApprovalState.PENDING}
                            width={'100%'}
                          >
                            {approvalB === ApprovalState.PENDING ? (
                              <Dots>
                                <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                              </Dots>
                            ) : (
                              <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                            )}
                          </ButtonPrimary>
                        )}
                      </RowBetween>
                    )}
                    <ButtonError
                      disabled={approvalB !== ApprovalState.APPROVED}
                      onClick={() => {
                        expertMode ? onCreate() : setShowConfirm(true)
                      }}
                      error={!isValid}
                    >
                      <Text fontSize={20} fontWeight={500}>
                        {error ?? <Trans>Mint Option</Trans>}
                      </Text>
                    </ButtonError>
                  </AutoColumn>
                )}
              </AutoColumn>
            </Wrapper>
          </AppBody>
          <SwitchLocaleLink />
        </Panel>
        <Panel>
          <AppBody>
            <Wrapper>
              <ThemedText.DeprecatedLink fontWeight={200} color={'deprecated_primary1'}>
                <Trans>Read data:</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*Option size: {formattedTypedAmount}</Trans>
              </ThemedText.DeprecatedLink>
              <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'deprecated_text2'}>
                <Trans>*Amount to Approve: {formattedTypedAmount2}</Trans>
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
                <Trans>Currency A: {currencyIdA}</Trans>
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
          </AppBody>
        </Panel>
      </>
    </TokenDetailsLayout>
  )
}
