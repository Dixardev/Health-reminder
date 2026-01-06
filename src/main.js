import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import { requestPermission } from '@tauri-apps/plugin-notification';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const ICONS = {
  sit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v6l4 2"></path></svg>`,
  water: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0L12 2.69z"></path></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  work: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  reset: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  volume: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
};

const DEFAULT_TASKS = [
  { id: 'sit', title: '久坐提醒', desc: '该起来活动了，走动一下吧~', interval: 45, enabled: true, icon: 'sit', lockDuration: 60, lockMode: 'normal', leadSec: 30, delayOnceEnabled: true, delayOnceSec: 300, autoResetOnIdle: true },
  { id: 'water', title: '喝水提醒', desc: '该喝口水了，保持水分充足~', interval: 60, enabled: true, icon: 'water', lockDuration: 60, lockMode: 'off', leadSec: 0, delayOnceEnabled: false, delayOnceSec: 0, autoResetOnIdle: true },
  { id: 'eye', title: '护眼提醒', desc: '让眼睛休息一下，看看远处~', interval: 20, enabled: true, icon: 'eye', lockDuration: 60, lockMode: 'normal', leadSec: 10, delayOnceEnabled: true, delayOnceSec: 120, autoResetOnIdle: true }
];

let settings = {
  tasks: [...DEFAULT_TASKS],
  soundEnabled: true,
  autoStart: false,
  lockScreenEnabled: false,
  lockDuration: 20,
  lockEndRequireConfirm: false,
  scheduleMode: 'independent', // independent | synced
  syncedPair: { breakTaskId: 'sit', microTaskId: 'eye', ratioK: 3 },
  conflictPolicy: 'priority', // priority | merge | defer
  idleThreshold: 300,  // 空闲阈值，秒，默认 5 分钟
};

let countdowns = {};  // 现在由后端事件更新
let stats = {
  sitBreaks: 0,
  waterCups: 0,
  workMinutes: 0,
};
let isPaused = false;
let isIdle = false;  // 当前是否处于空闲状态
let workStartTime = Date.now();
let activePopup = null;
let lockScreenState = {
  active: false,
  remaining: 0,
  task: null,
  unlockProgress: 0,
  unlockTimer: null,
  waitingConfirm: false,
};

let updateInfo = null;
let isUpdating = false;
let isCheckingUpdate = false;
let updateMessage = null;

// 同步任务配置到后端
async function syncTasksToBackend() {
  const getTaskPriority = (taskId) => {
    if (taskId === 'sit') return 300;
    if (taskId === 'eye') return 200;
    if (taskId === 'water') return 100;
    return 0;
  };

  const tasksForBackend = settings.tasks.map(t => ({
    id: t.id,
    title: t.title,
    desc: t.desc,
    interval: t.interval,
    enabled: t.enabled,
    icon: t.icon,
    auto_reset_on_idle: t.autoResetOnIdle || false,
    lead_sec: t.leadSec || 0,
    delay_once_enabled: t.delayOnceEnabled || false,
    delay_once_sec: t.delayOnceSec || 0,
    priority: getTaskPriority(t.id),
  }));
  await invoke('sync_tasks', { tasks: tasksForBackend }).catch(console.error);
}

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'lock_slave') {
    const task = {
      title: urlParams.get('title') || '休息时间',
      desc: urlParams.get('desc') || '让眼睛休息一下',
      icon: urlParams.get('icon') || 'eye',
      id: 'slave_lock'
    };
    const duration = parseInt(urlParams.get('duration') || '10');

    settings.lockDuration = duration;

    lockScreenState = {
      active: true,
      remaining: duration,
      task: task,
      unlockProgress: 0,
      unlockTimer: null,
      waitingConfirm: false,
    };

    renderFullUI();

    // 隐藏从属屏幕的解锁按钮
    setTimeout(() => {
      const btn = document.querySelector('.unlock-btn');
      if (btn) btn.style.display = 'none';
    }, 0);

    const lockInterval = setInterval(() => {
      lockScreenState.remaining--;
      updateLockScreenTimer();
      if (lockScreenState.remaining <= 0) {
        clearInterval(lockInterval);
      }
    }, 1000);

    return;
  }

  if (urlParams.get('mode') === 'prewarn') {
    const prewarn = {
      id: urlParams.get('id') || '',
      title: urlParams.get('title') || '即将开始',
      desc: urlParams.get('desc') || '',
      icon: urlParams.get('icon') || 'bell',
      remaining: parseInt(urlParams.get('remaining') || '0'),
      leadSec: parseInt(urlParams.get('lead_sec') || '0'),
      canDelay: urlParams.get('can_delay') === '1' || urlParams.get('can_delay') === 'true',
      delaySec: parseInt(urlParams.get('delay_sec') || '0'),
    };
    renderPrewarnUI(prewarn);
    return;
  }
 
  await loadSettings();

  try {
    settings.autoStart = await isEnabled();
  } catch (e) {
    console.error('Failed to check autostart status', e);
  }

  try {
    await requestPermission();
  } catch (e) {
    console.error('Failed to request notification permission', e);
  }

  if (settings.scheduleMode === 'synced') {
    applySyncedAlignment(settings.syncedPair?.breakTaskId);
    saveSettings();
  }

  // 初始化 countdowns 对象用于 UI 显示
  settings.tasks.forEach(task => {
    if (countdowns[task.id] === undefined) {
      countdowns[task.id] = task.interval * 60;
    }
  });

  // 同步任务到后端定时器
  await syncTasksToBackend();

  // 同步空闲阈值到后端
  await invoke('set_idle_threshold', { seconds: settings.idleThreshold }).catch(console.error);

  // 同步冲突处理策略到后端
  await invoke('timer_set_conflict_policy', { policy: settings.conflictPolicy }).catch(console.error);

  renderFullUI();

  // 监听后端倒计时更新事件
  listen('countdown-update', (event) => {
    const updates = event.payload;
    updates.forEach(info => {
      countdowns[info.id] = info.remaining;
    });
    updateLiveValues();
  });

  // 监听后端任务触发事件
  listen('task-triggered', async (event) => {
    const task = event.payload;
    // 找到完整的任务配置
    const fullTask = settings.tasks.find(t => t.id === task.id) || task;
    await triggerNotification(fullTask);
  });

  // 监听后端预告事件（到点前 lead_sec 秒）
  listen('task-lead', async (event) => {
    const lead = event.payload;
    // 只对仍存在的任务弹窗（避免旧配置残留）
    const exists = settings.tasks.some(t => t.id === lead.id);
    if (!exists) return;
    await openPrewarnWindow(lead);
  });

  // 监听空闲状态变化
  listen('idle-status-changed', (event) => {
    const status = event.payload;
    isIdle = status.is_idle;
    updateLiveValues();
  });

  listen('show-window', () => {
    invoke('show_main_window');
  });

  listen('reset-all-tasks', () => {
    resetAll();
  });

  listen('toggle-pause', () => {
    togglePause();
  });

  listen('system-locked', () => {
    invoke('timer_set_system_locked', { locked: true }).catch(console.error);
  });

  listen('system-unlocked', () => {
    invoke('timer_set_system_locked', { locked: false }).catch(console.error);
  });

  // 每秒更新工作时间统计（这个保留在前端）
  setInterval(() => {
    stats.workMinutes = Math.floor((Date.now() - workStartTime) / 60000);
  }, 1000);

  checkForUpdates();
}

async function checkForUpdates(manual = false) {
  if (manual) {
    isCheckingUpdate = true;
    updateMessage = null;
    renderFullUI();
  }

  try {
    const update = await check();
    if (update) {
      updateInfo = {
        version: update.version,
        body: update.body,
        update: update
      };
      updateMessage = null;
      renderFullUI();
    } else if (manual) {
      // 手动检查且没有更新时显示提示
      updateMessage = { type: 'success', text: '已是最新版本！' };
      renderFullUI();
      setTimeout(() => {
        updateMessage = null;
        renderFullUI();
      }, 3000);
    }
  } catch (e) {
    console.error('Update check failed:', e);
    if (manual) {
      const errorMsg = e?.response?.data || e?.message || '网络错误，请稍后重试';
      updateMessage = { type: 'error', text: '检查更新失败：' + errorMsg };
      renderFullUI();
      setTimeout(() => {
        updateMessage = null;
        renderFullUI();
      }, 3000);
    }
  } finally {
    if (manual) {
      isCheckingUpdate = false;
      renderFullUI();
    }
  }
}

async function performUpdate() {
  if (!updateInfo || isUpdating) return;
  
  isUpdating = true;
  renderFullUI();
  
  try {
    await updateInfo.update.downloadAndInstall();
    await relaunch();
  } catch (e) {
    console.error('Update failed:', e);
    isUpdating = false;
    renderFullUI();
  }
}

async function loadSettings() {
  try {
    const saved = await invoke('load_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...settings, ...parsed };
    }
  } catch (e) {
    console.log('Using default settings');
  }

  // 兼容旧版本配置：补齐任务字段默认值
  if (!Array.isArray(settings.tasks)) {
    settings.tasks = [...DEFAULT_TASKS];
  } else {
    settings.tasks = settings.tasks.map((task) => {
      const defaults = DEFAULT_TASKS.find(d => d.id === task.id) || {};
      return {
        ...defaults,
        ...task,
        lockMode: task.lockMode ?? defaults.lockMode ?? 'off',
        leadSec: task.leadSec ?? defaults.leadSec ?? 0,
        delayOnceEnabled: task.delayOnceEnabled ?? defaults.delayOnceEnabled ?? false,
        delayOnceSec: task.delayOnceSec ?? defaults.delayOnceSec ?? 0,
        lockDuration: task.lockDuration ?? defaults.lockDuration ?? 0,
        autoResetOnIdle: task.autoResetOnIdle ?? defaults.autoResetOnIdle ?? false,
      };
    });
  }
  
  const savedStats = localStorage.getItem('reminder_stats');
  if (savedStats) {
    const parsed = JSON.parse(savedStats);
    if (parsed.date === new Date().toDateString()) {
      stats = parsed.stats;
    }
  }
}

async function saveSettings() {
  await invoke('save_settings', { settings: JSON.stringify(settings) });
}

function saveStats() {
  localStorage.setItem('reminder_stats', JSON.stringify({
    date: new Date().toDateString(),
    stats: stats,
  }));
}

// tick 函数已移至 Rust 后端，不再需要前端定时器

async function openPrewarnWindow(lead) {
  const label = `prewarn-${lead.id}`;

  try {
    const existing = await WebviewWindow.getByLabel(label);
    if (existing) {
      await existing.setFocus();
      return;
    }
  } catch (_) {
    // ignore
  }

  const params = new URLSearchParams({
    mode: 'prewarn',
    id: lead.id,
    title: lead.title,
    desc: lead.desc,
    icon: lead.icon,
    remaining: String(lead.remaining ?? 0),
    lead_sec: String(lead.lead_sec ?? 0),
    can_delay: lead.can_delay ? '1' : '0',
    delay_sec: String(lead.delay_sec ?? 0),
  });

  const url = `index.html?${params.toString()}`;

  const win = new WebviewWindow(label, {
    url,
    title: '即将开始',
    width: 360,
    height: 200,
    resizable: false,
    decorations: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
  });

  win.once('tauri://error', (e) => {
    console.error('Failed to create prewarn window', e);
  });
}

async function triggerNotification(task) {
  if (settings.soundEnabled) {
    invoke('play_notification_sound').catch(() => {});
  }
  invoke('show_notification', { title: task.title, body: task.desc }).catch(console.error);

  const lockDuration = task.lockDuration ?? settings.lockDuration;
  const lockMode = task.lockMode || 'off';
  const shouldLock = settings.lockScreenEnabled && lockMode !== 'off' && lockDuration > 0;

  if (shouldLock) {
    await startLockScreen(task);
  } else {
    activePopup = { ...task };
    renderFullUI();
  }
}

async function startLockScreen(task) {
  // 通知后端锁屏模式激活
  invoke('timer_set_lock_screen_active', { active: true }).catch(console.error);

  // 使用任务级别的锁屏时长，如果没有则使用全局设置
  const lockDuration = task.lockDuration ?? settings.lockDuration;
  const lockMode = task.lockMode || 'normal';

  lockScreenState = {
    active: true,
    remaining: lockDuration,
    task: { ...task },
    unlockProgress: 0,
    unlockTimer: null,
    waitingConfirm: false,
  };

  try {
    await invoke('show_main_window');
    await invoke('enter_lock_mode', {
      task: {
        title: task.title,
        desc: task.desc,
        duration: lockDuration,
        icon: task.icon,
        lock_mode: lockMode,
      }
    });
  } catch (e) {
    console.error('Failed to enter lock mode', e);
  }

  renderFullUI();

  const lockInterval = setInterval(() => {
    if (!lockScreenState.active) {
      clearInterval(lockInterval);
      return;
    }

    lockScreenState.remaining--;
    updateLockScreenTimer();

    if (lockScreenState.remaining <= 0) {
      clearInterval(lockInterval);
      if (settings.lockEndRequireConfirm) {
        showLockConfirm();
      } else {
        endLockScreen().catch(console.error);
      }
    }
  }, 1000);
}

function showLockConfirm() {
  lockScreenState.waitingConfirm = true;
  renderFullUI();
}

async function endLockScreen() {
  lockScreenState.active = false;
  lockScreenState.waitingConfirm = false;

  // 通知后端锁屏模式结束
  invoke('timer_set_lock_screen_active', { active: false }).catch(console.error);

  const id = lockScreenState.task?.id;
  if (id === 'sit') stats.sitBreaks++;
  if (id === 'water') stats.waterCups++;
  saveStats();

  try {
    await invoke('exit_lock_mode');
    await invoke('hide_main_window');
  } catch (e) {
    console.error('Failed to exit lock mode', e);
  }

  renderFullUI();
}

function updateLockScreenTimer() {
  const secondsEl = document.querySelector('.lock-seconds');
  const unitEl = document.querySelector('.lock-unit');
  const progressEl = document.querySelector('.lock-timer-ring .progress');

  if (secondsEl) {
    const remaining = lockScreenState.remaining;
    if (remaining >= 60) {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      secondsEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
      if (unitEl) unitEl.textContent = '分钟';
    } else {
      secondsEl.textContent = remaining;
      if (unitEl) unitEl.textContent = '秒';
    }
  }

  if (progressEl) {
    // 使用任务级别的锁屏时长，如果没有则使用全局设置
    const total = lockScreenState.task?.lockDuration || settings.lockDuration;
    const offset = 565 * (1 - lockScreenState.remaining / total);
    progressEl.style.strokeDashoffset = offset;
  }
}

function getUnlockHoldSeconds() {
  return lockScreenState.task?.lockMode === 'strict' ? 5 : 3;
}

function startUnlockPress() {
  if (lockScreenState.unlockTimer) return;
  
  lockScreenState.unlockProgress = 0;
  const btn = document.querySelector('.unlock-btn');
  const progressBar = document.querySelector('.unlock-progress');
  
  if (btn) btn.classList.add('pressing');
  
  const totalSteps = getUnlockHoldSeconds() * 10; // 100ms per step
  lockScreenState.unlockTimer = setInterval(() => {
    lockScreenState.unlockProgress += 100 / totalSteps;
    
    if (progressBar) {
      progressBar.style.width = `${lockScreenState.unlockProgress}%`;
    }
    
    if (lockScreenState.unlockProgress >= 100) {
      cancelUnlockPress();
      endLockScreen();
    }
  }, 100);
}

function cancelUnlockPress() {
  if (lockScreenState.unlockTimer) {
    clearInterval(lockScreenState.unlockTimer);
    lockScreenState.unlockTimer = null;
  }
  
  lockScreenState.unlockProgress = 0;
  
  const btn = document.querySelector('.unlock-btn');
  const progressBar = document.querySelector('.unlock-progress');
  
  if (btn) btn.classList.remove('pressing');
  if (progressBar) progressBar.style.width = '0';
}

function dismissNotification() {
  if (!activePopup) return;
  
  // 点击“我知道了”仅记录统计数据，不再负责计时重置（重置已在触发时提前完成）
  const id = activePopup.id;
  if (id === 'sit') stats.sitBreaks++;
  if (id === 'water') stats.waterCups++;
  
  activePopup = null;
  saveStats();
  renderFullUI();
}

function addTask() {
  const id = 'task_' + Date.now();
  settings.tasks.push({
    id: id, title: '新提醒', desc: '又是充满活力的一天，记得休息哦~',
    interval: 30, enabled: true, icon: 'bell',
    lockDuration: 0, lockMode: 'off', leadSec: 0, delayOnceEnabled: false, delayOnceSec: 0,
    autoResetOnIdle: true
  });
  countdowns[id] = 30 * 60;
  saveSettings();
  syncTasksToBackend();
  renderFullUI();
}

function removeTask(id) {
  settings.tasks = settings.tasks.filter(t => t.id !== id);
  delete countdowns[id];
  saveSettings();
  syncTasksToBackend();
  renderFullUI();
}

function applySyncedAlignment(changedTaskId) {
  if (settings.scheduleMode !== 'synced') return;

  const { breakTaskId, microTaskId, ratioK } = settings.syncedPair || {};
  const k = Math.max(1, parseInt(ratioK || 1));
  if (!breakTaskId || !microTaskId || k <= 1) return;

  const breakTask = settings.tasks.find(t => t.id === breakTaskId);
  const microTask = settings.tasks.find(t => t.id === microTaskId);
  if (!breakTask || !microTask) return;

  if (changedTaskId === microTaskId) {
    microTask.interval = Math.max(1, parseInt(microTask.interval) || 1);
    breakTask.interval = microTask.interval * k;
  } else {
    breakTask.interval = Math.max(1, parseInt(breakTask.interval) || 1);
    const alignedMicro = Math.max(1, Math.round(breakTask.interval / k));
    microTask.interval = alignedMicro;
    breakTask.interval = alignedMicro * k;
  }

  countdowns[breakTaskId] = breakTask.interval * 60;
  countdowns[microTaskId] = microTask.interval * 60;
}

function applyOfficePreset() {
  const sit = settings.tasks.find(t => t.id === 'sit');
  const water = settings.tasks.find(t => t.id === 'water');
  const eye = settings.tasks.find(t => t.id === 'eye');

  if (sit) {
    Object.assign(sit, {
      interval: 60,
      lockDuration: 300,
      lockMode: 'normal',
      leadSec: 30,
      delayOnceEnabled: true,
      delayOnceSec: 300,
      autoResetOnIdle: true,
    });
    countdowns[sit.id] = sit.interval * 60;
  }

  if (water) {
    Object.assign(water, {
      interval: 60,
      lockDuration: 0,
      lockMode: 'off',
      leadSec: 0,
      delayOnceEnabled: false,
      delayOnceSec: 0,
      autoResetOnIdle: false,
    });
    countdowns[water.id] = water.interval * 60;
  }

  if (eye) {
    Object.assign(eye, {
      interval: 20,
      lockDuration: 20,
      lockMode: 'normal',
      leadSec: 10,
      delayOnceEnabled: true,
      delayOnceSec: 120,
      autoResetOnIdle: true,
    });
    countdowns[eye.id] = eye.interval * 60;
  }

  settings.lockScreenEnabled = true;
  settings.lockEndRequireConfirm = false;
  settings.scheduleMode = 'synced';
  settings.syncedPair = { breakTaskId: 'sit', microTaskId: 'eye', ratioK: 3 };
  settings.conflictPolicy = 'priority';

  saveSettings();
  syncTasksToBackend();
  invoke('timer_set_conflict_policy', { policy: settings.conflictPolicy }).catch(console.error);
  invoke('set_idle_threshold', { seconds: settings.idleThreshold }).catch(console.error);
  renderFullUI();
}

function updateTask(id, updates) {
  const task = settings.tasks.find(t => t.id === id);
  if (task) {
    Object.assign(task, updates);
    if (updates.interval !== undefined) {
      applySyncedAlignment(id);
      countdowns[id] = task.interval * 60;
      if (settings.scheduleMode === 'synced') {
        const { breakTaskId, microTaskId } = settings.syncedPair || {};
        [breakTaskId, microTaskId].filter(Boolean).forEach((tid) => {
          const t = settings.tasks.find(x => x.id === tid);
          const input = document.querySelector(`.interval-input[data-id="${tid}"]`);
          if (t && input) input.value = t.interval;
        });
      }
    }
    saveSettings();
    // 同步到后端
    syncTasksToBackend();
  }
}

function togglePause() {
  isPaused = !isPaused;
  // 通知后端暂停/恢复
  if (isPaused) {
    invoke('timer_pause').catch(console.error);
  } else {
    invoke('timer_resume').catch(console.error);
  }
  invoke('update_pause_menu', { paused: isPaused }).catch(() => {});
  renderFullUI();
}

function resetAll() {
  // 通知后端重置所有任务
  invoke('timer_reset_all').catch(console.error);
  settings.tasks.forEach(task => {
    countdowns[task.id] = task.interval * 60;
  });
  isPaused = false;
  invoke('timer_resume').catch(console.error);
  renderFullUI();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatLockTime(seconds) {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { time: `${mins}:${String(secs).padStart(2, '0')}`, unit: '分钟' };
  }
  return { time: seconds, unit: '秒' };
}

function updateTrayTooltip() {
  let lines = ['健康提醒助手'];
  if (isPaused) {
    lines.push('(已暂停)');
  } else {
    settings.tasks.forEach(t => {
      if (t.enabled) {
        lines.push(`${t.title}：${formatTime(countdowns[t.id])}`);
      }
    });
  }
  invoke('update_tray_tooltip', { tooltip: lines.join('\n') }).catch(() => {});
}

function renderPrewarnUI(prewarn) {
  const app = document.getElementById('app');
  const delayLabel = prewarn.delaySec >= 60
    ? `${Math.round(prewarn.delaySec / 60)} 分钟`
    : `${prewarn.delaySec} 秒`;

  app.innerHTML = `
    <div class="prewarn-container">
      <div class="prewarn-header">
        <div class="prewarn-icon">${ICONS[prewarn.icon] || ICONS.bell}</div>
        <div class="prewarn-title">${prewarn.title}</div>
      </div>
      <div class="prewarn-desc">${prewarn.desc}</div>
      <div class="prewarn-countdown">
        <span id="prewarnRemaining">${Math.max(0, prewarn.remaining || 0)}</span> 秒后开始
      </div>
      <div class="prewarn-actions">
        <button class="btn btn-primary" id="prewarnStartBtn">开始</button>
        ${prewarn.canDelay ? `<button class="btn btn-secondary" id="prewarnDelayBtn">延迟一次（${delayLabel}）</button>` : ''}
      </div>
    </div>
  `;

  const currentWindow = WebviewWindow.getCurrent();
  let remaining = Math.max(0, Number(prewarn.remaining) || 0);

  const closeSelf = async () => {
    try {
      await currentWindow.close();
    } catch (_) {
      // ignore
    }
  };

  const updateRemaining = () => {
    const el = document.getElementById('prewarnRemaining');
    if (el) el.textContent = String(remaining);
  };

  const timer = setInterval(() => {
    remaining -= 1;
    updateRemaining();
    if (remaining <= 0) {
      clearInterval(timer);
      closeSelf();
    }
  }, 1000);

  document.getElementById('prewarnStartBtn')?.addEventListener('click', async () => {
    clearInterval(timer);
    try {
      await invoke('timer_trigger_task_now', { taskId: prewarn.id });
    } catch (e) {
      console.error('Failed to trigger task now', e);
    } finally {
      await closeSelf();
    }
  });

  document.getElementById('prewarnDelayBtn')?.addEventListener('click', async () => {
    clearInterval(timer);
    try {
      await invoke('timer_delay_once', { taskId: prewarn.id });
    } catch (e) {
      console.error('Failed to delay task once', e);
    } finally {
      await closeSelf();
    }
  });
}

function updateLiveValues() {
  const statsElements = document.querySelectorAll('.status-item .value');
  if (statsElements[0]) statsElements[0].innerText = stats.sitBreaks;
  if (statsElements[1]) statsElements[1].innerText = stats.waterCups;
  if (statsElements[2]) statsElements[2].innerText = stats.workMinutes;

  let nextTask = null;
  let minTime = Infinity;
  settings.tasks.forEach(t => {
    if (t.enabled && countdowns[t.id] < minTime) {
      minTime = countdowns[t.id];
      nextTask = t;
    }
  });

  const timerText = document.querySelector('.time-text');
  if (timerText) {
    const timeStr = nextTask ? formatTime(countdowns[nextTask.id]) : '--:--';
    timerText.querySelector('.minutes').innerText = timeStr.split(':')[0];
    timerText.querySelector('.seconds').innerText = ':' + timeStr.split(':')[1];
  }

  const timerLabel = document.querySelector('.timer-label');
  if (timerLabel) {
    let statusText = nextTask ? nextTask.title : '无活动任务';
    if (isPaused) {
      statusText += ' (已暂停)';
    } else if (isIdle) {
      statusText += ' (空闲中)';
    }
    timerLabel.innerText = statusText;
  }

  const mainRing = document.querySelector('.timer-ring .progress');
  if (mainRing && nextTask) {
    const total = nextTask.interval * 60;
    const offset = 502 * (1 - countdowns[nextTask.id] / total);
    mainRing.style.strokeDashoffset = offset;
  }

  settings.tasks.forEach(task => {
    const card = document.querySelector(`.reminder-card[data-id="${task.id}"]`);
    if (card) {
      const current = countdowns[task.id] || 0;
      const total = task.interval * 60;
      const offset = 126 * (1 - current / total);
      card.querySelector('.progress-mini .progress').style.strokeDashoffset = offset;
      const timeDisplay = card.querySelector('.time-remaining');
      if (timeDisplay) timeDisplay.innerText = `(${formatTime(current)})`;
    }
  });

  updateTrayTooltip();
}

function renderFullUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="header">
      <h1>健康提醒助手</h1>
      <p>关爱健康，从每一次提醒开始</p>
    </div>

    <div class="status-bar">
      <div class="status-item"><div class="icon">${ICONS.sit}</div><div class="value">${stats.sitBreaks}</div><div class="label">休息次数</div></div>
      <div class="status-item"><div class="icon">${ICONS.water}</div><div class="value">${stats.waterCups}</div><div class="label">喝水次数</div></div>
      <div class="status-item"><div class="icon">${ICONS.work}</div><div class="value">${stats.workMinutes}</div><div class="label">工作分钟</div></div>
    </div>

    <div class="timer-display">
      <div class="timer-ring">
        <svg width="180" height="180" viewBox="0 0 180 180"><circle class="bg" cx="90" cy="90" r="80" /><circle class="progress" cx="90" cy="90" r="80" stroke-dasharray="502" stroke-dashoffset="502" /></svg>
        <div class="time-text"><div class="minutes">00</div><div class="seconds">:00</div></div>
      </div>
      <div class="timer-label">正在加载...</div>
    </div>

    <div class="reminder-cards">
      ${settings.tasks.map(task => `
        <div class="reminder-card" data-id="${task.id}">
          <div class="card-main">
            <div class="progress-mini" style="cursor:pointer;" title="点击重置" data-reset-id="${task.id}">
              <svg width="44" height="44" viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="20" /><circle class="progress" cx="22" cy="22" r="20" stroke-dasharray="126" stroke-dashoffset="126" /></svg>
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--primary); pointer-events:none;">${ICONS[task.icon] || ICONS.bell}</div>
            </div>
            <div class="info">
              <div class="title" contenteditable="true" data-id="${task.id}">${task.title}</div>
              <div class="time-info">
                <input type="number" class="interval-input" value="${task.interval}" data-id="${task.id}" min="1" max="1440">
                <span class="time-unit">分钟</span>
                <span class="time-remaining"></span>
              </div>
            </div>
            <div class="card-actions">
              <div class="toggle ${task.enabled ? 'active' : ''}" data-toggle-id="${task.id}"></div>
              ${!['sit', 'water', 'eye'].includes(task.id) ? `<div class="remove-btn" data-id="${task.id}">${ICONS.trash}</div>` : ''}
            </div>
          </div>
          <div class="card-footer">
            <label class="footer-option" title="用户无操作超过阈值时自动重置">
              <input type="checkbox" class="idle-reset-input" data-id="${task.id}" ${task.autoResetOnIdle ? 'checked' : ''}>
              <span class="checkbox-custom"></span>
              <span>空闲重置</span>
            </label>
            <div class="footer-option">
              <span>锁屏</span>
              <select class="lock-mode-select" data-id="${task.id}" ${settings.lockScreenEnabled ? '' : 'disabled'}>
                <option value="off" ${task.lockMode === 'off' ? 'selected' : ''}>关闭</option>
                <option value="normal" ${task.lockMode === 'normal' ? 'selected' : ''}>普通</option>
                <option value="strict" ${task.lockMode === 'strict' ? 'selected' : ''}>严格</option>
              </select>
            </div>
            <div class="footer-option">
              <span>锁屏时长</span>
              <input type="number" class="lock-input" value="${task.lockDuration ?? settings.lockDuration}" data-id="${task.id}" min="0" max="3600" ${(!settings.lockScreenEnabled || task.lockMode === 'off') ? 'disabled' : ''}>
              <span>秒</span>
            </div>
            <div class="footer-option">
              <span>预告</span>
              <input type="number" class="lead-input" value="${task.leadSec ?? 0}" data-id="${task.id}" min="0" max="3600">
              <span>秒</span>
            </div>
            <label class="footer-option" title="每轮仅允许一次">
              <input type="checkbox" class="delay-once-input" data-id="${task.id}" ${task.delayOnceEnabled ? 'checked' : ''}>
              <span class="checkbox-custom"></span>
              <span>延迟一次</span>
            </label>
            <div class="footer-option">
              <span>时长</span>
              <input type="number" class="delay-input" value="${task.delayOnceSec ?? 0}" data-id="${task.id}" min="0" max="3600" ${task.delayOnceEnabled ? '' : 'disabled'}>
              <span>秒</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="add-task-btn" id="addTaskBtn">${ICONS.plus} 添加自定义提醒</button>

    <div class="quick-actions">
      <button class="btn btn-primary" id="pauseBtn">${isPaused ? ICONS.play : ICONS.pause} ${isPaused ? '继续' : '暂停'}</button>
      <button class="btn btn-secondary" id="resetBtn">${ICONS.reset} 全部重置</button>
    </div>

    <div class="settings-section">
      <h3>系统设置</h3>
      <div class="setting-row">
        <div class="setting-info">
          <label>强制休息锁屏</label>
          <span class="setting-desc">提醒时锁定屏幕，确保真正休息</span>
        </div>
        <div class="toggle ${settings.lockScreenEnabled ? 'active' : ''}" id="lockToggle"></div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>锁屏结束手动确认</label>
          <span class="setting-desc">开启后倒计时结束需点击确认；关闭则自动结束</span>
        </div>
        <div class="toggle ${settings.lockEndRequireConfirm ? 'active' : ''}" id="lockConfirmToggle"></div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>联动模式（护眼×久坐）</label>
          <span class="setting-desc">按整数倍对齐，减少重叠/接连提醒</span>
        </div>
        <div class="toggle ${settings.scheduleMode === 'synced' ? 'active' : ''}" id="syncedToggle"></div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>冲突处理</label>
          <span class="setting-desc">多个任务同一时刻到点时</span>
        </div>
        <select class="setting-select" id="conflictPolicySelect">
          <option value="priority" ${settings.conflictPolicy === 'priority' ? 'selected' : ''}>仅触发优先级最高</option>
          <option value="merge" ${settings.conflictPolicy === 'merge' ? 'selected' : ''}>合并提示</option>
          <option value="defer" ${settings.conflictPolicy === 'defer' ? 'selected' : ''}>顺延补一次</option>
        </select>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>办公科学默认</label>
          <span class="setting-desc">一键应用推荐参数</span>
        </div>
        <button class="preset-btn" id="officePresetBtn">应用</button>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>空闲检测阈值</label>
          <span class="setting-desc">超过此时间无操作视为空闲${isIdle ? ' (当前空闲中)' : ''}</span>
        </div>
        <div class="idle-threshold-input-group">
          <input type="number" class="idle-threshold-input" id="idleThresholdInput" value="${Math.floor(settings.idleThreshold / 60)}" min="1" max="60">
          <span class="input-unit">分钟</span>
        </div>
      </div>
      <div class="setting-row">
        <label>提示音</label>
        <div style="display:flex; gap:12px; align-items:center;">
          <button class="preset-btn" id="testSoundBtn" style="padding:4px 8px; display:flex; gap:4px; align-items:center;">${ICONS.volume} 测试</button>
          <div class="toggle ${settings.soundEnabled ? 'active' : ''}" id="soundToggle"></div>
        </div>
      </div>
      <div class="setting-row">
        <label>开机自启动</label>
        <div class="toggle ${settings.autoStart ? 'active' : ''}" id="startToggle"></div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <label>版本更新</label>
          <span class="setting-desc">当前版本 v1.5.2${updateInfo ? `（有新版本 v${updateInfo.version}）` : ''}</span>
        </div>
        <button class="check-update-btn" id="checkUpdateBtn" ${isCheckingUpdate ? 'disabled' : ''}>
          ${isCheckingUpdate ? '<span class="spinner"></span> 检查中...' : (updateInfo ? '立即更新' : '检查更新')}
        </button>
      </div>
    </div>

    ${updateMessage ? `
    <div class="toast-message ${updateMessage.type === 'error' ? 'error' : 'success'}">
      <div class="toast-content">
        <span class="toast-icon">${updateMessage.type === 'error' ? '❌' : '✅'}</span>
        <span class="toast-text">${updateMessage.text}</span>
      </div>
    </div>
    ` : ''}

    <div class="notification-popup ${activePopup ? 'show' : ''}">
      <div class="notification-content">
        <div class="emoji">${activePopup ? (ICONS[activePopup.icon] || ICONS.bell) : ''}</div>
        <h2>${activePopup ? activePopup.title : ''}</h2>
        <p>${activePopup ? activePopup.desc : ''}</p>
        <button class="btn btn-primary" id="dismissBtn">我知道了</button>
      </div>
    </div>

    <div class="lock-screen ${lockScreenState.active ? 'show' : ''}">
      <div class="lock-screen-particles">
        ${Array.from({length: 20}, (_, i) => `<div class="particle" style="left:${Math.random()*100}%; top:${Math.random()*100}%; animation-delay:${Math.random()*6}s;"></div>`).join('')}
      </div>
      <div class="lock-screen-content">
        <div class="lock-timer-ring">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#007aff"/>
                <stop offset="100%" style="stop-color:#34c759"/>
              </linearGradient>
            </defs>
            <circle class="bg" cx="100" cy="100" r="90" />
            <circle class="progress" cx="100" cy="100" r="90" stroke-dasharray="565" stroke-dashoffset="0" />
          </svg>
          <div class="center-content">
            <div class="lock-icon">${lockScreenState.task ? (ICONS[lockScreenState.task.icon] || ICONS.bell) : ICONS.eye}</div>
            <div class="lock-seconds">${lockScreenState.waitingConfirm ? '✓' : formatLockTime(lockScreenState.remaining).time}</div>
            <div class="lock-unit">${lockScreenState.waitingConfirm ? '完成' : formatLockTime(lockScreenState.remaining).unit}</div>
          </div>
        </div>
        <div class="lock-title">${lockScreenState.waitingConfirm ? '休息时间到！' : (lockScreenState.task?.title || '休息时间')}</div>
        <div class="lock-message">${lockScreenState.waitingConfirm ? '您完成休息了吗？点击下方按钮确认~' : (lockScreenState.task?.desc || '让身体和眼睛休息一下吧~')}</div>
        ${lockScreenState.waitingConfirm ? `
        <button class="confirm-btn" id="confirmBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          已完成休息
        </button>
        ` : `
        <button class="unlock-btn" id="unlockBtn">
          <div class="unlock-progress"></div>
          <div class="unlock-text">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
            长按 ${getUnlockHoldSeconds()} 秒紧急解锁
          </div>
        </button>
        `}
      </div>
    </div>

    <div class="footer">健康办公助手 v1.5.2 · 愿你每天都有好身体</div>

    ${updateInfo ? `
    <div class="update-banner ${isUpdating ? 'updating' : ''}">
      <div class="update-content">
        <div class="update-info">
          <span class="update-icon">🎉</span>
          <span class="update-text">${isUpdating ? '正在更新...' : `发现新版本 v${updateInfo.version}`}</span>
        </div>
        ${!isUpdating ? `<button class="update-btn" id="updateBtn">立即更新</button>` : `<div class="update-spinner"></div>`}
      </div>
    </div>
    ` : ''}
  `;

  bindEvents();
  updateLiveValues();
}

function bindEvents() {
  document.querySelectorAll('.toggle').forEach(el => {
    el.addEventListener('click', async (e) => {
      if (el.dataset.toggleId) {
        const task = settings.tasks.find(t => t.id === el.dataset.toggleId);
        if (task) {
          task.enabled = !task.enabled;
          el.classList.toggle('active', task.enabled);
          saveSettings();
          syncTasksToBackend();  // 同步到后端
          updateLiveValues();
        }
      } else if (el.id === 'soundToggle') {
        settings.soundEnabled = !settings.soundEnabled;
        el.classList.toggle('active', settings.soundEnabled);
        saveSettings();
      } else if (el.id === 'startToggle') {
        try {
          const newState = !settings.autoStart;
          if (newState) {
            await enable();
          } else {
            await disable();
          }
          settings.autoStart = newState;
          el.classList.toggle('active', settings.autoStart);
          saveSettings();
        } catch (err) {
          console.error('Failed to toggle autostart', err);
        }
      } else if (el.id === 'lockToggle') {
        settings.lockScreenEnabled = !settings.lockScreenEnabled;
        el.classList.toggle('active', settings.lockScreenEnabled);
        saveSettings();
        renderFullUI();
      } else if (el.id === 'lockConfirmToggle') {
        settings.lockEndRequireConfirm = !settings.lockEndRequireConfirm;
        el.classList.toggle('active', settings.lockEndRequireConfirm);
        saveSettings();
      } else if (el.id === 'syncedToggle') {
        settings.scheduleMode = settings.scheduleMode === 'synced' ? 'independent' : 'synced';
        el.classList.toggle('active', settings.scheduleMode === 'synced');
        if (settings.scheduleMode === 'synced') {
          applySyncedAlignment(settings.syncedPair?.breakTaskId);
          syncTasksToBackend();
        }
        saveSettings();
        renderFullUI();
      }
    });
  });

  document.querySelectorAll('.interval-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (val > 0) {
        updateTask(el.dataset.id, { interval: val });
        updateLiveValues();
      }
    });
  });

  document.querySelectorAll('.preset-btn:not(#testSoundBtn)').forEach(el => {
    el.addEventListener('click', () => {
      const val = parseInt(el.dataset.val);
      updateTask(el.dataset.id, { interval: val });
      const input = document.querySelector(`.interval-input[data-id="${el.dataset.id}"]`);
      if (input) input.value = val;
      updateLiveValues();
    });
  });

  document.querySelectorAll('.title[contenteditable="true"]').forEach(el => {
    el.addEventListener('blur', (e) => {
      updateTask(el.dataset.id, { title: e.target.innerText });
      updateLiveValues();
    });
  });

  document.querySelectorAll('.progress-mini[data-reset-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.resetId;
      const task = settings.tasks.find(t => t.id === id);
      if (task) {
        countdowns[id] = task.interval * 60;
        // 通知后端重置该任务
        invoke('timer_reset_task', { taskId: id }).catch(console.error);
        updateLiveValues();
      }
    });
  });

  document.querySelectorAll('.remove-btn').forEach(el => {
    el.addEventListener('click', () => removeTask(el.dataset.id));
  });

  // 任务级别的空闲重置勾选框
  document.querySelectorAll('.idle-reset-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const id = el.dataset.id;
      const task = settings.tasks.find(t => t.id === id);
      if (task) {
        task.autoResetOnIdle = e.target.checked;
        saveSettings();
        syncTasksToBackend();
      }
    });
  });

  // 任务级别的锁屏时长输入框
  document.querySelectorAll('.lock-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const id = el.dataset.id;
      const task = settings.tasks.find(t => t.id === id);
      const val = parseInt(e.target.value);
      if (task && Number.isFinite(val) && val >= 0) {
        task.lockDuration = val;
        saveSettings();
      }
    });
  });

  document.querySelectorAll('.lock-mode-select').forEach(el => {
    el.addEventListener('change', (e) => {
      updateTask(el.dataset.id, { lockMode: e.target.value });
      renderFullUI();
    });
  });

  document.querySelectorAll('.lead-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (Number.isFinite(val) && val >= 0) {
        updateTask(el.dataset.id, { leadSec: val });
      }
    });
  });

  document.querySelectorAll('.delay-once-input').forEach(el => {
    el.addEventListener('change', (e) => {
      updateTask(el.dataset.id, { delayOnceEnabled: e.target.checked });
      renderFullUI();
    });
  });

  document.querySelectorAll('.delay-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (Number.isFinite(val) && val >= 0) {
        updateTask(el.dataset.id, { delayOnceSec: val });
      }
    });
  });

  const conflictSelect = document.getElementById('conflictPolicySelect');
  if (conflictSelect) {
    conflictSelect.addEventListener('change', async (e) => {
      settings.conflictPolicy = e.target.value;
      saveSettings();
      await invoke('timer_set_conflict_policy', { policy: settings.conflictPolicy }).catch(console.error);
    });
  }

  const officePresetBtn = document.getElementById('officePresetBtn');
  if (officePresetBtn) {
    officePresetBtn.addEventListener('click', () => {
      applyOfficePreset();
    });
  }

  document.getElementById('addTaskBtn').onclick = addTask;
  document.getElementById('pauseBtn').onclick = togglePause;
  document.getElementById('resetBtn').onclick = resetAll;
  document.getElementById('dismissBtn').onclick = dismissNotification;
  
  document.getElementById('testSoundBtn').onclick = () => {
    invoke('play_notification_sound').catch(e => console.error('Sound invoke failed:', e));
  };

  const unlockBtn = document.getElementById('unlockBtn');
  if (unlockBtn) {
    unlockBtn.addEventListener('mousedown', startUnlockPress);
    unlockBtn.addEventListener('mouseup', cancelUnlockPress);
    unlockBtn.addEventListener('mouseleave', cancelUnlockPress);
    unlockBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startUnlockPress();
    });
    unlockBtn.addEventListener('touchend', cancelUnlockPress);
    unlockBtn.addEventListener('touchcancel', cancelUnlockPress);
  }

  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', endLockScreen);
  }

  const updateBtn = document.getElementById('updateBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', performUpdate);
  }

  const checkUpdateBtn = document.getElementById('checkUpdateBtn');
  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener('click', () => {
      if (updateInfo) {
        // 如果已经有更新信息，执行更新
        performUpdate();
      } else {
        // 否则检查更新
        checkForUpdates(true);
      }
    });
  }

  const idleThresholdInput = document.getElementById('idleThresholdInput');
  if (idleThresholdInput) {
    idleThresholdInput.addEventListener('input', async (e) => {
      const minutes = parseInt(e.target.value);
      if (minutes >= 1 && minutes <= 60) {
        settings.idleThreshold = minutes * 60;  // 转换为秒
        saveSettings();
        await invoke('set_idle_threshold', { seconds: settings.idleThreshold }).catch(console.error);
      }
    });
  }
}

window.triggerNotification = triggerNotification;
window.settings = settings;

init();
