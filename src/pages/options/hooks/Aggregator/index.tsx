import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'

import { ThemedText } from '../../../../theme'
import { AGGREGATORABI as abi } from '../../constants/abis/AGGREGATORABI'

interface Props {
  aggregatorContract: string
}

export default function ReadAggregator(props: Props) {
  const aggregatorContract = props.aggregatorContract
  const [price, setPrice] = useState<string>()
  const { account, provider, isActive } = useWeb3React()

  useEffect(() => {
    if (!account) return

    const aggregator: Contract = new Contract(aggregatorContract, abi, provider)
    aggregator
      .latestRoundData()
      .then((result: string) => {
        setPrice(result[1])
      })
      .catch('error', console.error)
  }, [aggregatorContract])

  return (
    <>
      <ThemedText.DeprecatedLink fontSize={'12px'} fontWeight={200} color={'textSecondary'}>
        <Trans>Aggregator Price: {price}</Trans>
      </ThemedText.DeprecatedLink>
    </>
  )
}
