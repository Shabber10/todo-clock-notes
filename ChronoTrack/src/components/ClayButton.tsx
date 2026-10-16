import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import { Palette } from '../theme/colors';

interface ClayButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
  isDark?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  borderRadius?: number;
  testID?: string;
  accessibilityLabel?: string;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  onPress,
  style,
  glowColor,
  isDark = true,
  variant = 'primary',
  borderRadius = 16,
  testID,
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const clayTokens = isDark ? Palette.clay.dark : Palette.clay.light;

  // Determine dynamic background and glow based on variant
  let bgColor = clayTokens.bg;
  let effectiveGlow = glowColor;

  if (variant === 'primary') {
    bgColor = isDark ? '#1E3A8A' : '#2563EB';
    effectiveGlow = effectiveGlow || Palette.neon.blueGlow;
  } else if (variant === 'accent') {
    bgColor = isDark ? '#0891B2' : '#06B6D4';
    effectiveGlow = effectiveGlow || Palette.neon.cyanGlow;
  } else if (variant === 'success') {
    bgColor = isDark ? '#065F46' : '#10B981';
    effectiveGlow = effectiveGlow || Palette.neon.emeraldGlow;
  } else if (variant === 'danger') {
    bgColor = isDark ? '#991B1B' : '#EF4444';
    effectiveGlow = effectiveGlow || Palette.neon.coralGlow;
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        effectiveGlow ? {
          shadowColor: effectiveGlow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.65,
          shadowRadius: 10,
          elevation: 6,
        } : null,
      ]}
    >
      <TouchableOpacity
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.base,
          {
            backgroundColor: bgColor,
            borderRadius: borderRadius,
            borderColor: clayTokens.border,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#FFFFFF',
            borderBottomColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
          },
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
