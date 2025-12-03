/**
 * Card component matching website design
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'md',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
    };

    const paddingStyle: ViewStyle = {
      padding: padding === 'none' ? 0 : padding === 'sm' ? spacing.sm : padding === 'lg' ? spacing.lg : spacing.md,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.md,
          ...paddingStyle,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
          ...paddingStyle,
        };
      case 'flat':
        return {
          ...baseStyle,
          ...paddingStyle,
        };
      default:
        return { ...baseStyle, ...paddingStyle };
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

export const CardHeader: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  return <View style={[{ marginBottom: spacing.md }, style]}>{children}</View>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  return (
    <View style={style}>
      {typeof children === 'string' ? (
        <Text style={styles.title}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  return <View style={style}>{children}</View>;
};

import { Text } from 'react-native';
import { typography, colors as themeColors } from '@/theme';

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.foreground,
  },
});

