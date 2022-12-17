export function marketplaceDetail(
  isExpired: boolean,
  isClaimed: boolean,
  active: boolean
): {
  isSell: boolean
  sellable: boolean
  canBuy: boolean
} {
  const isinsell = false //eg. is not in sell | called from marketplace nft contract #TODO
  const isSold = false //get from marketplace events #TODO

  let isSell = false
  let sellable = true
  let canBuy = false

  if (isinsell) {
    isSell = true
  }
  if (!active || isExpired || isClaimed || isSell) {
    sellable = false
  }
  if (isSell) {
    canBuy = true
  }
  return {
    isSell,
    sellable,
    canBuy,
  }
}
