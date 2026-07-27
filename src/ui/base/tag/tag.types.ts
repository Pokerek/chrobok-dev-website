import type { tagStyles } from './tag.styles';
import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

export type TagProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagStyles>;

export type TagVariant = NonNullable<VariantProps<typeof tagStyles>['variant']>;
