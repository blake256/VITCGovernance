export default class WalletAccount {
  constructor({ address }) {
    if (!address) {
      throw new Error('address should not be empty')
    }

    this.address = address
  }
}
