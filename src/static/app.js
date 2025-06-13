document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Svuota la select prima di riempirla di nuovo
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.setAttribute("data-activity-id", name); // AGGIUNGI QUESTA RIGA

        const spotsLeft = details.max_participants - details.participants.length;

        // Sezione partecipanti (elenco puntato)
        let participantsSection = `
          <div class="participants-section">
            <strong>Partecipanti iscritti:</strong>
            ${
              details.participants.length > 0
                ? `<ul>${details.participants
                    .map(
                      (p) =>
                        `<li><span class="participant-badge">${p}</span></li>`
                    )
                    .join("")}</ul>`
                : '<p class="no-participants">Nessun partecipante ancora iscritto.</p>'
            }
          </div>
        `;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      // Scrolla sempre all'attività selezionata
      scrollToActivity(activity);

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Aggiorna la lista delle attività/partecipanti
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Funzione per scrollare all'attività
  function scrollToActivity(activityId) {
    const activityElem = document.querySelector(`[data-activity-id="${activityId}"]`);
    if (activityElem) {
      activityElem.classList.add('highlighted');
      activityElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        activityElem.classList.remove('highlighted');
      }, 2000);
    }
  }

  function showAlreadySubscribedError(activityId) {
    // Evidenzia l'attività
    const activityElem = document.querySelector(`[data-activity-id="${activityId}"]`);
    if (activityElem) {
      activityElem.classList.add('highlighted');
      // Scrolla l'elemento in vista
      activityElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Mostra il messaggio di errore
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = 'Sei già iscritto a questa attività!';
      errorDiv.style.display = 'block';
    }
  }

  // Initialize app
  fetchActivities();
});

// CSS per evidenziare
/*
.highlighted {
  background-color: #ffeeba;
  border: 2px solid #f5c518;
}
*/
