import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { STRATEGYABI } from '../constants/abis/STRATEGYABI'

export function GetOptionLimit(
  customStrategy: string,
  period: string
): {
  limit: string | undefined
  decimalLimit: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [limit, setLimit] = useState<string>()
  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(customStrategy, STRATEGYABI, provider)
    strategy
      .getAvailableContracts(period, ['0x'])
      .then((result: string) => {
        setLimit(result)
      })
      .catch('error', console.error)
  }, [customStrategy, period])

  function insertDecimal(num: number) {
    return Number((num / 10e17).toFixed(4))
  }
  const numFormattedLimit = Math.floor(Number(limit))
  const decimalLimit = insertDecimal(numFormattedLimit).toString()
  return { limit, decimalLimit }
}
