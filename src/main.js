import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

const DEFAULT_SETTINGS = {
  sitInterval: 45,
  waterInterval: 60,
  eyeInterval: 20,
  sitEnabled: true,
  waterEnabled: true,
  eyeEnabled: true,
  soundEnabled: true,
  autoStart: false,
};

let settings = { ...DEFAULT_SETTINGS };
let timers = {
  sit: null,
  water: null,
  eye: null,
};
let countdowns = {
  sit: 0,
  water: 0,
  eye: 0,
};
let stats = {
  sitBreaks: 0,
  waterCups: 0,
  workMinutes: 0,
};
let isPaused = false;
let workStartTime = Date.now();

async function loadSettings() {
  try {
    const saved = await invoke('load_settings');
    if (saved) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.log('Using default settings');
  }
  
  try {
    const savedStats = localStorage.getItem('reminder_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      const today = new Date().toDateString();
      if (parsed.date === today) {
        stats = parsed.stats;
      }
    }
  } catch (e) {
    console.log('Using default stats');
  }
}

async function saveSettings() {
  try {
    await invoke('save_settings', { settings: JSON.stringify(settings) });
  } catch (e) {
    console.log('Failed to save settings');
  }
}

function saveStats() {
  localStorage.setItem('reminder_stats', JSON.stringify({
    date: new Date().toDateString(),
    stats: stats,
  }));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { mins, secs };
}

function getNextReminder() {
  let next = null;
  let type = '';
  
  if (settings.sitEnabled && countdowns.sit > 0) {
    if (!next || countdowns.sit < next) {
      next = countdowns.sit;
      type = 'sit';
    }
  }
  if (settings.waterEnabled && countdowns.water > 0) {
    if (!next || countdowns.water < next) {
      next = countdowns.water;
      type = 'water';
    }
  }
  if (settings.eyeEnabled && countdowns.eye > 0) {
    if (!next || countdowns.eye < next) {
      next = countdowns.eye;
      type = 'eye';
    }
  }
  
  return { time: next || 0, type };
}

function showNotification(type) {
  const notifications = {
    sit: { emoji: '🧘', title: '该起来活动了！', desc: '久坐对身体不好，起来走动一下吧~' },
    water: { emoji: '💧', title: '该喝水了！', desc: '保持水分摄入，让身体更健康~' },
    eye: { emoji: '👀', title: '让眼睛休息一下！', desc: '看看远处，放松一下眼睛~' },
  };
  
  const n = notifications[type];
  const popup = document.querySelector('.notification-popup');
  const content = popup.querySelector('.notification-content');
  
  content.querySelector('.emoji').textContent = n.emoji;
  content.querySelector('h2').textContent = n.title;
  content.querySelector('p').textContent = n.desc;
  
  popup.classList.add('show');
  
  if (settings.soundEnabled) {
    try {
      invoke('play_notification_sound');
    } catch (e) {
      console.log('Sound not available');
    }
  }
}

function dismissNotification(type) {
  const popup = document.querySelector('.notification-popup');
  popup.classList.remove('show');
  
  if (type === 'sit') {
    stats.sitBreaks++;
    countdowns.sit = settings.sitInterval * 60;
  } else if (type === 'water') {
    stats.waterCups++;
    countdowns.water = settings.waterInterval * 60;
  } else if (type === 'eye') {
    countdowns.eye = settings.eyeInterval * 60;
  }
  
  saveStats();
  render();
}

function tick() {
  if (isPaused) return;
  
  stats.workMinutes = Math.floor((Date.now() - workStartTime) / 60000);
  
  if (settings.sitEnabled && countdowns.sit > 0) {
    countdowns.sit--;
    if (countdowns.sit === 0) {
      showNotification('sit');
    }
  }
  
  if (settings.waterEnabled && countdowns.water > 0) {
    countdowns.water--;
    if (countdowns.water === 0) {
      showNotification('water');
    }
  }
  
  if (settings.eyeEnabled && countdowns.eye > 0) {
    countdowns.eye--;
    if (countdowns.eye === 0) {
      showNotification('eye');
    }
  }
  
  render();
}

function toggleReminder(type) {
  settings[`${type}Enabled`] = !settings[`${type}Enabled`];
  if (settings[`${type}Enabled`]) {
    countdowns[type] = settings[`${type}Interval`] * 60;
  }
  saveSettings();
  render();
}

function updateInterval(type, value) {
  const val = parseInt(value) || 1;
  settings[`${type}Interval`] = Math.max(1, Math.min(180, val));
  countdowns[type] = settings[`${type}Interval`] * 60;
  saveSettings();
  render();
}

function togglePause() {
  isPaused = !isPaused;
  render();
}

function resetAll() {
  countdowns.sit = settings.sitInterval * 60;
  countdowns.water = settings.waterInterval * 60;
  countdowns.eye = settings.eyeInterval * 60;
  isPaused = false;
  render();
}

function toggleSetting(key) {
  settings[key] = !settings[key];
  saveSettings();
  
  if (key === 'autoStart') {
    invoke('set_autostart', { enabled: settings.autoStart }).catch(() => {});
  }
  
  render();
}

function render() {
  const next = getNextReminder();
  const { mins, secs } = formatTime(next.time);
  const totalSeconds = next.type ? settings[`${next.type}Interval`] * 60 : 1;
  const progress = next.time / totalSeconds;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - progress);
  
  const typeLabels = {
    sit: '久坐提醒',
    water: '喝水提醒',
    eye: '护眼提醒',
    '': '无活动提醒',
  };

  document.getElementById('app').innerHTML = `
    <div class="header">
      <h1>健康提醒助手</h1>
      <p>关爱健康，从每一次提醒开始</p>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <div class="icon">🧘</div>
        <div class="value">${stats.sitBreaks}</div>
        <div class="label">休息次数</div>
      </div>
      <div class="status-item">
        <div class="icon">💧</div>
        <div class="value">${stats.waterCups}</div>
        <div class="label">喝水次数</div>
      </div>
      <div class="status-item">
        <div class="icon">⏱️</div>
        <div class="value">${stats.workMinutes}</div>
        <div class="label">工作分钟</div>
      </div>
    </div>

    <div class="timer-display">
      <div class="timer-ring">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle class="bg" cx="90" cy="90" r="80" />
          <circle class="progress" cx="90" cy="90" r="80"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}" />
        </svg>
        <div class="time-text">
          <div class="minutes">${String(mins).padStart(2, '0')}</div>
          <div class="seconds">:${String(secs).padStart(2, '0')}</div>
        </div>
      </div>
      <div class="timer-label">${typeLabels[next.type]}${isPaused ? ' (已暂停)' : ''}</div>
    </div>

    <div class="reminder-cards">
      <div class="reminder-card">
        <div class="icon">🧘</div>
        <div class="info">
          <div class="title">久坐提醒</div>
          <div class="desc">每 <input type="number" class="interval-input" value="${settings.sitInterval}" data-type="sit" min="1" max="180"> 分钟</div>
        </div>
        <div class="toggle ${settings.sitEnabled ? 'active' : ''}" data-toggle="sit"></div>
      </div>
      
      <div class="reminder-card">
        <div class="icon">💧</div>
        <div class="info">
          <div class="title">喝水提醒</div>
          <div class="desc">每 <input type="number" class="interval-input" value="${settings.waterInterval}" data-type="water" min="1" max="180"> 分钟</div>
        </div>
        <div class="toggle ${settings.waterEnabled ? 'active' : ''}" data-toggle="water"></div>
      </div>
      
      <div class="reminder-card">
        <div class="icon">👀</div>
        <div class="info">
          <div class="title">护眼提醒</div>
          <div class="desc">每 <input type="number" class="interval-input" value="${settings.eyeInterval}" data-type="eye" min="1" max="180"> 分钟</div>
        </div>
        <div class="toggle ${settings.eyeEnabled ? 'active' : ''}" data-toggle="eye"></div>
      </div>
    </div>

    <div class="quick-actions">
      <button class="btn btn-primary" id="pauseBtn">
        ${isPaused ? '▶️ 继续' : '⏸️ 暂停'}
      </button>
      <button class="btn btn-secondary" id="resetBtn">
        🔄 重置
      </button>
    </div>

    <div class="settings-section">
      <h3>设置</h3>
      <div class="setting-row">
        <label>提示音</label>
        <div class="toggle ${settings.soundEnabled ? 'active' : ''}" data-setting="soundEnabled"></div>
      </div>
      <div class="setting-row">
        <label>开机自启动</label>
        <div class="toggle ${settings.autoStart ? 'active' : ''}" data-setting="autoStart"></div>
      </div>
    </div>

    <div class="notification-popup">
      <div class="notification-content">
        <div class="emoji">🧘</div>
        <h2>该起来活动了！</h2>
        <p>久坐对身体不好，起来走动一下吧~</p>
        <button class="btn btn-primary" id="dismissBtn">我知道了</button>
      </div>
    </div>

    <div class="footer">
      健康提醒助手 v1.0 · 最小化到托盘继续运行
    </div>
  `;

  document.querySelectorAll('.toggle[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleReminder(el.dataset.toggle));
  });
  
  document.querySelectorAll('.interval-input').forEach(el => {
    el.addEventListener('change', (e) => updateInterval(el.dataset.type, e.target.value));
  });
  
  document.querySelectorAll('.toggle[data-setting]').forEach(el => {
    el.addEventListener('click', () => toggleSetting(el.dataset.setting));
  });
  
  document.getElementById('pauseBtn').addEventListener('click', togglePause);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('dismissBtn').addEventListener('click', () => {
    const next = getNextReminder();
    dismissNotification(next.type || 'sit');
  });
}

async function init() {
  await loadSettings();
  
  countdowns.sit = settings.sitInterval * 60;
  countdowns.water = settings.waterInterval * 60;
  countdowns.eye = settings.eyeInterval * 60;
  
  render();
  
  setInterval(tick, 1000);
  
  listen('show-window', () => {
    invoke('show_main_window');
  });
}

init();
