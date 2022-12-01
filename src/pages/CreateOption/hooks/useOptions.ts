import { BigNumber } from '@ethersproject/bignumber'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { OptionDetails } from 'types/position'

import { useOptionPositionManagerContract } from '../../../hooks/useContract'
import { useOperationalTreasuryContract } from '../../../hooks/useContract'

interface UseOptionsResults {
  loading: boolean
  options: OptionDetails[] | undefined
}
function useOptionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseOptionsResults {
  const operationalTreasury = useOperationalTreasuryContract()
  const optionManager = useOptionPositionManagerContract()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(optionManager, 'ownerOf', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const options = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        return {
          tokenId,
          address: result.address,
          state: result.state,
          strategy: result.strategy,
          positivepnl: result.positivepnl,
          negativepnl: result.negativepnl,
          expiration: result.expiration,
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
export function useOptionFromTokenId(tokenId: BigNumber | undefined): UseOptionResults {
  const option = useOptionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: option.loading,
    option: option.options?.[0],
  }
}
export function useOptions(account: string | null | undefined): UseOptionsResults {
  const optionManager = useOptionPositionManagerContract()

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

  const { options, loading: optionsLoading } = useOptionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || optionsLoading,
    options,
  }
}
