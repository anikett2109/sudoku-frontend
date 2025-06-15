
const API_BASE_URL = 'https://sudoku-backend-1-fen4.onrender.com';
// Initialize GSAP animations and background effects
function initializeAnimations() {
  // Create floating numbers background
  const floatingContainer = document.getElementById('floatingNumbers');
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Create 50 floating numbers
  for (let i = 0; i < 50; i++) {
    const numberEl = document.createElement('div');
    numberEl.className = 'floating-number';
    numberEl.textContent = numbers[Math.floor(Math.random() * numbers.length)];
    numberEl.style.left = Math.random() * 100 + '%';
    numberEl.style.top = Math.random() * 100 + '%';
    floatingContainer.appendChild(numberEl);

    // Animate floating numbers
    gsap.to(numberEl, {
      y: -100,
      x: Math.random() * 200 - 100,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.1 + 0.02,
      duration: Math.random() * 20 + 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 5
    });
  }

  // Create particle system
  const particlesContainer = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particlesContainer.appendChild(particle);

    gsap.to(particle, {
      y: -window.innerHeight,
      x: Math.random() * 200 - 100,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 15 + 10,
      repeat: -1,
      ease: "none",
      delay: Math.random() * 10
    });
  }

  // Animate title on load
  gsap.fromTo("h1",
    {
      y: -100,
      opacity: 0,
      scale: 0.5
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)"
    }
  );

  // Animate board on load
  gsap.fromTo(".sudoku-board",
    {
      scale: 0.8,
      opacity: 0,
      rotationY: 45
    },
    {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.3
    }
  );

  // Animate buttons on load
  gsap.fromTo(".controls button",
    {
      y: 50,
      opacity: 0,
      scale: 0.8
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
      stagger: 0.1,
      delay: 0.6
    }
  );

  // Continuous board floating animation
  gsap.to(".sudoku-board", {
    y: -10,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Title glow animation
  gsap.to("h1", {
    textShadow: "0 0 40px rgba(102, 126, 234, 0.8)",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

// Enhanced cell animation functions
function animateCell(cell, type) {
  if (type === 'success') {
    gsap.fromTo(cell,
      { scale: 1 },
      {
        scale: 1.3,
        duration: 0.3,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1
      }
    );

    gsap.to(cell, {
      boxShadow: "0 0 30px rgba(46, 213, 115, 0.8), inset 0 0 30px rgba(46, 213, 115, 0.3)",
      duration: 0.5,
      ease: "power2.out"
    });
  } else if (type === 'error') {
    gsap.to(cell, {
      x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
      duration: 0.6,
      ease: "power2.out"
    });
  }
}

// Enhanced status animation
function animateStatus(text) {
  const statusEl = document.getElementById('status');

  gsap.fromTo(statusEl,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
  );

  statusEl.textContent = text;
}

// DOM elements
const boardElement = document.getElementById('sudokuBoard');
const generateBtn = document.getElementById('generateBtn');
const solveBtn = document.getElementById('solveBtn');
const clearBtn = document.getElementById('clearBtn');
const statusElement = document.getElementById('status');

// Game state
let board = Array(9).fill().map(() => Array(9).fill(0));
let isSolving = false;
let abortController = null;

// Initialize the board UI
function initializeBoard() {
  boardElement.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.max = '9';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', handleCellInput);
      cell.appendChild(input);
      row.appendChild(cell);
    }
    boardElement.appendChild(row);
  }

  // Animate cells on creation
  gsap.fromTo(".sudoku-board td",
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.05,
      stagger: {
        grid: [9, 9],
        from: "center",
        amount: 1
      },
      ease: "back.out(1.7)",
      delay: 0.5
    }
  );
}

// Handle cell input
function handleCellInput(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  const value = e.target.value === '' ? 0 : parseInt(e.target.value);

  if (value >= 1 && value <= 9) {
    board[row][col] = value;
    e.target.value = value;

    // Animate successful input
    gsap.fromTo(e.target.parentElement,
      { scale: 1 },
      { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  } else {
    board[row][col] = 0;
    e.target.value = '';
  }
}

// Update board UI from matrix
function updateBoardUI() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
      cell.value = board[i][j] === 0 ? '' : board[i][j];
    }
  }
}

// Clear the board
function clearBoard() {
  if (isSolving && abortController) {
    abortController.abort();
  }

  // Animate clear
  gsap.to(".sudoku-board input", {
    scale: 0,
    duration: 0.3,
    stagger: {
      grid: [9, 9],
      from: "center",
      amount: 0.5
    },
    ease: "back.in(1.7)",
    onComplete: () => {
      board = Array(9).fill().map(() => Array(9).fill(0));
      updateBoardUI();

      // Remove all color highlights
      document.querySelectorAll('input').forEach(input => {
        input.classList.remove('green', 'red');
      });

      // Animate back in
      gsap.to(".sudoku-board input", {
        scale: 1,
        duration: 0.3,
        stagger: {
          grid: [9, 9],
          from: "center",
          amount: 0.5
        },
        ease: "back.out(1.7)"
      });
    }
  });

  isSolving = false;
  statusElement.textContent = '';
}

// Generate a new board
async function generateBoard() {
  if (isSolving) return;

  try {
    animateStatus('Generating puzzle...');
    gsap.to(generateBtn, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    const response = await fetch(`${API_BASE_URL}/api/sudoku/generate`);
    if (!response.ok) throw new Error('Network response was not ok');
    board = await response.json();
    updateBoardUI();

    gsap.fromTo(".sudoku-board input",
      { scale: 0, rotation: 180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        stagger: 0.02,
        ease: "back.out(1.7)"
      }
    );

    animateStatus('New puzzle generated!');
  } catch (error) {
    animateStatus('Failed to generate puzzle');
    console.error('Generate error:', error);
  }
}

// Update the solveBoard function:
async function solveBoard() {
  if (isSolving) return;

  isSolving = true;
  abortController = new AbortController();
  animateStatus('Solving...');

  gsap.to(solveBtn, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/sudoku/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(board),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is SSE
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/event-stream')) {
      throw new Error('Server did not return SSE stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (event.includes('INVALID_BOARD')) {
          animateStatus('Invalid Sudoku board!');
          highlightInvalidCells();
          isSolving = false;
          return;
        }

        const dataMatch = event.match(/data:\s*(\{.*\})/);
        if (dataMatch) {
          try {
            const step = JSON.parse(dataMatch[1]);
            updateBoardStep(step);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    animateStatus('Solved!');
    gsap.to(".sudoku-board", {
      scale: 1.05,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });

  } catch (error) {
    if (error.name !== 'AbortError') {
      animateStatus('Failed to solve puzzle');
      console.error('Solve error:', error);

      // Show more detailed error if available
      if (error.message.includes('Failed to fetch')) {
        animateStatus('Cannot connect to server');
      }
    } else {
      animateStatus('Solving aborted');
    }
  } finally {
    isSolving = false;
  }
}

// Update board with a solving step
function updateBoardStep(step) {
  const cell = document.querySelector(`input[data-row="${step.row}"][data-col="${step.col}"]`);

  // Update board data
  board[step.row][step.col] = step.value;

  // Update UI
  cell.value = step.value === 0 ? '' : step.value;

  // Apply visual effect with enhanced animations
  cell.classList.remove('green', 'red');
  if (step.value !== 0) {
    cell.classList.add('green');
    animateCell(cell.parentElement, 'success');
  } else {
    cell.classList.add('red');
    animateCell(cell.parentElement, 'error');
  }

  // Remove color after animation
  setTimeout(() => {
    cell.classList.remove('green', 'red');
  }, 1000);
}

// Event listeners
generateBtn.addEventListener('click', generateBoard);
solveBtn.addEventListener('click', solveBoard);
clearBtn.addEventListener('click', clearBoard);

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  initializeBoard();
});
