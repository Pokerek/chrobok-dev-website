import type { ButtonHTMLAttributes } from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { buttonStyles } from './button.styles';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  asChild?: boolean;
}
