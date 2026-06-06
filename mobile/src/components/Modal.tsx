/**
 * Modal primitive + ConfirmDialog convenience.
 *
 * Replaces native Alert.alert (which silently no-ops on web) with a
 * design-system-aligned overlay that works identically on iOS, Android
 * and web. Backdrop dims the rest of the screen, body is a centered
 * Card. Pressing the backdrop calls onClose if provided.
 *
 * <Modal>: bare primitive. Compose anything inside.
 * <ConfirmDialog>: a one-shot confirm/cancel prompt. Most callers want this.
 */
import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Button } from './Button';
import { Typo } from './Heading';
import { tokens } from '../design-system/tokens';

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  /** When true (default), tapping the backdrop calls onClose. */
  dismissOnBackdrop?: boolean;
  children: React.ReactNode;
  /** Override the card style (e.g. wider for a long-form dialog). */
  cardStyle?: ViewStyle;
};

export function Modal({
  visible,
  onClose,
  dismissOnBackdrop = true,
  children,
  cardStyle,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissOnBackdrop ? onClose : undefined}
      >
        {/* Stop press propagation so taps inside the card don't dismiss. */}
        <Pressable onPress={() => {}} style={[styles.card, cardStyle]}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  /** Label for the action button. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to 'Cancel'. */
  cancelLabel?: string;
  /** Render the confirm button in danger style (red). Use for destructive actions. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Disable buttons while a follow-up action is running. */
  loading?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} onClose={loading ? undefined : onCancel}>
      <Typo variant="h3">{title}</Typo>
      {message && (
        <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          {message}
        </Typo>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 20,
        }}
      >
        <Button variant="ghost" onPress={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'danger' : 'primary'}
          onPress={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 22, 17, 0.4)', // espresso-900 @ 40%
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: tokens.colors.bgCard,
    borderRadius: tokens.radius.xl,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
});
