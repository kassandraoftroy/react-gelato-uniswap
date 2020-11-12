# react-gelato-uniswap
A demo react app for automated trading on uniswap using gelato

## setup

1. clone repo, enter root directory
2. npm install
3. npm start (runs on port 3000)

## external provider

in a .env file set two variables:

`DAPP_INFURA_ID` (Project ID from infura)
`DAPP_PROVIDER_PK` (0x prefixed private key of provider)

TODO: a simple script for initializing the provider, providing funds, and whitelisting the taskSpec for the Uniswap Trade that the frontend is using
