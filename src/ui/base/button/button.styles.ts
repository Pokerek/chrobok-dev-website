import { cva } from 'class-variance-authority';

export const buttonStyles = cva(
  'inline-flex items-center justify-center font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-border-default bg-element-bg text-text-primary hover:bg-hover-bg',
        outline: 'border border-border-default bg-transparent hover:bg-element-bg',
        link: 'text-text-primary underline-offset-4 hover:underline',
      },
      size: {
        // Heights are minimums, not fixed: at 200% text zoom a label wraps, and a fixed box
        // clips it. `icon` is the exception — a fixed square with no label to wrap.
        default: 'min-h-10 px-6 py-2',
        sm: 'min-h-9 px-4',
        lg: 'min-h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
