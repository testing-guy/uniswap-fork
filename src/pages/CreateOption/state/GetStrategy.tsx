import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { OPERATIONALABI } from '../constants/abis/OPERATIONALABI'

export function GetStrategyAddressbyId(
  operationalAddress: string,
  id: BigNumber
): {
  state: string | undefined
  strategy: string | undefined
  negativepnl: string | undefined
  positivepnl: string | undefined
  expiration: string | undefined
} {
  const { account, provider, isActive } = useWeb3React()
  const [strategy, setStrategy] = useState<string>()
  const [state, setState] = useState<string>()
  const [negativepnl, setNegativepnl] = useState<string>()
  const [positivepnl, setPositivepnl] = useState<string>()
  const [expiration, setExpiration] = useState<string>()
  useEffect(() => {
    if (!account) return
    const operational: Contract = new Contract(operationalAddress, OPERATIONALABI, provider)
    operational
      .lockedLiquidity(id)
      .then((result: string) => {
        setState(result[0])
        setStrategy(result[1])
        setNegativepnl(result[2])
        setPositivepnl(result[3])
        setExpiration(result[4])
      })
      .catch('error', console.error)
  }, [operationalAddress, id])

  return { strategy, state, negativepnl, positivepnl, expiration }
}
