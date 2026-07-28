import type { linkStyles } from './link.styles';
import type { HTMLAttributes } from 'astro/types';
import type { VariantProps } from 'class-variance-authority';

export type LinkProps = HTMLAttributes<'a'> &
  VariantProps<typeof linkStyles> & {
    href: string;
    /** Emits `target="_blank"` and `rel="noopener noreferrer"` together. */
    external?: boolean;
  };
