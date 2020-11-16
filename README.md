# react-gelato-uniswap

A demo react app for automated trading on uniswap using gelato.

Test the app on Rinkeby testnet [right now](http://157.245.245.34:3000) 🎉

Or you can run it locally by following the steps in [run server](https://github.com/superarius/react-gelato-uniswap#run-server).

## demo

To interact with this app you'll need the [metamask browser extension](https://metamask.io)

You'll also need some Rinkeby ETH and Rinkeby DAI in your wallet. 

[Here is a rinkeby faucet](https://faucet.rinkeby.io/) to get you some test ether. 

The Rinkeby DAI contract ([0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa](https://rinkeby.etherscan.io/address/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa)) has an `allocateTo(address,uint256)` method for funding yourself. If you have trouble you can ping me and I'll happily send you some.

Now your ready to demo making automated trades on uniswap using gelato.

## run server

1. Clone repo, enter root directory

2. run `npm install` (install dependencies)

3. run `touch .env` (create .env file)

4. Get an [Infura Project ID](https://infura.io) if you don't already have one, then set it to `DAPP_INFURA_ID` in the `.env` file.

5. Choose an ethereum keypair to be your Gelato Provider. Set the hex private key (with 0x prefix) to `DAPP_PROVIDER_PK` in the `.env` file

6. run `npx hardhat compile` (compiles smart contracts)

7. Fund the Gelato Provider address with at least 4 rinkeby ether. [Here is a faucet](https://faucet.rinkeby.io/)

8. run `node scripts/setupGelatoProvider.js 3` (run setup script)

9. Set `DAPP_FEE_ACTION_ADDR` in the `.env` file with the contract address provided from the script above.

10. run `npm start` (run server on port 3000)

The script in Step 8 instanciates the provider, deploys the ActionStablecoinFee contract, whitelists the dapp TaskSpec, and provides 3 ETH to the Gelato network.

You can always re-run this script to either top up the provider, deploy a new ActionStablecoinFee contract, or whitelist a new TaskSpec.



