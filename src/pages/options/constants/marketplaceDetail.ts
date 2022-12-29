export function marketplaceDetail(
  isExpired: boolean | undefined,
  isClaimed: boolean | undefined,
  active: boolean | undefined
): {
  isSell: boolean
  sellable: boolean
  canBuy: boolean
} {
  const isinsell = false //true = is in sell (can buy), false, isnt in sell (cant buy) #TODO
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
