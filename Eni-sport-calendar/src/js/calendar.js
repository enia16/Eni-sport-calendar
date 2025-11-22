let currentDate = new Date();
let currentFilter = ''; // Empty string means show all sports
let events = [
  {
    id: 1,
    date: "2025-07-18",
    time: "18:30",
    sport: "Football",
    teams: "Salzburg vs. Sturm",
    venue: "Red Bull Arena",
    description: "Austrian Football League match",
  },
  {
    id: 2,
    date: "2025-10-23",
    time: "09:45",
    sport: "Ice Hockey",
    teams: "KAC vs. Capitals",
    venue: "Stadthalle Klagenfurt",
    description: "Championship game",
  },
  {
    id: 3,
    date: "2025-11-21",
    time: "15:00",
    sport: "Basketball",
    teams: "Lakers vs. Bulls",
    venue: "Staples Center",
    description: "NBA game",
  },
];

function loadStoredEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem('events') || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      // Append stored events to in-memory events, avoiding duplicate ids
      const seen = new Set(events.map(e => e.id));
      stored.forEach(s => {
        if (!seen.has(s.id)) {
          events.push(s);
          seen.add(s.id);
        }
      });
    }
  } catch (e) {
    console.warn('Could not load stored events from localStorage', e);
  }
}

function init() {
  console.log("Initializing...");
  loadStoredEvents();
  populateSportFilter();
  setupEventListeners();
  renderCalendar();
  console.log("Initialization complete");
}

function populateSportFilter() {
  // Get unique sports from all events
  const sports = [...new Set(events.map(e => e.sport))].sort();
  const filterSelect = document.getElementById('sportFilter');
  if (!filterSelect) return;
  
  // Add sport options (keep "All Sports" first)
  sports.forEach(sport => {
    const option = document.createElement('option');
    option.value = sport;
    option.textContent = sport;
    filterSelect.appendChild(option);
  });
}

function setupEventListeners() {
  const prevMonth = document.getElementById("prevMonth");
  if (prevMonth) prevMonth.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };
  const nextMonth = document.getElementById("nextMonth");
  if (nextMonth) nextMonth.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };
  
  // Sport filter listener
  const sportFilter = document.getElementById('sportFilter');
  if (sportFilter) {
    sportFilter.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderCalendar();
    });
  }
}

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

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  document.getElementById("monthYear").textContent = months[month] + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = createDayCell(year, month, day);
    grid.appendChild(cell);
  }
}

function createDayCell(year, month, day) {
  const dateStr =
    year +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0");
  // Filter events by date and apply sport filter
  let dayEvents = events.filter((e) => e.date === dateStr);
  if (currentFilter) {
    dayEvents = dayEvents.filter((e) => e.sport === currentFilter);
  }

  const cell = document.createElement("div");
  cell.className = "calendar-day";

  const today = new Date();
  if (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  ) {
    cell.classList.add("today");
  }

  const num = document.createElement("div");
  num.className = "day-number";
  num.textContent = day;
  cell.appendChild(num);

  if (dayEvents.length > 0) {
    cell.classList.add("has-events");
    dayEvents.forEach((event) => {
      const marker = document.createElement("div");
      marker.className = "event-marker";
      marker.textContent = "● " + event.sport;
      marker.onclick = () => showEventDetail(event);
      cell.appendChild(marker);
    });
  }

  return cell;
}

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

function handleAddEvent() {
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const sport = document.getElementById("eventSport").value;
  const teams = document.getElementById("eventTeams").value;

  if (!date || !time || !sport || !teams) {
    alert("Please fill required fields");
    return;
  }

  const newEvent = {
    id: Date.now(),
    date: date,
    time: time,
    sport: sport,
    teams: teams,
    venue: document.getElementById("eventVenue").value || "TBD",
    description: document.getElementById("eventDescription").value || "",
  };

  events.push(newEvent);

  // Persist user-added event to localStorage (key: 'events')
  try {
    const stored = JSON.parse(localStorage.getItem('events') || '[]');
    if (Array.isArray(stored)) {
      stored.push(newEvent);
      localStorage.setItem('events', JSON.stringify(stored));
    } else {
      localStorage.setItem('events', JSON.stringify([newEvent]));
    }
  } catch (e) {
    console.warn('Could not persist new event to localStorage', e);
    try { localStorage.setItem('events', JSON.stringify([newEvent])); } catch (e2) { /* ignore */ }
  }

  // Clear form fields if present
  const f = (id) => { const el = document.getElementById(id); if (el) el.value = ''; };
  f('eventDate');
  f('eventTime');
  f('eventSport');
  f('eventTeams');
  f('eventVenue');
  f('eventDescription');

  currentDate = new Date(date);
  renderCalendar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
