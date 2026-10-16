import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { MeasurementType, TaskPriority } from '../types';
import * as db from '../database/db';

interface DayOption {
  key: string;
  label: string;
  dayIndex: number;
  fullName: string;
}

const WEEK_DAYS: DayOption[] = [
  { key: 'sun', label: 'S', dayIndex: 0, fullName: 'Sunday' },
  { key: 'mon', label: 'M', dayIndex: 1, fullName: 'Monday' },
  { key: 'tue', label: 'T', dayIndex: 2, fullName: 'Tuesday' },
  { key: 'wed', label: 'W', dayIndex: 3, fullName: 'Wednesday' },
  { key: 'thu', label: 'T', dayIndex: 4, fullName: 'Thursday' },
  { key: 'fri', label: 'F', dayIndex: 5, fullName: 'Friday' },
  { key: 'sat', label: 'S', dayIndex: 6, fullName: 'Saturday' },
];

const ALARM_SOUNDS = [
  'Default (Gentle Chime)',
  'Digital Beep',
  'Morning Sunbird',
  'Zen Temple Bell',
  'Radar Alert',
  'Energetic Wave',
];

const SNOOZE_OPTIONS = [5, 10, 15, 20, 30];

export const AddTaskModal: React.FC = () => {
  const { isAddTaskModalOpen, setIsAddTaskModalOpen, selectedDate, categories, settings, refreshData } = useApp();
  const isDark = settings.theme === 'dark';

  // Core Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // Measurement State
  const [measurementType, setMeasurementType] = useState<MeasurementType>('quantity');
  const [isMeasurementPopupOpen, setIsMeasurementPopupOpen] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [plannedMinutes, setPlannedMinutes] = useState('');

  // Repeat / Days of week state (all unselected by default)
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Alarm & Sound state (from user's image)
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [pauseAlarmMins, setPauseAlarmMins] = useState(10);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [alarmSound, setAlarmSound] = useState('Default (Gentle Chime)');
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isVibrateEnabled, setIsVibrateEnabled] = useState(true);

  // Time Picker Modal State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end'>('start');
  const [timeActiveSection, setTimeActiveSection] = useState<'hour' | 'minute'>('hour');
  const [pickerHour, setPickerHour] = useState(9);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>('AM');

  const MEASUREMENT_TYPES: { type: MeasurementType; label: string; icon: string }[] = [
    { type: 'quantity', label: 'Quantity (km, pages, etc.)', icon: 'speedometer' },
    { type: 'duration', label: 'Duration (minutes/hours)', icon: 'time' },
    { type: 'checklist', label: 'Checklist / Milestones', icon: 'list' },
    { type: 'percentage', label: 'Percentage (0-100%)', icon: 'pie-chart' },
    { type: 'rating', label: 'Self-Rating (1-5 stars)', icon: 'star' },
    { type: 'binary', label: 'Done / Not Done', icon: 'checkbox' },
  ];

  const selectedMeasurement = MEASUREMENT_TYPES.find(m => m.type === measurementType) || MEASUREMENT_TYPES[0];
  const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  // Toggle Day Selection
  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      setSelectedDays(selectedDays.filter(d => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  // Format Repeat Summary Text
  const getRepeatSummary = () => {
    if (selectedDays.length === 7) return 'Everyday';
    if (selectedDays.length === 0) return 'No repeat (Once)';
    const isWeekdays = selectedDays.length === 5 && !selectedDays.includes('sun') && !selectedDays.includes('sat');
    if (isWeekdays) return 'Weekdays (Mon - Fri)';
    const isWeekends = selectedDays.length === 2 && selectedDays.includes('sun') && selectedDays.includes('sat');
    if (isWeekends) return 'Weekends (Sat - Sun)';
    const dayNames = WEEK_DAYS.filter(d => selectedDays.includes(d.key)).map(d => d.fullName.slice(0, 3));
    return dayNames.join(', ');
  };

  // Format 24h string to 12h display
  const formatTime12h = (time24: string) => {
    const parts = time24.split(':');
    let h = parseInt(parts[0] || '9', 10);
    const m = parts[1] || '00';
    const period = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  };

  // Open Time Picker Modal
  const openTimePickerModal = (target: 'start' | 'end') => {
    setTimePickerTarget(target);
    setTimeActiveSection('hour');
    const currentTimeStr = target === 'start' ? startTime : endTime;
    const parts = currentTimeStr.split(':');
    let h = parseInt(parts[0] || '9', 10);
    const m = parseInt(parts[1] || '0', 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    setPickerHour(h);
    setPickerMinute(m);
    setPickerPeriod(period);
    setIsTimePickerOpen(true);
  };

  const adjustMinute = (delta: number) => {
    setPickerMinute(prev => (prev + delta + 60) % 60);
  };

  const setPickerToNow = () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    setPickerHour(h);
    setPickerMinute(m);
    setPickerPeriod(period);
  };

  // Confirm Time Picker
  const handleConfirmTime = () => {
    let h = pickerHour;
    if (pickerPeriod === 'PM' && h < 12) h += 12;
    if (pickerPeriod === 'AM' && h === 12) h = 0;
    const formatted = `${h.toString().padStart(2, '0')}:${pickerMinute.toString().padStart(2, '0')}`;
    if (timePickerTarget === 'start') {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
    setIsTimePickerOpen(false);
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setPriority(null);
    setStartTime('09:00');
    setEndTime('10:00');
    setMeasurementType('quantity');
    setTargetAmount('');
    setUnit('');
    setPlannedMinutes('');
    setSelectedDays([]);
    setIsAlarmEnabled(true);
  };

  useEffect(() => {
    if (isAddTaskModalOpen) {
      resetForm();
    }
  }, [isAddTaskModalOpen]);

  // Save Task
  const handleSaveTask = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title.');
      return;
    }

    let measurementConfig: any = {};
    if (measurementType === 'quantity') {
      measurementConfig = { target: parseFloat(targetAmount) || 1, unit: unit || 'units' };
    } else if (measurementType === 'duration') {
      measurementConfig = { plannedMinutes: parseFloat(plannedMinutes) || 60 };
    } else if (measurementType === 'checklist') {
      measurementConfig = {
        subtasks: [
          { id: 'sub_1', title: 'Phase 1 - Planning', weight: 1, completed: false },
          { id: 'sub_2', title: 'Phase 2 - Execution', weight: 1, completed: false }
        ]
      };
    } else if (measurementType === 'rating') {
      measurementConfig = { maxRating: 5 };
    }

    const finalCategoryId = categoryId || categories[0]?.id || 'cat_1';
    const finalPriority: TaskPriority = priority || 'medium';
    const recurrence = selectedDays.length === 7 
      ? 'daily' 
      : selectedDays.length === 5 && !selectedDays.includes('sun') && !selectedDays.includes('sat')
      ? 'weekdays' 
      : selectedDays.length > 0 
      ? 'weekly' 
      : 'one_time';

    const newTask = {
      id: `tsk_${Date.now()}`,
      title,
      description,
      categoryId: finalCategoryId,
      priority: finalPriority,
      measurementType,
      measurementConfig,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      recurrence,
    };

    db.insertNewTaskInDb(newTask as any, selectedDate);
    refreshData();
    resetForm();
    setIsAddTaskModalOpen(false);
  };

  // Delete / Cancel Draft Task
  const handleDeleteDraft = () => {
    resetForm();
    setIsAddTaskModalOpen(false);
  };

  return (
    <Modal
      visible={isAddTaskModalOpen}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setIsAddTaskModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, isDark ? styles.darkSheet : styles.lightSheet]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Create a Task
              </Text>
              <TouchableOpacity
                testID="btn-close-add-task"
                accessibilityLabel="Close Create Task Modal"
                accessibilityRole="button"
                onPress={() => setIsAddTaskModalOpen(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Task Name */}
            <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
              Task Title *
            </Text>
            <TextInput
              testID="input-task-title"
              accessibilityLabel="Task Title Input"
              style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
              placeholder="e.g. Study Python, Morning Run"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
              Description (optional)
            </Text>
            <TextInput
              testID="input-task-description"
              accessibilityLabel="Task Description Input"
              style={[styles.input, isDark ? styles.darkInput : styles.lightInput, { height: 60 }]}
              placeholder="Add details, links, or notes..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Category Selector */}
            <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
              Category
            </Text>
            <View style={styles.chipsRow}>
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    testID={`btn-category-${cat.id}`}
                    accessibilityLabel={`Category ${cat.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.chip,
                      isSelected ? { backgroundColor: cat.color } : (isDark ? styles.darkChip : styles.lightChip)
                    ]}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.selectedChipText : (isDark ? styles.darkText : styles.lightText)]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Pickers (Dedicated Time Selection) */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
                  Start Time
                </Text>
                <TouchableOpacity
                  testID="btn-time-start"
                  accessibilityLabel={`Start time: ${formatTime12h(startTime)}. Tap to select start time.`}
                  accessibilityRole="button"
                  onPress={() => openTimePickerModal('start')}
                  style={[styles.timePickerButton, isDark ? styles.darkInput : styles.lightInput]}
                >
                  <Ionicons name="time-outline" size={18} color="#0D9488" style={{ marginRight: 8 }} />
                  <Text style={[styles.timePickerButtonText, isDark ? styles.darkText : styles.lightText]}>
                    {formatTime12h(startTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
                  End Time
                </Text>
                <TouchableOpacity
                  testID="btn-time-end"
                  accessibilityLabel={`End time: ${formatTime12h(endTime)}. Tap to select end time.`}
                  accessibilityRole="button"
                  onPress={() => openTimePickerModal('end')}
                  style={[styles.timePickerButton, isDark ? styles.darkInput : styles.lightInput]}
                >
                  <Ionicons name="time-outline" size={18} color="#0D9488" style={{ marginRight: 8 }} />
                  <Text style={[styles.timePickerButtonText, isDark ? styles.darkText : styles.lightText]}>
                    {formatTime12h(endTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Repeat Days in a Week (Circular Chips from user's image) */}
            <View style={styles.alarmSectionCard}>
              <View style={styles.daysHeaderRow}>
                <Text style={[styles.sectionSubtitle, isDark ? styles.darkLabel : styles.lightLabel]}>
                  Repeat on days
                </Text>
                <Text style={styles.repeatSummaryText}>
                  {getRepeatSummary()}
                </Text>
              </View>

              <View style={styles.daysRow}>
                {WEEK_DAYS.map((day) => {
                  const isDaySelected = selectedDays.includes(day.key);
                  return (
                    <TouchableOpacity
                      key={day.key}
                      testID={`btn-repeat-day-${day.key}`}
                      accessibilityLabel={`Repeat on ${day.fullName}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isDaySelected }}
                      onPress={() => toggleDay(day.key)}
                      style={[
                        styles.dayCircle,
                        isDaySelected ? styles.dayCircleActive : (isDark ? styles.dayCircleDark : styles.dayCircleLight)
                      ]}
                    >
                      <Text style={[styles.dayCircleText, isDaySelected ? styles.dayCircleTextActive : (isDark ? styles.darkText : styles.lightText)]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Measurement Method Dropdown Selector (Clean Trigger, No Layout Push) */}
            <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel, { marginTop: 14 }]}>
              How do you want to measure this task?
            </Text>
            <TouchableOpacity
              testID="btn-measurement-dropdown-trigger"
              accessibilityLabel={`Measurement method: ${selectedMeasurement.label}. Tap to choose method.`}
              accessibilityRole="combobox"
              onPress={() => setIsMeasurementPopupOpen(true)}
              style={[styles.dropdownTrigger, isDark ? styles.darkDropdownTrigger : styles.lightDropdownTrigger]}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownSelectedLeft}>
                <View style={[styles.dropdownIconCircle, isDark ? styles.darkIconCircle : styles.lightIconCircle]}>
                  <Ionicons
                    name={selectedMeasurement.icon as any}
                    size={18}
                    color="#0D9488"
                  />
                </View>
                <Text style={[styles.dropdownSelectedText, isDark ? styles.darkText : styles.lightText]}>
                  {selectedMeasurement.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>

            {/* Dynamic Target Fields (shown based on measurement choice) */}
            {measurementType === 'quantity' && (
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
                    Target Amount
                  </Text>
                  <TextInput
                    testID="input-target-amount"
                    accessibilityLabel="Target Amount Input"
                    placeholder="e.g. 5"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
                    keyboardType="numeric"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
                    Unit (e.g. km, pages)
                  </Text>
                  <TextInput
                    testID="input-target-unit"
                    accessibilityLabel="Target Unit Input"
                    placeholder="e.g. km, pages"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>
            )}

            {measurementType === 'duration' && (
              <View>
                <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
                  Planned Duration (minutes)
                </Text>
                <TextInput
                  testID="input-planned-minutes"
                  accessibilityLabel="Planned Duration Minutes Input"
                  placeholder="e.g. 60"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
                  keyboardType="numeric"
                  value={plannedMinutes}
                  onChangeText={setPlannedMinutes}
                />
              </View>
            )}

            {/* Priority Selection */}
            <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel, { marginTop: 14 }]}>
              Priority
            </Text>
            <View style={styles.chipsRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    testID={`btn-priority-${p}`}
                    accessibilityLabel={`Priority ${p}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.chip,
                      isSelected ? styles.priorityChipSelected : (isDark ? styles.darkChip : styles.lightChip)
                    ]}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.selectedChipText : (isDark ? styles.darkText : styles.lightText)]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Alarm & Sound Card (Matching user's reference image) */}
            <View style={[styles.alarmControlCard, isDark ? styles.darkAlarmCard : styles.lightAlarmCard]}>
              {/* Alarm Schedule & Toggle */}
              <View style={styles.alarmRow}>
                <View style={styles.alarmRowLeft}>
                  <Ionicons name="alarm-outline" size={20} color="#0D9488" />
                  <Text style={[styles.alarmLabel, isDark ? styles.darkText : styles.lightText]}>
                    {isAlarmEnabled ? 'Alarm is on' : 'Alarm is off'}
                  </Text>
                </View>
                <Switch
                  testID="switch-alarm-toggle"
                  accessibilityLabel="Toggle Alarm On or Off"
                  value={isAlarmEnabled}
                  onValueChange={setIsAlarmEnabled}
                  trackColor={{ false: '#64748B', true: '#0D9488' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Pause Alarm (Snooze) */}
              <TouchableOpacity
                testID="btn-pause-alarm"
                accessibilityLabel={`Pause alarm snooze: ${pauseAlarmMins} minutes. Tap to change.`}
                accessibilityRole="button"
                onPress={() => setIsPauseModalOpen(true)}
                style={styles.alarmOptionRow}
              >
                <View style={styles.alarmRowLeft}>
                  <Ionicons name="time-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.alarmOptionText, isDark ? styles.darkText : styles.lightText]}>
                    Pause alarm (Snooze)
                  </Text>
                </View>
                <View style={styles.alarmOptionRight}>
                  <Text style={styles.alarmOptionValue}>{pauseAlarmMins} mins</Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
              </TouchableOpacity>

              {/* Alarm Sound Selector */}
              <TouchableOpacity
                testID="btn-sound-select"
                accessibilityLabel={`Alarm sound: ${alarmSound}. Tap to change sound.`}
                accessibilityRole="button"
                onPress={() => setIsSoundModalOpen(true)}
                style={styles.alarmOptionRow}
              >
                <View style={styles.alarmRowLeft}>
                  <Ionicons name="notifications-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.alarmOptionText, isDark ? styles.darkText : styles.lightText]}>
                    Sound
                  </Text>
                </View>
                <View style={styles.alarmOptionRight}>
                  <Text style={styles.alarmOptionValue} numberOfLines={1}>{alarmSound}</Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
              </TouchableOpacity>

              {/* Vibrate Toggle */}
              <View style={[styles.alarmOptionRow, { borderBottomWidth: 0 }]}>
                <View style={styles.alarmRowLeft}>
                  <Ionicons name="phone-portrait-outline" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.alarmOptionText, isDark ? styles.darkText : styles.lightText]}>
                    Vibrate
                  </Text>
                </View>
                <Switch
                  testID="switch-vibrate-toggle"
                  accessibilityLabel="Toggle Vibrate"
                  value={isVibrateEnabled}
                  onValueChange={setIsVibrateEnabled}
                  trackColor={{ false: '#64748B', true: '#0D9488' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Bottom Action Buttons: Delete and Save (Matching user's image) */}
            <View style={styles.bottomActionsRow}>
              <TouchableOpacity
                testID="btn-task-delete"
                accessibilityLabel="Delete or Cancel Task"
                accessibilityRole="button"
                onPress={handleDeleteDraft}
                style={[styles.deleteButton, isDark ? styles.deleteButtonDark : styles.deleteButtonLight]}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-task-save"
                accessibilityLabel="Save Task"
                accessibilityRole="button"
                onPress={handleSaveTask}
                style={styles.saveButton}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* POPUP MODAL 1: Measurement Method Picker (Does NOT push content down!) */}
      <Modal
        visible={isMeasurementPopupOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMeasurementPopupOpen(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setIsMeasurementPopupOpen(false)}
        >
          <View style={[styles.popupCard, isDark ? styles.darkSheet : styles.lightSheet]}>
            <View style={styles.popupHeader}>
              <Text style={[styles.popupTitle, isDark ? styles.darkText : styles.lightText]}>
                Measurement Method
              </Text>
              <TouchableOpacity onPress={() => setIsMeasurementPopupOpen(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {MEASUREMENT_TYPES.map((m, idx) => {
                const isSelected = measurementType === m.type;
                const isLast = idx === MEASUREMENT_TYPES.length - 1;
                return (
                  <TouchableOpacity
                    key={m.type}
                    testID={`btn-measure-type-${m.type}`}
                    accessibilityLabel={`Choose ${m.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setMeasurementType(m.type);
                      setIsMeasurementPopupOpen(false);
                    }}
                    style={[
                      styles.popupItem,
                      isSelected && (isDark ? styles.popupItemSelectedDark : styles.popupItemSelectedLight),
                      !isLast && (isDark ? styles.popupItemBorderDark : styles.popupItemBorderLight)
                    ]}
                  >
                    <View style={styles.popupItemLeft}>
                      <View style={[styles.popupIconCircle, isSelected ? styles.popupIconCircleActive : (isDark ? styles.darkIconCircle : styles.lightIconCircle)]}>
                        <Ionicons
                          name={m.icon as any}
                          size={18}
                          color={isSelected ? '#FFFFFF' : '#0D9488'}
                        />
                      </View>
                      <Text style={[styles.popupItemText, isSelected ? styles.popupItemTextActive : (isDark ? styles.darkText : styles.lightText)]}>
                        {m.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 2: Dedicated Time Picker Modal */}
      <Modal
        visible={isTimePickerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTimePickerOpen(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={[styles.timePickerCard, isDark ? styles.darkSheet : styles.lightSheet]}>
            <Text style={[styles.popupTitle, isDark ? styles.darkText : styles.lightText, { textAlign: 'center', marginBottom: 12 }]}>
              {timePickerTarget === 'start' ? 'Set Start Time' : 'Set End Time'}
            </Text>

            {/* Time Digital Display */}
            <View style={styles.timeDisplayRow}>
              <TouchableOpacity
                onPress={() => setTimeActiveSection('hour')}
                style={[
                  styles.timeBox, 
                  isDark ? styles.darkTimeBox : styles.lightTimeBox,
                  timeActiveSection === 'hour' && styles.timeBoxFocused
                ]}
              >
                <Text style={styles.timeDigitText}>
                  {pickerHour.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timeBoxSub}>HOUR</Text>
              </TouchableOpacity>

              <Text style={[styles.timeColon, isDark ? styles.darkText : styles.lightText]}>:</Text>

              <TouchableOpacity
                onPress={() => setTimeActiveSection('minute')}
                style={[
                  styles.timeBox, 
                  isDark ? styles.darkTimeBox : styles.lightTimeBox,
                  timeActiveSection === 'minute' && styles.timeBoxFocused
                ]}
              >
                <Text style={styles.timeDigitText}>
                  {pickerMinute.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timeBoxSub}>MIN</Text>
              </TouchableOpacity>

              {/* AM / PM Toggle */}
              <View style={styles.amPmContainer}>
                <TouchableOpacity
                  testID="btn-timepicker-am"
                  onPress={() => setPickerPeriod('AM')}
                  style={[styles.amPmButton, pickerPeriod === 'AM' && styles.amPmActive]}
                >
                  <Text style={[styles.amPmText, pickerPeriod === 'AM' && styles.amPmTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="btn-timepicker-pm"
                  onPress={() => setPickerPeriod('PM')}
                  style={[styles.amPmButton, pickerPeriod === 'PM' && styles.amPmActive]}
                >
                  <Text style={[styles.amPmText, pickerPeriod === 'PM' && styles.amPmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Adjust & Stepper Row */}
            <View style={styles.stepperRow}>
              <TouchableOpacity 
                testID="btn-timepicker-minus-1" 
                onPress={() => adjustMinute(-1)} 
                style={[styles.stepperBtn, isDark ? styles.darkStepperBtn : styles.lightStepperBtn]}
              >
                <Ionicons name="remove" size={16} color={isDark ? '#E2E8F0' : '#0F172A'} />
                <Text style={[styles.stepperBtnText, isDark ? styles.darkText : styles.lightText]}>-1m</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                testID="btn-timepicker-now" 
                onPress={setPickerToNow} 
                style={[styles.nowBtn, isDark ? styles.darkNowBtn : styles.lightNowBtn]}
              >
                <Ionicons name="time-outline" size={14} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.nowBtnText}>Current Time</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                testID="btn-timepicker-plus-1" 
                onPress={() => adjustMinute(1)} 
                style={[styles.stepperBtn, isDark ? styles.darkStepperBtn : styles.lightStepperBtn]}
              >
                <Ionicons name="add" size={16} color={isDark ? '#E2E8F0' : '#0F172A'} />
                <Text style={[styles.stepperBtnText, isDark ? styles.darkText : styles.lightText]}>+1m</Text>
              </TouchableOpacity>
            </View>

            {/* Hour Quick Selector */}
            <Text style={[styles.pickerSubLabel, isDark ? styles.darkLabel : styles.lightLabel]}>
              Select Hour
            </Text>
            <View style={styles.gridNumbers}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <TouchableOpacity
                  key={h}
                  testID={`btn-timepicker-hour-${h}`}
                  onPress={() => {
                    setPickerHour(h);
                    setTimeActiveSection('minute');
                  }}
                  style={[styles.numBtn, pickerHour === h && styles.numBtnActive]}
                >
                  <Text style={[styles.numBtnText, pickerHour === h && styles.numBtnTextActive, isDark && pickerHour !== h && styles.darkText]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minute Quick Selector (Full 12 5-min intervals) */}
            <Text style={[styles.pickerSubLabel, isDark ? styles.darkLabel : styles.lightLabel]}>
              Select Minute
            </Text>
            <View style={styles.gridNumbers}>
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <TouchableOpacity
                  key={m}
                  testID={`btn-timepicker-min-${m}`}
                  onPress={() => {
                    setPickerMinute(m);
                    setTimeActiveSection('minute');
                  }}
                  style={[styles.numBtn, pickerMinute === m && styles.numBtnActive]}
                >
                  <Text style={[styles.numBtnText, pickerMinute === m && styles.numBtnTextActive, isDark && pickerMinute !== m && styles.darkText]}>
                    :{m.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.timePickerActionRow}>
              <TouchableOpacity
                testID="btn-timepicker-cancel"
                onPress={() => setIsTimePickerOpen(false)}
                style={styles.timeCancelBtn}
              >
                <Text style={styles.timeCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-timepicker-confirm"
                onPress={handleConfirmTime}
                style={styles.timeConfirmBtn}
              >
                <Text style={styles.timeConfirmText}>Confirm Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL 3: Alarm Sound Picker */}
      <Modal
        visible={isSoundModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSoundModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setIsSoundModalOpen(false)}
        >
          <View style={[styles.popupCard, isDark ? styles.darkSheet : styles.lightSheet]}>
            <View style={styles.popupHeader}>
              <Text style={[styles.popupTitle, isDark ? styles.darkText : styles.lightText]}>
                Alarm Sound
              </Text>
              <TouchableOpacity onPress={() => setIsSoundModalOpen(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {ALARM_SOUNDS.map((snd) => {
              const isSelected = alarmSound === snd;
              return (
                <TouchableOpacity
                  key={snd}
                  onPress={() => {
                    setAlarmSound(snd);
                    setIsSoundModalOpen(false);
                  }}
                  style={[styles.popupItem, isSelected && (isDark ? styles.popupItemSelectedDark : styles.popupItemSelectedLight)]}
                >
                  <View style={styles.popupItemLeft}>
                    <Ionicons
                      name="musical-note-outline"
                      size={18}
                      color={isSelected ? '#0D9488' : (isDark ? '#94A3B8' : '#64748B')}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[styles.popupItemText, isSelected ? styles.popupItemTextActive : (isDark ? styles.darkText : styles.lightText)]}>
                      {snd}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 4: Pause / Snooze Picker */}
      <Modal
        visible={isPauseModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPauseModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setIsPauseModalOpen(false)}
        >
          <View style={[styles.popupCard, isDark ? styles.darkSheet : styles.lightSheet]}>
            <View style={styles.popupHeader}>
              <Text style={[styles.popupTitle, isDark ? styles.darkText : styles.lightText]}>
                Pause Alarm (Snooze Duration)
              </Text>
              <TouchableOpacity onPress={() => setIsPauseModalOpen(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {SNOOZE_OPTIONS.map((mins) => {
              const isSelected = pauseAlarmMins === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    setPauseAlarmMins(mins);
                    setIsPauseModalOpen(false);
                  }}
                  style={[styles.popupItem, isSelected && (isDark ? styles.popupItemSelectedDark : styles.popupItemSelectedLight)]}
                >
                  <Text style={[styles.popupItemText, isSelected ? styles.popupItemTextActive : (isDark ? styles.darkText : styles.lightText)]}>
                    {mins} minutes
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    flex: 1,
    marginTop: 54,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  lightSheet: {
    backgroundColor: '#FFFFFF',
  },
  darkSheet: {
    backgroundColor: '#0F172A',
  },
  headerRow: {
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginBottom: 8,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 14,
    paddingBottom: 110,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  lightLabel: {
    color: '#334155',
  },
  darkLabel: {
    color: '#94A3B8',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  lightInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  darkInput: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  lightChip: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  darkChip: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  twoCol: {
    flexDirection: 'row',
    marginTop: 6,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  timePickerButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  alarmSectionCard: {
    marginTop: 14,
    borderRadius: 16,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  repeatSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#0D9488',
  },
  dayCircleLight: {
    backgroundColor: '#F1F5F9',
  },
  dayCircleDark: {
    backgroundColor: '#1E293B',
  },
  dayCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dayCircleTextActive: {
    color: '#FFFFFF',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightDropdownTrigger: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  darkDropdownTrigger: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  dropdownSelectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightIconCircle: {
    backgroundColor: '#CCFBF1',
  },
  darkIconCircle: {
    backgroundColor: '#134E4A',
  },
  dropdownSelectedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityChipSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  alarmControlCard: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  lightAlarmCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  darkAlarmCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  alarmRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alarmLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  alarmOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  alarmOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  alarmOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '50%',
  },
  alarmOptionValue: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 24,
  },
  deleteButtonLight: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: '#0D9488',
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    elevation: 6,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 8,
  },
  popupItemSelectedLight: {
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
  },
  popupItemSelectedDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderRadius: 10,
  },
  popupItemBorderLight: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  popupItemBorderDark: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  popupItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  popupIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupIconCircleActive: {
    backgroundColor: '#0D9488',
  },
  popupItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  popupItemTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  timePickerCard: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    elevation: 8,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
  },
  timeBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 70,
  },
  lightTimeBox: {
    backgroundColor: '#F1F5F9',
  },
  darkTimeBox: {
    backgroundColor: '#1E293B',
  },
  timeDigitText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D9488',
  },
  timeBoxSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  timeColon: {
    fontSize: 28,
    fontWeight: '800',
  },
  amPmContainer: {
    marginLeft: 10,
    gap: 4,
  },
  amPmButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#94A3B8',
  },
  amPmActive: {
    backgroundColor: '#0D9488',
  },
  amPmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amPmTextActive: {
    color: '#FFFFFF',
  },
  pickerSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeBoxFocused: {
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  stepperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  lightStepperBtn: {
    backgroundColor: '#F1F5F9',
  },
  darkStepperBtn: {
    backgroundColor: '#1E293B',
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  lightNowBtn: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  darkNowBtn: {
    backgroundColor: 'rgba(13, 148, 136, 0.22)',
  },
  nowBtnText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  numBtn: {
    width: '14.5%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnWide: {
    width: '22%',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnActive: {
    backgroundColor: '#0D9488',
  },
  numBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  numBtnTextActive: {
    color: '#FFFFFF',
  },
  timePickerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  timeCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  timeCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  timeConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#0D9488',
  },
  timeConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
