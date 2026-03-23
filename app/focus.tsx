import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { ProgressRing } from '@/components/ProgressRing';
import { Button } from '@/components/Button';
import { schedulePomodoroFinish, cancelPomodoroFinish } from '@/lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOCUS_TIME = 25 * 60; // 25 minutes
const STORAGE_KEY = 'pomodoro_end_time';

export default function FocusScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const task = useTaskStore(state => state.tasks.find(t => t.id === id));
  const toggleTask = useTaskStore(state => state.toggleTask);

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const appState = useRef(AppState.currentState);

  // Initialize and handle AppState changes
  useEffect(() => {
    const checkPersistedTime = async () => {
      const storedEndTime = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        const now = Date.now();
        const diff = Math.floor((endTime - now) / 1000);
        
        if (diff > 0) {
          setTimeLeft(diff);
          setIsActive(true);
        } else {
          // Timer finished while app was closed
          setTimeLeft(0);
          setIsActive(false);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    checkPersistedTime();

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        const storedEndTime = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedEndTime) {
          const endTime = parseInt(storedEndTime, 10);
          const now = Date.now();
          const diff = Math.floor((endTime - now) / 1000);
          
          if (diff > 0) {
            setTimeLeft(diff);
          } else {
            setTimeLeft(0);
            setIsActive(false);
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      AsyncStorage.removeItem(STORAGE_KEY);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.taskTitle}>Task not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const toggleTimer = async () => {
    const nextActive = !isActive;
    setIsActive(nextActive);

    if (nextActive) {
      const endTime = Date.now() + timeLeft * 1000;
      await AsyncStorage.setItem(STORAGE_KEY, endTime.toString());
      await schedulePomodoroFinish(task.title, timeLeft);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await cancelPomodoroFinish();
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    setTimeLeft(FOCUS_TIME);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await cancelPomodoroFinish();
  };

  const completeTask = () => {
    if (!task.completed) {
      toggleTask(task.id);
    }
    router.back();
  };

  // Timer Math
  const progress = 1 - (timeLeft / FOCUS_TIME);
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Feather name="x" size={32} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.focusingOn}>Focusing on</Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.notes && <Text style={styles.notes}>{task.notes}</Text>}

        <View style={styles.timerContainer}>
          <ProgressRing 
            progress={progress} 
            size={280} 
            strokeWidth={12} 
            color={colors.primary} 
            showText={false}
          />
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerText}>{minutes}:{seconds}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Button 
            title={isActive ? "Pause" : "Start"} 
            onPress={toggleTimer} 
            variant={isActive ? "outline" : "primary"}
            style={styles.controlBtn}
          />
          <Button 
            title="Reset" 
            onPress={resetTimer} 
            variant="secondary"
            style={styles.controlBtn}
          />
        </View>

        <Button 
          title={task.completed ? "Task Completed" : "Complete Task"} 
          onPress={completeTask} 
          style={[styles.completeBtn, task.completed && styles.completeBtnDisabled]}
          disabled={task.completed}
        />
      </View>
    </SafeAreaView>
  );
}

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: Theme.spacing.lg,
    alignSelf: 'flex-end',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  focusingOn: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  taskTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  notes: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  timerContainer: {
    marginVertical: Theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 72,
    color: colors.text,
  },
  controls: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  controlBtn: {
    flex: 1,
  },
  completeBtn: {
    width: '100%',
    backgroundColor: colors.success,
  },
  completeBtnDisabled: {
    backgroundColor: colors.border,
  }
});
