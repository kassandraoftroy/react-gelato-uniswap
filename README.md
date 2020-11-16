# react-gelato-uniswap
A demo react app for automated trading on uniswap using gelato

## install

1. clone repo, enter root directory
2. npm install
3. npx hardhat compile

To interact with this app you'll also need the [metamask browser extension](https://metamask.io)

## setup 

Before running the react app, you must set three variables in the .env file of the root directory:

`DAPP_INFURA_ID` (Project ID from infura)

`DAPP_PROVIDER_PK` (0x prefixed ethereum private key)

`DAPP_FEE_ACTION_ADDR` (see below)


1. Get an [Infura Project ID](https://infura.io) if you don't already have one, then set it to `DAPP_INFURA_ID` in the .env file
2. Choose an ethereum keypair to be the Gelato Provider. Set the hex private key (with 0x prefix) to `DAPP_PROVIDER_PK` in the .env file.
3. Fund the Gelato Provider address with at least 3 rinkeby ether. [Here is a faucet](https://faucet.rinkeby.io/)
4. Run this command: `node scripts/setupGelatoProvider.js 2`
5. Set `DAPP_FEE_ACTION_ADDR` with output from this script.

The script in Step 4 instanciates the provider, deploys the ActionStablecoinFee contract, whitelists the dapp TaskSpec, and provides 2 ETH to the Gelato network.

You can always re-run this script to either top up the provider, deploy a new ActionStablecoinFee contract, or whitelist a new TaskSpec.

You'll also need some Rinkeby DAI (here: [0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa](https://rinkeby.etherscan.io/address/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa)). You can DAI from the contract by calling the contract's `allocateTo(address,uint256)` function. If you have issues you can also ping [me](https://github.com/superarius) and I'll send you some.

## run 

npm start

(runs on port 3000)


