import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'

import { STRATEGYABI as abi } from '../../constants/abis/STRATEGYABI'

interface Props {
  addressContract: string
  amount: string
  period: string
}

export default function ReadStrategy(props: Props) {
  const addressContract = props.addressContract
  const amount = props.amount
  const period = props.period
  const [pnl, setPnl] = useState<string>()
  const { account, provider, isActive } = useWeb3React()

  useEffect(() => {
    if (!account) return
    const strategy: Contract = new Contract(addressContract, abi, provider)
    strategy
      .calculateNegativepnlAndPositivepnl(amount, period, ['0x'])
      .then((result: string) => {
        setPnl(result[0])
      })
      .catch('error', console.error)
  }, [addressContract, amount, period])

  return (
    <>
      <Trans>{pnl}</Trans>
    </>
  )
}
