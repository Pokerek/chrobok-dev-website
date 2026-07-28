import type { HTMLAttributes } from 'astro/types';
import type { VariantProps } from 'class-variance-authority';
import type { linkStyles } from 'ui/base/link/link.styles';

export type LinkProps = HTMLAttributes<'a'> &
  VariantProps<typeof linkStyles> & {
    href: string;
    /** Emits the full external-link contract: target, rel and the screen-reader suffix, together. */
    external?: boolean;
  };
