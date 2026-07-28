import { cva } from 'class-variance-authority';

import { cn } from 'styles/utils';

import { buttonStyles } from '../button/button.styles';

export const linkStyles = cva('', {
  variants: {
    variant: {
      bordered: cn(buttonStyles({ variant: 'outline' }), 'flex w-fit text-center'),
      // `break-all` is load-bearing, not cosmetic: an email address or URL is one unbreakable
      // token, and at 200% text on a narrow screen it overruns the column and forces horizontal
      // page scroll — a WCAG 2.1 AA 1.4.10 (Reflow) failure that axe does not detect.
      inline: 'break-all underline underline-offset-4',
    },
  },
  defaultVariants: {
    variant: 'inline',
  },
});
