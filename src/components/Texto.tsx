// Text de React Native que traduce sus textos según el país y el idioma (lib/region).
// Toda la app importa Text desde aquí en lugar de 'react-native'.
import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { t, useRegion } from '../lib/region';

function traducir(n: ReactNode): ReactNode {
  if (typeof n === 'string') return t(n);
  if (Array.isArray(n)) return Children.map(n, traducir);
  return n;
}

export function Text({ children, accessibilityLabel, ...props }: TextProps) {
  useRegion(); // se redibuja al cambiar idioma o país
  return (
    <RNText {...props} accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}>
      {traducir(children)}
    </RNText>
  );
}
