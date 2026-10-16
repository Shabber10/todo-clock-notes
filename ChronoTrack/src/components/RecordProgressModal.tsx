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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { calculateProgress } from '../services/measurementService';
import * as db from '../database/db';

export const RecordProgressModal: React.FC = () => {
  const {
    selectedOccurrenceForProgress,
    setSelectedOccurrenceForProgress,
    settings,
    refreshData
  } = useApp();
  const isDark = settings.theme === 'dark';

  const task = selectedOccurrenceForProgress?.task;
  const actualData = selectedOccurrenceForProgress?.actualData || {};
  const progressPercentage = selectedOccurrenceForProgress?.progressPercentage || 0;

  // Local form state - declared unconditionally
  const [actualQuantity, setActualQuantity] = useState('0');
  const [actualMinutes, setActualMinutes] = useState('0');
  const [percentage, setPercentage] = useState('0');
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [rating, setRating] = useState(4);
  const [isDone, setIsDone] = useState(false);
  const [note, setNote] = useState('');

  // Live timer state for duration tasks
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when selected occurrence changes
  useEffect(() => {
    if (selectedOccurrenceForProgress) {
      const data = selectedOccurrenceForProgress.actualData || {};
      setActualQuantity(data.actual !== undefined ? String(data.actual) : '0');
      setActualMinutes(data.actualMinutes !== undefined ? String(data.actualMinutes) : '0');
      setPercentage(data.percentage !== undefined ? String(data.percentage) : String(selectedOccurrenceForProgress.progressPercentage || 0));
      setSubtasks(data.subtasks || selectedOccurrenceForProgress.task?.measurementConfig?.subtasks || []);
      setRating(data.rating || 4);
      setIsDone(data.completed || false);
      setNote('');
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setShowDeleteConfirm(false);
    }
  }, [selectedOccurrenceForProgress]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const addedMinutes = Math.round(timerSeconds / 60);
    const current = parseFloat(actualMinutes) || 0;
    setActualMinutes(String(current + addedMinutes));
    setTimerSeconds(0);
  };

  const toggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    setSubtasks(updated);
  };

  const handleSave = () => {
    if (!selectedOccurrenceForProgress || !task) return;
    let newActualData: any = {};

    if (task.measurementType === 'quantity') {
      newActualData = { actual: parseFloat(actualQuantity) || 0 };
    } else if (task.measurementType === 'duration') {
      newActualData = { actualMinutes: parseFloat(actualMinutes) || 0 };
    } else if (task.measurementType === 'percentage') {
      newActualData = { percentage: parseFloat(percentage) || 0 };
    } else if (task.measurementType === 'checklist') {
      newActualData = { subtasks };
    } else if (task.measurementType === 'rating') {
      newActualData = { rating, markCompleted: true };
    } else if (task.measurementType === 'binary') {
      newActualData = { completed: isDone };
    }

    const result = calculateProgress(task.measurementType, task.measurementConfig, newActualData);

    const status = result.isCompleted
      ? 'completed'
      : result.progressPercentage > 0
      ? 'in_progress'
      : 'upcoming';

    db.saveOccurrenceProgressInDb(
      selectedOccurrenceForProgress.id,
      result.progressPercentage,
      newActualData,
      result.normalizedDisplay,
      status
    );

    refreshData();
    setSelectedOccurrenceForProgress(null);
  };

  const executeDeleteTask = () => {
    if (!task) return;
    db.deleteTaskFromDb(task.id);
    refreshData();
    setSelectedOccurrenceForProgress(null);
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirm(true);
  };

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!selectedOccurrenceForProgress || !task) return null;

  return (
    <Modal
      visible={Boolean(selectedOccurrenceForProgress)}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setSelectedOccurrenceForProgress(null)}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, isDark ? styles.darkSheet : styles.lightSheet]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.title, isDark ? styles.darkText : styles.lightText]}>
                {task.title}
              </Text>
              <Text style={styles.subtitle}>
                {task.category?.name} • {selectedOccurrenceForProgress.scheduledStart} - {selectedOccurrenceForProgress.scheduledEnd}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                testID="btn-header-delete-task"
                accessibilityLabel="Delete Task"
                accessibilityRole="button"
                onPress={handleDeleteTask}
                style={styles.headerActionBtn}
              >
                <Ionicons name="trash-outline" size={21} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity 
                testID="btn-close-progress-modal"
                accessibilityLabel="Close Progress Modal"
                accessibilityRole="button"
                onPress={() => setSelectedOccurrenceForProgress(null)}
                style={styles.headerActionBtn}
              >
                <Ionicons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 14 }}>
            {/* 1. Quantity measurement UI */}
            {task.measurementType === 'quantity' && (
              <View style={styles.section}>
                <Text style={[styles.label, isDark ? styles.darkText : styles.lightText]}>
                  Target: {task.measurementConfig?.target} {task.measurementConfig?.unit}
                </Text>
                <Text style={styles.hint}>Enter your actual recorded quantity:</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="input-progress-quantity"
                    accessibilityLabel="Actual Recorded Quantity"
                    style={[styles.numericInput, isDark ? styles.darkInput : styles.lightInput]}
                    keyboardType="numeric"
                    value={actualQuantity}
                    onChangeText={setActualQuantity}
                  />
                  <Text style={[styles.unitText, isDark ? styles.darkText : styles.lightText]}>
                    {task.measurementConfig?.unit}
                  </Text>
                </View>
              </View>
            )}

            {/* 2. Duration measurement & Live Timer UI */}
            {task.measurementType === 'duration' && (
              <View style={styles.section}>
                <Text style={[styles.label, isDark ? styles.darkText : styles.lightText]}>
                  Planned: {task.measurementConfig?.plannedMinutes} minutes
                </Text>

                {/* Live stopwatch circle */}
                <View style={styles.timerCircle}>
                  <Text style={styles.timerDigits}>{formatTimerDisplay(timerSeconds)}</Text>
                  <Text style={styles.timerLabel}>Live Focus Session</Text>
                  <View style={styles.timerButtonsRow}>
                    <TouchableOpacity
                      testID="btn-progress-timer-toggle"
                      accessibilityLabel={isTimerRunning ? "Pause Live Timer" : "Start Live Timer"}
                      accessibilityRole="button"
                      onPress={() => setIsTimerRunning(!isTimerRunning)}
                      style={[styles.timerBtn, isTimerRunning ? styles.pauseBtn : styles.startBtn]}
                    >
                      <Ionicons name={isTimerRunning ? "pause" : "play"} size={18} color="#FFF" />
                      <Text style={styles.timerBtnText}>{isTimerRunning ? 'Pause' : 'Start'}</Text>
                    </TouchableOpacity>

                    {timerSeconds > 0 && (
                      <TouchableOpacity 
                        testID="btn-progress-timer-save"
                        accessibilityLabel="Save Recorded Timer Duration"
                        accessibilityRole="button"
                        onPress={handleStopTimer} 
                        style={[styles.timerBtn, styles.stopBtn]}
                      >
                        <Ionicons name="stop" size={18} color="#FFF" />
                        <Text style={styles.timerBtnText}>Save</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text style={[styles.hint, { marginTop: 12 }]}>Or enter total focused minutes manually:</Text>
                <TextInput
                  testID="input-progress-minutes"
                  accessibilityLabel="Actual Focused Minutes"
                  style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
                  keyboardType="numeric"
                  value={actualMinutes}
                  onChangeText={setActualMinutes}
                />
              </View>
            )}

            {/* 3. Checklist milestones UI */}
            {task.measurementType === 'checklist' && (
              <View style={styles.section}>
                <Text style={[styles.label, isDark ? styles.darkText : styles.lightText]}>
                  Milestones Completed:
                </Text>
                {subtasks.map((st: any, idx: number) => (
                  <TouchableOpacity
                    key={st.id || idx}
                    onPress={() => toggleSubtask(idx)}
                    style={[styles.subtaskRow, isDark ? styles.darkSubtask : styles.lightSubtask]}
                  >
                    <Ionicons
                      name={st.completed ? "checkbox" : "square-outline"}
                      size={22}
                      color={st.completed ? "#2563EB" : (isDark ? "#64748B" : "#94A3B8")}
                    />
                    <Text style={[
                      styles.subtaskTitle,
                      st.completed && styles.subtaskDone,
                      isDark ? styles.darkText : styles.lightText
                    ]}>
                      {st.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 4. Direct Percentage UI */}
            {task.measurementType === 'percentage' && (
              <View style={styles.section}>
                <Text style={[styles.label, isDark ? styles.darkText : styles.lightText]}>
                  Completion Percentage: {percentage}%
                </Text>
                <TextInput
                  style={[styles.input, isDark ? styles.darkInput : styles.lightInput]}
                  keyboardType="numeric"
                  value={percentage}
                  onChangeText={setPercentage}
                />
              </View>
            )}

            {/* 5. Rating UI */}
            {task.measurementType === 'rating' && (
              <View style={styles.section}>
                <Text style={[styles.label, isDark ? styles.darkText : styles.lightText]}>
                  Rate your effort & quality:
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={36}
                        color={star <= rating ? "#F59E0B" : "#94A3B8"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 6. Binary UI */}
            {task.measurementType === 'binary' && (
              <TouchableOpacity
                testID="btn-progress-binary-toggle"
                accessibilityLabel={isDone ? "Marked as Done (100%)" : "Mark as Complete"}
                accessibilityRole="button"
                accessibilityState={{ selected: isDone }}
                onPress={() => setIsDone(!isDone)}
                style={[styles.binaryCard, isDone ? styles.binaryDone : (isDark ? styles.darkCard : styles.lightCard)]}
              >
                <Ionicons
                  name={isDone ? "checkmark-circle" : "ellipse-outline"}
                  size={28}
                  color={isDone ? "#10B981" : "#64748B"}
                />
                <Text style={[styles.binaryText, isDone && { color: '#059669', fontWeight: '700' }]}>
                  {isDone ? 'Marked as Done (100%)' : 'Click to Mark Complete'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Progress Note */}
            <Text style={[styles.label, isDark ? styles.darkText : styles.lightText, { marginTop: 14 }]}>
              Progress Notes (optional)
            </Text>
            <TextInput
              testID="input-progress-note"
              accessibilityLabel="Progress Notes Input"
              style={[styles.input, isDark ? styles.darkInput : styles.lightInput, { height: 60 }]}
              placeholder="Add reflection, stats, or notes..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={note}
              onChangeText={setNote}
              multiline
            />

          </ScrollView>

          {/* Action Buttons: Delete and Save Progress pinned at bottom */}
          {showDeleteConfirm ? (
            <View style={[styles.confirmDeleteContainer, isDark ? styles.darkConfirmContainer : styles.lightConfirmContainer]}>
              <View style={styles.confirmHeader}>
                <Ionicons name="warning-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.confirmDeleteTitle, isDark ? styles.darkText : styles.lightText]}>
                  Delete Task?
                </Text>
              </View>
              <Text style={styles.confirmDeleteSubtitle}>
                This will delete "{task.title}" and its occurrences.
              </Text>
              <View style={styles.confirmButtonsRow}>
                <TouchableOpacity
                  testID="btn-cancel-delete"
                  accessibilityLabel="Cancel Deletion"
                  accessibilityRole="button"
                  onPress={() => setShowDeleteConfirm(false)}
                  style={[styles.cancelDeleteBtn, isDark ? styles.darkCancelBtn : styles.lightCancelBtn]}
                >
                  <Text style={[styles.cancelDeleteBtnText, isDark ? styles.darkText : styles.lightText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="btn-confirm-delete"
                  accessibilityLabel="Confirm Delete Task"
                  accessibilityRole="button"
                  onPress={executeDeleteTask}
                  style={styles.confirmDeleteBtn}
                >
                  <Ionicons name="trash" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.actionButtonsRow, isDark ? styles.darkActionButtonsRow : styles.lightActionButtonsRow]}>
              <TouchableOpacity
                testID="btn-delete-task"
                accessibilityLabel="Delete Task"
                accessibilityRole="button"
                onPress={handleDeleteTask}
                style={[styles.deleteBtn, isDark ? styles.darkDeleteBtn : styles.lightDeleteBtn]}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.deleteBtnText}>Delete Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                testID="btn-save-progress"
                accessibilityLabel="Save Progress Button"
                accessibilityRole="button"
                onPress={handleSave} 
                style={styles.saveBtn}
              >
                <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Progress</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    flex: 1,
    marginTop: 120,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
  },
  lightSheet: {
    backgroundColor: '#FFFFFF',
  },
  darkSheet: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numericInput: {
    width: 100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
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
  timerCircle: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  timerDigits: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563EB',
  },
  timerLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  startBtn: {
    backgroundColor: '#2563EB',
  },
  pauseBtn: {
    backgroundColor: '#D97706',
  },
  stopBtn: {
    backgroundColor: '#10B981',
  },
  timerBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
    gap: 10,
  },
  lightSubtask: {
    backgroundColor: '#F8FAFC',
  },
  darkSubtask: {
    backgroundColor: '#1E293B',
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtaskDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  binaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
  },
  lightCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  binaryDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  binaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 4,
    borderRadius: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
  },
  lightActionButtonsRow: {
    borderTopColor: '#F1F5F9',
  },
  darkActionButtonsRow: {
    borderTopColor: '#1E293B',
  },
  confirmDeleteContainer: {
    padding: 12,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  lightConfirmContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  darkConfirmContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#7F1D1D',
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  confirmDeleteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  confirmDeleteSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelDeleteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lightCancelBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  darkCancelBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cancelDeleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmDeleteBtn: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  lightDeleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  darkDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#7F1D1D',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
  },
  saveBtnText: {
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
});
