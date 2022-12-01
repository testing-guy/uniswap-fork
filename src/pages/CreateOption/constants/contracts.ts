import { ADDRESSES } from './addresses'

export function useAddresses(
  chainId: number | undefined,
  currencyIdA: string | undefined,
  strategyType: string | undefined
): {
  operationalAddress: string
  aggregatorAddress: string
  strategy: string
  premiumCurrency: string
} {
  let operationalAddress = ''
  let aggregatorAddress = ''
  let strategy = ''
  let premiumCurrency = ''
  if (chainId == 5) {
    if (currencyIdA == ADDRESSES.GOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WETH.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.GOERLI.WETH.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.GOERLI.WETH.PUT
      }
    } else if (currencyIdA == ADDRESSES.GOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.GOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.GOERLI.WBTC.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.GOERLI.WBTC.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.GOERLI.WBTC.PUT
      }
    } else {
    }
    premiumCurrency = ADDRESSES.GOERLI.USDC
  } else if (chainId == 42161) {
    if (currencyIdA == ADDRESSES.ARBITRUM.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.ARBITRUM.WETH.TREASURY
      aggregatorAddress = ADDRESSES.ARBITRUM.WETH.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.ARBITRUM.WETH.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.ARBITRUM.WETH.PUT
      }
    } else if (currencyIdA == ADDRESSES.ARBITRUM.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.ARBITRUM.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.ARBITRUM.WBTC.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.ARBITRUM.WBTC.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.ARBITRUM.WBTC.PUT
      }
    } else {
    }
    premiumCurrency = ADDRESSES.ARBITRUM.USDC
  } else if (chainId == 421613) {
    if (currencyIdA == ADDRESSES.ARBITRUMGOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.ARBITRUMGOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.ARBITRUMGOERLI.WETH.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.ARBITRUMGOERLI.WETH.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.ARBITRUMGOERLI.WETH.PUT
      }
    } else if (currencyIdA == ADDRESSES.ARBITRUMGOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.ARBITRUMGOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.ARBITRUMGOERLI.WBTC.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.ARBITRUMGOERLI.WBTC.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.ARBITRUMGOERLI.WBTC.PUT
      }
    } else {
    }
    premiumCurrency = ADDRESSES.ARBITRUMGOERLI.USDC
  } else if (chainId == 420) {
    if (currencyIdA == ADDRESSES.OPTIMISMGOERLI.WETH.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WETH.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.OPTIMISMGOERLI.WETH.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.OPTIMISMGOERLI.WETH.PUT
      }
    } else if (currencyIdA == ADDRESSES.OPTIMISMGOERLI.WBTC.UNDERLYING) {
      operationalAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.TREASURY
      aggregatorAddress = ADDRESSES.OPTIMISMGOERLI.WBTC.AGGREGATOR
      if (strategyType == 'CALL') {
        strategy = ADDRESSES.OPTIMISMGOERLI.WBTC.CALL
      } else if (strategyType == 'PUT') {
        strategy = ADDRESSES.OPTIMISMGOERLI.WBTC.PUT
      }
    } else {
    }
    premiumCurrency = ADDRESSES.OPTIMISMGOERLI.USDC
  }
  return {
    operationalAddress,
    aggregatorAddress,
    strategy,
    premiumCurrency,
  }
}
