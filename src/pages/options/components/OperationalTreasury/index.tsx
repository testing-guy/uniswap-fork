import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import React, { useState } from 'react'

import { ThemedText } from '../../../../theme'
import { ERC20ABI as abi2 } from '../../constants/abis/ERC20ABI'
import { OPERATIONALABI as abi } from '../../constants/abis/OPERATIONALABI'

interface Props {
  operationalContract: string
  strategyContract: string
  amount: string
  period: string
  usdContract: string
}

export default function UseOperationalTreasury(props: Props) {
  const operationalContract = props.operationalContract
  const usdContract = props.usdContract
  const [price, setPrice] = useState<string>()
  const { account, provider } = useWeb3React()

  async function approve(event: React.FormEvent) {
    event.preventDefault()
    if (!account) return
    const usdc: Contract = new Contract(usdContract, abi2, provider?.getSigner())
    usdc.approve(props.operationalContract, props.amount).catch('error', console.error)
  }

  async function buy(event: React.FormEvent) {
    event.preventDefault()
    if (!account) return

    const operationalTreasury: Contract = new Contract(operationalContract, abi, provider?.getSigner())
    operationalTreasury
      .buy(props.strategyContract, account, props.amount, props.period, [])
      .then((result: string) => {
        setPrice(result)
      })
      .catch('error', console.error)
  }

  return (
    <>
      <ButtonPrimary onClick={approve} width={'100%'}>
        <ThemedText.DeprecatedLink fontSize={'24px'} fontWeight={200} color={'textSecondary'}>
          <Trans>Approve</Trans>
        </ThemedText.DeprecatedLink>
      </ButtonPrimary>
      <ButtonPrimary onClick={buy} width={'100%'}>
        <ThemedText.DeprecatedLink fontSize={'24px'} fontWeight={200} color={'textSecondary'}>
          <Trans>Buy</Trans>
        </ThemedText.DeprecatedLink>
      </ButtonPrimary>
    </>
  )
}
