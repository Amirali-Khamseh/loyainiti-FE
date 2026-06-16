import React from 'react';
import { View } from 'react-native';
import { RotateCw, TriangleAlert } from 'lucide-react-native';
import { tokens } from '../design-system/tokens';
import { Typo } from './Heading';
import { Button } from './Button';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time errors anywhere below it and shows a themed fallback
 * instead of a redbox / blank screen. Wraps the navigator in app/_layout.tsx.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            gap: 16,
            backgroundColor: tokens.colors.bgCanvas,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.colors.dangerBg,
              borderWidth: 1,
              borderColor: tokens.colors.dangerBorder,
            }}
          >
            <TriangleAlert color={tokens.colors.danger} size={22} />
          </View>
          <Typo variant="h2" style={{ textAlign: 'center' }}>
            Something went wrong
          </Typo>
          <Typo variant="body" color={tokens.colors.fg2} style={{ textAlign: 'center' }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </Typo>
          <Button
            variant="primary"
            leftSlot={<RotateCw color={tokens.colors.actionFg} size={15} />}
            onPress={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}
