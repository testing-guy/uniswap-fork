import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { OptionDetails } from 'types/position'

import { ADDRESSES } from '../constants/addresses'
import { useOperationalTreasuryContract, useOptionPositionManagerContract } from './useContract'

interface UseOptionsResults {
  loading: boolean
  options: OptionDetails[] | undefined
}
function useOptionsFromTokenIds(
  managerAddress: string | undefined,
  tokenIds: BigNumber[] | undefined
): UseOptionsResults {
  const optionManager = useOptionPositionManagerContract(managerAddress)
  const operationalAddress = ADDRESSES.OPTIMISMGOERLI.WETH.TREASURY
  const operationalTreasury = useOperationalTreasuryContract(operationalAddress)
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(optionManager, 'ownerOf', inputs)
  const claimResults = useSingleContractMultipleData(operationalTreasury, 'lockedLiquidity', inputs)
  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const { account } = useWeb3React()

  const options = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const claim = claimResults[i].result as CallStateResult

        let isOpen = 0
        let isExpired = false

        const currentTimestamp = () => new Date().getTime() / 10e2
        const period = claim.expiration - currentTimestamp()
        const determinateExpiration = Array.from(period.toString())[0]
        if (determinateExpiration === '-') {
          isExpired = true
        }

        let isClaimed = 0
        if (claim.state === 1) {
          isClaimed = 1
        } else if (claim.state === 0) {
          isClaimed = 0
        }

        if (!isClaimed || isExpired) {
          isOpen = 1
        }

        console.log(
          'Token ID: ' + tokenId + ' | claim: ' + isClaimed + ' | expired: ' + isExpired + ' | open: ' + isOpen
        )
        return {
          tokenId,
          state: claim.state,
          isOpen,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds])
  return {
    loading,
    options: options?.map((option, i) => ({ ...option, tokenId: inputs[i][0] })),
  }
}
interface UseOptionResults {
  loading: boolean
  option: OptionDetails | undefined
}
export function useOptionFromTokenId(
  managerAddress: string | undefined,
  tokenId: BigNumber | undefined
): UseOptionResults {
  const option = useOptionsFromTokenIds(managerAddress, tokenId ? [tokenId] : undefined)
  return {
    loading: option.loading,
    option: option.options?.[0],
  }
}
export function useOptions(managerAddress: string | undefined, account: string | null | undefined): UseOptionsResults {
  const optionManager = useOptionPositionManagerContract(managerAddress)

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(optionManager, 'balanceOf', [
    account ?? undefined,
  ])

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(optionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])
  const { options, loading: optionsLoading } = useOptionsFromTokenIds(managerAddress, tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || optionsLoading,
    options,
  }
}
