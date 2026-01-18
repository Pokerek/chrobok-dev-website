import {forwardRef} from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from 'styles/utils';

import { buttonStyles } from './button.styles';

import type { ButtonProps } from './button.types';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonStyles({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
