import { cn } from 'styles/utils';

import { tagStyles } from './tag.styles';

import type { TagProps } from './tag.types';

export const Tag = ({ className, tier, ...props }: TagProps) => (
  <span className={cn(tagStyles({ tier }), className)} {...props} />
);
