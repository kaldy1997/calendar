import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { timerService } from './timerService';
import { LocalNotifications } from '@capacitor/local-notifications';

vi.mock('@capacitor/local-notifications', () => {
  return {
    LocalNotifications: {
      createChannel: vi.fn(() => Promise.resolve()),
      registerActionTypes: vi.fn(() => Promise.resolve()),
      addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
      schedule: vi.fn(() => Promise.resolve()),
      cancel: vi.fn(() => Promise.resolve()),
      getPending: vi.fn(() => Promise.resolve({ notifications: [] }))
    }
  };
});

describe('TimerService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset private states if necessary (by re-initializing or clearing timers array)
    (timerService as any).activeTimers = [];
    (timerService as any).listeners = [];
    if ((timerService as any).intervalId) {
      clearInterval((timerService as any).intervalId);
      (timerService as any).intervalId = null;
    }
    (timerService as any).isInitialized = false;
  });

  afterEach(() => {
    if ((timerService as any).intervalId) {
      clearInterval((timerService as any).intervalId);
      (timerService as any).intervalId = null;
    }
  });

  it('initializes and loads from localStorage', async () => {
    const savedTimers = [
      {
        id: 't-1',
        configuredTimerId: 'preset-1',
        duration: 60,
        remainingSeconds: 60,
        isRunning: false,
        elapsedBefore: 0
      }
    ];
    localStorage.setItem('active_timers', JSON.stringify(savedTimers));

    await timerService.init();

    expect(timerService.getActiveTimers()).toHaveLength(1);
    expect(timerService.getActiveTimers()[0].id).toBe('t-1');
  });

  it('starts a new active timer and notifies subscribers', async () => {
    await timerService.init();

    const listener = vi.fn();
    timerService.subscribe(listener);

    timerService.startTimer({
      id: 'preset-1',
      duration: 120,
      label: 'Test Timer'
    });

    expect(timerService.getActiveTimers()).toHaveLength(1);
    expect(timerService.getActiveTimers()[0].duration).toBe(120);
    expect(timerService.getActiveTimers()[0].isRunning).toBe(true);

    expect(listener).toHaveBeenCalled();
    expect(LocalNotifications.schedule).toHaveBeenCalled();
  });

  it('pauses and resumes a timer correctly', async () => {
    await timerService.init();

    timerService.startTimer({
      id: 'preset-1',
      duration: 100
    });

    const timer = timerService.getActiveTimers()[0];
    timerService.pauseTimer(timer.id);

    expect(timerService.getActiveTimers()[0].isRunning).toBe(false);
    expect(timerService.getActiveTimers()[0].startTime).toBeUndefined();

    timerService.resumeTimer(timer.id);
    expect(timerService.getActiveTimers()[0].isRunning).toBe(true);
    expect(timerService.getActiveTimers()[0].startTime).toBeDefined();
  });

  it('cancels a timer correctly', async () => {
    await timerService.init();

    timerService.startTimer({
      id: 'preset-1',
      duration: 100
    });

    const timer = timerService.getActiveTimers()[0];
    timerService.cancelTimer(timer.id);

    expect(timerService.getActiveTimers()).toHaveLength(0);
    expect(LocalNotifications.cancel).toHaveBeenCalledWith({
      notifications: [{ id: 99999 }]
    });
  });

  it('ticks active timers and triggers alarm when remaining seconds hit 0', async () => {
    await timerService.init();

    // Set mock date now
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    timerService.startTimer({
      id: 'preset-1',
      duration: 5
    });

    // Advance time by 5 seconds
    vi.setSystemTime(now + 5000);
    // Directly invoke private tick method to simulate interval tick
    (timerService as any).tick();

    expect(timerService.getActiveTimers()[0].remainingSeconds).toBe(0);
    expect(timerService.getActiveTimers()[0].isRunning).toBe(false);

    // Verify loud alarm was scheduled
    expect(LocalNotifications.schedule).toHaveBeenCalledWith(
      expect.objectContaining({
        notifications: expect.arrayContaining([
          expect.objectContaining({
            channelId: 'loud-alarm-channel',
            sound: 'alarm.mp3'
          })
        ])
      })
    );

    vi.useRealTimers();
  });
});
