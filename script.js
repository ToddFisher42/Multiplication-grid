const MAX_NUMBER = 15;
const STORAGE_KEYS = { theme: 'ttg-theme', numbers: 'ttg-numbers', timer: 'ttg-timer' };

let selectedNumbers = [];
let rowOrder = [];
let colOrder = [];
let answersVisible = false;

let timerInterval = null;
let remainingSeconds = 0;
let timerPaused = false;

// localStorage can be unavailable (private mode, blocked site data), so never let it break the page
function loadSetting(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function saveSetting(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Settings just won't persist
    }
}

function getNumberCheckboxes() {
    return document.querySelectorAll('#checkboxes input[type="checkbox"]');
}

function setStatus(message, isAlert = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.classList.toggle('alert', isAlert);
}

function initCheckboxes() {
    const container = document.getElementById('checkboxes');
    for (let i = 1; i <= MAX_NUMBER; i++) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = i;
        checkbox.addEventListener('change', updateGrid);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${i}`));
        container.appendChild(label);
    }

    // Range shortcuts (1-10, 1-12, Select All) tick every number up to their data-max
    document.querySelectorAll('.range-select').forEach(rangeBox => {
        rangeBox.addEventListener('change', (e) => {
            const max = parseInt(e.target.dataset.max);
            getNumberCheckboxes().forEach(cb => {
                cb.checked = e.target.checked && parseInt(cb.value) <= max;
            });
            updateGrid();
        });
    });

    // Restore the last selection
    const saved = loadSetting(STORAGE_KEYS.numbers);
    if (saved) {
        const savedNumbers = saved.split(',').map(Number);
        getNumberCheckboxes().forEach(cb => {
            cb.checked = savedNumbers.includes(parseInt(cb.value));
        });
    }
}

// Keep each range shortcut ticked only while the selection is exactly 1 to its max
function syncGroupCheckboxes() {
    document.querySelectorAll('.range-select').forEach(rangeBox => {
        const max = parseInt(rangeBox.dataset.max);
        rangeBox.checked = selectedNumbers.length === max && selectedNumbers.every(n => n <= max);
    });
}

function updateGrid() {
    selectedNumbers = Array.from(getNumberCheckboxes())
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));
    rowOrder = [...selectedNumbers];
    colOrder = [...selectedNumbers];
    saveSetting(STORAGE_KEYS.numbers, selectedNumbers.join(','));
    syncGroupCheckboxes();
    if (selectedNumbers.length > 0) {
        setStatus('');
    }
    generateGrid();
}

function generateGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    if (selectedNumbers.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'empty-hint';
        hint.textContent = 'Tick at least one number above to build the grid.';
        grid.appendChild(hint);
        return;
    }

    const table = document.createElement('table');
    table.className = 'times-table';
    // Column count (including the header column) lets the print styles fit the grid to the page
    table.style.setProperty('--cols', colOrder.length + 1);

    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = `Times table for ${selectedNumbers.join(', ')}`;
    table.appendChild(caption);

    // Header row
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'corner';
    corner.textContent = '×';
    corner.setAttribute('aria-label', 'times');
    headRow.appendChild(corner);
    colOrder.forEach(num => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = num;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    rowOrder.forEach(rowNum => {
        const tr = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.scope = 'row';
        rowHeader.textContent = rowNum;
        tr.appendChild(rowHeader);

        colOrder.forEach(colNum => {
            const td = document.createElement('td');
            td.textContent = answersVisible ? rowNum * colNum : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    grid.appendChild(table);
}

function setAnswersVisible(visible) {
    answersVisible = visible;
    document.getElementById('toggleAnswersBtn').textContent = visible ? 'Hide Answers' : 'Show Answers';
    generateGrid();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function scrambleNumbers() {
    if (selectedNumbers.length === 0) {
        setStatus('Select some numbers first, then scramble.', true);
        return;
    }
    // Rows and columns are shuffled independently
    shuffle(rowOrder);
    shuffle(colOrder);
    generateGrid();
}

// ---- Timer ----

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTargetMinutes() {
    const select = document.getElementById('timerSelect');
    if (select.value !== 'custom') {
        return parseInt(select.value);
    }
    const custom = parseInt(document.getElementById('customTime').value);
    if (Number.isNaN(custom) || custom < 1) {
        return null;
    }
    return Math.min(custom, 60);
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = formatTime(remainingSeconds);
}

function setTimerButtons(running) {
    document.getElementById('startBtn').disabled = running;
    document.getElementById('pauseBtn').disabled = !running;
    document.getElementById('pauseBtn').textContent = 'Pause';
}

function tick() {
    remainingSeconds--;
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
        finishTimer();
    }
}

function startTimer() {
    if (selectedNumbers.length === 0) {
        setStatus('Select at least one number before starting the timer.', true);
        return;
    }

    const targetMinutes = getTargetMinutes();
    if (targetMinutes === null) {
        setStatus('Enter a custom time of at least 1 minute.', true);
        document.getElementById('customTime').focus();
        return;
    }

    clearInterval(timerInterval);
    remainingSeconds = targetMinutes * 60;
    timerPaused = false;
    document.body.classList.remove('times-up');
    setStatus('');
    setAnswersVisible(false);
    updateTimerDisplay();
    setTimerButtons(true);
    timerInterval = setInterval(tick, 1000);
}

function togglePause() {
    if (remainingSeconds <= 0) return;
    const pauseBtn = document.getElementById('pauseBtn');
    if (timerPaused) {
        timerInterval = setInterval(tick, 1000);
        pauseBtn.textContent = 'Pause';
        setStatus('');
    } else {
        clearInterval(timerInterval);
        pauseBtn.textContent = 'Resume';
        setStatus('Timer paused.');
    }
    timerPaused = !timerPaused;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerPaused = false;
    remainingSeconds = 0;
    document.body.classList.remove('times-up');
    updateTimerDisplay();
    setTimerButtons(false);
    setStatus('');
}

function finishTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingSeconds = 0;
    updateTimerDisplay();
    setTimerButtons(false);
    document.getElementById('pauseBtn').disabled = true;
    document.body.classList.add('times-up');
    setStatus("Time's up! Answers are now showing.", true);
    setAnswersVisible(true);
    playAlarm();
}

// Generates the alarm with the Web Audio API so no sound file is needed
function playAlarm() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
        const ctx = new AudioCtx();
        const beepLength = 0.25;
        for (let i = 0; i < 3; i++) {
            const start = ctx.currentTime + i * 0.4;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + beepLength);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + beepLength);
        }
        setTimeout(() => ctx.close(), 1500);
    } catch {
        // Audio is a nice-to-have; the visual "Time's up" cue still shows
    }
}

// ---- Theme and settings ----

function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    document.getElementById('themeToggle').checked = isDark;
}

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const savedTheme = loadSetting(STORAGE_KEYS.theme);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

    toggle.addEventListener('change', () => {
        applyTheme(toggle.checked);
        saveSetting(STORAGE_KEYS.theme, toggle.checked ? 'dark' : 'light');
    });
}

function initTimerControls() {
    const select = document.getElementById('timerSelect');
    const customInput = document.getElementById('customTime');

    const savedTimer = loadSetting(STORAGE_KEYS.timer);
    if (savedTimer && select.querySelector(`option[value="${savedTimer}"]`)) {
        select.value = savedTimer;
    }

    const updateCustomVisibility = () => {
        customInput.style.display = select.value === 'custom' ? 'inline-block' : 'none';
    };
    updateCustomVisibility();

    select.addEventListener('change', () => {
        updateCustomVisibility();
        saveSetting(STORAGE_KEYS.timer, select.value);
    });

    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);
}

function initActionButtons() {
    document.getElementById('scrambleBtn').addEventListener('click', scrambleNumbers);
    document.getElementById('toggleAnswersBtn').addEventListener('click', () => {
        setAnswersVisible(!answersVisible);
    });
}

// Initialize
initThemeToggle();
initCheckboxes();
initTimerControls();
initActionButtons();
updateGrid();
