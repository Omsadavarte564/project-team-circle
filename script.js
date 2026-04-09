// ================= STATE =================
let selectedChips = [];
let currentResult = null;
let patientQueue = [];
let reminders = [];
let selectedHospital = null;
let ambulanceRunning = false;

let currentUserRole = null;
let currentUserName = '';

const AUTH_STORAGE_KEY = 'medreach_auth_users_v1';
const DATA_STORAGE_KEY = 'medreach_app_data_v2';

const portalAccess = {
  patient: {
    label: 'Patient Portal',
    pages: ['home', 'patient-dashboard', 'symptom', 'book-session', 'emergency', 'reminder']
  },
  doctor: {
    label: 'Doctor Portal',
    pages: ['home', 'doctor-dashboard', 'queue', 'emergency']
  }
};

const defaultCredentials = {
  doctor: [{ username: 'doctor', password: 'doctor123' }],
  patient: [{ username: 'patient', password: 'patient123' }]
};

const conditionLabels = {
  chest_pain: 'Chest Pain',
  fever: 'Fever',
  headache: 'Headache',
  cough: 'Cough & Cold',
  breathlessness: 'Breathlessness',
  stomach_pain: 'Stomach Pain',
  dizziness: 'Dizziness',
  back_pain: 'Back Pain',
  skin_rash: 'Skin Rash',
  vomiting: 'Vomiting / Nausea'
};

const specialtyByCondition = {
  chest_pain: 'Cardiology',
  fever: 'General Medicine',
  headache: 'Neurology',
  cough: 'General Medicine',
  breathlessness: 'Pulmonology',
  stomach_pain: 'Gastroenterology',
  dizziness: 'Neurology',
  back_pain: 'Orthopedics',
  skin_rash: 'Dermatology',
  vomiting: 'Gastroenterology'
};

const doctorsDirectory = [
  {
    id: 'dr-aisha',
    name: 'Dr. Aisha Khan',
    specialties: ['General Medicine', 'Pulmonology'],
    rating: 4.8,
    experience: 12,
    hospital: 'City General Hospital'
  },
  {
    id: 'dr-vikram',
    name: 'Dr. Vikram Patel',
    specialties: ['Cardiology', 'General Medicine'],
    rating: 4.9,
    experience: 15,
    hospital: 'District Hospital'
  },
  {
    id: 'dr-neha',
    name: 'Dr. Neha Sharma',
    specialties: ['Dermatology', 'General Medicine'],
    rating: 4.7,
    experience: 10,
    hospital: 'Rural Health Clinic'
  },
  {
    id: 'dr-arun',
    name: 'Dr. Arun Menon',
    specialties: ['Gastroenterology', 'General Medicine'],
    rating: 4.6,
    experience: 11,
    hospital: 'City General Hospital'
  },
  {
    id: 'dr-priya',
    name: 'Dr. Priya Iyer',
    specialties: ['Neurology', 'Orthopedics'],
    rating: 4.8,
    experience: 13,
    hospital: 'District Hospital'
  }
];

let authUsers = loadAuthUsers();
let appData = loadAppData();
patientQueue = Array.isArray(appData.queue) ? [...appData.queue] : [];

function byId(id) {
  return document.getElementById(id);
}

function normalizeUsers(input) {
  const normalized = { doctor: [], patient: [] };

  ['doctor', 'patient'].forEach((role) => {
    const roleItems = input && input[role];
    const items = Array.isArray(roleItems) ? roleItems : [];

    items.forEach((item) => {
      const username = item && typeof item.username === 'string' ? item.username.trim().toLowerCase() : '';
      const password = item && typeof item.password === 'string' ? item.password : '';

      if (username && password) {
        normalized[role].push({ username, password });
      }
    });
  });

  return normalized;
}

function mergeDefaultUsers(existingUsers) {
  const merged = {
    doctor: [...existingUsers.doctor],
    patient: [...existingUsers.patient]
  };

  ['doctor', 'patient'].forEach((role) => {
    defaultCredentials[role].forEach((account) => {
      const alreadyPresent = merged[role].some((u) => u.username === account.username);
      if (!alreadyPresent) {
        merged[role].push({ ...account });
      }
    });
  });

  return merged;
}

function loadAuthUsers() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return mergeDefaultUsers({ doctor: [], patient: [] });
    }

    const parsed = JSON.parse(raw);
    const cleaned = normalizeUsers(parsed);
    return mergeDefaultUsers(cleaned);
  } catch (error) {
    return mergeDefaultUsers({ doctor: [], patient: [] });
  }
}

function saveAuthUsers() {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUsers));
  } catch (error) {
    // Keep app functional even if localStorage is not available.
  }
}

function defaultAppData() {
  return {
    queue: [],
    visits: [],
    checkedPatients: [],
    bookings: [],
    doctorReviews: [],
    remindersByUser: {},
    patientProfiles: {}
  };
}

function loadAppData() {
  const fallback = defaultAppData();
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return {
      queue: Array.isArray(parsed && parsed.queue) ? parsed.queue : [],
      visits: Array.isArray(parsed && parsed.visits) ? parsed.visits : [],
      checkedPatients: Array.isArray(parsed && parsed.checkedPatients) ? parsed.checkedPatients : [],
      bookings: Array.isArray(parsed && parsed.bookings) ? parsed.bookings : [],
      doctorReviews: Array.isArray(parsed && parsed.doctorReviews) ? parsed.doctorReviews : [],
      remindersByUser:
        parsed && typeof parsed.remindersByUser === 'object' && parsed.remindersByUser !== null
          ? parsed.remindersByUser
          : {},
      patientProfiles:
        parsed && typeof parsed.patientProfiles === 'object' && parsed.patientProfiles !== null
          ? parsed.patientProfiles
          : {}
    };
  } catch (error) {
    return fallback;
  }
}

function saveAppData() {
  try {
    appData.queue = [...patientQueue];
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData));
  } catch (error) {
    // Ignore persistence errors gracefully.
  }
}

function findUser(role, username) {
  const safeRole = role === 'doctor' ? 'doctor' : 'patient';
  const safeUsername = (username || '').trim().toLowerCase();
  return authUsers[safeRole].find((u) => u.username === safeUsername) || null;
}

function getConditionLabel(conditionKey) {
  return conditionLabels[conditionKey] || 'General Condition';
}

function getDoctorById(doctorId) {
  return doctorsDirectory.find((d) => d.id === doctorId) || null;
}

function formatSessionDate(dateStr, timeStr) {
  if (!dateStr) {
    return 'Date not set';
  }

  const safeTime = timeStr || '00:00';
  const dt = new Date(`${dateStr}T${safeTime}`);
  if (Number.isNaN(dt.getTime())) {
    return `${dateStr} ${timeStr || ''}`.trim();
  }

  return dt.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function bookingStatusClass(status) {
  const safe = (status || '').toLowerCase();
  if (safe === 'approved') return 'status-approved';
  if (safe === 'completed') return 'status-completed';
  if (safe === 'rejected') return 'status-rejected';
  return 'status-pending';
}

function setPatientProfile(patch) {
  if (!currentUserName) {
    return;
  }

  const existing =
    typeof appData.patientProfiles[currentUserName] === 'object' && appData.patientProfiles[currentUserName] !== null
      ? appData.patientProfiles[currentUserName]
      : {};

  appData.patientProfiles[currentUserName] = {
    ...existing,
    ...patch
  };
  saveAppData();
}

function getPatientProfile(username) {
  if (!username) {
    return {};
  }
  const profile = appData.patientProfiles[username];
  return typeof profile === 'object' && profile !== null ? profile : {};
}

function loadRemindersForUser(username) {
  if (!username) {
    return [];
  }

  const source = appData.remindersByUser && appData.remindersByUser[username];
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item) => ({
    id: item.id,
    name: item.name,
    time: item.time,
    freq: item.freq,
    notes: item.notes || '',
    done: !!item.done
  }));
}

function persistRemindersForCurrentUser() {
  if (currentUserRole !== 'patient' || !currentUserName) {
    return;
  }

  appData.remindersByUser[currentUserName] = reminders.map((r) => ({ ...r }));
  saveAppData();
}

function setFormMessage(id, message, type) {
  const el = byId(id);
  if (!el) {
    return;
  }

  el.textContent = message || '';
  if (!message) {
    el.style.color = '';
    return;
  }

  if (type === 'error') {
    el.style.color = 'var(--critical)';
  } else if (type === 'warning') {
    el.style.color = 'var(--warning)';
  } else {
    el.style.color = 'var(--accent)';
  }
}

function isElementRoleAllowed(el, role) {
  const roleAttr = el.getAttribute('data-role');
  if (!roleAttr) {
    return true;
  }

  return roleAttr
    .split(',')
    .map((value) => value.trim())
    .includes(role);
}

function hasPageAccess(pageId) {
  if (!currentUserRole || !portalAccess[currentUserRole]) {
    return false;
  }

  return portalAccess[currentUserRole].pages.includes(pageId);
}

function setLoginError(message) {
  const errorEl = byId('loginError');
  if (!errorEl) {
    return;
  }

  errorEl.textContent = message || '';
}

function setRegisterError(message) {
  const errorEl = byId('registerError');
  if (!errorEl) {
    return;
  }

  errorEl.textContent = message || '';
}

function clearSymptomSelection() {
  selectedChips = [];
  document.querySelectorAll('#additionalChips .chip').forEach((chip) => {
    chip.classList.remove('selected');
  });

  const resultCard = byId('resultCard');
  const noResult = byId('noResult');
  if (resultCard) {
    resultCard.classList.remove('show');
  }
  if (noResult) {
    noResult.style.display = '';
  }
}

function applyPortalVisibility() {
  if (!currentUserRole || !portalAccess[currentUserRole]) {
    return;
  }

  const label = byId('portalLabel');
  if (label) {
    const userSuffix = currentUserName ? ` - ${currentUserName}` : '';
    label.textContent = `${portalAccess[currentUserRole].label}${userSuffix}`;
  }

  document.querySelectorAll('.nav-tab').forEach((tab) => {
    const allowed = isElementRoleAllowed(tab, currentUserRole);
    tab.style.display = allowed ? '' : 'none';
    tab.classList.remove('active');
  });

  document.querySelectorAll('.module-card[data-role]').forEach((card) => {
    const allowed = isElementRoleAllowed(card, currentUserRole);
    card.style.display = allowed ? '' : 'none';
  });

  const queueControls = byId('queueControls');
  if (queueControls) {
    queueControls.style.display = currentUserRole === 'doctor' ? 'flex' : 'none';
  }

  const allowedPages = portalAccess[currentUserRole].pages;
  document.querySelectorAll('.page').forEach((page) => {
    const pageId = page.id.replace('page-', '');
    const allowed = allowedPages.includes(pageId);
    page.style.display = allowed ? '' : 'none';
    page.classList.remove('active');
  });
}

function registerUser(event) {
  if (event) {
    event.preventDefault();
  }

  const roleEl = byId('registerRole');
  const usernameEl = byId('registerUsername');
  const passwordEl = byId('registerPassword');
  const confirmEl = byId('registerConfirmPassword');

  const role = roleEl ? roleEl.value : '';
  const username = usernameEl ? usernameEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const confirmPassword = confirmEl ? confirmEl.value : '';

  if (!role || !username || !password || !confirmPassword) {
    setRegisterError('Please complete all registration fields.');
    return;
  }

  if (username.length < 3) {
    setRegisterError('Username must be at least 3 characters.');
    return;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    setRegisterError('Username can contain only letters, numbers, dot, underscore, and hyphen.');
    return;
  }

  if (password.length < 6) {
    setRegisterError('Password must be at least 6 characters.');
    return;
  }

  if (password !== confirmPassword) {
    setRegisterError('Password and confirm password do not match.');
    return;
  }

  if (findUser(role, username)) {
    setRegisterError('This username already exists for selected role.');
    return;
  }

  const safeRole = role === 'doctor' ? 'doctor' : 'patient';
  authUsers[safeRole].push({
    username: username.toLowerCase(),
    password
  });
  saveAuthUsers();

  if (roleEl) {
    roleEl.value = 'patient';
  }
  if (usernameEl) {
    usernameEl.value = '';
  }
  if (passwordEl) {
    passwordEl.value = '';
  }
  if (confirmEl) {
    confirmEl.value = '';
  }

  const loginRoleEl = byId('loginRole');
  const loginUsernameEl = byId('loginUsername');

  if (loginRoleEl) {
    loginRoleEl.value = safeRole;
  }
  if (loginUsernameEl) {
    loginUsernameEl.value = username;
  }

  setRegisterError('');
  setLoginError('Registration successful. Please login with your new account.');
  showToast('Registration successful.', 'success');
}

function loginUser(event) {
  if (event) {
    event.preventDefault();
  }

  const roleEl = byId('loginRole');
  const usernameEl = byId('loginUsername');
  const passwordEl = byId('loginPassword');

  const role = roleEl ? roleEl.value : '';
  const username = usernameEl ? usernameEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';

  if (!role || !username || !password) {
    setLoginError('Please select role and enter username and password.');
    return;
  }

  authUsers = loadAuthUsers();
  appData = loadAppData();
  patientQueue = Array.isArray(appData.queue) ? [...appData.queue] : [];

  const matchedUser = findUser(role, username);
  const valid = matchedUser && matchedUser.password === password;

  if (!valid) {
    setLoginError('Invalid login. Please check credentials or register a new account.');
    showToast('Invalid credentials.', 'error');
    return;
  }

  currentUserRole = role;
  currentUserName = matchedUser.username;
  reminders = currentUserRole === 'patient' ? loadRemindersForUser(currentUserName) : [];

  setLoginError('');
  setRegisterError('');
  setFormMessage('bookingMsg', '', 'info');
  setFormMessage('patientReviewMsg', '', 'info');

  if (passwordEl) {
    passwordEl.value = '';
  }

  const loginScreen = byId('loginScreen');
  const app = byId('app');
  if (loginScreen) {
    loginScreen.classList.add('hidden');
  }
  if (app) {
    app.classList.remove('hidden');
  }

  applyPortalVisibility();
  renderQueue();
  renderReminders();
  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();
  goPage('home');
  showToast(`${portalAccess[role].label} login successful.`, 'success');
}

function logoutUser() {
  persistRemindersForCurrentUser();

  currentUserRole = null;
  currentUserName = '';
  reminders = [];
  clearSymptomSelection();

  const app = byId('app');
  const loginScreen = byId('loginScreen');
  if (app) {
    app.classList.add('hidden');
  }
  if (loginScreen) {
    loginScreen.classList.remove('hidden');
  }

  const roleEl = byId('loginRole');
  const usernameEl = byId('loginUsername');
  const passwordEl = byId('loginPassword');

  if (roleEl) {
    roleEl.value = 'patient';
  }
  if (usernameEl) {
    usernameEl.value = '';
  }
  if (passwordEl) {
    passwordEl.value = '';
  }

  setLoginError('');
  setRegisterError('');
  setFormMessage('bookingMsg', '', 'info');
  setFormMessage('patientReviewMsg', '', 'info');
  showToast('Logged out successfully.', 'info');
}

function bindAuthForms() {
  const loginForm = byId('loginForm');
  if (loginForm && !loginForm.dataset.boundSubmit) {
    loginForm.addEventListener('submit', loginUser);
    loginForm.dataset.boundSubmit = '1';
  }

  const registerForm = byId('registerForm');
  if (registerForm && !registerForm.dataset.boundSubmit) {
    registerForm.addEventListener('submit', registerUser);
    registerForm.dataset.boundSubmit = '1';
  }
}

function ensureDoctorAccess(actionText) {
  if (currentUserRole === 'doctor') {
    return true;
  }

  showToast(`Doctor login required to ${actionText}.`, 'error');
  return false;
}

// ================= NAVIGATION =================
function goPage(id) {
  if (!currentUserRole) {
    showToast('Please login first.', 'error');
    return;
  }

  if (!hasPageAccess(id)) {
    showToast('This page is not available in your portal.', 'error');
    return;
  }

  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach((tab) => tab.classList.remove('active'));

  const pageEl = byId('page-' + id);
  if (pageEl) {
    pageEl.classList.add('active');
  }

  const activeTab = document.querySelector(`.nav-tab[data-page="${id}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  if (id === 'queue') {
    renderQueue();
  }
  if (id === 'reminder') {
    renderReminders();
  }
  if (id === 'doctor-dashboard') {
    renderDoctorDashboard();
  }
  if (id === 'book-session') {
    renderBookSessionPage();
  }
  if (id === 'patient-dashboard') {
    renderPatientDashboard();
  }
}

// ================= SYMPTOM CHECKER =================
const symptomsDB = {
  chest_pain: {
    name: 'Possible Cardiac Event',
    severity: 'critical',
    desc: 'Chest pain can indicate serious cardiac conditions including angina or myocardial infarction. Requires immediate medical evaluation.',
    medicines: ['Aspirin 325mg', 'Nitroglycerine (sublingual)', 'Clopidogrel'],
    rec: '🚨 SEEK EMERGENCY CARE IMMEDIATELY. Call an ambulance. Do not drive yourself. Chew aspirin (if not allergic) while waiting for help.'
  },
  fever: {
    name: 'Viral / Bacterial Fever',
    severity: 'medium',
    desc: 'Fever indicates the body is fighting an infection. Could be viral (common cold, flu) or bacterial in origin.',
    medicines: ['Paracetamol 500mg', 'Ibuprofen 400mg', 'ORS Solution', 'Vitamin C'],
    rec: '⚠️ Rest and stay hydrated. Take paracetamol every 6 hours if temp > 38.5°C. Visit doctor if fever persists more than 3 days or exceeds 40°C.'
  },
  headache: {
    name: 'Tension / Migraine Headache',
    severity: 'low',
    desc: 'Most headaches are tension-type related to stress or dehydration. Persistent or severe headaches may indicate other conditions.',
    medicines: ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Naproxen'],
    rec: '✅ Drink water, rest in a quiet dark room. Over-the-counter pain relievers usually suffice. Consult doctor if headache is sudden, severe, or accompanied by vision changes.'
  },
  cough: {
    name: 'Upper Respiratory Infection',
    severity: 'low',
    desc: 'Common cough and cold symptoms typically caused by rhinovirus or other viral pathogens. Usually resolves in 7–10 days.',
    medicines: ['Cetrizine 10mg', 'Ambroxol Syrup', 'Honey & Ginger', 'Vitamin C 500mg'],
    rec: '✅ Stay warm and hydrated. Steam inhalation helps. Honey with warm water soothes throat. See doctor if cough persists > 2 weeks or blood is present.'
  },
  breathlessness: {
    name: 'Respiratory Distress',
    severity: 'critical',
    desc: 'Difficulty breathing can indicate asthma, pneumonia, pulmonary embolism, or cardiac issues. Requires urgent evaluation.',
    medicines: ['Salbutamol Inhaler', 'Prednisolone 5mg', 'Oxygen supplementation'],
    rec: '🚨 URGENT: Seek medical help immediately. Sit upright, use rescue inhaler if prescribed. Call ambulance if breathing worsens.'
  },
  stomach_pain: {
    name: 'Gastrointestinal Disorder',
    severity: 'medium',
    desc: 'Abdominal pain may range from indigestion to appendicitis. Location and character of pain are important diagnostic clues.',
    medicines: ['Pantoprazole 40mg', 'Domperidone 10mg', 'ORS', 'Antacid Syrup'],
    rec: '⚠️ Avoid spicy/oily food. Eat light meals. Visit doctor if pain is severe, right-sided lower, or accompanied by fever/vomiting.'
  },
  dizziness: {
    name: 'Vertigo / Hypotension',
    severity: 'medium',
    desc: 'Dizziness can result from low blood pressure, dehydration, inner ear problems (vertigo), or anemia.',
    medicines: ['ORS Solution', 'Betahistine 16mg', 'Iron Supplement'],
    rec: '⚠️ Sit or lie down immediately. Drink fluids. Avoid sudden positional changes. Seek medical care if dizziness is severe or recurrent.'
  },
  back_pain: {
    name: 'Musculoskeletal Back Pain',
    severity: 'low',
    desc: 'Most back pain is mechanical — related to muscles, ligaments, or disc problems. Usually improves with rest and physiotherapy.',
    medicines: ['Ibuprofen 400mg', 'Diclofenac Gel', 'Muscle Relaxant (Cyclobenzaprine)'],
    rec: '✅ Apply heat/cold pack. Gentle stretching helps. Avoid heavy lifting. See doctor if pain radiates to legs or is accompanied by numbness.'
  },
  skin_rash: {
    name: 'Allergic Dermatitis / Eczema',
    severity: 'low',
    desc: 'Skin rashes commonly result from allergies, contact dermatitis, insect bites, or viral infections like chickenpox.',
    medicines: ['Cetrizine 10mg', 'Calamine Lotion', 'Hydrocortisone Cream 1%'],
    rec: '✅ Avoid known allergens. Apply calamine lotion for itching. See doctor if rash is spreading rapidly, painful, or with fever.'
  },
  vomiting: {
    name: 'Gastroenteritis / Food Poisoning',
    severity: 'medium',
    desc: 'Nausea and vomiting often indicate gastroenteritis, food poisoning, or viral infections. Key concern is dehydration.',
    medicines: ['ORS Solution', 'Ondansetron 4mg', 'Domperidone 10mg', 'Probiotics'],
    rec: '⚠️ Sip ORS/water frequently to prevent dehydration. Eat bland food (BRAT diet). Seek care if vomiting persists > 24hrs or blood is present.'
  }
};

function toggleChip(el, val) {
  el.classList.toggle('selected');
  if (selectedChips.includes(val)) {
    selectedChips = selectedChips.filter((value) => value !== val);
  } else {
    selectedChips.push(val);
  }
}

function analyzeSymptoms() {
  if (!hasPageAccess('symptom')) {
    showToast('This action is available in Patient Portal.', 'error');
    return;
  }

  const primaryEl = byId('primarySymptom');
  const nameEl = byId('patientName');
  const ageEl = byId('patientAge');

  const primary = primaryEl ? primaryEl.value : '';
  const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : 'Patient';

  if (!primary) {
    showToast('Please select a primary symptom.', 'error');
    return;
  }

  const data = symptomsDB[primary];
  if (!data) {
    showToast('Selected symptom is not available.', 'error');
    return;
  }

  currentResult = {
    name,
    data,
    primary,
    chips: [...selectedChips],
    age: ageEl ? ageEl.value : ''
  };

  // Severity override based on extra chips
  let severity = data.severity;
  if ((selectedChips.includes('palpitations') || selectedChips.includes('high_temp')) && severity === 'low') {
    severity = 'medium';
  }
  if (selectedChips.includes('palpitations') && primary === 'chest_pain') {
    severity = 'critical';
  }
  currentResult.severity = severity;

  const badgeMap = {
    critical: '<div class="severity-badge severity-critical">🔴 Critical — Seek Immediate Help</div>',
    medium: '<div class="severity-badge severity-medium">🟡 Medium — See Doctor Today</div>',
    low: '<div class="severity-badge severity-low">🟢 Low — Home Care Likely Sufficient</div>'
  };

  const severityEl = byId('severityBadge');
  const conditionNameEl = byId('conditionName');
  const conditionDescEl = byId('conditionDesc');
  const medicinesListEl = byId('medicinesList');
  const recommendationEl = byId('recommendation');
  const resultCard = byId('resultCard');
  const noResult = byId('noResult');

  if (severityEl) {
    severityEl.innerHTML = badgeMap[severity];
  }
  if (conditionNameEl) {
    conditionNameEl.textContent = data.name;
  }
  if (conditionDescEl) {
    conditionDescEl.textContent = data.desc;
  }
  if (medicinesListEl) {
    medicinesListEl.innerHTML = data.medicines.map((m) => `<li class="med-chip">💊 ${m}</li>`).join('');
  }
  if (recommendationEl) {
    recommendationEl.textContent = data.rec;
  }
  if (resultCard) {
    resultCard.classList.add('show');
  }
  if (noResult) {
    noResult.style.display = 'none';
  }

  setPatientProfile({
    lastCondition: primary,
    lastConditionName: data.name,
    lastSeverity: severity,
    lastAnalyzedAt: new Date().toISOString(),
    patientDisplayName: name
  });

  showToast('Analysis complete.', 'success');
}

function recordVisit(patientObj) {
  appData.visits.unshift({
    ...patientObj,
    visitedAt: new Date().toISOString()
  });
  saveAppData();
}

function markPatientChecked(patientObj) {
  appData.checkedPatients.unshift({
    ...patientObj,
    checkedAt: new Date().toISOString(),
    checkedBy: currentUserName || 'doctor',
    doctorName: patientObj.doctorName || currentUserName || 'Doctor'
  });
  saveAppData();
}

function addToQueue() {
  if (!currentResult) {
    showToast('Analyze symptoms first.', 'error');
    return;
  }

  const p = {
    id: Date.now(),
    patientUsername: currentUserRole === 'patient' ? currentUserName : null,
    name: currentResult.name || 'Patient',
    condition: currentResult.data.name,
    severity: currentResult.severity,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wait: currentResult.severity === 'critical' ? 'Immediate' : currentResult.severity === 'medium' ? '~15 min' : '~30 min'
  };

  if (currentResult.severity === 'critical') {
    patientQueue.unshift(p);
  } else {
    patientQueue.push(p);
  }

  patientQueue.sort((a, b) => {
    const order = { critical: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  recordVisit(p);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  renderPatientDashboard();

  if (hasPageAccess('queue')) {
    showToast(`${p.name} added to queue.`, 'success');
    goPage('queue');
    return;
  }

  showToast(`${p.name} added to queue. Doctor will view it in Doctor Portal.`, 'success');
}

function addSamplePatient() {
  if (!ensureDoctorAccess('add sample patients')) {
    return;
  }

  const samples = [
    { name: 'Ravi Kumar', condition: 'Viral Fever', severity: 'low' },
    { name: 'Sunita Devi', condition: 'Chest Pain', severity: 'critical' },
    { name: 'Mohan Lal', condition: 'Stomach Pain', severity: 'medium' },
    { name: 'Priya Singh', condition: 'Headache', severity: 'low' },
    { name: 'Arjun Patel', condition: 'Breathlessness', severity: 'critical' }
  ];

  const sample = samples[Math.floor(Math.random() * samples.length)];
  const p = {
    id: Date.now(),
    patientUsername: null,
    name: sample.name,
    condition: sample.condition,
    severity: sample.severity,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wait: sample.severity === 'critical' ? 'Immediate' : sample.severity === 'medium' ? '~15 min' : '~30 min'
  };

  patientQueue.push(p);
  patientQueue.sort((a, b) => {
    const order = { critical: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  recordVisit(p);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  showToast(`${p.name} added.`, 'info');
}

function callNextPatient() {
  if (!ensureDoctorAccess('call the next patient')) {
    return;
  }

  if (patientQueue.length === 0) {
    showToast('Queue is empty.', 'error');
    return;
  }

  const p = patientQueue.shift();
  markPatientChecked(p);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast(`Calling ${p.name} — ${p.condition}`, 'success');
}

function renderQueue() {
  const list = byId('queueList');
  if (!list) {
    return;
  }

  if (patientQueue.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:40px;font-size:14px;">No patients in queue. Use the Symptom Checker to add patients.</div>';
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

  if (!patientName || !patientAge || !disease || !doctorId || !date || !time) {
    setFormMessage('bookingMsg', 'Please fill all required fields.', 'error');
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
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

function populatePatientReviewDoctors() {
  const select = byId('patientReviewDoctor');
  const hint = byId('patientReviewHint');
  if (!select) {
    return;
  }

  const doctorMap = {};

  appData.checkedPatients
    .filter((entry) => entry.patientUsername === currentUserName)
    .forEach((entry) => {
      const checkedBy = (entry.checkedBy || '').trim();
      if (!checkedBy) {
        return;
      }

      const matchedDoctor =
        doctorsDirectory.find((doctor) => doctor.username === checkedBy) ||
        doctorsDirectory.find((doctor) => doctor.name === checkedBy);

      const doctorId = entry.doctorId || (matchedDoctor ? matchedDoctor.id : checkedBy);
      const doctorName = entry.doctorName || (matchedDoctor ? matchedDoctor.name : `Dr. ${checkedBy}`);

      if (!doctorMap[doctorId]) {
        doctorMap[doctorId] = {
          id: doctorId,
          name: doctorName
        };
      }
    });

  const doctors = Object.keys(doctorMap).map((key) => doctorMap[key]);

  if (doctors.length === 0) {
    select.innerHTML = '<option value="">No checked doctor yet</option>';
    select.disabled = true;
    if (hint) {
      hint.textContent = 'You can review a doctor after the doctor has checked you.';
    }
    return;
  }

  select.disabled = false;
  if (hint) {
    hint.textContent = 'Only doctors who have already checked you are listed here.';
  }
  select.innerHTML = doctors
    .map((doctor) => `<option value="${doctor.id}">${doctor.name}</option>`)
    .join('');
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
  const ratingEl = byId('patientReviewRating');
  const commentEl = byId('patientReviewComment');

  const doctorId = doctorEl ? doctorEl.value : '';
  const rating = ratingEl ? Number(ratingEl.value) : 0;
  const comment = commentEl ? commentEl.value.trim() : '';

  if (!doctorId || !rating || !comment) {
    setFormMessage('patientReviewMsg', 'Please select a checked doctor, rating, and comment.', 'error');
    return;
  }

  const checkedDoctorEntry = appData.checkedPatients.find((entry) => {
    if (entry.patientUsername !== currentUserName) {
      return false;
    }

    const checkedBy = (entry.checkedBy || '').trim();
    const matchedDoctor =
      doctorsDirectory.find((doctorItem) => doctorItem.username === checkedBy) ||
      doctorsDirectory.find((doctorItem) => doctorItem.name === checkedBy);
    const entryDoctorId = entry.doctorId || (matchedDoctor ? matchedDoctor.id : checkedBy);

    return entryDoctorId === doctorId;
  });

  if (!checkedDoctorEntry) {
    setFormMessage('patientReviewMsg', 'You can only review a doctor who has checked you.', 'error');
    return;
  }

  const doctor = getDoctorById(doctorId);
  const doctorName = checkedDoctorEntry.doctorName || (doctor ? doctor.name : '');

  const profile = getPatientProfile(currentUserName);
  const patientName = profile.patientDisplayName || currentUserName || 'Patient';

  const review = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    patientUsername: currentUserName,
    patientName,
    doctorId,
    doctorName: doctorName || `Dr. ${checkedDoctorEntry.checkedBy || 'Doctor'}`,
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
        <div class="stack-item-sub">${new Date(review.createdAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
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
        <div class="stack-item-sub">${getReviewComment(review) || 'No written comment.'}</div>
        <div class="stack-item-sub">${new Date(review.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</div>
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

function renderPatientTips() {
  const list = byId('patientTipsList');
  if (!list) {
    return;
  }

  const tips = [];
  const totalReminders = reminders.length;
  const doneReminders = reminders.filter((r) => r.done).length;
  const completionRate = totalReminders ? (doneReminders / totalReminders) * 100 : 0;

  if (totalReminders === 0) {
    tips.push('Add medicine reminders to improve treatment adherence.');
  } else if (completionRate < 50) {
    tips.push('Your medicine adherence is below 50%. Try fixed dose times and keep reminder notes.');
  } else {
    tips.push('Great adherence so far. Keep following your medicine schedule.');
  }

  const profile = getPatientProfile(currentUserName);
  if (profile.lastCondition) {
    tips.push(`For ${getConditionLabel(profile.lastCondition)}, monitor symptoms and stay hydrated.`);
  }

  const pendingBookings = appData.bookings.filter(
    (b) => b.patientUsername === currentUserName && (b.status === 'Pending' || b.status === 'Approved')
  ).length;

  if (pendingBookings > 0) {
    tips.push(`You have ${pendingBookings} active session request(s). Keep your phone available for updates.`);
  } else {
    tips.push('Book a follow-up session if symptoms continue for more than 2-3 days.');
  }

  list.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join('');
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
  populatePatientReviewDoctors();
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

  const names = ['City General Hospital selected', 'Rural Health Clinic selected', 'District Hospital selected'];
  showToast(names[idx], 'info');
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
  const hospitalNames = ['City General Hospital', 'Rural Health Clinic', 'District Hospital'];
  const hospitalPositions = [
    { l: '28%', t: '32%' },
    { l: '63%', t: '65%' },
    { l: '75%', t: '28%' }
  ];

  const dot = byId('ambulanceDot');
  const status = byId('ambulanceStatus');
  const sosStatus = byId('sosStatus');

  if (!dot || !status || !sosStatus) {
    ambulanceRunning = false;
    showToast('Emergency UI is not available.', 'error');
    return;
  }

  sosStatus.innerHTML = `<span style="color:var(--critical)">🚨 Alert sent! Ambulance dispatched from ${hospitalNames[idx]}</span>`;
  dot.style.left = hospitalPositions[idx].l;
  dot.style.top = hospitalPositions[idx].t;
  dot.style.display = 'block';
  status.style.display = 'block';

  // Add to queue as critical
  const emergencyEntry = {
    id: Date.now(),
    patientUsername: currentUserRole === 'patient' ? currentUserName : null,
    name: 'SOS Patient',
    condition: 'Emergency Alert',
    severity: 'critical',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  showToast('SOS alert sent. Ambulance is on the way.', 'error');
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

function initializeApp() {
  bindAuthForms();

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
