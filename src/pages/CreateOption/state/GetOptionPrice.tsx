import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { STRATEGYABI } from '../constants/abis/STRATEGYABI'

export function GetOptionPricePrice(
  customStrategy: string,
  amount: string,
  period: string
): {
  pnl: string | undefined
  formattedPNL: string
  decimalPNL: string
} {
  const { account, provider, isActive } = useWeb3React()
  const [pnl, setPnl] = useState<string>()
  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(customStrategy, STRATEGYABI, provider)
    strategy
      .calculateNegativepnlAndPositivepnl(amount, period, ['0x'])
      .then((result: string) => {
        setPnl(result[0])
      })
      .catch('error', console.error)
  }, [customStrategy, amount, period])

  function insertDecimal(num: number) {
    return Number((num / 10e5).toFixed(6))
  }
  const numFormattedAmountsPNL = Math.floor(Number(pnl))
  const decimalPNL = insertDecimal(numFormattedAmountsPNL).toString()

  const formattedPNL = Math.floor(Number(pnl)).toString()
  return { pnl, formattedPNL, decimalPNL }
}

export function GetPayOffAmount(
  customStrategy: string,
  id: BigNumber
): {
  payOffAmount: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [payOffAmount, setPayOffAmount] = useState<string>()
  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(customStrategy, STRATEGYABI, provider)
    strategy
      .payOffAmount(id)
      .then((result: string) => {
        setPayOffAmount(result)
      })
      .catch('error', console.error)
  }, [id])

  return { payOffAmount }
}
