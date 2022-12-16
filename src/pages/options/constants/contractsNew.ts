import { BigNumber } from '@ethersproject/bignumber'

import { GetStrategyAddressbyId } from '../state/GetStrategy'
import { ADDRESSES } from './addresses'

export function useAddresses(
  chainId: number | undefined,
  currencyIdA: string | undefined,
  parsedTokenId: BigNumber | undefined
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
  }
}
