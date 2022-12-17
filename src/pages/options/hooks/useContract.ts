import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { getContract } from '../../../utils'
import AggregatorJson from '../constants/abis/AggregatorV3Interface.json'
import StrategyJson from '../constants/abis/HegicStrategy.json'
import OperationalTreasuryJson from '../constants/abis/OperationalTreasury.json'
import { ADDRESSES } from '../constants/addresses'
import { AggregatorV3Interface } from '../constants/contracts/AggregatorV3Interface'
import { HegicStrategy } from '../constants/contracts/HegicStrategy'

const { abi: OperationalTreasuryABI } = OperationalTreasuryJson
export const { abi: StrategyABI } = StrategyJson
export const { abi: AggregatorABI } = AggregatorJson

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

export function GetStrategyContract(strategyAddress?: string) {
  return useContract<HegicStrategy>(strategyAddress, StrategyABI, false)
}

export function useTreasuryContract(): Contract | null {
  return useContract(ADDRESSES.GOERLI.WETH.TREASURY, OperationalTreasuryABI, true)
}

export function useAggregatorContract(aggregatorAddress?: string): Contract | null {
  return useContract(aggregatorAddress, AggregatorABI, true) as AggregatorV3Interface
}

export function useAggregatorAnswer(testAggregator?: string) {
  return useContract<AggregatorV3Interface>(testAggregator, AggregatorABI, false)?.latestRoundData
}
