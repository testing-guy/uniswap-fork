import { BigNumber } from '@ethersproject/bignumber'

import { GetPayOffAvailable, GetPayOffbyId, GetStrategyData } from '../state/GetOptionPrice'
import { GetOptionState } from '../state/GetOptionState'
import { GetOwnerbyId } from '../state/GetPositionManager'
import { GetStrategyAddressbyId } from '../state/GetStrategy'
import { GetStrike } from '../state/GetStrike'
import { ADDRESSES } from './addresses'
import { optionSelector } from './optionSelector'

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
  isOpen: number
  expired: string
  expiredLeft: string
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
  aggregatorPrice: string | undefined
  active: boolean
  ownsNFT: boolean
  payOffOrClaimed: string
} {
  const selector = optionSelector(chainId, currencyIdA)
  const getStrategy = GetStrategyAddressbyId(selector.operationalAddress, parsedTokenId)
  if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.CALL) {
    selector.strategyType = 'CALL'
    selector.strategyAddress = getStrategy.strategy
  } else if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.PUT) {
    selector.strategyType = 'PUT'
    selector.strategyAddress = getStrategy.strategy
  }
  const expiration = getStrategy.expiration
  const negativepnl = getStrategy.negativepnl
  const state = getStrategy.state

  const getState = GetOptionState(selector.operationalAddress, selector.strategyAddress, parsedTokenId)
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
  const isOpen = getState.isOpen
  const expired = getState.expired
  const expiredLeft = getState.expiredLeft

  const payOff = GetPayOffbyId(selector.strategyAddress, parsedTokenId).payOff
  const formattedPayoff = (Math.floor(Number(payOff)) / 10e5).toFixed(3)

  const formattedFunctionperiod = periodHexFix / 60 / 60 / 24
  const openingDate = new Date((Math.floor(Number(expiration)) - periodHexFix) * 10e2).toLocaleString()
  const openingLocaleDate = new Date((Math.floor(Number(expiration)) - periodHexFix) * 10e2).toLocaleDateString()
  const closingDate = new Date(Math.floor(Number(expiration)) * 10e2).toLocaleDateString()
  const netClaimedPNL = ((Math.floor(Number(paidAmountHex)) - Math.floor(Number(negativepnl))) / 10e5).toFixed(3)
  const unrealizedPNL = ((Math.floor(Number(payOff)) - Math.floor(Number(negativepnl))) / 10e5).toFixed(3)
  const formattedNegativePNL = (Math.floor(Number(negativepnl)) / 10e5).toFixed(3)

  const optionOwner = GetOwnerbyId(selector.managerAddress, parsedTokenId).address
  const payOffAvailable = GetPayOffAvailable(
    selector.strategyAddress,
    parsedTokenId,
    optionOwner,
    optionOwner
  ).available

  const dataAmount = GetStrategyData(selector.strategyAddress, parsedTokenId).amount
  const formattedAmount = (Math.floor(Number(dataAmount)) / 10e17).toFixed(6)
  const dataStrike = GetStrategyData(selector.strategyAddress, parsedTokenId).strike
  const formattedStrike = (Math.floor(Number(dataStrike)) / 10e7).toFixed(2)
  const aggregatorPrice = GetStrike(selector.aggregatorAddress ?? undefined).formattedStrike?.toFixed(2)

  const active = payOffAvailable?.toString() === 'true'
  const ownsNFT = optionOwner === account

  let payOffOrClaimed = formattedPayoff
  if (isClaimed) {
    payOffOrClaimed = paidAmountHexFix
  }

  const operationalAddress = selector.operationalAddress
  const aggregatorAddress = selector.aggregatorAddress
  const premiumAddress = selector.premiumAddress
  const managerAddress = selector.managerAddress
  const underlyingAddress = selector.underlyingAddress
  const strategyAddress = selector.strategyAddress
  const strategyType = selector.strategyType

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
    isOpen,
    expired,
    expiredLeft,
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
    payOffOrClaimed,
  }
}

export function optionStatus(
  chainId: number | undefined,
  currencyIdA: string | undefined,
  parsedTokenId: number | undefined
): {
  isOpen: number
} {
  const tokenId = BigNumber.from(parsedTokenId)
  console.log(tokenId)
  const selector = optionSelector(chainId, currencyIdA)
  const getStrategy = GetStrategyAddressbyId(selector.operationalAddress, tokenId)
  if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.CALL) {
    selector.strategyType = 'CALL'
    selector.strategyAddress = getStrategy.strategy
  } else if (getStrategy.strategy == ADDRESSES.OPTIMISMGOERLI.WETH.PUT) {
    selector.strategyType = 'PUT'
    selector.strategyAddress = getStrategy.strategy
  }
  const getState = GetOptionState(selector.operationalAddress, selector.strategyAddress, tokenId)

  const isExpired = getState.isExpired
  const isClaimed = getState.isClaimed

  let isOpen = 0
  if (!isClaimed && !isExpired) {
    isOpen = 1
  }

  return {
    isOpen,
  }
}
