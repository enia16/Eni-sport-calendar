// State Management
let currentDate = new Date();
let events = [];

// Sample Events
const sampleEvents = [
    {
        id: 1,
        date: '2025-07-18',
        time: '18:30',
        sport: 'Football',
        teams: 'Salzburg vs. Sturm',
        venue: 'Red Bull Arena',
        description: 'Austrian Football League match'
    },
    {
        id: 2,
        date: '2025-10-23',
        time: '09:45',
        sport: 'Ice Hockey',
        teams: 'KAC vs. Capitals',
        venue: 'Stadthalle Klagenfurt',
        description: 'ICE Hockey League championship game'
    }
];

// Initialize
function init() {
    // Load events from JSON or use sample data
    loadEvents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial calendar
    renderCalendar();
}

// Load events
function loadEvents() {
    // Load user-saved events from localStorage
    let stored = [];
    try {
        stored = JSON.parse(localStorage.getItem('events') || '[]');
        if (!Array.isArray(stored)) stored = [];
    } catch (e) {
        console.warn('Could not parse stored events from localStorage', e);
        stored = [];
    }

    // Try to load base events from events.json, fallback to sample data
    fetch('events.json')
        .then(response => response.json())
        .then(data => {
            const base = data.events || sampleEvents;
            // Merge base + stored, dedupe by id (stored take precedence)
            const merged = base.concat(stored);
            const seen = new Set();
            events = merged.filter(ev => {
                if (seen.has(ev.id)) return false;
                seen.add(ev.id);
                return true;
            });
            renderCalendar();
        })
        .catch(() => {
            // Use sample data if JSON file not found
            events = sampleEvents.concat(stored);
            // dedupe
            const seen = new Set();
            events = events.filter(ev => {
                if (seen.has(ev.id)) return false;
                seen.add(ev.id);
                return true;
            });
            renderCalendar();
        });
}

// Setup Event Listeners
function setupEventListeners() {
    // Month navigation
    const prevMonth = document.getElementById('prevMonth');
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    const nextMonth = document.getElementById('nextMonth');
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

// Calendar Rendering
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Get calendar data
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Clear calendar grid
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(year, month, day);
        calendarGrid.appendChild(dayCell);
    }
}

// Create Day Cell
function createDayCell(year, month, day) {
    const dateString = formatDate(year, month, day);
    const dayEvents = getEventsForDate(dateString);
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    // Check if today
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayCell.classList.add('today');
    }
    
    // Add day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);
    
    // Add events
    if (dayEvents.length > 0) {
        dayCell.classList.add('has-events');
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        
        dayEvents.forEach(event => {
            const eventMarker = createEventMarker(event);
            eventsContainer.appendChild(eventMarker);
        });
        
        dayCell.appendChild(eventsContainer);
    }
    
    return dayCell;
}

// Create Event Marker
function createEventMarker(event) {
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    
    const dot = document.createElement('span');
    dot.className = 'event-dot';
    dot.textContent = '●';
    
    const name = document.createElement('span');
    name.className = 'event-name';
    name.textContent = event.sport;
    
    marker.appendChild(dot);
    marker.appendChild(name);
    
    marker.addEventListener('click', () => showEventDetail(event));
    
    return marker;
}

// Get Events for Date
function getEventsForDate(dateString) {
    return events.filter(event => event.date === dateString);
}

// Format Date
function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Show Event Detail
function showEventDetail(event) {
    // Store selected event in sessionStorage so the detail page can retrieve and display it
    try {
        sessionStorage.setItem('selectedEvent', JSON.stringify(event));
    } catch (e) {
        console.warn('Could not store event in sessionStorage', e);
    }
    // Navigate to the event detail page
    window.location.href = 'event-detail.html';
}

// Handle Add Event
function handleAddEvent() {
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const sport = document.getElementById('eventSport').value;
    const teams = document.getElementById('eventTeams').value;
    const venue = document.getElementById('eventVenue').value;
    const description = document.getElementById('eventDescription').value;
    
    // Validation
    if (!date || !time || !sport || !teams) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new event
    const newEvent = {
        id: Date.now(),
        date: date,
        time: time,
        sport: sport,
        teams: teams,
        venue: venue || 'TBD',
        description: description
    };
    
    // Add to events array
    events.push(newEvent);

    // Persist only user-added events to localStorage
    try {
        const stored = JSON.parse(localStorage.getItem('events') || '[]');
        if (Array.isArray(stored)) {
            stored.push(newEvent);
            localStorage.setItem('events', JSON.stringify(stored));
        } else {
            localStorage.setItem('events', JSON.stringify([newEvent]));
        }
    } catch (e) {
        console.warn('Could not persist event to localStorage', e);
        try { localStorage.setItem('events', JSON.stringify([newEvent])); } catch (e2) {/* ignore */}
    }

    // Clear form
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    document.getElementById('eventSport').value = '';
    document.getElementById('eventTeams').value = '';
    document.getElementById('eventVenue').value = '';
    document.getElementById('eventDescription').value = '';
    
    // Navigate to calendar and render
    const eventDate = new Date(date);
    currentDate = eventDate;
    renderCalendar();
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}