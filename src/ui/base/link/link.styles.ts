import { cva } from 'class-variance-authority';

import { cn } from 'styles/utils';

import { buttonStyles } from '../button/button.styles';

export const linkStyles = cva('', {
  variants: {
    variant: {
      // Composed from the outline button rather than restated, so the `min-h-10` fix that
      // stops labels clipping at 200% zoom keeps one source of truth and reaches every link.
      bordered: cn(buttonStyles({ variant: 'outline' }), 'flex w-fit text-center'),
      inline: 'underline underline-offset-4',
    },
  },
  defaultVariants: {
    variant: 'inline',
  },
});
