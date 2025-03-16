let selectedNumbers = [];
let timerInterval;
let answersVisible = false;
let rowOrder = [];
let colOrder = [];

function initCheckboxes() {
    const container = document.getElementById('checkboxes');
    for (let i = 1; i <= 12; i++) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = i;
        checkbox.onchange = updateGrid;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${i}`));
        container.appendChild(label);
    }

    // Group select handlers
    document.getElementById('select1to10').onchange = (e) => {
        const checkboxes = document.querySelectorAll('#checkboxes input');
        checkboxes.forEach(cb => {
            const val = parseInt(cb.value);
            cb.checked = e.target.checked && val <= 10;
        });
        updateGrid();
    };

    document.getElementById('selectAll').onchange = (e) => {
        const checkboxes = document.querySelectorAll('#checkboxes input');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateGrid();
    };
}

function updateGrid() {
    selectedNumbers = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.value));
    rowOrder = [...selectedNumbers];
    colOrder = [...selectedNumbers];
    generateGrid();
}

function generateGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${selectedNumbers.length + 1}, 50px)`;

    // Top row (headers)
    grid.appendChild(document.createElement('div')); // Empty top-left cell
    colOrder.forEach(num => {
        const cell = document.createElement('div');
        cell.className = 'cell header';
        cell.textContent = num;
        grid.appendChild(cell);
    });

    // Rest of the grid
    rowOrder.forEach(rowNum => {
        const rowHeader = document.createElement('div');
        rowHeader.className = 'cell header';
        rowHeader.textContent = rowNum;
        grid.appendChild(rowHeader);

        colOrder.forEach(colNum => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = answersVisible ? rowNum * colNum : '';
            grid.appendChild(cell);
        });
    });
}

function startTimer() {
    clearInterval(timerInterval);
    const select = document.getElementById('timerSelect');
    let targetMinutes = parseInt(select.value);
    
    if (select.value === 'custom') {
        targetMinutes = parseInt(document.getElementById('customTime').value) || 5; // Default to 5 if invalid
    }
    
    const targetTime = targetMinutes * 60;
    let elapsedTime = 0;
    answersVisible = false;
    generateGrid();

    timerInterval = setInterval(() => {
        const mins = Math.floor(elapsedTime / 60);
        const secs = elapsedTime % 60;
        document.getElementById('timerDisplay').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (elapsedTime >= targetTime) {
            clearInterval(timerInterval);
            document.getElementById('showAnswers').classList.remove('hidden');
            const siren = document.getElementById('sirenSound');
            siren.play();
        }
        elapsedTime++;
    }, 1000);
}

function revealAnswers() {
    answersVisible = true;
    generateGrid();
}

function scrambleNumbers() {
    // Shuffle row order
    for (let i = rowOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rowOrder[i], rowOrder[j]] = [rowOrder[j], rowOrder[i]];
    }
    
    // Shuffle column order independently
    for (let i = colOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colOrder[i], colOrder[j]] = [colOrder[j], colOrder[i]];
    }
    
    generateGrid();
}

// Theme toggle and custom timer visibility
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const select = document.getElementById('timerSelect');
    const customInput = document.getElementById('customTime');

    toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark', toggle.checked);
        document.body.classList.toggle('light', !toggle.checked);
    });

    select.addEventListener('change', () => {
        customInput.style.display = select.value === 'custom' ? 'inline-block' : 'none';
    });

    document.body.classList.add('light');
}

// Initialize
initCheckboxes();
initThemeToggle();
