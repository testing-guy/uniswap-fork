import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useOperationalTreasuryWethContract, useStrategyContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'

import { OPERATIONALABI } from '../constants/abis/OPERATIONALABI'

export function GetStrategyAddressbyId(
  operationalAddress: string,
  id: BigNumber | undefined
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

export function GetTransactionDataBuy(hash: string): {
  period: string | undefined
} {
  const { provider } = useWeb3React()
  const [buyData, setBuyData] = useState<string>()
  provider?.getTransactionReceipt(hash).then(function (txobject) {
    if (!txobject) return
    setBuyData(txobject.logs[1].data)
  })
  const period = buyData?.slice(258, 322)
  return { period }
}

export function GetTransactionDataPayOff(hash: string): {
  payOffData: string | undefined
} {
  const { provider } = useWeb3React()
  const [payOffData, setPayData] = useState<string>()

  provider?.getTransactionReceipt(hash).then(function (txobject) {
    if (!txobject) return
    setPayData(txobject.logs[0].data)
    console.log(txobject)
  })
  return { payOffData }
}

export function GetPayOffLogs(
  parsedTokenId: BigNumber | undefined,
  operationalAddress: string
): {
  paidAmount: string | undefined
} {
  const { provider, account } = useWeb3React()
  const topic3 = '0000000000000000000000000000000000000000000000000000000000000000'
  const topicsId = '0x' + topic3.slice(parsedTokenId?.toString().length) + parsedTokenId
  let topicAddress
  if (!account) {
    topicAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'
  } else {
    topicAddress = '0x000000000000000000000000' + account?.slice(2)
  }

  const filter = {
    address: operationalAddress,
    fromBlock: 0,
    topics: ['0x4f2d18324ee95128de091ed2adc501295479000ce4c2cec607aeb1b67e189e2f', topicsId, topicAddress],
  }

  const [paidAmount, setPaidAmount] = useState<string>()
  const operationalTreasury = useOperationalTreasuryWethContract()
  const logPayOff = provider?.getLogs(filter).then(function (log) {
    const events = log.map((log) => operationalTreasury?.interface.parseLog(log))
    setPaidAmount(events[0]?.args.amount._hex.toString())
  })
  return { paidAmount }
}

export function GetPeriodLogs(
  parsedTokenId: BigNumber | undefined,
  strategyAddress: string
): {
  period: string | undefined
} {
  const { provider } = useWeb3React()
  const topic3 = '0000000000000000000000000000000000000000000000000000000000000000'
  const topicsId = '0x' + topic3.slice(parsedTokenId?.toString().length) + parsedTokenId

  const filter = {
    address: strategyAddress,
    fromBlock: 0,
    topics: ['0xe6ba045508353d28ffe727d7e1d54c14bb77665dd60636928b88674a9c7b4260', topicsId],
  }

  const [period, setPeriod] = useState<string>()
  const operationalTreasury = useStrategyContract()
  const logPayOff = provider?.getLogs(filter).then(function (log) {
    const events = log.map((log) => operationalTreasury?.interface.parseLog(log))
    setPeriod(events[0]?.args[4]._hex)
  })
  return { period }
}
