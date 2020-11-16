import { defineMessages } from 'react-intl';

export const scope = 'gelatoDapp.components.ConnectWalletStep';

export default defineMessages({
  walletHeader: {
      id: `${scope}.walletHeader`,
      defaultMessage: 'Wallet',
  },
  connectWallet: {
      id: `${scope}.connectWallet`,
      defaultMessage: 'connect wallet',
  },
  addressHeader: {
    id: `${scope}.addressHeader`,
    defaultMessage: 'Address:',
  },
  continue: {
    id: `${scope}.continue`,
    defaultMessage: 'continue',   
  },
  step: {
    id: `${scope}.step`,
    defaultMessage: 'connect your metamask wallet',
  },
  stepHeader: {
    id: `${scope}.stepHeader`,
    defaultMessage: 'Step 1:',
  }
});