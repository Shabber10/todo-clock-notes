import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ClayButton } from './ClayButton';

interface MaterialTimePickerModalProps {
  visible: boolean;
  initialTime: string; // "HH:mm" in 24h format
  title?: string;
  isDark?: boolean;
  onCancel: () => void;
  onConfirm: (time24: string) => void;
}

const DIAL_SIZE = 256;
const CENTER = DIAL_SIZE / 2;
const RADIUS = 92;

export const MaterialTimePickerModal: React.FC<MaterialTimePickerModalProps> = ({
  visible,
  initialTime,
  title = 'Select time',
  isDark = false,
  onCancel,
  onConfirm,
}) => {
  const [pickerMode, setPickerMode] = useState<'dial' | 'input'>('dial');
  const [activeSection, setActiveSection] = useState<'hour' | 'minute'>('hour');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'am' | 'pm'>('am');

  const [inputHour, setInputHour] = useState('08');
  const [inputMinute, setInputMinute] = useState('00');
  const minuteInputRef = useRef<TextInput>(null);

  const dialRef = useRef<View>(null);

  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  // Initialize values when opened
  useEffect(() => {
    if (visible) {
      const parts = (initialTime || '09:00').split(':');
      let h = parseInt(parts[0] || '9', 10);
      const m = parseInt(parts[1] || '0', 10);
      const p = h >= 12 ? 'pm' : 'am';
      h = h % 12;
      if (h === 0) h = 12;

      setHour(h);
      setMinute(m);
      setPeriod(p);
      setInputHour(String(h).padStart(2, '0'));
      setInputMinute(String(m).padStart(2, '0'));
      setActiveSection('hour');
      setPickerMode('dial');
    }
  }, [visible, initialTime]);

  // Sync inputs when hour/minute change
  const updateHour = (newHour: number) => {
    const clamped = Math.max(1, Math.min(12, newHour));
    setHour(clamped);
    setInputHour(String(clamped).padStart(2, '0'));
  };

  const updateMinute = (newMinute: number) => {
    const clamped = Math.max(0, Math.min(59, newMinute));
    setMinute(clamped);
    setInputMinute(String(clamped).padStart(2, '0'));
  };

  // Convert touch coordinates on dial to hour or minute
  const handleDialTouch = (evt: GestureResponderEvent, isRelease = false) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - CENTER;
    const dy = locationY - CENTER;

    // Angle in degrees from 12 o'clock, clockwise [0..360)
    const angleRad = Math.atan2(dy, dx);
    let deg = (angleRad * (180 / Math.PI) + 90 + 360) % 360;

    const currentSection = activeSectionRef.current;
    if (currentSection === 'hour') {
      let h = Math.round(deg / 30);
      if (h === 0) h = 12;
      updateHour(h);
      if (isRelease) {
        // Material UX: automatically advance to minute selection
        setActiveSection('minute');
      }
    } else {
      let m = Math.round(deg / 6) % 60;
      updateMinute(m);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        handleDialTouch(evt, false);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        handleDialTouch(evt, false);
      },
      onPanResponderRelease: (evt: GestureResponderEvent) => {
        handleDialTouch(evt, true);
      },
    })
  ).current;

  // Final confirmation
  const handleConfirm = () => {
    let finalHour = hour;
    let finalMinute = minute;

    if (pickerMode === 'input') {
      const parsedH = parseInt(inputHour, 10);
      const parsedM = parseInt(inputMinute, 10);
      if (!isNaN(parsedH)) {
        finalHour = Math.max(1, Math.min(12, parsedH));
      }
      if (!isNaN(parsedM)) {
        finalMinute = Math.max(0, Math.min(59, parsedM));
      }
    }

    let h24 = finalHour;
    if (period === 'pm' && h24 < 12) h24 += 12;
    if (period === 'am' && h24 === 12) h24 = 0;

    const formatted = `${String(h24).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;
    onConfirm(formatted);
  };

  // Color tokens
  const primaryColor = isDark ? Palette.neon.cyan : '#2563EB';
  const primaryBg = isDark ? 'rgba(0, 240, 255, 0.15)' : 'rgba(37, 99, 235, 0.12)';
  const dialBg = isDark ? 'rgba(8, 14, 26, 0.95)' : '#F1F5F9';
  const inactiveBoxBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
  const activeBoxBg = isDark ? 'rgba(0, 240, 255, 0.18)' : '#EFF6FF';
  const activeBorderColor = primaryColor;
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';

  // Calculate clock hand coordinates
  const currentAngleDeg =
    activeSection === 'hour'
      ? (hour % 12) * 30 - 90
      : minute * 6 - 90;

  const currentAngleRad = (currentAngleDeg * Math.PI) / 180;
  const handEndX = CENTER + RADIUS * Math.cos(currentAngleRad);
  const handEndY = CENTER + RADIUS * Math.sin(currentAngleRad);

  // Hour numbers: 1 to 12
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Minute numbers: every 5 minutes (0, 5, 10, ... 55)
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, isDark ? styles.darkCard : styles.lightCard]}>
          {/* Header Title */}
          <Text style={[styles.headerTitle, { color: subTextColor }]}>
            {title}
          </Text>

          {/* Time Display & AM/PM Toggle */}
          <View style={styles.displayRow}>
            {/* Hour Box */}
            <TouchableOpacity
              testID="btn-timepicker-hour-box"
              accessibilityLabel="Select Hour"
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => setActiveSection('hour')}
              style={[
                styles.digitBox,
                {
                  backgroundColor: activeSection === 'hour' ? activeBoxBg : inactiveBoxBg,
                  borderColor: activeSection === 'hour' ? activeBorderColor : 'transparent',
                },
              ]}
            >
              {pickerMode === 'dial' ? (
                <Text
                  style={[
                    styles.digitText,
                    { color: activeSection === 'hour' ? primaryColor : textColor },
                  ]}
                >
                  {String(hour).padStart(2, '0')}
                </Text>
              ) : (
                <TextInput
                  testID="input-timepicker-hour"
                  style={[styles.digitInput, { color: textColor }]}
                  value={inputHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus={true}
                  onFocus={() => setActiveSection('hour')}
                  onChangeText={(val) => {
                    setInputHour(val);
                    const n = parseInt(val, 10);
                    if (!isNaN(n)) updateHour(n);
                    if (val.length === 2) {
                      minuteInputRef.current?.focus();
                      setActiveSection('minute');
                    }
                  }}
                />
              )}
              {pickerMode === 'input' && (
                <Text style={[styles.inputSubLabel, { color: subTextColor }]}>Hour</Text>
              )}
            </TouchableOpacity>

            {/* Colon */}
            <Text style={[styles.colonText, { color: textColor }]}>:</Text>

            {/* Minute Box */}
            <TouchableOpacity
              testID="btn-timepicker-minute-box"
              accessibilityLabel="Select Minute"
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => setActiveSection('minute')}
              style={[
                styles.digitBox,
                {
                  backgroundColor: activeSection === 'minute' ? activeBoxBg : inactiveBoxBg,
                  borderColor: activeSection === 'minute' ? activeBorderColor : 'transparent',
                },
              ]}
            >
              {pickerMode === 'dial' ? (
                <Text
                  style={[
                    styles.digitText,
                    { color: activeSection === 'minute' ? primaryColor : textColor },
                  ]}
                >
                  {String(minute).padStart(2, '0')}
                </Text>
              ) : (
                <TextInput
                  ref={minuteInputRef}
                  testID="input-timepicker-minute"
                  style={[styles.digitInput, { color: textColor }]}
                  value={inputMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus={true}
                  onFocus={() => setActiveSection('minute')}
                  onChangeText={(val) => {
                    setInputMinute(val);
                    const n = parseInt(val, 10);
                    if (!isNaN(n)) updateMinute(n);
                  }}
                />
              )}
              {pickerMode === 'input' && (
                <Text style={[styles.inputSubLabel, { color: subTextColor }]}>Minute</Text>
              )}
            </TouchableOpacity>

            {/* AM / PM Toggle Pill */}
            <View
              style={[
                styles.amPmPill,
                { borderColor: isDark ? '#475569' : '#CBD5E1' },
              ]}
            >
              <TouchableOpacity
                testID="btn-timepicker-am"
                accessibilityLabel="AM"
                accessibilityRole="button"
                onPress={() => setPeriod('am')}
                style={[
                  styles.amPmHalf,
                  period === 'am' && { backgroundColor: primaryBg },
                ]}
              >
                <Text
                  style={[
                    styles.amPmLabel,
                    {
                      color: period === 'am' ? primaryColor : subTextColor,
                      fontWeight: period === 'am' ? '800' : '600',
                    },
                  ]}
                >
                  a.m.
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.amPmDivider,
                  { backgroundColor: isDark ? '#475569' : '#CBD5E1' },
                ]}
              />

              <TouchableOpacity
                testID="btn-timepicker-pm"
                accessibilityLabel="PM"
                accessibilityRole="button"
                onPress={() => setPeriod('pm')}
                style={[
                  styles.amPmHalf,
                  period === 'pm' && { backgroundColor: primaryBg },
                ]}
              >
                <Text
                  style={[
                    styles.amPmLabel,
                    {
                      color: period === 'pm' ? primaryColor : subTextColor,
                      fontWeight: period === 'pm' ? '800' : '600',
                    },
                  ]}
                >
                  p.m.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Middle Body: Clock Dial or Input Spacer */}
          {pickerMode === 'dial' ? (
            <View style={styles.dialWrapper}>
              <View
                ref={dialRef}
                testID="timepicker-clock-dial"
                style={[styles.dialContainer, { backgroundColor: dialBg }]}
                {...panResponder.panHandlers}
              >
                {/* SVG Clock Hand & Center Dot */}
                <Svg
                  width={DIAL_SIZE}
                  height={DIAL_SIZE}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  <Line
                    x1={CENTER}
                    y1={CENTER}
                    x2={handEndX}
                    y2={handEndY}
                    stroke={primaryColor}
                    strokeWidth={2.5}
                  />
                  <Circle cx={CENTER} cy={CENTER} r={4.5} fill={primaryColor} />
                  <Circle
                    cx={handEndX}
                    cy={handEndY}
                    r={19}
                    fill={primaryColor}
                  />
                </Svg>

                {/* Clock Numbers */}
                {activeSection === 'hour'
                  ? hourNumbers.map((h) => {
                      const angleDeg = (h % 12) * 30 - 90;
                      const rad = (angleDeg * Math.PI) / 180;
                      const x = CENTER + RADIUS * Math.cos(rad);
                      const y = CENTER + RADIUS * Math.sin(rad);
                      const isSelected = hour === h;

                      return (
                        <View
                          key={`hour-${h}`}
                          style={[
                            styles.numberItem,
                            { left: x - 18, top: y - 18 },
                          ]}
                          pointerEvents="none"
                        >
                          <Text
                            style={[
                              styles.numberText,
                              {
                                color: isSelected ? '#FFFFFF' : textColor,
                                fontWeight: isSelected ? '800' : '500',
                              },
                            ]}
                          >
                            {h}
                          </Text>
                        </View>
                      );
                    })
                  : minuteNumbers.map((m) => {
                      const angleDeg = m * 6 - 90;
                      const rad = (angleDeg * Math.PI) / 180;
                      const x = CENTER + RADIUS * Math.cos(rad);
                      const y = CENTER + RADIUS * Math.sin(rad);
                      const isSelected = minute === m;

                      return (
                        <View
                          key={`min-${m}`}
                          style={[
                            styles.numberItem,
                            { left: x - 18, top: y - 18 },
                          ]}
                          pointerEvents="none"
                        >
                          <Text
                            style={[
                              styles.numberText,
                              {
                                color: isSelected ? '#FFFFFF' : textColor,
                                fontWeight: isSelected ? '800' : '500',
                              },
                            ]}
                          >
                            {String(m).padStart(2, '0')}
                          </Text>
                        </View>
                      );
                    })}
              </View>
            </View>
          ) : (
            <View style={styles.inputModeSpacing} />
          )}

          {/* Bottom Action Row */}
          <View style={styles.bottomBar}>
            {/* Mode Toggle Button (Keyboard / Clock icon) */}
            <TouchableOpacity
              testID="btn-timepicker-mode-toggle"
              accessibilityLabel={pickerMode === 'dial' ? 'Switch to text input' : 'Switch to clock dial'}
              accessibilityRole="button"
              onPress={() => setPickerMode(pickerMode === 'dial' ? 'input' : 'dial')}
              style={styles.modeToggleBtn}
            >
              <Ionicons
                name={pickerMode === 'dial' ? 'keypad-outline' : 'time-outline'}
                size={24}
                color={subTextColor}
              />
            </TouchableOpacity>

            {/* Cancel & OK Buttons */}
            <View style={styles.actionsRight}>
              <TouchableOpacity
                testID="btn-timepicker-cancel"
                accessibilityLabel="Cancel"
                accessibilityRole="button"
                onPress={onCancel}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionBtnText, { color: primaryColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-timepicker-confirm"
                accessibilityLabel="OK"
                accessibilityRole="button"
                onPress={handleConfirm}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionBtnText, { color: primaryColor }]}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogCard: {
    width: 328,
    borderRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  lightCard: {
    backgroundColor: Palette.glass.lightElevated,
    borderWidth: 1.5,
    borderColor: Palette.glass.lightBorderSpecular,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  darkCard: {
    backgroundColor: Palette.glass.darkElevated,
    borderWidth: 1.5,
    borderColor: Palette.glass.darkBorderSpecular,
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  digitBox: {
    width: 84,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitText: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
  },
  digitInput: {
    fontSize: 44,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
    width: '100%',
  },
  inputSubLabel: {
    fontSize: 10,
    fontWeight: '600',
    position: 'absolute',
    bottom: -16,
  },
  colonText: {
    fontSize: 40,
    fontWeight: '700',
    marginHorizontal: 8,
    paddingBottom: 4,
  },
  amPmPill: {
    marginLeft: 12,
    width: 52,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  amPmHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amPmDivider: {
    height: 1,
    width: '100%',
  },
  amPmLabel: {
    fontSize: 13,
  },
  dialWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dialContainer: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    position: 'relative',
    overflow: 'hidden',
  },
  numberItem: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 15,
  },
  inputModeSpacing: {
    height: 36,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 4,
  },
  modeToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
