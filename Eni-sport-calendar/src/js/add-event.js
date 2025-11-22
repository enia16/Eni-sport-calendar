function handleAddEventOnPage(e) {
  e && e.preventDefault && e.preventDefault();

  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const sport = document.getElementById('eventSport').value;
  const teams = document.getElementById('eventTeams').value;
  const venue = document.getElementById('eventVenue').value;
  const description = document.getElementById('eventDescription').value;

  if (!date || !time || !sport || !teams) {
    alert('Please fill required fields');
    return;
  }

  const newEvent = {
    id: Date.now(),
    date: date,
    time: time,
    sport: sport,
    teams: teams,
    venue: venue || 'TBD',
    description: description || ''
  };

  try {
    const stored = JSON.parse(localStorage.getItem('events') || '[]');
    if (!Array.isArray(stored)) throw new Error('Invalid stored events');
    stored.push(newEvent);
    localStorage.setItem('events', JSON.stringify(stored));
  } catch (err) {
    console.warn('Could not persist event to localStorage', err);
    // As a fallback, save a singleton array
    localStorage.setItem('events', JSON.stringify([newEvent]));
  }

  // Simple UX: redirect back to calendar (calendar.html). The calendar will read localStorage and show the new event.
  window.location.href = 'calendar.html';
}

// Wire up when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('submitEvent');
    if (btn) btn.addEventListener('click', handleAddEventOnPage);
  });
} else {
  const btn = document.getElementById('submitEvent');
  if (btn) btn.addEventListener('click', handleAddEventOnPage);
}
