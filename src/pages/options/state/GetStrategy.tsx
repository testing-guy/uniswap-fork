import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useOperationalTreasuryContract, useStrategyContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'

import { OPERATIONALABI } from '../constants/abis/OPERATIONALABI'
import { METHODS } from '../constants/addresses'
import { ParseTokenId } from './ParseTokenId'

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
  const { chainId, account, provider } = useWeb3React()
  const [strategy, setStrategy] = useState<string>()
  const [state, setState] = useState<string>()
  const [negativepnl, setNegativepnl] = useState<string>()
  const [positivepnl, setPositivepnl] = useState<string>()
  const [expiration, setExpiration] = useState<string>()
  useEffect(() => {
    if (!chainId || !account || operationalAddress === '') return
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
  buyData: string | undefined
} {
  const { chainId, account, provider } = useWeb3React()
  const [buyData, setBuyData] = useState<string>()
  useEffect(() => {
    if (!chainId || !account || !hash) return
    provider?.getTransactionReceipt(hash).then(function (txobject) {
      if (!txobject) return
      setBuyData(txobject.logs[1].data)
    })
  }, [account])
  const period = buyData?.slice(258, 322)
  return { buyData, period }
}

export function GetTransactionDataPayOff(hash: string): {
  payOffData: string | undefined
} {
  const { chainId, account, provider } = useWeb3React()
  const [payOffData, setPayData] = useState<string>()

  useEffect(() => {
    if (!chainId || !account || payOffData === '') return
    provider?.getTransactionReceipt(hash).then(function (txobject) {
      if (!txobject) return
      setPayData(txobject.logs[0].data)
    })
  }, [payOffData])
  return { payOffData }
}

export function GetPayOffLogs(
  tokenId: BigNumber | undefined,
  operationalAddress: string
): {
  paidAmount: string | undefined
} {
  const { chainId, provider, account } = useWeb3React()
  const parseTokenId = ParseTokenId(tokenId, account)

  const filter = {
    address: operationalAddress,
    fromBlock: 0,
    topics: [METHODS.TOPICS.PAYOFF, parseTokenId.topicsId, parseTokenId.topicAddress],
  }

  const [paidAmount, setPaidAmount] = useState<string>()
  const operationalTreasury = useOperationalTreasuryContract(operationalAddress)

  useEffect(() => {
    if (!chainId || !account || operationalAddress === '') return
    provider?.getLogs(filter).then(function (log) {
      const events = log.map((log) => operationalTreasury?.interface.parseLog(log))
      setPaidAmount(events[0]?.args.amount._hex.toString())
    })
  }, [operationalAddress])
  return { paidAmount }
}

export function GetPeriodLogs(
  tokenId: BigNumber | undefined,
  strategyAddress: string
): {
  period: string | undefined
} {
  const { chainId, account, provider } = useWeb3React()
  const parseTokenId = ParseTokenId(tokenId, account)

  const filter = {
    address: strategyAddress,
    fromBlock: 0,
    topics: [METHODS.TOPICS.MINT, parseTokenId.topicsId],
  }

  const [period, setPeriod] = useState<string>()
  const strategyContract = useStrategyContract(strategyAddress)

  useEffect(() => {
    if (!chainId || !account || strategyAddress === '') return
    provider?.getLogs(filter).then(function (log) {
      const events = log.map((log) => strategyContract?.interface.parseLog(log))
      setPeriod(events[0]?.args[4]._hex)
    })
  }, [strategyAddress])
  return { period }
}

export function GetTransactionHash(
  tokenId: BigNumber | undefined,
  strategyAddress: string
): {
  txhash: string | undefined
  txdata: string | undefined
  txBlockNumber: string | undefined
} {
  const { chainId, account, provider } = useWeb3React()
  const parseTokenId = ParseTokenId(tokenId, account)

  const [txhash, setTxHash] = useState<string>()
  const [txdata, setTxData] = useState<string>()
  const [txBlockNumber, setBlockNumber] = useState<string>()

  const filter = {
    address: strategyAddress,
    fromBlock: 0,
    topics: [METHODS.TOPICS.MINT, parseTokenId.topicsId],
  }
  useEffect(() => {
    if (!chainId || !account || strategyAddress === '') return
    provider?.getLogs(filter).then((data) => {
      setTxHash(data[0].transactionHash)
      setTxData(data[0].data)
      setBlockNumber(data[0].blockNumber.toString())
    })
  }, [strategyAddress])
  return { txhash, txdata, txBlockNumber }
}
