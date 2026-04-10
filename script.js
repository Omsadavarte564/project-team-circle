= '<div style="color:var(--text-muted);text-align:center;padding:40px;font-size:14px;">No patients in queue. Use the Symptom Checker to add patients.</div>';
  } else {
    list.innerHTML = patientQueue
      .map((p, i) => `
      <div class="queue-item priority-${p.severity}">
        <div class="queue-num">#${i + 1}</div>
        <div class="queue-info">
          <div class="queue-name">${p.name}</div>
          <div class="queue-detail">${p.condition} &middot; ${p.severity.charAt(0).toUpperCase() + p.severity.slice(1)} Priority</div>
        </div>
        <div class="queue-time">
          <div style="color:${p.severity === 'critical' ? 'var(--critical)' : p.severity === 'medium' ? 'var(--warning)' : 'var(--safe)'};">${p.wait}</div>
          <div>Added ${p.time}</div>
        </div>
      </div>
    `)
      .join('');
  }

  const total = byId('stat-total');
  const critical = byId('stat-critical');
  const medium = byId('stat-medium');
  const low = byId('stat-low');

  if (total) {
    total.textContent = patientQueue.length;
  }
  if (critical) {
    critical.textContent = patientQueue.filter((p) => p.severity === 'critical').length;
  }
  if (medium) {
    medium.textContent = patientQueue.filter((p) => p.severity === 'medium').length;
  }
  if (low) {
    low.textContent = patientQueue.filter((p) => p.severity === 'low').length;
  }
}

// ================= BOOKINGS / DASHBOARDS =================
function populateDoctorOptions() {
  const bookingDoctor = byId('bookingDoctor');
  if (!bookingDoctor) {
    return;
  }

  bookingDoctor.innerHTML = doctorsDirectory
    .map((doctor) => {
      const specialty = doctor.specialties[0] || 'General Medicine';
      return `<option value="${doctor.id}">${doctor.name} — ${specialty} (${doctor.rating.toFixed(1)}★)</option>`;
    })
    .join('');
}

function bookDoctorSession(event) {
  if (event) {
    event.preventDefault();
  }

  if (!hasPageAccess('book-session')) {
    showToast('This action is available in Patient Portal.', 'error');
    return;
  }

  const patientNameEl = byId('bookingPatientName');
  const patientAgeEl = byId('bookingPatientAge');
  const diseaseEl = byId('bookingDisease');
  const doctorEl = byId('bookingDoctor');
  const dateEl = byId('bookingDate');
  const timeEl = byId('bookingTime');
  const notesEl = byId('bookingNotes');

  const patientName = patientNameEl ? patientNameEl.value.trim() : '';
  const patientAge = patientAgeEl ? patientAgeEl.value : '';
  const disease = diseaseEl ? diseaseEl.value : '';
  const doctorId = doctorEl ? doctorEl.value : '';
  const date = dateEl ? dateEl.value : '';
  const time = timeEl ? timeEl.value : '';
  const notes = notesEl ? notesEl.value.trim() : '';
  const patientAccount = findUser('patient', currentUserName);
  const patientProfile = getPatientProfile(currentUserName);
  const patientPhone = (patientAccount && patientAccount.phone) || patientProfile.contactPhone || '';
  const patientEmail = (patientAccount && patientAccount.email) || patientProfile.contactEmail || '';
  const patientState = (patientAccount && patientAccount.state) || patientProfile.state || '';
  const patientAddress = (patientAccount && patientAccount.address) || patientProfile.address || '';

  if (!patientName || !patientAge || !disease || !doctorId || !date || !time) {
    setFormMessage('bookingMsg', 'Please fill all required fields.', 'error');
    return;
  }

  if (!patientPhone || !patientEmail) {
    setFormMessage('bookingMsg', 'Patient contact details are missing. Please update registration details.', 'error');
    return;
  }

  const doctor = getDoctorById(doctorId);
  if (!doctor) {
    setFormMessage('bookingMsg', 'Selected doctor not found.', 'error');
    return;
  }

  const booking = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    patientUsername: currentUserName,
    patientName,
    patientAge: Number(patientAge),
    disease,
    doctorId,
    doctorName: doctor.name,
    date,
    time,
    notes,
    patientPhone,
    patientEmail,
    patientState,
    patientAddress,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  appData.bookings.unshift(booking);
  setPatientProfile({ patientDisplayName: patientName });
  saveAppData();

  if (notesEl) {
    notesEl.value = '';
  }
  setFormMessage('bookingMsg', 'Session registered successfully. Doctor will review your request.', 'success');

  renderBookSessionPage();
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast('Session registration submitted.', 'success');
}

function updateBookingStatus(bookingId, status) {
  if (!ensureDoctorAccess('update session status')) {
    return;
  }

  const booking = appData.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    showToast('Booking not found.', 'error');
    return;
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  saveAppData();

  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();
  showToast(`Booking marked as ${status}.`, 'info');
}

function addBookingToQueue(bookingId) {
  if (!ensureDoctorAccess('add booked patient to queue')) {
    return;
  }

  const booking = appData.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    showToast('Booking not found.', 'error');
    return;
  }

  const entry = {
    id: Date.now(),
    patientUsername: booking.patientUsername || null,
    name: booking.patientName,
    condition: getConditionLabel(booking.disease),
    severity: 'medium',
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: '~15 min'
  };

  patientQueue.push(entry);
  patientQueue.sort((a, b) => {
    const order = { critical: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  recordVisit(entry);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast(`${entry.name} moved to queue.`, 'success');
}

function renderPatientBookingList() {
  const list = byId('patientBookingList');
  if (!list) {
    return;
  }

  if (!currentUserName) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">Login as patient to view your bookings.</div></div>';
    return;
  }

  const rows = appData.bookings.filter((b) => b.patientUsername === currentUserName);
  if (rows.length === 0) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">No session requests yet.</div></div>';
    return;
  }

  list.innerHTML = rows
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((b) => `
      <div class="stack-item">
        <div class="stack-item-title">${b.doctorName}</div>
        <div class="stack-item-sub">${getConditionLabel(b.disease)} · ${formatSessionDate(b.date, b.time)}</div>
        <span class="status-badge ${bookingStatusClass(b.status)}">${b.status}</span>
      </div>
    `)
    .join('');
}

function renderDoctorBookingList() {
  const list = byId('doctorBookingList');
  if (!list) {
    return;
  }

  if (appData.bookings.length === 0) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">No session registrations available.</div></div>';
    return;
  }

  const ordered = appData.bookings
    .slice()
    .sort((a, b) => {
      const rank = { Pending: 0, Approved: 1, Completed: 2, Rejected: 3 };
      const left = rank[a.status] !== undefined ? rank[a.status] : 9;
      const right = rank[b.status] !== undefined ? rank[b.status] : 9;
      return left - right || (a.createdAt < b.createdAt ? 1 : -1);
    });

  list.innerHTML = ordered
    .map((b) => {
      const actions = [];
      if (b.status === 'Pending') {
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Approved')">Approve</button>`);
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Rejected')">Reject</button>`);
      }
      if (b.status === 'Approved') {
        actions.push(`<button class="btn-mini" onclick="addBookingToQueue(${b.id})">Add To Queue</button>`);
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Completed')">Mark Done</button>`);
      }

      return `
        <div class="stack-item">
          <div class="stack-item-title">${b.patientName} · ${b.patientAge} yrs</div>
          <div class="stack-item-sub">${getConditionLabel(b.disease)} · ${b.doctorName}</div>
          <div class="stack-item-sub">Contact: ${b.patientPhone || 'N/A'} · ${b.patientEmail || 'N/A'}</div>
          <div class="stack-item-sub">Address: ${[b.patientAddress, b.patientState].filter(Boolean).join(', ') || 'N/A'}</div>
          ${b.notes ? `<div class="stack-item-sub">Notes: ${b.notes}</div>` : ''}
          <div class="stack-item-sub">${formatSessionDate(b.date, b.time)}</div>
          <span class="status-badge ${bookingStatusClass(b.status)}">${b.status}</span>
          ${actions.length ? `<div class="stack-actions">${actions.join('')}</div>` : ''}
        </div>
      `;
    })
    .join('');
}

function renderBookSessionPage() {
  populateDoctorOptions();

  const dateEl = byId('bookingDate');
  if (dateEl) {
    dateEl.min = new Date().toISOString().split('T')[0];
  }

  const patientNameEl = byId('bookingPatientName');
  if (patientNameEl && currentUserRole === 'patient' && !patientNameEl.value.trim()) {
    const profile = getPatientProfile(currentUserName);
    patientNameEl.value = profile.patientDisplayName || currentUserName;
  }

  renderPatientBookingList();
}

function populatePatientReviewSessions() {
  const sessionSelect = byId('patientReviewSession');
  if (!sessionSelect) {
    return;
  }

  if (!currentUserName) {
    sessionSelect.innerHTML = '<option value="">Login as patient</option>';
    return;
  }

  const sessions = appData.bookings
    .filter((booking) => booking.patientUsername === currentUserName)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (sessions.length === 0) {
    sessionSelect.innerHTML = '<option value="">No sessions available</option>';
    return;
  }

  const previousValue = sessionSelect.value;
  sessionSelect.innerHTML = sessions
    .map(
      (booking) =>
        `<option value="${booking.id}">${booking.doctorName} · ${getConditionLabel(booking.disease)} · ${formatSessionDate(
          booking.date,
          booking.time
        )}</option>`
    )
    .join('');

  const hasPrevious = sessions.some((booking) => String(booking.id) === String(previousValue));
  sessionSelect.value = hasPrevious ? previousValue : String(sessions[0].id);
}

function syncReviewDoctorWithSession() {
  const sessionSelect = byId('patientReviewSession');
  const doctorSelect = byId('patientReviewDoctor');
  if (!sessionSelect || !doctorSelect || !sessionSelect.value) {
    return;
  }

  const bookingId = Number(sessionSelect.value);
  const booking = appData.bookings.find(
    (item) => item.id === bookingId && item.patientUsername === currentUserName
  );
  if (booking && booking.doctorId) {
    doctorSelect.value = booking.doctorId;
  }
}

function populatePatientReviewDoctors() {
  const select = byId('patientReviewDoctor');
  if (!select) {
    return;
  }

  const doctorMap = {};

  appData.bookings
    .filter((booking) => booking.patientUsername === currentUserName)
    .forEach((booking) => {
      if (!booking.doctorId) {
        return;
      }
      if (!doctorMap[booking.doctorId]) {
        doctorMap[booking.doctorId] = {
          id: booking.doctorId,
          name: booking.doctorName || (getDoctorById(booking.doctorId) || {}).name || 'Doctor'
        };
      }
    });

  doctorsDirectory.forEach((doctor) => {
    if (!doctorMap[doctor.id]) {
      doctorMap[doctor.id] = { id: doctor.id, name: doctor.name };
    }
  });

  const doctors = Object.keys(doctorMap).map((key) => doctorMap[key]);

  if (doctors.length === 0) {
    select.innerHTML = '<option value="">No doctors available</option>';
    return;
  }

  const previousValue = select.value;
  select.innerHTML = doctors
    .map((doctor) => `<option value="${doctor.id}">${doctor.name}</option>`)
    .join('');
  const hasPrevious = doctors.some((doctor) => doctor.id === previousValue);
  select.value = hasPrevious ? previousValue : doctors[0].id;
  syncReviewDoctorWithSession();
}

function savePatientReview(event) {
  if (event) {
    event.preventDefault();
  }

  if (!hasPageAccess('patient-dashboard')) {
    showToast('Patient login required to submit review.', 'error');
    return;
  }

  const doctorEl = byId('patientReviewDoctor');
  const sessionEl = byId('patientReviewSession');
  const ratingEl = byId('patientReviewRating');
  const commentEl = byId('patientReviewComment');

  const doctorId = doctorEl ? doctorEl.value : '';
  const sessionBookingId = sessionEl ? Number(sessionEl.value) : 0;
  const rating = ratingEl ? Number(ratingEl.value) : 0;
  const comment = commentEl ? commentEl.value.trim() : '';

  if (!sessionBookingId || !doctorId || !rating || !comment) {
    setFormMessage('patientReviewMsg', 'Please select session, doctor, rating, and comment.', 'error');
    return;
  }

  const booking = appData.bookings.find(
    (item) => item.id === sessionBookingId && item.patientUsername === currentUserName
  );
  if (!booking) {
    setFormMessage('patientReviewMsg', 'Selected session is not available.', 'error');
    return;
  }

  const finalDoctorId = booking.doctorId || doctorId;
  const doctor = getDoctorById(finalDoctorId);
  if (!doctor) {
    setFormMessage('patientReviewMsg', 'Selected doctor is not available.', 'error');
    return;
  }

  const profile = getPatientProfile(currentUserName);
  const patientName = profile.patientDisplayName || currentUserName || 'Patient';

  const review = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    patientUsername: currentUserName,
    patientName,
    sessionBookingId,
    doctorId: finalDoctorId,
    doctorName: doctor.name,
    disease: booking.disease,
    sessionDate: booking.date,
    sessionTime: booking.time,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };

  appData.doctorReviews.unshift(review);
  saveAppData();

  if (commentEl) commentEl.value = '';
  if (ratingEl) {
    ratingEl.value = '5';
  }

  setFormMessage('patientReviewMsg', 'Thanks. Your review has been submitted.', 'success');
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast('Review submitted.', 'success');
}

function getReviewDoctorName(review) {
  if (review && review.doctorName) {
    return review.doctorName;
  }

  if (review && review.doctorId) {
    const doctor = getDoctorById(review.doctorId);
    if (doctor) {
      return doctor.name;
    }
  }

  if (review && review.doctorUsername) {
    return `Dr. ${review.doctorUsername}`;
  }

  return 'Doctor';
}

function getReviewComment(review) {
  if (!review) {
    return '';
  }
  return review.comment || review.notes || review.prescription || '';
}

function renderDoctorReviewList() {
  const list = byId('doctorReviewList');
  if (!list) {
    return;
  }

  if (appData.doctorReviews.length === 0) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">No patient reviews submitted yet.</div></div>';
    return;
  }

  list.innerHTML = appData.doctorReviews
    .slice(0, 8)
    .map((review) => `
      <div class="stack-item">
        <div class="stack-item-title">${getReviewDoctorName(review)} · ${Number(review.rating || 0)}/5</div>
        <div class="stack-item-sub">By ${review.patientName || 'Patient'}</div>
        <div class="stack-item-sub">${getReviewComment(review) || 'No written comment.'}</div>
        <div class="stack-item-sub">${new Date(review.createdAt).toLocaleString(getCurrentLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        <span class="status-badge status-approved">Patient Feedback</span>
      </div>
    `)
    .join('');
}

function renderPatientReviewList() {
  const list = byId('patientReviewList');
  if (!list) {
    return;
  }

  if (!currentUserName) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">Login as patient to see reviews.</div></div>';
    return;
  }

  const rows = appData.doctorReviews.filter((r) => r.patientUsername === currentUserName);
  if (rows.length === 0) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">You have not submitted any doctor reviews yet.</div></div>';
    return;
  }

  list.innerHTML = rows
    .slice(0, 6)
    .map((review) => `
      <div class="stack-item">
        <div class="stack-item-title">${getReviewDoctorName(review)}</div>
        <div class="stack-item-sub">${getConditionLabel(review.disease || '')}${review.sessionDate ? ` · ${formatSessionDate(review.sessionDate, review.sessionTime)}` : ''}</div>
        <div class="stack-item-sub">${getReviewComment(review) || 'No written comment.'}</div>
        <div class="stack-item-sub">${new Date(review.createdAt).toLocaleDateString(getCurrentLocale(), { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        <span class="status-badge status-approved">${Number(review.rating || 0)}/5</span>
      </div>
    `)
    .join('');
}

function renderDoctorStats() {
  const visitedEl = byId('doc-stat-visited');
  const checkedEl = byId('doc-stat-checked');
  const pendingEl = byId('doc-stat-pending');
  const ratingEl = byId('doc-stat-rating');

  const visited = appData.visits.length;
  const checked = appData.checkedPatients.length;
  const pendingSessions = appData.bookings.filter((b) => b.status === 'Pending' || b.status === 'Approved').length;
  const reviews = appData.doctorReviews;
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;

  if (visitedEl) visitedEl.textContent = visited;
  if (checkedEl) checkedEl.textContent = checked;
  if (pendingEl) pendingEl.textContent = pendingSessions;
  if (ratingEl) ratingEl.textContent = avgRating.toFixed(1);
}

function renderDoctorDashboard() {
  renderDoctorStats();
  renderDoctorBookingList();
}

function scoreDoctorForCondition(doctor, conditionKey) {
  const specialtyNeeded = specialtyByCondition[conditionKey] || 'General Medicine';
  const hasSpecialty = doctor.specialties.includes(specialtyNeeded);
  const base = doctor.rating * 10 + doctor.experience;
  return base + (hasSpecialty ? 25 : 0);
}

function renderBestDoctorList(conditionKey) {
  const list = byId('bestDoctorList');
  if (!list) {
    return;
  }

  const safeCondition = conditionKey && conditionKey !== 'auto' ? conditionKey : 'fever';
  const targetSpecialty = specialtyByCondition[safeCondition] || 'General Medicine';

  const ranked = doctorsDirectory
    .slice()
    .sort((a, b) => scoreDoctorForCondition(b, safeCondition) - scoreDoctorForCondition(a, safeCondition))
    .slice(0, 3);

  list.innerHTML = ranked
    .map((doctor, index) => {
      const match = doctor.specialties.includes(targetSpecialty) ? 'Best match' : 'Alternative';
      return `
        <div class="stack-item">
          <div class="stack-item-title">#${index + 1} ${doctor.name}</div>
          <div class="stack-item-sub">${doctor.specialties.join(', ')}</div>
          <div class="stack-item-sub">${doctor.hospital} · ${doctor.experience} yrs exp · ${doctor.rating.toFixed(1)}★</div>
          <span class="status-badge ${match === 'Best match' ? 'status-approved' : 'status-pending'}">${match}</span>
        </div>
      `;
    })
    .join('');
}

function suggestBestDoctors() {
  if (!hasPageAccess('patient-dashboard')) {
    showToast('This action is available in Patient Portal.', 'error');
    return;
  }

  const selector = byId('suggestCondition');
  let selected = selector ? selector.value : 'auto';

  if (selected === 'auto') {
    const profile = getPatientProfile(currentUserName);
    selected = profile.lastCondition || 'fever';
  }

  renderBestDoctorList(selected);
}

function renderQueue() {
  const list = byId('queueList');
  if (!list) {
    return;
  }

  if (patientQueue.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:40px;font-size:14px;">No patients in queue. Use the Symptom Checker or Add Patient to add patients.</div>';
    return;
  }

  list.innerHTML = patientQueue
    .map((p, idx) => {
      return `
        <div class="queue-item ${p.severity}">
          <div class="queue-num">${idx + 1}</div>
          <div class="queue-main">
            <div class="queue-name"><strong>Name:</strong> ${p.name}</div>
            <div class="queue-cond"><strong>Disease:</strong> ${p.condition}</div>
            <div class="queue-meta">
              <span class="queue-severity">${p.severity.toUpperCase()}</span>
              <span class="queue-time">${p.time}</span>
              <span class="queue-wait">${p.wait}</span>
            </div>
            <div class="queue-case-study">
              <div><strong>Recovery/Case Study:</strong> ${p.caseStudy && p.caseStudy.recoveryDetails ? p.caseStudy.recoveryDetails : '-'}</div>
              <div style="font-size:11px;color:var(--text-muted)"><strong>Added by:</strong> ${p.caseStudy && p.caseStudy.addedBy ? p.caseStudy.addedBy : '-'} | <strong>Date:</strong> ${p.caseStudy && p.caseStudy.addedAt ? new Date(p.caseStudy.addedAt).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderPatientStats() {
  const totalRemindersEl = byId('pat-stat-reminders');
  const takenEl = byId('pat-stat-taken');
  const bookingEl = byId('pat-stat-bookings');
  const queueEl = byId('pat-stat-queue');

  const myBookings = appData.bookings.filter((b) => b.patientUsername === currentUserName);
  const myQueueEntries = appData.visits.filter((v) => v.patientUsername === currentUserName);

  if (totalRemindersEl) totalRemindersEl.textContent = reminders.length;
  if (takenEl) takenEl.textContent = reminders.filter((r) => r.done).length;
  if (bookingEl) bookingEl.textContent = myBookings.length;
  if (queueEl) queueEl.textContent = myQueueEntries.length;
}

function renderPatientDashboard() {
  populatePatientReviewSessions();
  populatePatientReviewDoctors();
  syncReviewDoctorWithSession();
  renderPatientStats();
  renderPatientReviewList();
  renderPatientTips();
  if (currentUserRole === 'patient') {
    suggestBestDoctors();
  }
}

// ================= EMERGENCY =================
function selectHospital(idx) {
  selectedHospital = idx;
  document.querySelectorAll('.hosp-card').forEach((card, i) => {
    card.classList.toggle('selected', i === idx);
  });

  const selected = hospitalNetwork[idx];
  if (selected) {
    showToast(`${selected.name} selected`, 'info');
  }
}

function triggerSOS() {
  if (!currentUserRole) {
    showToast('Please login first.', 'error');
    return;
  }

  if (ambulanceRunning) {
    showToast('Ambulance already dispatched.', 'error');
    return;
  }

  goPage('emergency');
  ambulanceRunning = true;

  const idx = selectedHospital !== null && selectedHospital !== undefined ? selectedHospital : 0;
  const hospitalNames = hospitalNetwork.map((hospital) => hospital.name);
  const hospitalPositions = [
    { l: '28%', t: '32%' },
    { l: '63%', t: '65%' },
    { l: '75%', t: '28%' }
  ];
  const safeIdx = idx >= 0 && idx < hospitalPositions.length ? idx : 0;

  const dot = byId('ambulanceDot');
  const status = byId('ambulanceStatus');
  const sosStatus = byId('sosStatus');

  if (!dot || !status || !sosStatus) {
    ambulanceRunning = false;
    showToast('Emergency UI is not available.', 'error');
    return;
  }

  const dispatchHospital = hospitalNames[safeIdx] || hospitalNames[0];
  const allHospitalsText = hospitalNames.join(', ');
  sosStatus.innerHTML = `<span style="color:var(--critical)">🚨 Alert broadcast to all hospitals: ${allHospitalsText}. Ambulance dispatched from ${dispatchHospital}.</span>`;
  dot.style.left = hospitalPositions[safeIdx].l;
  dot.style.top = hospitalPositions[safeIdx].t;
  dot.style.display = 'block';
  status.style.display = 'block';

  const profile = getPatientProfile(currentUserName);
  const emergencyPatientName =
    profile.patientDisplayName || (currentUserRole === 'patient' ? currentUserName : '') || 'SOS Patient';

  appData.emergencyRequests.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    requestedBy: currentUserName || 'unknown',
    role: currentUserRole || 'guest',
    patientName: emergencyPatientName,
    dispatchedFrom: dispatchHospital,
    notifiedHospitals: hospitalNames,
    createdAt: new Date().toISOString()
  });

  // Add to queue as critical
  const emergencyEntry = {
    id: Date.now(),
    patientUsername: currentUserRole === 'patient' ? currentUserName : null,
    name: emergencyPatientName,
    condition: 'Emergency Alert',
    severity: 'critical',
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: 'Immediate'
  };
  patientQueue.unshift(emergencyEntry);
  recordVisit(emergencyEntry);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  renderPatientDashboard();

  const waypoints = [
    { l: '40%', t: '44%' },
    { l: '48%', t: '52%' },
    { l: '50%', t: '55%' }
  ];

  const steps = ['En route 🚑 ETA: 8 min', 'Approaching 🚑 ETA: 4 min', '🚑 Arrived at your location!'];
  let step = 0;

  const interval = setInterval(() => {
    if (step >= waypoints.length) {
      clearInterval(interval);
      ambulanceRunning = false;
      status.textContent = '✅ Ambulance arrived!';

      setTimeout(() => {
        dot.style.display = 'none';
        status.style.display = 'none';
        sosStatus.textContent = '';
      }, 4000);

      showToast('Ambulance has arrived.', 'success');
      return;
    }

    dot.style.left = waypoints[step].l;
    dot.style.top = waypoints[step].t;
    status.textContent = steps[step];
    step += 1;
  }, 2000);

  showToast('SOS alert sent to all hospitals. Ambulance is on the way.', 'error');
}

// ================= REMINDERS =================
function addToReminder() {
  if (!hasPageAccess('reminder')) {
    showToast('This action is available in Patient Portal.', 'error');
    return;
  }

  if (!currentResult) {
    showToast('Analyze symptoms first.', 'error');
    return;
  }

  const meds = currentResult.data.medicines;
  meds.forEach((medicine) => {
    reminders.push({
      id: Date.now() + Math.random(),
      name: medicine,
      time: 'Morning 8:00 AM',
      freq: 'Daily',
      notes: 'As prescribed',
      done: false
    });
  });

  persistRemindersForCurrentUser();
  renderReminders();
  renderPatientDashboard();
  showToast(`${meds.length} medicines added to reminders.`, 'success');
  goPage('reminder');
}

function addReminder() {
  if (!hasPageAccess('reminder')) {
    showToast('This action is available in Patient Portal.', 'error');
    return;
  }

  const medNameEl = byId('medName');
  const medTimeEl = byId('medTime');
  const medFreqEl = byId('medFreq');
  const medNotesEl = byId('medNotes');

  const name = medNameEl ? medNameEl.value.trim() : '';
  if (!name) {
    showToast('Please enter medicine name.', 'error');
    return;
  }

  reminders.push({
    id: Date.now(),
    name,
    time: medTimeEl ? medTimeEl.value : 'Morning 8:00 AM',
    freq: medFreqEl ? medFreqEl.value : 'Daily',
    notes: medNotesEl ? medNotesEl.value : '',
    done: false
  });

  if (medNameEl) {
    medNameEl.value = '';
  }
  if (medNotesEl) {
    medNotesEl.value = '';
  }

  persistRemindersForCurrentUser();
  renderReminders();
  renderPatientDashboard();
  showToast('Reminder added.', 'success');
}

function toggleDone(id) {
  const reminder = reminders.find((r) => r.id === id);
  if (reminder) {
    reminder.done = !reminder.done;
  }
  persistRemindersForCurrentUser();
  renderReminders();
  renderPatientDashboard();
}

function deleteReminder(id) {
  reminders = reminders.filter((r) => r.id !== id);
  persistRemindersForCurrentUser();
  renderReminders();
  renderPatientDashboard();
}

function renderReminders() {
  const list = byId('reminderList');
  const count = byId('reminderCount');
  if (!list || !count) {
    return;
  }

  const done = reminders.filter((r) => r.done).length;
  count.textContent = `${done}/${reminders.length} taken today`;

  if (reminders.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:14px;padding:20px 0;text-align:center;">No reminders yet. Add your first medicine above.</div>';
    return;
  }

  list.innerHTML = reminders
    .map((r) => `
    <div class="reminder-item ${r.done ? 'done' : ''}">
      <div class="rem-icon">💊</div>
      <div class="rem-info">
        <div class="rem-name" style="${r.done ? 'text-decoration:line-through' : ''}">${r.name}</div>
        <div class="rem-time">⏰ ${r.time} · ${r.freq}${r.notes ? ' · ' + r.notes : ''}</div>
      </div>
      <button class="rem-check ${r.done ? 'checked' : ''}" onclick="toggleDone(${r.id})">✓</button>
      <button onclick="deleteReminder(${r.id})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:4px;" title="Delete">🗑</button>
    </div>
  `)
    .join('');
}

// ================= TOAST =================
function showToast(msg, type = 'info') {
  const toast = byId('toast');
  if (!toast) {
    return;
  }

  toast.textContent = msg;
  toast.className = `show ${type}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.className = '';
  }, 3000);
}

async function initializeApp() {
  bindAuthForms();
  await initializeLanguageControls();

  authUsers = loadAuthUsers();
  saveAuthUsers();

  appData = loadAppData();
  patientQueue = Array.isArray(appData.queue) ? [...appData.queue] : [];

  renderQueue();
  renderReminders();
  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();

  const loginScreen = byId('loginScreen');
  const app = byId('app');

  if (loginScreen) {
    loginScreen.classList.remove('hidden');
  }
  if (app) {
    app.classList.add('hidden');
  }
}

// ---- Init ----
initializeApp();
