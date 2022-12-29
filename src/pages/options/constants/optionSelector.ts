import { ADDRESSES } from './addresses'

export function optionSelector(
  chainId: number | undefined,
  underlyingCurrency: string | undefined
): {
  operationalAddress: string
  aggregatorAddress: string
  premiumAddress: string
  managerAddress: string
  underlyingAddress: string
  strategyAddress: string
  strategyType: string
} {
  let operationalAddress = ''
  let managerAddress = ''
  let aggregatorAddress = ''
  let premiumAddress = ''
  let underlyingAddress = ''
  const strategyType = ''
  const strategyAddress = ''

  if (chainId == 5) {
    if (underlyingCurrency == ADDRESSES.GOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WETH.AGGREGATOR
      managerAddress = ADDRESSES.GOERLI.WETH.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
    } else if (underlyingCurrency == ADDRESSES.GOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WBTC.AGGREGATOR
      managerAddress = ADDRESSES.GOERLI.WBTC.MANAGER
    }
    premiumAddress = ADDRESSES.GOERLI.USDC
  } else if (chainId == 420) {
    if (underlyingCurrency == ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WETH.AGGREGATOR
      managerAddress = ADDRESSES.OPTIMISMGOERLI.WETH.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING
    } else if (underlyingCurrency == ADDRESSES.OPTIMISMGOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.AGGREGATOR
      managerAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.MANAGER
      underlyingAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.UNDERLYING
    }
    premiumAddress = ADDRESSES.OPTIMISMGOERLI.USDC
  }

  return {
    operationalAddress,
    aggregatorAddress,
    premiumAddress,
    managerAddress,
    underlyingAddress,
    strategyAddress,
    strategyType,
  }
}
