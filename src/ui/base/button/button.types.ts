import type { buttonStyles } from './button.styles';
import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  asChild?: boolean;
}
