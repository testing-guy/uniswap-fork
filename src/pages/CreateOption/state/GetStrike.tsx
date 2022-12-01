import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { AGGREGATORABI } from '../constants/abis/AGGREGATORABI'

export function GetStrike(aggregatorA: string): {
  formattedStrike: number | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [strikePrice, setStrike] = useState<string>()
  useEffect(() => {
    if (!account) return
    const aggregator: Contract = new Contract(aggregatorA, AGGREGATORABI, provider?.getSigner())
    aggregator
      .latestRoundData()
      .then((result: string) => {
        setStrike(result[1])
      })
      .catch('error', console.error)
  }, [isActive])
  const formattedStrike = Math.floor(Number(strikePrice) / 10e7)
  return { formattedStrike }
}
