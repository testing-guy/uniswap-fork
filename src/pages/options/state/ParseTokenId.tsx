import { BigNumber } from '@ethersproject/bignumber'

import { HEX } from '../constants/addresses'

export function ParseTokenId(
  tokenId: BigNumber | undefined,
  account: string | undefined
): {
  tokenId: BigNumber | undefined
  topicsId: string
  topicAddress: string
} {
  let tokenIdFix = tokenId?.toString()
  if (!tokenIdFix) {
    tokenIdFix = '0x0'
  }
  const parsedTokenId = tokenId?._hex.slice(2)
  const topicsId = '0x' + HEX[64].slice(parsedTokenId?.length) + parsedTokenId

  let topicAddress
  if (!account) {
    topicAddress = '0x' + HEX[64]
  } else {
    topicAddress = '0x' + HEX[24] + account?.slice(2)
  }
  return { topicsId, topicAddress, tokenId }
}
