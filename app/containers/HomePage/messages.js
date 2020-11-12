/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.containers.HomePage';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the HomePage container!',
  },
  connectWallet: {
      id: `${scope}.connectWallet`,
      defaultMessage: 'connect wallet',
  },
  walletHeader: {
    id: `${scope}.walletHeader`,
    defaultMessage: 'Wallet',
  },
  addressLabel: {
    id: `${scope}.addressLabel`,
    defaultMessage: 'Address',
  },
  getProxy: {
    id: `${scope}.getProxy`,
    defaultMessage: 'get a proxy',
  },
  haveProxy: {
    id: `${scope}.haveProxy`,
    defaultMessage: 'You have a Gelato Proxy',
  },
  allowance: {
    id: `${scope}.allowance`,
    defaultMessage: 'Allowance',
  },
  approve: {
    id: `${scope}.approve`,
    defaultMessage: 'approve',
  },
  amount: {
    id: `${scope}.amount`,
    defaultMessage: 'Amount',
  },
  seconds: {
    id: `${scope}.seconds`,
    defaultMessage: 'Seconds',
  },
  traderRunning: {
    id: `${scope}.traderRunning`,
    defaultMessage: 'Your automated trader is running!',
  },
  traderStart: {
    id: `${scope}.traderStart`,
    defaultMessage: 'start trader',
  },
  traderStop: {
    id: `${scope}.traderStop`,
    defaultMessage: 'stop trader',
  },
  traderHeader: {
    id: `${scope}.traderHeader`,
    defaultMessage: 'Start automated trades (DAI->WETH)',
  }
});
