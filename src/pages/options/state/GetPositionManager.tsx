import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { MANAGERABI } from '../constants/abis/MANAGERABI'

export function GetOwnerbyId(
  positionManager: string,
  id: BigNumber | undefined
): {
  address: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [address, setAddress] = useState<string>()
  useEffect(() => {
    if (!account) return
    const manager: Contract = new Contract(positionManager, MANAGERABI, provider)
    manager
      .ownerOf(id)
      .then((result: string) => {
        setAddress(result)
      })
      .catch('error', console.error)
  }, [positionManager, id])

  return { address }
}
