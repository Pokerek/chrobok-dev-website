import { cva } from 'class-variance-authority';

import { cn } from 'styles/utils';

import { buttonStyles } from '../button/button.styles';

export const linkStyles = cva('', {
  variants: {
    variant: {
      bordered: cn(buttonStyles({ variant: 'outline' }), 'flex w-fit text-center'),
      inline: 'break-all underline underline-offset-4',
    },
  },
  defaultVariants: {
    variant: 'inline',
  },
});
