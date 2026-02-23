import { Text, type TextProps, type PolymorphicComponentProps } from '@mantine/core';

type Props = PolymorphicComponentProps<'p', TextProps>;

export const SectionLabel = (props: Props) => (
  <Text size="sm" fw={500} {...props} />
);

export const MetaText = (props: Props) => (
  <Text size="xs" c="dimmed" {...props} />
);

export const ErrorText = (props: Props) => (
  <Text size="xs" c="red" {...props} />
);
