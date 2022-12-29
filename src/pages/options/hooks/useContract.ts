import { Contract } from '@ethersproject/contracts'
import { ERC20 } from '@opensea/seaport-js/lib/typechain/ERC20'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { HegicStrategy, OperationalTreasury, PositionsManager } from 'types/options'

import { getContract } from '../../../utils'
import AggregatorJson from '../constants/abis/AggregatorV3Interface.json'
import { ERC20ABI } from '../constants/abis/ERC20ABI'
import StrategyJson from '../constants/abis/HegicStrategy.json'
import OperationalTreasuryJson from '../constants/abis/OperationalTreasury.json'
import NonfungibleOptionManagerJson from '../constants/abis/OptionManager.json'
import { AggregatorV3Interface } from '../constants/contracts/AggregatorV3Interface'

const { abi: OperationalTreasuryABI } = OperationalTreasuryJson
export const { abi: StrategyABI } = StrategyJson
export const { abi: AggregatorABI } = AggregatorJson
const { abi: NFTOptionManagerABI } = NonfungibleOptionManagerJson

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

export function useOptionPositionManagerContract(
  managerAddress?: string,
  withSignerIfPossible?: boolean
): PositionsManager | null {
  return useContract<PositionsManager>(managerAddress, NFTOptionManagerABI, withSignerIfPossible)
}

export function useOperationalTreasuryContract(
  operationalAddress?: string,
  withSignerIfPossible?: boolean
): OperationalTreasury | null {
  return useContract<OperationalTreasury>(operationalAddress, OperationalTreasuryABI, withSignerIfPossible)
}

export function GetStrategyContract(strategyAddress?: string) {
  return useContract<HegicStrategy>(strategyAddress, StrategyABI, false)
}

export function useTreasuryContract(treasuryAddress?: string): Contract | null {
  return useContract(treasuryAddress, OperationalTreasuryABI, true)
}

export function useAggregatorContract(aggregatorAddress?: string): Contract | null {
  return useContract(aggregatorAddress, AggregatorABI, true) as AggregatorV3Interface
}

export function useAggregatorAnswer(testAggregator?: string) {
  return useContract<AggregatorV3Interface>(testAggregator, AggregatorABI, false)?.latestRoundData
}

export function useSimpleERC20(erc20?: string): Contract | null {
  return useContract(erc20, ERC20ABI, true) as ERC20
}
