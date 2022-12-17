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

export function GetPayOffbyId(
  strategyAddress: string,
  id: BigNumber | undefined
): {
  payOff: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [payOff, setpayOff] = useState<string>()
  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(strategyAddress, STRATEGYABI, provider)
    strategy
      .payOffAmount(id)
      .then((result: string) => {
        setpayOff(result)
      })
      .catch('error', console.error)
  }, [strategyAddress, id])

  return { payOff }
}

export function GetPayOffAvailable(
  strategyAddress: string,
  id: BigNumber | undefined,
  caller: string | undefined,
  recipient: string | undefined
): {
  available: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [available, setAvailable] = useState<string>()
  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(strategyAddress, STRATEGYABI, provider)
    strategy
      .isPayoffAvailable(id, caller, recipient)
      .then((result: string) => {
        setAvailable(result)
      })
      .catch('error', console.error)
  }, [strategyAddress, id])

  return { available }
}

export function GetStrategyData(
  strategyAddress: string,
  id: BigNumber | undefined
): {
  amount: string | undefined
  strike: string | undefined
} {
  const { account, provider } = useWeb3React()
  const [amount, setAmountData] = useState<string>()
  const [strike, setStrikeData] = useState<string>()
  useEffect(() => {
    if (!account || strategyAddress === '') return
    const strategy: Contract = new Contract(strategyAddress, STRATEGYABI, provider)
    strategy
      .strategyData(id)
      .then((result: string) => {
        setAmountData(result[0])
        setStrikeData(result[1])
      })
      .catch('error', console.error)
  }, [strategyAddress, id])

  return { amount, strike }
}
