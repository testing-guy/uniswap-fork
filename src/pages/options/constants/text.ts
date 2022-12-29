type AddressMap = { [chainId: number]: string }

export const TEXT = {
  STRIKE_INFO: {
    INTRO: 'Strike info are... Introduction of strike infos',
    DATE: 'Date at the moment of option opening.',
    PRICE: 'Aggregator price at the moment of option opening.',
    COLLATERAL: 'Collateral of your option.',
    PREMIUM: 'Cost of your option at opening',
  },
  MODALS: {
    EXERCISE: 'When exercise an option, you will take the Unrealized PNL, then your option will be set inactive',
    SELL: 'You can sell only your options',
    BUY: 'You can buy option from others if are in sell',
    TRANSFER: 'You can transfer this option to any wallet',
  },
  BUTTONS: {
    BUYDISABLED: 'You cant buy an expired, claimed, not in sell or inactive option.',
    SELLDISABLED: 'You cant sell an expired, claimed or inactive option.',
  },
  BADGE: {
    CLAIMED: 'Your position was already claimed.',
    ACTIVE: 'Your option is active.',
    EXPIRED: 'This option is expired.',
    SELLABLE: 'Your can sell this option in the marketplace.',
    INSELL: 'This option is in sell.',
    UNSELLABLE: 'This option is unsellable.',
  },
  OPTION_LIST: {
    ID: 'Option ID number',
    CALL: 'Call option',
    PUT: 'Put option',
    EMPTY: '',
    STRIKE_PRICE: 'Price at opening date',
    CURRENT_PRICE: 'Current underlying price',
    STRIKE_DATE: 'Date of opening of this option',
    EXPIRATION: 'Date of expiration of this option',
  },
}
