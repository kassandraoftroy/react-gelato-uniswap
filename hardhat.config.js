require("dotenv").config();
const INFURA_ID = process.env.DAPP_INFURA_ID;
const PROVIDER_PK = process.env.DAPP_PROVIDER_PK;
if (PROVIDER_PK==null || PROVIDER_PK==undefined || INFURA_ID==null || INFURA_ID==undefined) {
    console.log("\n !! IMPORTANT !!\n Must set .env vars before running hardhat");
    throw "set env variables";
}

module.exports = {
    defaultNetwork: "rinkeby",
    networks: {
        rinkeby: {
            // Standard
            accounts: [PROVIDER_PK],
            chainId: 4,
            // gas: 4000000,  // 4 million
             // gasPrice: "auto",
            url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
            // Custom
            // Rinkeby: addressBook
            addressBook: {
                // Rinkeby: erc20s
                erc20: {
                    DAI: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
                    "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa": "DAI",
                    WETH: "0xc778417e063141139fce010982780140aa0cd5ab",
                    "0xc778417e063141139fce010982780140aa0cd5ab": "WETH",
                },
    
                // Rinkeby: Gelato
                gelatoExecutor: {
                    default: "0xa5A98a6AD379C7B578bD85E35A3eC28AD72A336b", // PermissionedExecutors
                },
    
                uniswapV2: {
                    router2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                    factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
                },
            },
    
            // Rinkeby: Contracts
            contracts: [
                // === Actions ===
                // Provider
                "FeeHandlerFactory",
                "GelatoTokenFaucet",
                // === Conditions ===
                // Time
                "ConditionTimeStateful",
                // === GelatoCore ===
                "GelatoCore",
                // === ProviderModules ===
                "ProviderModuleGelatoUserProxy",
            ],
    
            // Rinkeby: Deployments
            deployments: {
                // ==== Actions ====
                ActionTransfer: "0x783bD05d52B02811dECC8960aBF38A56c9Fb5F9B",
                // Provider
                FeeHandlerFactory: "0x6988f5c52E0b6Bdcf6d0223e65a4C49F0c2cb1F8",
                // ==== Conditions ====
                // Time
                ConditionTimeStateful: "0xcA560E4399399016d897983206aB591CAD19169C",
                // ===== Gelato Core ====
                GelatoCore: "0x733aDEf4f8346FD96107d8d6605eA9ab5645d632",
                // === GelatoUserProxies ===
                GelatoUserProxyFactory: "0x0309EC714C7E7c4C5B94bed97439940aED4F0624",
                // ===== Provider Modules ====
                ProviderModuleGelatoUserProxy: "0x66a35534126B4B0845A2aa03825b95dFaaE88B0C",
                GelatoTokenFaucet: "0xbA7A7187EF22fE2B001bF8e4707B66B3985F5805",
            },
    
            // Rinkeby: Filters
            filters: {
                defaultFromBlock: 6699941,
                defaultToBlock: "latest",
            },
        },
    },
    solidity: {
        version: "0.6.10",
        settings: {
          optimizer: {
            enabled: true
          }
        }
    }
};
