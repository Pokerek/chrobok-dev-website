import { cva } from 'class-variance-authority';

export const tagStyles = cva(
  'inline-flex items-center border border-border-default bg-element-bg px-3 py-1 font-body text-sm font-medium text-text-primary',
  {
    variants: {
      variant: {
        solid: 'border-solid',
        dashed: 'border-dashed',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);
