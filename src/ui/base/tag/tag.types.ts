import type { tagStyles } from './tag.styles';
import type { VariantProps } from 'class-variance-authority';

export type TagVariant = NonNullable<VariantProps<typeof tagStyles>['variant']>;
