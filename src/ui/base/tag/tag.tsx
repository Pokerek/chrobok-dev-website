import { cn } from 'styles/utils';

import { tagStyles } from './tag.styles';

import type { TagProps } from './tag.types';

export const Tag = ({ className, variant, ...props }: TagProps) => (
  <span className={cn(tagStyles({ variant }), className)} {...props} />
);
