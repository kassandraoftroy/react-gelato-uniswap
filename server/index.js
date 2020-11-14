/* eslint consistent-return:0 import/order:0 */
require("dotenv").config();
if (process.env.DAPP_INFURA_ID==null || process.env.DAPP_PROVIDER_PK==null || process.env.DAPP_FEE_ACTION_ADDR==null) {
    console.log(process.env.DAPP_INFURA_ID, process.env.DAPP_PROVIDER_PK, process.env.DAPP_FEE_ACTION_ADDR);
    console.log("\n !! IMPORTANT !!\n Must set all .env variables before running server (see README.md)");
    throw "run setup before starting server"
}

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

app.post('/contracts', (_req, res) => {
    let coreArtifact = hre.artifacts.readArtifactSync('GelatoCore');
    let proxyFactoryArtifact = hre.artifacts.readArtifactSync('IGelatoUserProxyFactory');
    let proxyArtifact = hre.artifacts.readArtifactSync('IGelatoUserProxy');
    let uniArtifact = hre.artifacts.readArtifactSync('IUniswapV2Router02');
    let erc20Artifact = hre.artifacts.readArtifactSync('IERC20');
    let feeActionArtifact = hre.artifacts.readArtifactSync('ActionStablecoinFee');
    let conditionTimeArtifact = hre.artifacts.readArtifactSync('ConditionTimeStateful');
    let proxyFactoryAddress = hre.network.config.deployments.GelatoUserProxyFactory;
    let wethAddress = hre.network.config.addressBook.erc20.WETH;
    let daiAddress = hre.network.config.addressBook.erc20.DAI;
    let uniAddress = hre.network.config.addressBook.uniswapV2.router2;
    let providerModuleAddress = hre.network.config.deployments.ProviderModuleGelatoUserProxy;
    let feeActionAddress = process.env.DAPP_FEE_ACTION_ADDR;
    let coreAddress = hre.network.config.deployments.GelatoCore;
    let executor = hre.network.config.addressBook.gelatoExecutor.default;
    let conditionTimeAddress = hre.network.config.deployments.ConditionTimeStateful;
    let contracts = {GelatoUserProxyFactory: {abi: proxyFactoryArtifact.abi, address: proxyFactoryAddress}, WETH: {abi:erc20Artifact.abi, address: wethAddress}, DAI: {abi:erc20Artifact.abi, address: daiAddress}, GelatoProviderModule: {address: providerModuleAddress}, UniswapRouter: {address: uniAddress, abi: uniArtifact.abi}, IGelatoUserProxy:{abi: proxyArtifact.abi}, GelatoCore: {abi: coreArtifact.abi, address: coreAddress}, GelatoExecutor: {address: executor}, ActionStablecoinFee: {abi: feeActionArtifact.abi, address: feeActionAddress}, ConditionTimeStateful: {address: conditionTimeAddress, abi: conditionTimeArtifact.abi}};
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
