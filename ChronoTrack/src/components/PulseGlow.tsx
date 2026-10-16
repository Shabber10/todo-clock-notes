import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface PulseGlowProps {
  children: React.ReactNode;
  glowColor?: string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export const PulseGlow: React.FC<PulseGlowProps> = ({
  children,
  glowColor = '#00F0FF',
  active = true,
  style,
  borderRadius = 16,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulseAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [active]);

  if (!active) {
    return <View style={style}>{children}</View>;
  }

  const haloOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const haloSpread = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 16],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          borderRadius,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: haloOpacity,
          shadowRadius: haloSpread,
          elevation: 8,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
