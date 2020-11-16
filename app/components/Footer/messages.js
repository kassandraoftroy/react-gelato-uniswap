/*
 * Footer Messages
 *
 * This contains all the text for the Footer component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'gelatoDapp.components.Footer';

export default defineMessages({
  tagline: {
    id: `${scope}.tagline`,
    defaultMessage: 'This project is licensed under the MIT license.',
  },
  authorMessage: {
    id: `${scope}.authorMessage`,
    defaultMessage: `
      Made with love by {author}.
    `,
  },
});
