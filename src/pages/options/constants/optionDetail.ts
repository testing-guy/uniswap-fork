import { BigNumber } from '@ethersproject/bignumber'

import { GetPayOffAvailable, GetPayOffbyId, GetStrategyData } from '../state/GetOptionPrice'
import { GetOptionState } from '../state/GetOptionState'
import { GetOwnerbyId } from '../state/GetPositionManager'
import { GetStrategyAddressbyId } from '../state/GetStrategy'
import { GetStrike } from '../state/GetStrike'
import { ADDRESSES } from './addresses'

export function optionDetail(
  chainId: number | undefined,
  currencyIdA: string | undefined,
  parsedTokenId: BigNumber | undefined,
  account: string | undefined
): {
  operationalAddress: string
  aggregatorAddress: string
  premiumAddress: string
  managerAddress: string
  underlyingAddress: string
  strategyAddress: string
  expiration: string | undefined
  negativepnl: string | undefined
  strategyType: string
  state: string | undefined
  inactiveButtonText: string
  periodHexFix: number
  paidAmountHex: string
  paidAmountHexFix: string
  isExpired: boolean
  isClaimed: boolean
  expired: string
  formattedFunctionperiod: number
  openingDate: string
  openingLocaleDate: string
  closingDate: string
  netClaimedPNL: string
  unrealizedPNL: string
  formattedNegativePNL: string
  payOff: string | undefined
  formattedPayoff: string
  optionOwner: string | undefined
  payOffAvailable: string | undefined
  dataAmount: string | undefined
  formattedAmount: string
  dataStrike: string | undefined
  formattedStrike: string
  aggregatorPrice: number | undefined
  active: boolean
  ownsNFT: boolean
} {
  let operationalAddress = ''
  let managerAddress = ''
  let aggregatorAddress = ''
  let premiumAddress = ''
  let underlyingAddress = ''
  let strategyType = ''
  let strategyAddress = ''

  if (chainId == 5) {
    if (currencyIdA == ADDRESSES.GOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WETH.AGGREGATOR
      managerAddress = ADDRESSES.GOERLI.WETH.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
    } else if (currencyIdA == ADDRESSES.GOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WBTC.AGGREGATOR
      managerAddress = ADDRESSES.GOERLI.WBTC.MANAGER
    }
    premiumAddress = ADDRESSES.GOERLI.USDC
  } else if (chainId == 420) {
    if (currencyIdA == ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WETH.AGGREGATOR
      managerAddress = ADDRESSES.OPTIMISMGOERLI.WETH.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
    } else if (currencyIdA == ADDRESSES.OPTIMISMGOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.AGGREGATOR
      managerAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.UNDERLYING
    }
    premiumAddress = ADDRESSES.OPTIMISMGOERLI.USDC
  }

  const getStrategy = GetStrategyAddressbyId(operationalAddress, parsedTokenId)
  if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.CALL) {
    strategyType = 'CALL'
    strategyAddress = getStrategy.strategy
  } else if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.PUT) {
    strategyType = 'PUT'
    strategyAddress = getStrategy.strategy
  }
  const expiration = getStrategy.expiration
  const negativepnl = getStrategy.negativepnl
  const state = getStrategy.state

  const getState = GetOptionState(operationalAddress, strategyAddress, parsedTokenId)
  let inactiveButtonText = 'Unexercisable'
  if (getState.isExpired) {
    inactiveButtonText = 'Expired'
  } else if (getState.isClaimed) {
    inactiveButtonText = 'Claimed'
  }
  const periodHexFix = getState.periodHexFix
  const paidAmountHex = getState.paidAmountHex
  const paidAmountHexFix = getState.paidAmountHexFix
  const isExpired = getState.isExpired
  const isClaimed = getState.isClaimed
  const expired = getState.expired

  const payOff = GetPayOffbyId(strategyAddress, parsedTokenId).payOff
  const formattedPayoff = (Math.floor(Number(payOff)) / 10e5).toFixed(3)
  const formattedFunctionperiod = periodHexFix / 60 / 60 / 24
  const openingDate = new Date((Math.floor(Number(expiration)) - periodHexFix) * 10e2).toLocaleString()
  const openingLocaleDate = new Date((Math.floor(Number(expiration)) - periodHexFix) * 10e2).toLocaleDateString()
  const closingDate = new Date(Math.floor(Number(expiration)) * 10e2).toLocaleDateString()
  const netClaimedPNL = ((Math.floor(Number(paidAmountHex)) - Math.floor(Number(negativepnl))) / 10e5).toFixed(3)
  const unrealizedPNL = ((Math.floor(Number(payOff)) - Math.floor(Number(negativepnl))) / 10e5).toFixed(3)
  const formattedNegativePNL = (Math.floor(Number(negativepnl)) / 10e5).toFixed(3)

  const optionOwner = GetOwnerbyId(managerAddress, parsedTokenId).address
  const payOffAvailable = GetPayOffAvailable(strategyAddress, parsedTokenId, account?.toString(), optionOwner).available

  const dataAmount = GetStrategyData(strategyAddress, parsedTokenId).amount
  const formattedAmount = (Math.floor(Number(dataAmount)) / 10e17).toFixed(6)
  const dataStrike = GetStrategyData(strategyAddress, parsedTokenId).strike
  const formattedStrike = (Math.floor(Number(dataStrike)) / 10e7).toFixed(2)
  const aggregatorPrice = GetStrike(aggregatorAddress ?? undefined).formattedStrike

  const active = payOffAvailable?.toString() === 'true'
  const ownsNFT = optionOwner === account
  return {
    operationalAddress,
    aggregatorAddress,
    premiumAddress,
    managerAddress,
    underlyingAddress,
    strategyAddress,
    expiration,
    negativepnl,
    strategyType,
    state,
    inactiveButtonText,
    periodHexFix,
    paidAmountHex,
    paidAmountHexFix,
    isExpired,
    isClaimed,
    expired,
    payOff,
    formattedPayoff,
    formattedFunctionperiod,
    openingDate,
    openingLocaleDate,
    closingDate,
    netClaimedPNL,
    unrealizedPNL,
    formattedNegativePNL,
    optionOwner,
    payOffAvailable,
    dataAmount,
    formattedAmount,
    dataStrike,
    formattedStrike,
    aggregatorPrice,
    active,
    ownsNFT,
  }
}
