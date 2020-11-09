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
      defaultMessage: 'Connect Wallet',
  },
  walletHeader: {
    id: `${scope}.walletHeader`,
    defaultMessage: 'Wallet',
  },
  addressLabel: {
    id: `${scope}.addressLabel`,
    defaultMessage: 'Address',
  },
});
