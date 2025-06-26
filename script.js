// JavaScript for functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentDateEl = document.getElementById('current-date');
    const countDisplayEl = document.getElementById('count-display');
    const progressTextEl = document.getElementById('progress-text');
    const incrementBtn = document.getElementById('increment-btn');
    const decrementBtn = document.getElementById('decrement-btn');
    const targetInput = document.getElementById('target-input');
    const setTargetBtn = document.getElementById('set-target-btn');
    const historyListEl = document.getElementById('history-list');

    // App State
    let state = {
        count: 0,
        target: 10,
        lastVisitedDate: null,
        history: {} // format: { 'YYYY-MM-DD': count }
    };

    // --- UTILITY FUNCTIONS ---

    /**
     * Get today's date in YYYY-MM-DD format for consistent storage and comparison.
     */
    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    /**
     * Format date for display (e.g., "June 26, 2025")
     */
    const formatDisplayDate = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    }

    // --- CORE LOGIC ---

    /**
     * Load data from localStorage and initialize the state.
     */
    const loadState = () => {
        const savedState = localStorage.getItem('jobCounterState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
        targetInput.value = state.target;
    };

    /**
     * Save the current state to localStorage.
     */
    const saveState = () => {
        localStorage.setItem('jobCounterState', JSON.stringify(state));
    };

    /**
     * Update the UI based on the current state.
     */
    const updateUI = () => {
        // Update counter display
        countDisplayEl.textContent = state.count;

        // Prevent negative counter
        decrementBtn.disabled = state.count <= 0;

        // Update progress text
        const remaining = state.target - state.count;
        if (state.target > 0) {
            if (remaining > 0) {
                progressTextEl.innerHTML = `<strong>${remaining}</strong> more to reach your goal of <strong>${state.target}</strong>.`;
                progressTextEl.classList.remove('goal-reached');
            } else {
                progressTextEl.textContent = "You've reached your daily goal! Great job!";
                progressTextEl.classList.add('goal-reached');
            }
        } else {
            progressTextEl.textContent = 'Set a daily target to track progress.';
            progressTextEl.classList.remove('goal-reached');
        }

        // Update date display
        currentDateEl.textContent = formatDisplayDate();
    };

    /**
     * Render the history list in the UI.
     */
    const renderHistory = () => {
        historyListEl.innerHTML = '';
        if (Object.keys(state.history).length === 0) {
            historyListEl.innerHTML = '<li>No history yet.</li>';
            return;
        }

        // Get sorted dates (most recent first)
        const sortedDates = Object.keys(state.history).sort().reverse();

        for (const date of sortedDates) {
            const count = state.history[date];
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> <strong>${count} applications</strong>`;
            historyListEl.appendChild(listItem);
        }
    };

    /**
     * Check if the day has changed. If so, reset the counter and update history.
     */
    const checkAndResetForNewDay = () => {
        const today = getTodayDateString();
        // If there's a last visited date and it's not today
        if (state.lastVisitedDate && state.lastVisitedDate !== today) {
            // Save yesterday's count to history only if it was greater than 0
            if (state.count > 0) {
                state.history[state.lastVisitedDate] = state.count;
            }
            // Reset the count for the new day
            state.count = 0;
        }
        // Update the last visited date to today
        state.lastVisitedDate = today;
        saveState();
    };

    // --- EVENT HANDLERS ---

    incrementBtn.addEventListener('click', () => {
        state.count++;
        updateUI();
        saveState();
    });

    decrementBtn.addEventListener('click', () => {
        if (state.count > 0) {
            state.count--;
            updateUI();
            saveState();
        }
    });

    setTargetBtn.addEventListener('click', () => {
        const newTarget = parseInt(targetInput.value, 10);
        if (newTarget > 0) {
            state.target = newTarget;
            updateUI();
            saveState();
            // Optional: give user feedback
            targetInput.style.borderColor = 'var(--success-color)';
            setTimeout(() => { targetInput.style.borderColor = 'var(--border-color)'; }, 2000);
        } else {
            // Optional: give user feedback
            targetInput.style.borderColor = 'var(--danger-color)';
            setTimeout(() => { targetInput.style.borderColor = 'var(--border-color)'; }, 2000);
        }
    });

    // --- INITIALIZATION ---

    const initializeApp = () => {
        loadState();
        checkAndResetForNewDay();
        updateUI();
        renderHistory();
    };

    initializeApp();
});