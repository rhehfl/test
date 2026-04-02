import type { Preview } from '@storybook/react-vite'
import "../src/index.css"
import { background } from 'storybook/theming';
const preview: Preview = {
  parameters: {
      backgrounds: {
      default: 'base',
      values: [
        { name: 'base',    value: '#0B0D12' },
        { name: 'surface', value: '#111318' },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;