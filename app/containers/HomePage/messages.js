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
  }
});
