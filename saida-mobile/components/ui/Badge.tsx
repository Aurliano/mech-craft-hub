/**
 * Badge component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
      paddingVertical: size === 'sm' ? 2 : 4,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colors.success,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colors.warning,
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: colors.error,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.muted,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.primaryForeground,
    };

    if (variant === 'default' || variant === 'secondary') {
      return {
        ...baseStyle,
        color: colors.foreground,
      };
    }

    return baseStyle;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{children}</Text>
    </View>
  );
};

