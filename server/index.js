/* eslint consistent-return:0 import/order:0 */
require('dotenv').config();
if (
  process.env.DAPP_INFURA_ID == null ||
  process.env.DAPP_PROVIDER_PK == null ||
  process.env.DAPP_FEE_ACTION_ADDR == null
) {
  console.log(
    '\n !! IMPORTANT !!\n Must set all .env variables before running server (see README.md)',
  );
  throw 'run setup before starting server';
}
const ethers = require('ethers');
const externalProviderAddress = new ethers.Wallet(process.env.DAPP_PROVIDER_PK)
  .address;
const actionStablecoinFeeAddress = process.env.DAPP_FEE_ACTION_ADDR;
const express = require('express');
const logger = require('./logger');
const argv = require('./argv');
const port = require('./port');
const bodyParser = require('body-parser');
const hre = require('hardhat');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;
const { resolve } = require('path');
const app = express();

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// expose a single API endpoint for reading contract abis from the backend
app.post('/contracts', (_req, res) => {
  const coreArtifact = hre.artifacts.readArtifactSync('GelatoCore');
  const proxyFactoryArtifact = hre.artifacts.readArtifactSync(
    'IGelatoUserProxyFactory',
  );
  const proxyArtifact = hre.artifacts.readArtifactSync('IGelatoUserProxy');
  const uniArtifact = hre.artifacts.readArtifactSync('IUniswapV2Router02');
  const erc20Artifact = hre.artifacts.readArtifactSync('@gelatonetwork/core/contracts/external/IERC20.sol:IERC20');
  const feeActionArtifact = hre.artifacts.readArtifactSync(
    'ActionStablecoinFee',
  );
  const conditionTimeArtifact = hre.artifacts.readArtifactSync(
    'ConditionTimeStateful',
  );
  const aggregatorArtifact = hre.artifacts.readArtifactSync(
    'AggregatorV3Interface',
  );
  const actionUniswapArtifact = hre.artifacts.readArtifactSync(
    'ActionSafeUniswap',
  );
  const proxyFactoryAddress =
    hre.network.config.deployments.GelatoUserProxyFactory;
  const wethAddress = hre.network.config.addressBook.erc20.WETH;
  const daiAddress = hre.network.config.addressBook.erc20.DAI;
  const uniAddress = hre.network.config.addressBook.uniswapV2.router2;
  const providerModuleAddress =
    hre.network.config.deployments.ProviderModuleGelatoUserProxy;
  const feeActionAddress = actionStablecoinFeeAddress;
  const gelatoProviderAddress = externalProviderAddress;
  const coreAddress = hre.network.config.deployments.GelatoCore;
  const executor = hre.network.config.addressBook.gelatoExecutor.default;
  const conditionTimeAddress =
    hre.network.config.deployments.ConditionTimeStateful;
  const actionUniswapAddress = hre.network.config.deployments.ActionSafeUniswap;
  const contracts = {
    GelatoUserProxyFactory: {
      abi: proxyFactoryArtifact.abi,
      address: proxyFactoryAddress,
    },
    WETH: { abi: erc20Artifact.abi, address: wethAddress },
    DAI: { abi: erc20Artifact.abi, address: daiAddress },
    GelatoProviderModule: { address: providerModuleAddress },
    UniswapRouter: { address: uniAddress, abi: uniArtifact.abi },
    IGelatoUserProxy: { abi: proxyArtifact.abi },
    GelatoCore: { abi: coreArtifact.abi, address: coreAddress },
    GelatoExecutor: { address: executor },
    ActionStablecoinFee: {
      abi: feeActionArtifact.abi,
      address: feeActionAddress,
    },
    ConditionTimeStateful: {
      address: conditionTimeAddress,
      abi: conditionTimeArtifact.abi,
    },
    GelatoProvider: { address: gelatoProviderAddress },
    IAggregatorV3: { abi: aggregatorArtifact.abi },
    ActionSafeUniswap: {
      abi: actionUniswapArtifact.abi,
      address: actionUniswapAddress,
    },
  };
  return res.json(contracts);
});

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});

app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let url;
    try {
      url = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, url);
  } else {
    logger.appStarted(port, prettyHost);
  }
});
