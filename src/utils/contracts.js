import Web3 from 'web3'
import ZSCoreABI from '../../abi/ZSCore.json'
import ZSSharePoolABI from '../../abi/ZSSharePool.json'
import ZSRelayVaultABI from '../../abi/ZSRelayVault.json'
import ERC20ABI from '../../abi/ERC20.json'
import ADDRESSES from '../../abi/adress.json'

const contracts = {
  instances: null,
  web3: null,

  async init(provider) {
    const web3 = new Web3(provider)
    const chainId = await web3.eth.getChainId()
    const addresses = ADDRESSES[chainId.toString()]

    if (!addresses) {
      throw new Error(`不支持的链 ID: ${chainId}`)
    }

    const instances = {
      zsCore: new web3.eth.Contract(ZSCoreABI.abi, addresses.ZSCore),
      zsSharePool: new web3.eth.Contract(ZSSharePoolABI.abi, addresses.ZSSharePool),
      zsRelayVault: new web3.eth.Contract(ZSRelayVaultABI.abi, addresses.ZSRelayVault),
      wbnb: new web3.eth.Contract(ERC20ABI.abi, addresses.WBNB),
      usdt: new web3.eth.Contract(ERC20ABI.abi, addresses.USDT),
      addresses
    }

    this.instances = instances
    this.web3 = web3
    return instances
  },

  getInstances() {
    return this.instances
  },

  getWeb3() {
    return this.web3
  }
}

export { contracts }

