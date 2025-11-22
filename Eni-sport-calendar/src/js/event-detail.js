function displayEventDetail() {
  try {
    const eventJson = sessionStorage.getItem('selectedEvent');
    if (!eventJson) {
      document.getElementById('eventDetail').innerHTML = '<p>No event selected. <a href="calendar.html">Back to calendar</a></p>';
      return;
    }

    const event = JSON.parse(eventJson);
    const [year, month, day] = event.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    document.getElementById("eventDetail").innerHTML = `
      <h2>${event.sport}</h2>
      <div class="detail-section">
          <h3>Teams</h3>
          <p>${event.teams}</p>
      </div>
      <div class="detail-section">
          <h3>Date & Time</h3>
          <p>${dateStr}</p>
          <p>${event.time}</p>
      </div>
      <div class="detail-section">
          <h3>Venue</h3>
          <p>${event.venue}</p>
      </div>
      <div class="detail-section">
          <h3>Description</h3>
          <p>${event.description}</p>
      </div>
    `;
  } catch (e) {
    console.error('Could not display event detail', e);
    document.getElementById('eventDetail').innerHTML = '<p>Error loading event. <a href="calendar.html">Back to calendar</a></p>';
  }
}

// Display event when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayEventDetail);
} else {
  displayEventDetail();
}
