// ================= STATE =================
let selectedChips = [];
let currentResult = null;
let patientQueue = [];
let reminders = [];
let selectedHospital = null;
let ambulanceRunning = false;

let currentUserRole = null;
let currentUserName = '';
let currentUserUid = null;
let currentLanguage = 'en';

const AUTH_STORAGE_KEY = 'medreach_auth_users_v1';
const DATA_STORAGE_KEY = 'medreach_app_data_v2';
const LANGUAGE_STORAGE_KEY = 'medreach_language_pref_v1';

const languageOptions = [
  { code: 'en', locale: 'en-IN', label: 'English' },
  { code: 'hi', locale: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'mr', locale: 'mr-IN', label: 'मराठी (Marathi)' }
];

let i18nEnglish = {};
let i18nCurrent = {};
const i18nCache = {};

const uiBindings = [
  { selector: '.lang-label', key: 'common.language' },
  { selector: '.login-title', key: 'login.title' },
  { selector: '.login-sub', key: 'login.subtitle' },
  { selector: '#loginForm label[for="loginRole"]', key: 'login.role' },
  { selector: '#loginForm label[for="loginUsername"]', key: 'login.username' },
  { selector: '#loginForm label[for="loginPassword"]', key: 'login.password' },
  { selector: '#loginForm .login-btn', key: 'login.login_button' },
  { selector: '#registerPromptTitle', key: 'login.new_registration' },
  { selector: '.auth-link-row .auth-link-btn:nth-of-type(1)', key: 'login.register_patient' },
  { selector: '.auth-link-row .auth-link-btn:nth-of-type(2)', key: 'login.register_doctor' },
  { selector: '#registerFormTitle', key: 'register.patient_title' },
  { selector: '.auth-link-close', key: 'register.back_to_login' },
  { selector: '#registerForm label[for="registerRole"]', key: 'register.register_as' },
  { selector: '#registerForm label[for="registerUsername"]', key: 'register.username' },
  { selector: '#registerForm label[for="registerPassword"]', key: 'register.password' },
  { selector: '#registerForm label[for="registerConfirmPassword"]', key: 'register.confirm_password' },
  { selector: '#registerForm .auth-title:nth-of-type(2)', key: 'register.contact_details' },
  { selector: '#registerForm label[for="registerPhone"]', key: 'register.phone' },
  { selector: '#registerForm label[for="registerEmail"]', key: 'register.email' },
  { selector: '#registerForm label[for="registerState"]', key: 'register.state' },
  { selector: '#registerForm label[for="registerAddress"]', key: 'register.address' },
  { selector: '#registerForm .register-btn', key: 'register.create_account' },
  { selector: '.nav-tab[data-page="home"]', key: 'nav.home' },
  { selector: '.nav-tab[data-page="patient-dashboard"]', key: 'nav.patient_dashboard' },
  { selector: '.nav-tab[data-page="doctor-dashboard"]', key: 'nav.doctor_dashboard' },
  { selector: '.nav-tab[data-page="symptom"]', key: 'nav.symptoms' },
  { selector: '.nav-tab[data-page="queue"]', key: 'nav.queue' },
  { selector: '.nav-tab[data-page="book-session"]', key: 'nav.book_session' },
  { selector: '.nav-tab[data-page="emergency"]', key: 'nav.emergency' },
  { selector: '.nav-tab[data-page="reminder"]', key: 'nav.reminders' },
  { selector: '.emergency-btn', key: 'nav.sos' },
  { selector: '.logout-btn', key: 'common.logout' }
,
  { selector: '#page-home .hero-title', key: 'home.hero_title' },
  { selector: '#page-home .hero-sub', key: 'home.hero_sub' },
  { selector: '#homeCardTitleSymptom', key: 'home.card.symptom.title' },
  { selector: '#homeCardDescSymptom', key: 'home.card.symptom.desc' },
  { selector: '#homeCardTitleQueue', key: 'home.card.queue.title' },
  { selector: '#homeCardDescQueue', key: 'home.card.queue.desc' },
  { selector: '#homeCardTitleEmergency', key: 'home.card.emergency.title' },
  { selector: '#homeCardDescEmergency', key: 'home.card.emergency.desc' },
  { selector: '#homeCardTitleReminder', key: 'home.card.reminder.title' },
  { selector: '#homeCardDescReminder', key: 'home.card.reminder.desc' },
  { selector: '#homeCardTitleDoctorDash', key: 'home.card.doctor_dashboard.title' },
  { selector: '#homeCardDescDoctorDash', key: 'home.card.doctor_dashboard.desc' },
  { selector: '#homeCardTitlePatientDash', key: 'home.card.patient_dashboard.title' },
  { selector: '#homeCardDescPatientDash', key: 'home.card.patient_dashboard.desc' },
  { selector: '#homeCardTitleBook', key: 'home.card.book_session.title' },
  { selector: '#homeCardDescBook', key: 'home.card.book_session.desc' },

  { selector: '#patientDashboardTag', key: 'patient_dashboard.tag' },
  { selector: '#patientDashboardTitle', key: 'patient_dashboard.title' },
  { selector: '#patientDashboardSub', key: 'patient_dashboard.sub' },
  { selector: '#patStatLabelReminders', key: 'patient_dashboard.stat.reminders' },
  { selector: '#patStatLabelTaken', key: 'patient_dashboard.stat.taken' },
  { selector: '#patStatLabelBookings', key: 'patient_dashboard.stat.bookings' },
  { selector: '#patStatLabelQueue', key: 'patient_dashboard.stat.queue' },
  { selector: '#patientCardHeadBestDoctor', key: 'patient_dashboard.best_doctor.title' },
  { selector: '#page-patient-dashboard label[for="suggestCondition"]', key: 'patient_dashboard.condition_label' },
  { selector: '#suggestBestDoctorsBtn', key: 'patient_dashboard.best_doctor.button' },
  { selector: '#patientCardHeadReviewSession', key: 'patient_dashboard.review_session.title' },
  { selector: '#page-patient-dashboard label[for="patientReviewSession"]', key: 'patient_dashboard.review_session.select_session' },
  { selector: '#page-patient-dashboard label[for="patientReviewDoctor"]', key: 'patient_dashboard.review_session.select_doctor' },
  { selector: '#page-patient-dashboard label[for="patientReviewRating"]', key: 'patient_dashboard.review_session.rating' },
  { selector: '#page-patient-dashboard label[for="patientReviewComment"]', key: 'patient_dashboard.review_session.comment' },
  { selector: '#page-patient-dashboard #patientReviewForm button[type="submit"]', key: 'patient_dashboard.review_session.submit' },
  { selector: '#patientCardHeadSubmittedReviews', key: 'patient_dashboard.submitted_reviews.title' },
  { selector: '#patientCardHeadHealthTips', key: 'patient_dashboard.health_tips.title' },

  { selector: '#doctorDashboardTag', key: 'doctor_dashboard.tag' },
  { selector: '#doctorDashboardTitle', key: 'doctor_dashboard.title' },
  { selector: '#doctorDashboardSub', key: 'doctor_dashboard.sub' },
  { selector: '#docStatLabelVisited', key: 'doctor_dashboard.stat.visited' },
  { selector: '#docStatLabelChecked', key: 'doctor_dashboard.stat.checked' },
  { selector: '#docStatLabelPending', key: 'doctor_dashboard.stat.pending' },
  { selector: '#docStatLabelRating', key: 'doctor_dashboard.stat.rating' },
  { selector: '#doctorCardHeadSessionRequests', key: 'doctor_dashboard.requests.title' },

  { selector: '#symptomSectionTag', key: 'symptom.tag' },
  { selector: '#symptomSectionTitle', key: 'symptom.title' },
  { selector: '#symptomSectionSub', key: 'symptom.sub' },
  { selector: '#page-symptom label[for="patientName"]', key: 'symptom.patient_name' },
  { selector: '#page-symptom label[for="patientAge"]', key: 'symptom.age' },
  { selector: '#page-symptom label[for="primarySymptom"]', key: 'symptom.primary_symptom' },
  { selector: '#additionalSymptomsLabel', key: 'symptom.additional_symptoms' },
  { selector: '#page-symptom label[for="duration"]', key: 'symptom.duration' },
  { selector: '#page-symptom button[onclick="analyzeSymptoms()"]', key: 'symptom.analyze' },
  { selector: '#symptomSuggestedMedsLabel', key: 'symptom.suggested_medicines' },
  { selector: '#symptomRecommendationLabel', key: 'symptom.recommendation_label' },
  { selector: '#page-symptom button[onclick="addToQueue()"]', key: 'symptom.add_to_queue' },
  { selector: '#page-symptom button[onclick="addToReminder()"]', key: 'symptom.set_reminder' },

  { selector: '#queueSectionTag', key: 'queue.tag' },
  { selector: '#queueSectionTitle', key: 'queue.title' },
  { selector: '#queueSectionSub', key: 'queue.sub' },
  { selector: '#queueStatLabelTotal', key: 'queue.stat.total' },
  { selector: '#queueStatLabelCritical', key: 'queue.stat.critical' },
  { selector: '#queueStatLabelMedium', key: 'queue.stat.medium' },
  { selector: '#queueStatLabelLow', key: 'queue.stat.low' },
  { selector: '#queueHeading', key: 'queue.heading' },
  { selector: '#addPatientBtn', key: 'queue.add_patient' },
  { selector: '#callNextBtn', key: 'queue.call_next' },

  { selector: '#bookingSectionTag', key: 'booking.tag' },
  { selector: '#bookingSectionTitle', key: 'booking.title' },
  { selector: '#bookingSectionSub', key: 'booking.sub' },
  { selector: '#page-book-session label[for="bookingPatientName"]', key: 'booking.patient_name' },
  { selector: '#page-book-session label[for="bookingPatientAge"]', key: 'booking.age' },
  { selector: '#page-book-session label[for="bookingDisease"]', key: 'booking.disease' },
  { selector: '#page-book-session label[for="bookingDoctor"]', key: 'booking.preferred_doctor' },
  { selector: '#page-book-session label[for="bookingDate"]', key: 'booking.preferred_date' },
  { selector: '#page-book-session label[for="bookingTime"]', key: 'booking.preferred_time' },
  { selector: '#page-book-session label[for="bookingNotes"]', key: 'booking.notes' },
  { selector: '#page-book-session #bookingForm button[type="submit"]', key: 'booking.submit' },
  { selector: '#mySessionRequestsHeading', key: 'booking.my_requests' },

  { selector: '#emergencySectionTag', key: 'emergency.tag' },
  { selector: '#emergencySectionTitle', key: 'emergency.title' },
  { selector: '#emergencySectionSub', key: 'emergency.sub' },
  { selector: '#mapPinLabelCity', key: 'emergency.map.city_hospital_short' },
  { selector: '#mapPinLabelRural', key: 'emergency.map.rural_clinic_short' },
  { selector: '#mapPinLabelDistrict', key: 'emergency.map.district_hospital_short' },
  { selector: '#mapPinLabelYou', key: 'emergency.map.you' },
  { selector: '#legendOpenHospital', key: 'emergency.legend.open_hospital' },
  { selector: '#legendBusyClinic', key: 'emergency.legend.busy_clinic' },
  { selector: '#legendYouAmbulance', key: 'emergency.legend.you_ambulance' },
  { selector: '#nearbyFacilitiesTitle', key: 'emergency.nearby_facilities' },
  { selector: '#hospNameCity', key: 'emergency.hospital.city.name' },
  { selector: '#hospMetaCityDistance', key: 'emergency.hospital.city.distance' },
  { selector: '#hospMetaCityEta', key: 'emergency.hospital.city.eta' },
  { selector: '#hospBadgeCity', key: 'emergency.status.open' },
  { selector: '#hospNameRural', key: 'emergency.hospital.rural.name' },
  { selector: '#hospMetaRuralDistance', key: 'emergency.hospital.rural.distance' },
  { selector: '#hospMetaRuralEta', key: 'emergency.hospital.rural.eta' },
  { selector: '#hospBadgeRural', key: 'emergency.status.busy' },
  { selector: '#hospNameDistrict', key: 'emergency.hospital.district.name' },
  { selector: '#hospMetaDistrictDistance', key: 'emergency.hospital.district.distance' },
  { selector: '#hospMetaDistrictEta', key: 'emergency.hospital.district.eta' },
  { selector: '#hospBadgeDistrict', key: 'emergency.status.open' },
  { selector: '#sosButton', key: 'emergency.send_alert' },

  { selector: '#reminderSectionTag', key: 'reminder.tag' },
  { selector: '#reminderSectionTitle', key: 'reminder.title' },
  { selector: '#reminderSectionSub', key: 'reminder.sub' },
  { selector: '#addReminderHeading', key: 'reminder.add_new' },
  { selector: '#page-reminder label[for="medName"]', key: 'reminder.medicine_name' },
  { selector: '#page-reminder label[for="medTime"]', key: 'reminder.time_of_day' },
  { selector: '#page-reminder label[for="medFreq"]', key: 'reminder.frequency' },
  { selector: '#page-reminder label[for="medNotes"]', key: 'reminder.notes' },
  { selector: '#addReminderBtn', key: 'reminder.add_button' },
  { selector: '#todayScheduleHeading', key: 'reminder.today_schedule' }
];

const uiOptionBindings = [
  { selector: '#loginRole option[value="patient"]', key: 'roles.patient' },
  { selector: '#loginRole option[value="doctor"]', key: 'roles.doctor' },
  { selector: '#registerRole option[value="patient"]', key: 'roles.patient' },
  { selector: '#registerRole option[value="doctor"]', key: 'roles.doctor' },

  { selector: '#suggestCondition option[value="auto"]', key: 'patient_dashboard.best_doctor.use_latest' },
  { selector: '#suggestCondition option[value="chest_pain"]', key: 'condition.chest_pain' },
  { selector: '#suggestCondition option[value="fever"]', key: 'condition.fever' },
  { selector: '#suggestCondition option[value="headache"]', key: 'condition.headache' },
  { selector: '#suggestCondition option[value="cough"]', key: 'condition.cough' },
  { selector: '#suggestCondition option[value="breathlessness"]', key: 'condition.breathlessness' },
  { selector: '#suggestCondition option[value="stomach_pain"]', key: 'condition.stomach_pain' },
  { selector: '#suggestCondition option[value="dizziness"]', key: 'condition.dizziness' },
  { selector: '#suggestCondition option[value="back_pain"]', key: 'condition.back_pain' },
  { selector: '#suggestCondition option[value="skin_rash"]', key: 'condition.skin_rash' },
  { selector: '#suggestCondition option[value="vomiting"]', key: 'condition.vomiting' },

  { selector: '#patientReviewRating option[value="5"]', key: 'patient_dashboard.review.rating_5' },
  { selector: '#patientReviewRating option[value="4"]', key: 'patient_dashboard.review.rating_4' },
  { selector: '#patientReviewRating option[value="3"]', key: 'patient_dashboard.review.rating_3' },
  { selector: '#patientReviewRating option[value="2"]', key: 'patient_dashboard.review.rating_2' },
  { selector: '#patientReviewRating option[value="1"]', key: 'patient_dashboard.review.rating_1' },

  { selector: '#primarySymptom option[value=""]', key: 'symptom.choose_symptom' },
  { selector: '#primarySymptom option[value="chest_pain"]', key: 'condition.chest_pain' },
  { selector: '#primarySymptom option[value="fever"]', key: 'condition.fever' },
  { selector: '#primarySymptom option[value="headache"]', key: 'condition.headache' },
  { selector: '#primarySymptom option[value="cough"]', key: 'condition.cough' },
  { selector: '#primarySymptom option[value="breathlessness"]', key: 'condition.breathlessness' },
  { selector: '#primarySymptom option[value="stomach_pain"]', key: 'condition.stomach_pain' },
  { selector: '#primarySymptom option[value="dizziness"]', key: 'condition.dizziness' },
  { selector: '#primarySymptom option[value="back_pain"]', key: 'condition.back_pain' },
  { selector: '#primarySymptom option[value="skin_rash"]', key: 'condition.skin_rash' },
  { selector: '#primarySymptom option[value="vomiting"]', key: 'condition.vomiting' },

  { selector: '#duration option[value="today"]', key: 'symptom.duration.today' },
  { selector: '#duration option[value="2days"]', key: 'symptom.duration.2days' },
  { selector: '#duration option[value="week"]', key: 'symptom.duration.week' },
  { selector: '#duration option[value="more"]', key: 'symptom.duration.more' },

  { selector: '#bookingDisease option[value="chest_pain"]', key: 'condition.chest_pain' },
  { selector: '#bookingDisease option[value="fever"]', key: 'condition.fever' },
  { selector: '#bookingDisease option[value="headache"]', key: 'condition.headache' },
  { selector: '#bookingDisease option[value="cough"]', key: 'condition.cough' },
  { selector: '#bookingDisease option[value="breathlessness"]', key: 'condition.breathlessness' },
  { selector: '#bookingDisease option[value="stomach_pain"]', key: 'condition.stomach_pain' },
  { selector: '#bookingDisease option[value="dizziness"]', key: 'condition.dizziness' },
  { selector: '#bookingDisease option[value="back_pain"]', key: 'condition.back_pain' },
  { selector: '#bookingDisease option[value="skin_rash"]', key: 'condition.skin_rash' },
  { selector: '#bookingDisease option[value="vomiting"]', key: 'condition.vomiting' },

  { selector: '#medTime option[value="Morning 8:00 AM"]', key: 'reminder.time.morning' },
  { selector: '#medTime option[value="Afternoon 1:00 PM"]', key: 'reminder.time.afternoon' },
  { selector: '#medTime option[value="Evening 6:00 PM"]', key: 'reminder.time.evening' },
  { selector: '#medTime option[value="Night 10:00 PM"]', key: 'reminder.time.night' },

  { selector: '#medFreq option[value="Daily"]', key: 'reminder.freq.daily' },
  { selector: '#medFreq option[value="Twice a day"]', key: 'reminder.freq.twice' },
  { selector: '#medFreq option[value="Every alternate day"]', key: 'reminder.freq.alternate' },
  { selector: '#medFreq option[value="Weekly"]', key: 'reminder.freq.weekly' }
];

const uiHtmlBindings = [
  { selector: '#noResult', key: 'symptom.no_result_html' }
];

const fallbackEnglishPack = {
  'common.language': 'Language',
  'common.logout': 'Logout',
  'login.title': 'Secure Portal Login',
  'login.subtitle': 'Select your role to open Doctor or Patient portal.',
  'login.role': 'Login Role',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.login_button': 'Login',
  'login.new_registration': 'New Registration',
  'login.register_patient': 'Register as Patient',
  'login.register_doctor': 'Register as Doctor',
  'login.username_placeholder': 'Enter username',
  'login.password_placeholder': 'Enter password',
  'register.patient_title': 'Patient Registration',
  'register.doctor_title': 'Doctor Registration',
  'register.back_to_login': 'Back to Login',
  'register.register_as': 'Register As',
  'register.username': 'Username',
  'register.password': 'Password',
  'register.confirm_password': 'Confirm Password',
  'register.contact_details': 'Contact Details',
  'register.phone': 'Phone Number',
  'register.email': 'Email Address',
  'register.state': 'State',
  'register.address': 'Address',
  'register.create_account': 'Create Account',
  'register.username_placeholder': 'Choose username',
  'register.password_placeholder': 'Create password',
  'register.confirm_password_placeholder': 'Confirm password',
  'register.phone_placeholder': 'Enter mobile number',
  'register.email_placeholder': 'Enter email address',
  'register.state_placeholder': 'Enter state name',
  'register.address_placeholder': 'Enter address',
  'nav.home': 'Home',
  'nav.patient_dashboard': 'Patient Dashboard',
  'nav.doctor_dashboard': 'Doctor Dashboard',
  'nav.symptoms': 'Symptoms',
  'nav.queue': 'Queue',
  'nav.book_session': 'Book Session',
  'nav.emergency': 'Emergency',
  'nav.reminders': 'Reminders',
  'portal.patient': 'Patient Portal',
  'portal.doctor': 'Doctor Portal',
  'roles.patient': 'Patient',
  'roles.doctor': 'Doctor',
  'condition.chest_pain': 'Chest Pain',
  'condition.fever': 'Fever',
  'condition.headache': 'Headache',
  'condition.cough': 'Cough & Cold',
  'condition.breathlessness': 'Breathlessness',
  'condition.stomach_pain': 'Stomach Pain',
  'condition.dizziness': 'Dizziness',
  'condition.back_pain': 'Back Pain',
  'condition.skin_rash': 'Skin Rash',
  'condition.vomiting': 'Vomiting / Nausea'
};

i18nEnglish = { ...fallbackEnglishPack };
i18nCurrent = { ...fallbackEnglishPack };

const hospitalNetwork = [
  { name: 'City General Hospital', shortLabel: 'City Hospital', distance: '2.4 km', eta: '~8 min' },
  { name: 'Rural Health Clinic', shortLabel: 'Rural Clinic', distance: '4.1 km', eta: '~12 min' },
  { name: 'District Hospital', shortLabel: 'District Hosp.', distance: '7.8 km', eta: '~22 min' }
];

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

function cleanTextValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(value) {
  return (typeof value === 'string' ? value : '').replace(/[^\d+]/g, '').trim();
}

function normalizeUsers(input) {
  const normalized = { doctor: [], patient: [] };

  ['doctor', 'patient'].forEach((role) => {
    const roleItems = input && input[role];
    const items = Array.isArray(roleItems) ? roleItems : [];

    items.forEach((item) => {
      const username = item && typeof item.username === 'string' ? item.username.trim().toLowerCase() : '';
      const password = item && typeof item.password === 'string' ? item.password : '';
      const fullName = cleanTextValue(item && item.fullName);
      const phone = normalizePhone(item && item.phone);
      const email = cleanTextValue(item && item.email).toLowerCase();
      const state = cleanTextValue(item && item.state);
      const address = cleanTextValue(item && item.address);

      if (username && password) {
        normalized[role].push({
          username,
          password,
          fullName,
          phone,
          email,
          state,
          address
        });
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
    emergencyRequests: [],
    remindersByUser: {},
    patientProfiles: {},
    patientDetails: []
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
      emergencyRequests: Array.isArray(parsed && parsed.emergencyRequests) ? parsed.emergencyRequests : [],
      remindersByUser:
        parsed && typeof parsed.remindersByUser === 'object' && parsed.remindersByUser !== null
          ? parsed.remindersByUser
          : {},
      patientProfiles:
        parsed && typeof parsed.patientProfiles === 'object' && parsed.patientProfiles !== null
          ? parsed.patientProfiles
          : {},
      patientDetails: Array.isArray(parsed && parsed.patientDetails) ? parsed.patientDetails : []
    };
  } catch (error) {
    return fallback;
  }
}

function saveAppData() {
  try {
    appData.queue = [...patientQueue];
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData));

    // Also sync to Firestore (fire-and-forget)
    if (typeof fbSaveAppData === 'function') {
      fbSaveAppData(appData).catch(function(err) {
        console.warn('Firestore sync failed:', err);
      });
    }
  } catch (error) {
    // Ignore persistence errors gracefully.
  }
}

function getLanguageOption(code) {
  return languageOptions.find((item) => item.code === code) || null;
}

function getLanguageLabel(code) {
  const item = getLanguageOption(code);
  return item ? item.label : 'English';
}

function getCurrentLocale() {
  const item = getLanguageOption(currentLanguage);
  return item && item.locale ? item.locale : 'en-IN';
}

function loadLanguagePreference() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && getLanguageOption(saved)) {
      return saved;
    }
  } catch (error) {
    // Fallback to English.
  }
  return 'en';
}

function saveLanguagePreference(code) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch (error) {
    // Ignore preference persistence failure.
  }
}

function getLanguageShortName(code) {
  const option = getLanguageOption(code);
  if (!option || !option.label) {
    return 'English';
  }
  return option.label.split('(')[0].trim();
}

function buildFallbackLanguagePack(code) {
  if (code === 'en') {
    return { ...fallbackEnglishPack };
  }

  const name = getLanguageShortName(code);
  return {
    ...fallbackEnglishPack,
    'common.language': `Language (${name})`,
    'login.title': `Secure Portal Login (${name})`,
    'login.subtitle': `Select role to open Doctor or Patient portal. (${name})`,
    'nav.home': `Home (${name})`,
    'nav.patient_dashboard': `Patient Dashboard (${name})`,
    'nav.doctor_dashboard': `Doctor Dashboard (${name})`,
    'nav.emergency': `Emergency (${name})`
  };
}

async function loadLanguagePack(code) {
  const safeCode = getLanguageOption(code) ? code : 'en';
  if (i18nCache[safeCode]) {
    return i18nCache[safeCode];
  }

  try {
    const response = await fetch(`i18n/${safeCode}.json`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load i18n/${safeCode}.json`);
    }
    const payload = await response.json();
    const normalized = payload && typeof payload === 'object' ? payload : {};
    i18nCache[safeCode] = {
      ...buildFallbackLanguagePack(safeCode),
      ...normalized
    };
    return i18nCache[safeCode];
  } catch (error) {
    console.warn(`Language file load failed for ${safeCode}`, error);
    i18nCache[safeCode] = buildFallbackLanguagePack(safeCode);
    return i18nCache[safeCode];
  }
}

function interpolate(template, vars = {}) {
  if (typeof template !== 'string') {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

function t(key, vars = {}) {
  const fromCurrent = i18nCurrent[key];
  const fromEnglish = i18nEnglish[key];
  const raw = fromCurrent !== undefined ? fromCurrent : fromEnglish !== undefined ? fromEnglish : key;
  return interpolate(raw, vars);
}

function translatedOrNull(key, vars = {}) {
  const value = t(key, vars);
  return value === key ? null : value;
}

function setTextIfPresent(selector, text) {
  if (text === undefined || text === null) {
    return;
  }
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = String(text);
  });
}

function setHtmlIfPresent(selector, htmlText) {
  if (htmlText === undefined || htmlText === null) {
    return;
  }
  document.querySelectorAll(selector).forEach((el) => {
    el.innerHTML = String(htmlText);
  });
}

function setPlaceholderIfPresent(selector, text) {
  if (typeof text !== 'string') {
    return;
  }
  document.querySelectorAll(selector).forEach((el) => {
    el.setAttribute('placeholder', text);
  });
}

function setNavButtonText(page, textKey) {
  const buttons = document.querySelectorAll(`.nav-tab[data-page="${page}"]`);
  if (!buttons.length) {
    return;
  }
  const defaultIcons = {
    home: '🏠',
    'patient-dashboard': '📊',
    'doctor-dashboard': '📈',
    symptom: '🩺',
    queue: '🏥',
    'book-session': '🗓',
    emergency: '🚑',
    reminder: '💊'
  };
  buttons.forEach((button) => {
    const current = button.textContent || '';
    const emojiMatch = current.match(/^[^\p{L}\p{N}\s]+/u);
    const icon = emojiMatch ? emojiMatch[0].trim() : defaultIcons[page] || '';
    button.textContent = icon ? `${icon} ${t(textKey)}` : t(textKey);
  });
}

function refreshDashboardNavbarLanguage() {
  setNavButtonText('patient-dashboard', 'nav.patient_dashboard');
  setNavButtonText('doctor-dashboard', 'nav.doctor_dashboard');

  setTextIfPresent('#patientDashboardTag', t('patient_dashboard.tag'));
  setTextIfPresent('#patientDashboardTitle', t('patient_dashboard.title'));
  setTextIfPresent('#patientDashboardSub', t('patient_dashboard.sub'));
  setTextIfPresent('#doctorDashboardTag', t('doctor_dashboard.tag'));
  setTextIfPresent('#doctorDashboardTitle', t('doctor_dashboard.title'));
  setTextIfPresent('#doctorDashboardSub', t('doctor_dashboard.sub'));
}

function applyLanguageToStaticUI() {
  uiBindings.forEach((binding) => {
    setTextIfPresent(binding.selector, t(binding.key));
  });

  uiOptionBindings.forEach((binding) => {
    setTextIfPresent(binding.selector, t(binding.key));
  });

  uiHtmlBindings.forEach((binding) => {
    setHtmlIfPresent(binding.selector, t(binding.key));
  });

  setNavButtonText('home', 'nav.home');
  setNavButtonText('patient-dashboard', 'nav.patient_dashboard');
  setNavButtonText('doctor-dashboard', 'nav.doctor_dashboard');
  setNavButtonText('symptom', 'nav.symptoms');
  setNavButtonText('queue', 'nav.queue');
  setNavButtonText('book-session', 'nav.book_session');
  setNavButtonText('emergency', 'nav.emergency');
  setNavButtonText('reminder', 'nav.reminders');
  refreshDashboardNavbarLanguage();

  setPlaceholderIfPresent('#loginUsername', t('login.username_placeholder'));
  setPlaceholderIfPresent('#loginPassword', t('login.password_placeholder'));
  setPlaceholderIfPresent('#registerUsername', t('register.username_placeholder'));
  setPlaceholderIfPresent('#registerPassword', t('register.password_placeholder'));
  setPlaceholderIfPresent('#registerConfirmPassword', t('register.confirm_password_placeholder'));
  setPlaceholderIfPresent('#registerPhone', t('register.phone_placeholder'));
  setPlaceholderIfPresent('#registerEmail', t('register.email_placeholder'));
  setPlaceholderIfPresent('#registerState', t('register.state_placeholder'));
  setPlaceholderIfPresent('#registerAddress', t('register.address_placeholder'));
  setPlaceholderIfPresent('#patientReviewComment', t('patient_dashboard.review.comment_placeholder'));
  setPlaceholderIfPresent('#patientName', t('symptom.patient_name_placeholder'));
  setPlaceholderIfPresent('#patientAge', t('symptom.age_placeholder'));
  setPlaceholderIfPresent('#bookingPatientName', t('booking.patient_name_placeholder'));
  setPlaceholderIfPresent('#bookingPatientAge', t('booking.age_placeholder'));
  setPlaceholderIfPresent('#bookingNotes', t('booking.notes_placeholder'));
  setPlaceholderIfPresent('#medName', t('reminder.medicine_name_placeholder'));
  setPlaceholderIfPresent('#medNotes', t('reminder.notes_placeholder'));

  setTextIfPresent('#additionalChips .chip:nth-of-type(1)', `😴 ${t('symptom.chip.fatigue')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(2)', `💧 ${t('symptom.chip.sweating')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(3)', `🤢 ${t('symptom.chip.nausea')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(4)', `🌡️ ${t('symptom.chip.high_temp')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(5)', `😮 ${t('symptom.chip.sore_throat')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(6)', `🦴 ${t('symptom.chip.body_ache')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(7)', `🍽️ ${t('symptom.chip.loss_appetite')}`);
  setTextIfPresent('#additionalChips .chip:nth-of-type(8)', `❤️ ${t('symptom.chip.palpitations')}`);

  document.title = t('app.title');

  portalAccess.patient.label = t('portal.patient');
  portalAccess.doctor.label = t('portal.doctor');
  applyPortalVisibility();

  syncRegisterRoleTitle();
}

async function applyTranslationsForLanguage(code) {
  i18nEnglish = await loadLanguagePack('en');

  i18nCurrent = code === 'en' ? i18nEnglish : await loadLanguagePack(code);
  applyLanguageToStaticUI();
}

function localizeConditionLabels() {
  const map = {
    chest_pain: t('condition.chest_pain'),
    fever: t('condition.fever'),
    headache: t('condition.headache'),
    cough: t('condition.cough'),
    breathlessness: t('condition.breathlessness'),
    stomach_pain: t('condition.stomach_pain'),
    dizziness: t('condition.dizziness'),
    back_pain: t('condition.back_pain'),
    skin_rash: t('condition.skin_rash'),
    vomiting: t('condition.vomiting')
  };

  Object.keys(conditionLabels).forEach((key) => {
    if (map[key]) {
      conditionLabels[key] = map[key];
    }
  });
}

function syncLanguageSelectors(code) {
  ['loginLanguageSelect', 'appLanguageSelect'].forEach((id) => {
    const select = byId(id);
    if (select) {
      select.value = code;
    }
  });
}

function populateLanguageSelectors() {
  const optionsHtml = languageOptions.map((item) => `<option value="${item.code}">${item.label}</option>`).join('');
  ['loginLanguageSelect', 'appLanguageSelect'].forEach((id) => {
    const select = byId(id);
    if (!select) {
      return;
    }
    select.innerHTML = optionsHtml;
  });
}

async function setLanguage(code, notify = true) {
  const safeCode = getLanguageOption(code) ? code : 'en';
  currentLanguage = safeCode;
  document.documentElement.setAttribute('lang', safeCode === 'en' ? 'en' : safeCode);
  saveLanguagePreference(safeCode);
  syncLanguageSelectors(safeCode);
  await applyTranslationsForLanguage(safeCode);
  localizeConditionLabels();
  renderQueue();
  renderReminders();
  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();
  refreshDashboardNavbarLanguage();

  // Update AI Doctor section labels
  if (typeof updateAILabels === 'function') {
    updateAILabels();
  }

  if (notify) {
    showToast(t('common.language_changed', { language: getLanguageLabel(safeCode) }), 'info');
  }
}

async function initializeLanguageControls() {
  currentLanguage = loadLanguagePreference();
  populateLanguageSelectors();
  syncLanguageSelectors(currentLanguage);
  document.documentElement.setAttribute('lang', currentLanguage === 'en' ? 'en' : currentLanguage);

  ['loginLanguageSelect', 'appLanguageSelect'].forEach((id) => {
    const select = byId(id);
    if (!select || select.dataset.boundChange) {
      return;
    }
    select.addEventListener('change', async (event) => {
      await setLanguage(event.target.value, true);
    });
    select.dataset.boundChange = '1';
  });

  await applyTranslationsForLanguage(currentLanguage);
  localizeConditionLabels();
}

function findUser(role, username) {
  const safeRole = role === 'doctor' ? 'doctor' : 'patient';
  const safeUsername = (username || '').trim().toLowerCase();
  return authUsers[safeRole].find((u) => u.username === safeUsername) || null;
}

function getCurrentAuthUser() {
  if (!currentUserRole || !currentUserName) {
    return null;
  }
  return findUser(currentUserRole, currentUserName);
}

function getConditionLabel(conditionKey) {
  return conditionLabels[conditionKey] || t('common.general_condition');
}

function getSpecialtyLabel(specialty) {
  const map = {
    Cardiology: 'specialty.cardiology',
    'General Medicine': 'specialty.general_medicine',
    Neurology: 'specialty.neurology',
    Pulmonology: 'specialty.pulmonology',
    Gastroenterology: 'specialty.gastroenterology',
    Orthopedics: 'specialty.orthopedics',
    Dermatology: 'specialty.dermatology'
  };
  const key = map[specialty];
  return key ? t(key) : specialty;
}

function getBookingStatusLabel(status) {
  const map = {
    Pending: 'status.pending',
    Approved: 'status.approved',
    Completed: 'status.completed',
    Rejected: 'status.rejected'
  };
  const key = map[status];
  return key ? t(key) : status;
}

function getSeverityLabel(severity) {
  const map = {
    critical: 'severity.critical',
    medium: 'severity.medium',
    low: 'severity.low'
  };
  const key = map[severity];
  return key ? t(key) : String(severity || '').toUpperCase();
}

function getSeverityPriorityLabel(severity) {
  const map = {
    critical: 'severity.priority_critical',
    medium: 'severity.priority_medium',
    low: 'severity.priority_low'
  };
  const key = map[severity];
  return key ? t(key) : t('severity.priority_default');
}

function getWaitLabelBySeverity(severity) {
  if (severity === 'critical') return t('queue.wait.immediate');
  if (severity === 'medium') return t('queue.wait.medium');
  return t('queue.wait.low');
}

function localizeQueueWaitValue(wait, severity) {
  const normalized = String(wait || '').trim();
  if (!normalized) {
    return getWaitLabelBySeverity(severity);
  }

  const map = {
    Immediate: 'queue.wait.immediate',
    '~15 min': 'queue.wait.medium',
    '~30 min': 'queue.wait.low'
  };
  return map[normalized] ? t(map[normalized]) : normalized;
}

function localizeReminderTimeLabel(value) {
  const map = {
    'Morning 8:00 AM': 'reminder.time.morning_plain',
    'Afternoon 1:00 PM': 'reminder.time.afternoon_plain',
    'Evening 6:00 PM': 'reminder.time.evening_plain',
    'Night 10:00 PM': 'reminder.time.night_plain'
  };
  return map[value] ? t(map[value]) : value;
}

function localizeReminderFrequencyLabel(value) {
  const map = {
    Daily: 'reminder.freq.daily_plain',
    'Twice a day': 'reminder.freq.twice_plain',
    'Every alternate day': 'reminder.freq.alternate_plain',
    Weekly: 'reminder.freq.weekly_plain'
  };
  return map[value] ? t(map[value]) : value;
}

function getLocalizedHospitalName(index) {
  const keyMap = [
    'emergency.hospital.city.name_plain',
    'emergency.hospital.rural.name_plain',
    'emergency.hospital.district.name_plain'
  ];
  const key = keyMap[index];
  return key ? t(key) : (hospitalNetwork[index] && hospitalNetwork[index].name) || '';
}

function localizeHospitalNameByValue(name) {
  if (!name) {
    return '';
  }
  if (name === 'City General Hospital') return getLocalizedHospitalName(0);
  if (name === 'Rural Health Clinic') return getLocalizedHospitalName(1);
  if (name === 'District Hospital') return getLocalizedHospitalName(2);
  return name;
}

function getLocalizedSymptomData(conditionKey) {
  const base = symptomsDB[conditionKey];
  if (!base) {
    return null;
  }

  const rawMeds = t(`symptom_data.${conditionKey}.medicines`);
  const hasTranslatedMeds = typeof rawMeds === 'string' && rawMeds !== `symptom_data.${conditionKey}.medicines`;
  const medicines = hasTranslatedMeds
    ? rawMeds
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean)
    : base.medicines;

  return {
    ...base,
    name: t(`symptom_data.${conditionKey}.name`),
    desc: t(`symptom_data.${conditionKey}.desc`),
    rec: t(`symptom_data.${conditionKey}.rec`),
    medicines
  };
}

function getQueueConditionText(entry) {
  if (!entry) {
    return t('common.general_condition');
  }

  const directKey = entry.conditionKey || entry.condition;
  if (directKey === 'emergency_alert' || entry.condition === 'Emergency Alert') {
    return t('emergency.alert_condition');
  }

  const legacyNameToKey = {
    'Possible Cardiac Event': 'chest_pain',
    'Viral / Bacterial Fever': 'fever',
    'Tension / Migraine Headache': 'headache',
    'Upper Respiratory Infection': 'cough',
    'Respiratory Distress': 'breathlessness',
    'Gastrointestinal Disorder': 'stomach_pain',
    'Vertigo / Hypotension': 'dizziness',
    'Musculoskeletal Back Pain': 'back_pain',
    'Allergic Dermatitis / Eczema': 'skin_rash',
    'Gastroenteritis / Food Poisoning': 'vomiting'
  };

  if (legacyNameToKey[entry.condition]) {
    return getConditionLabel(legacyNameToKey[entry.condition]);
  }

  if (conditionLabels[directKey]) {
    return getConditionLabel(directKey);
  }

  return entry.condition || t('common.general_condition');
}

function getDoctorById(doctorId) {
  return doctorsDirectory.find((d) => d.id === doctorId) || null;
}

function formatSessionDate(dateStr, timeStr) {
  if (!dateStr) {
    return t('common.date_not_set');
  }

  const safeTime = timeStr || '00:00';
  const dt = new Date(`${dateStr}T${safeTime}`);
  if (Number.isNaN(dt.getTime())) {
    return `${dateStr} ${timeStr || ''}`.trim();
  }

  return dt.toLocaleString(getCurrentLocale(), {
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

function syncRegisterRoleTitle() {
  const titleEl = byId('registerFormTitle');
  const roleEl = byId('registerRole');
  if (!titleEl || !roleEl) {
    return;
  }

  titleEl.textContent = roleEl.value === 'doctor' ? t('register.doctor_title') : t('register.patient_title');
}

function openRegisterForm(role = 'patient') {
  const registerForm = byId('registerForm');
  const roleEl = byId('registerRole');
  if (!registerForm || !roleEl) {
    return;
  }

  roleEl.value = role === 'doctor' ? 'doctor' : 'patient';
  syncRegisterRoleTitle();
  registerForm.classList.remove('hidden');
  setRegisterError('');
}

function closeRegisterForm() {
  const registerForm = byId('registerForm');
  if (!registerForm) {
    return;
  }

  registerForm.classList.add('hidden');
  setRegisterError('');
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

async function registerUser(event) {
  if (event) {
    event.preventDefault();
  }

  const roleEl = byId('registerRole');
  const usernameEl = byId('registerUsername');
  const passwordEl = byId('registerPassword');
  const confirmEl = byId('registerConfirmPassword');
  const phoneEl = byId('registerPhone');
  const emailEl = byId('registerEmail');
  const stateEl = byId('registerState');
  const addressEl = byId('registerAddress');

  const role = roleEl ? roleEl.value : '';
  const username = usernameEl ? usernameEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const confirmPassword = confirmEl ? confirmEl.value : '';
  const phone = phoneEl ? normalizePhone(phoneEl.value) : '';
  const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
  const state = stateEl ? stateEl.value.trim() : '';
  const address = addressEl ? addressEl.value.trim() : '';

  if (!role || !username || !password || !confirmPassword || !phone || !email || !state || !address) {
    setRegisterError(t('auth.error.complete_registration_fields'));
    return;
  }

  if (username.length < 3) {
    setRegisterError(t('auth.error.username_min'));
    return;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    setRegisterError(t('auth.error.username_chars'));
    return;
  }

  if (password.length < 6) {
    setRegisterError(t('auth.error.password_min'));
    return;
  }

  if (password !== confirmPassword) {
    setRegisterError(t('auth.error.password_mismatch'));
    return;
  }

  if (phone.replace(/\D/g, '').length < 10) {
    setRegisterError(t('auth.error.phone_invalid'));
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setRegisterError(t('auth.error.email_invalid'));
    return;
  }

  // Show loading state
  const registerBtn = document.querySelector('#registerForm .register-btn');
  const originalBtnText = registerBtn ? registerBtn.textContent : '';
  if (registerBtn) {
    registerBtn.textContent = '⏳ Creating Account...';
    registerBtn.disabled = true;
  }

  const safeRole = role === 'doctor' ? 'doctor' : 'patient';

  // Register with Firebase Auth
  if (typeof fbSignUp === 'function') {
    const result = await fbSignUp(username.toLowerCase(), safeRole, password, {
      email: email,
      phone: phone,
      state: state,
      address: address,
      displayName: username
    });

    if (!result.success) {
      if (registerBtn) {
        registerBtn.textContent = originalBtnText;
        registerBtn.disabled = false;
      }
      if (result.error === 'auth/email-already-in-use') {
        setRegisterError(t('auth.error.username_exists'));
      } else if (result.error === 'auth/weak-password') {
        setRegisterError(t('auth.error.password_min'));
      } else {
        setRegisterError(result.message || 'Registration failed. Please try again.');
      }
      return;
    }
  }

  // Also keep in local authUsers for backward compatibility
  if (!findUser(safeRole, username)) {
    authUsers[safeRole].push({
      username: username.toLowerCase(),
      password,
      phone,
      email,
      state,
      address
    });
    saveAuthUsers();
  }

  if (registerBtn) {
    registerBtn.textContent = originalBtnText;
    registerBtn.disabled = false;
  }

  if (roleEl) {
    roleEl.value = safeRole;
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
  if (phoneEl) {
    phoneEl.value = '';
  }
  if (emailEl) {
    emailEl.value = '';
  }
  if (stateEl) {
    stateEl.value = '';
  }
  if (addressEl) {
    addressEl.value = '';
  }

  const loginRoleEl = byId('loginRole');
  const loginUsernameEl = byId('loginUsername');

  if (loginRoleEl) {
    loginRoleEl.value = safeRole;
  }
  if (loginUsernameEl) {
    loginUsernameEl.value = username;
  }

  closeRegisterForm();
  setRegisterError('');
  setLoginError(t('auth.success.registration_login_prompt'));
  showToast(t('auth.success.registration'), 'success');
}

async function loginUser(event) {
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
    setLoginError(t('auth.error.login_fields_required'));
    return;
  }

  // Show loading state on login button
  const loginBtn = document.querySelector('#loginForm .login-btn');
  const originalBtnText = loginBtn ? loginBtn.textContent : '';
  if (loginBtn) {
    loginBtn.textContent = '⏳ Logging in...';
    loginBtn.disabled = true;
  }

  let firebaseUid = null;
  let firebaseProfile = null;

  // Try Firebase Auth
  if (typeof fbSignIn === 'function') {
    let result = await fbSignIn(username, role, password);

    // If login fails, check if this is a default credential that needs auto-creation
    if (!result.success) {
      const isDefault = defaultCredentials[role] &&
        defaultCredentials[role].some(
          function(d) { return d.username === username.toLowerCase() && d.password === password; }
        );

      if (isDefault) {
        // Auto-create the default user in Firebase
        await fbEnsureDefaultUser(username.toLowerCase(), role, password);
        result = await fbSignIn(username, role, password);
      }

      if (!result.success) {
        if (loginBtn) {
          loginBtn.textContent = originalBtnText;
          loginBtn.disabled = false;
        }
        setLoginError(t('auth.error.invalid_login'));
        showToast(t('auth.error.invalid_credentials'), 'error');
        return;
      }
    }

    firebaseUid = result.uid;

    // Load user profile from Firestore
    firebaseProfile = await fbGetUserProfile(firebaseUid);

    // Verify role matches
    if (firebaseProfile && firebaseProfile.role && firebaseProfile.role !== role) {
      if (loginBtn) {
        loginBtn.textContent = originalBtnText;
        loginBtn.disabled = false;
      }
      await fbSignOut();
      setLoginError(t('auth.error.invalid_login'));
      showToast(t('auth.error.invalid_credentials'), 'error');
      return;
    }

    // Load app data from Firestore
    const firestoreData = await fbLoadAppData();
    if (firestoreData) {
      appData = {
        queue: Array.isArray(firestoreData.queue) ? firestoreData.queue : [],
        visits: Array.isArray(firestoreData.visits) ? firestoreData.visits : [],
        checkedPatients: Array.isArray(firestoreData.checkedPatients) ? firestoreData.checkedPatients : [],
        bookings: Array.isArray(firestoreData.bookings) ? firestoreData.bookings : [],
        doctorReviews: Array.isArray(firestoreData.doctorReviews) ? firestoreData.doctorReviews : [],
        emergencyRequests: Array.isArray(firestoreData.emergencyRequests) ? firestoreData.emergencyRequests : [],
        remindersByUser: (firestoreData.remindersByUser && typeof firestoreData.remindersByUser === 'object') ? firestoreData.remindersByUser : {},
        patientProfiles: (firestoreData.patientProfiles && typeof firestoreData.patientProfiles === 'object') ? firestoreData.patientProfiles : {},
        patientDetails: Array.isArray(firestoreData.patientDetails) ? firestoreData.patientDetails : []
      };
    } else {
      // Fallback to localStorage if Firestore has no data
      appData = loadAppData();
    }
  } else {
    // Fallback: no Firebase available, use localStorage auth
    authUsers = loadAuthUsers();
    appData = loadAppData();
    const matchedUser = findUser(role, username);
    const valid = matchedUser && matchedUser.password === password;
    if (!valid) {
      if (loginBtn) {
        loginBtn.textContent = originalBtnText;
        loginBtn.disabled = false;
      }
      setLoginError(t('auth.error.invalid_login'));
      showToast(t('auth.error.invalid_credentials'), 'error');
      return;
    }
  }

  patientQueue = Array.isArray(appData.queue) ? [...appData.queue] : [];

  if (loginBtn) {
    loginBtn.textContent = originalBtnText;
    loginBtn.disabled = false;
  }

  currentUserRole = role;
  currentUserName = username.trim().toLowerCase();
  currentUserUid = firebaseUid;
  reminders = currentUserRole === 'patient' ? loadRemindersForUser(currentUserName) : [];

  if (currentUserRole === 'patient') {
    const profileData = firebaseProfile || {};
    setPatientProfile({
      contactPhone: profileData.phone || '',
      contactEmail: profileData.realEmail || profileData.email || '',
      state: profileData.state || '',
      address: profileData.address || ''
    });
  }

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

  // Load and render doctors directory
  loadRegisteredDoctors().then(function() {
    renderDoctorsDirectory();
  });

  goPage('home');
  showToast(t('auth.success.login', { portal: portalAccess[role].label }), 'success');

  if (currentUserRole === 'doctor') {
    const pending = appData.bookings.filter((booking) => booking.status === 'Pending').length;
    if (pending > 0) {
      showToast(t('auth.info.pending_requests', { count: pending }), 'info');
    }
  }
}

async function logoutUser() {
  persistRemindersForCurrentUser();

  // Firebase sign out
  if (typeof fbSignOut === 'function') {
    await fbSignOut();
  }

  currentUserRole = null;
  currentUserName = '';
  currentUserUid = null;
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

  closeRegisterForm();
  setLoginError('');
  setRegisterError('');
  setFormMessage('bookingMsg', '', 'info');
  setFormMessage('patientReviewMsg', '', 'info');
  showToast(t('auth.success.logout'), 'info');
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

  const registerRole = byId('registerRole');
  if (registerRole && !registerRole.dataset.boundChange) {
    registerRole.addEventListener('change', syncRegisterRoleTitle);
    registerRole.dataset.boundChange = '1';
  }

  const reviewSession = byId('patientReviewSession');
  if (reviewSession && !reviewSession.dataset.boundChange) {
    reviewSession.addEventListener('change', syncReviewDoctorWithSession);
    reviewSession.dataset.boundChange = '1';
  }
}

function ensureDoctorAccess(actionText) {
  if (currentUserRole === 'doctor') {
    return true;
  }

  showToast(t('auth.error.doctor_required', { action: actionText }), 'error');
  return false;
}

// ================= NAVIGATION =================
function goPage(id) {
  if (!currentUserRole) {
    showToast(t('auth.error.login_first'), 'error');
    return;
  }

  if (!hasPageAccess(id)) {
    showToast(t('auth.error.page_not_available'), 'error');
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

  if (id === 'home') {
    renderDoctorsDirectory();
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
    showToast(t('auth.error.patient_portal_only'), 'error');
    return;
  }

  const primaryEl = byId('primarySymptom');
  const nameEl = byId('patientName');
  const ageEl = byId('patientAge');

  const primary = primaryEl ? primaryEl.value : '';
  const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : t('common.patient');

  if (!primary) {
    showToast(t('symptom.error.select_primary'), 'error');
    return;
  }

  const data = getLocalizedSymptomData(primary);
  if (!data) {
    showToast(t('symptom.error.unavailable'), 'error');
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
    critical: `<div class="severity-badge severity-critical">🔴 ${t('severity.badge_critical')}</div>`,
    medium: `<div class="severity-badge severity-medium">🟡 ${t('severity.badge_medium')}</div>`,
    low: `<div class="severity-badge severity-low">🟢 ${t('severity.badge_low')}</div>`
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

  showToast(t('symptom.success.analysis_complete'), 'success');
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
    checkedBy: currentUserName || 'doctor'
  });
  saveAppData();
}

function addToQueue() {
  if (!currentResult) {
    showToast(t('symptom.error.analyze_first'), 'error');
    return;
  }

  const p = {
    id: Date.now(),
    patientUsername: currentUserRole === 'patient' ? currentUserName : null,
    name: currentResult.name || t('common.patient'),
    condition: currentResult.primary,
    conditionKey: currentResult.primary,
    severity: currentResult.severity,
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: getWaitLabelBySeverity(currentResult.severity)
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
    showToast(t('queue.success.added', { name: p.name }), 'success');
    goPage('queue');
    return;
  }

  showToast(t('queue.success.added_doctor_view', { name: p.name }), 'success');
}

function addSamplePatient() {
  if (!ensureDoctorAccess(t('queue.action.add_patients'))) {
    return;
  }

  // Prompt for patient name, disease, and recovery details
  const name = prompt(t('queue.prompt.patient_name'), '');
  if (!name) {
    showToast(t('queue.warning.cancel_no_name'), 'warning');
    return;
  }
  const disease = prompt(t('queue.prompt.patient_disease'), '');
  if (!disease) {
    showToast(t('queue.warning.cancel_no_disease'), 'warning');
    return;
  }
  const recoveryDetails = prompt(t('queue.prompt.recovery_details'), '');
  if (!recoveryDetails) {
    showToast(t('queue.warning.cancel_no_recovery'), 'warning');
    return;
  }

  // Severity selection (optional, default to 'medium')
  let severity = prompt(t('queue.prompt.severity'), 'medium');
  severity = (severity || '').toLowerCase().trim();
  if (severity === 'high') severity = 'critical';
  if (!['critical', 'medium', 'low'].includes(severity)) severity = 'medium';

  const p = {
    id: Date.now(),
    patientUsername: null,
    name,
    condition: disease,
    severity,
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: getWaitLabelBySeverity(severity),
    caseStudy: {
      disease,
      recoveryDetails,
      addedBy: currentUserName || t('roles.doctor').toLowerCase(),
      addedAt: new Date().toISOString()
    }
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
  showToast(t('queue.success.manual_added', { name: p.name, disease }), 'info');
}

function callNextPatient() {
  if (!ensureDoctorAccess(t('queue.action.call_next_patient'))) {
    return;
  }

  if (patientQueue.length === 0) {
    showToast(t('queue.error.empty'), 'error');
    return;
  }

  const p = patientQueue.shift();
  markPatientChecked(p);
  saveAppData();
  renderQueue();
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast(t('queue.success.calling', { name: p.name, condition: getQueueConditionText(p) }), 'success');
}

// ================= BOOKINGS / DASHBOARDS =================
function populateDoctorOptions() {
  const bookingDoctor = byId('bookingDoctor');
  if (!bookingDoctor) {
    return;
  }

  bookingDoctor.innerHTML = doctorsDirectory
    .map((doctor) => {
      const specialty = getSpecialtyLabel(doctor.specialties[0] || 'General Medicine');
      return `<option value="${doctor.id}">${doctor.name} — ${specialty} (${doctor.rating.toFixed(1)}★)</option>`;
    })
    .join('');
}

function bookDoctorSession(event) {
  if (event) {
    event.preventDefault();
  }

  if (!hasPageAccess('book-session')) {
    showToast(t('auth.error.patient_portal_only'), 'error');
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
    setFormMessage('bookingMsg', t('booking.error.required_fields'), 'error');
    return;
  }

  if (!patientPhone || !patientEmail) {
    setFormMessage('bookingMsg', t('booking.error.contact_missing'), 'error');
    return;
  }

  const doctor = getDoctorById(doctorId);
  if (!doctor) {
    setFormMessage('bookingMsg', t('booking.error.doctor_not_found'), 'error');
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
  setFormMessage('bookingMsg', t('booking.success.registered'), 'success');

  renderBookSessionPage();
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast(t('booking.success.submitted_toast'), 'success');
}

function updateBookingStatus(bookingId, status) {
  if (!ensureDoctorAccess(t('booking.action.update_status'))) {
    return;
  }

  const booking = appData.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    showToast(t('booking.error.not_found'), 'error');
    return;
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  saveAppData();

  // Auto-add to queue when approved
  if (status === 'Approved') {
    autoAddApprovedBookingsToQueue(bookingId);
  }

  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();
  showToast(t('booking.success.status_updated', { status: getBookingStatusLabel(status) }), 'info');
}

function addBookingToQueue(bookingId) {
  if (!ensureDoctorAccess(t('booking.action.add_to_queue'))) {
    return;
  }

  const booking = appData.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    showToast(t('booking.error.not_found'), 'error');
    return;
  }

  const entry = {
    id: Date.now(),
    patientUsername: booking.patientUsername || null,
    name: booking.patientName,
    condition: booking.disease,
    conditionKey: booking.disease,
    severity: 'medium',
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: getWaitLabelBySeverity('medium')
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
  showToast(t('queue.success.moved_from_booking', { name: entry.name }), 'success');
}

function renderPatientBookingList() {
  const list = byId('patientBookingList');
  if (!list) {
    return;
  }

  if (!currentUserName) {
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('booking.empty.login_patient')}</div></div>`;
    return;
  }

  const rows = appData.bookings.filter((b) => b.patientUsername === currentUserName);
  if (rows.length === 0) {
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('booking.empty.no_requests')}</div></div>`;
    return;
  }

  list.innerHTML = rows
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((b) => `
      <div class="stack-item">
        <div class="stack-item-title">${b.doctorName}</div>
        <div class="stack-item-sub">${getConditionLabel(b.disease)} · ${formatSessionDate(b.date, b.time)}</div>
        <span class="status-badge ${bookingStatusClass(b.status)}">${getBookingStatusLabel(b.status)}</span>
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
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('booking.empty.no_registrations')}</div></div>`;
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
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Approved')">${t('booking.action.approve')}</button>`);
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Rejected')">${t('booking.action.reject')}</button>`);
      }
      if (b.status === 'Approved') {
        actions.push(`<button class="btn-mini" onclick="addBookingToQueue(${b.id})">${t('booking.action.add_to_queue_btn')}</button>`);
        actions.push(`<button class="btn-mini" onclick="updateBookingStatus(${b.id}, 'Completed')">${t('booking.action.mark_done')}</button>`);
      }

      return `
        <div class="stack-item">
          <div class="stack-item-title">${b.patientName} · ${b.patientAge} ${t('common.years_short')}</div>
          <div class="stack-item-sub">${getConditionLabel(b.disease)} · ${b.doctorName}</div>
          <div class="stack-item-sub">${t('booking.label.contact')}: ${b.patientPhone || t('common.na')} · ${b.patientEmail || t('common.na')}</div>
          <div class="stack-item-sub">${t('booking.label.address')}: ${[b.patientAddress, b.patientState].filter(Boolean).join(', ') || t('common.na')}</div>
          ${b.notes ? `<div class="stack-item-sub">${t('booking.label.notes')}: ${b.notes}</div>` : ''}
          <div class="stack-item-sub">${formatSessionDate(b.date, b.time)}</div>
          <span class="status-badge ${bookingStatusClass(b.status)}">${getBookingStatusLabel(b.status)}</span>
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
    sessionSelect.innerHTML = `<option value="">${t('review.empty.login_patient_option')}</option>`;
    return;
  }

  const sessions = appData.bookings
    .filter((booking) => booking.patientUsername === currentUserName)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (sessions.length === 0) {
    sessionSelect.innerHTML = `<option value="">${t('review.empty.no_sessions_option')}</option>`;
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
          name: booking.doctorName || (getDoctorById(booking.doctorId) || {}).name || t('common.doctor')
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
    select.innerHTML = `<option value="">${t('review.empty.no_doctors_option')}</option>`;
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
    showToast(t('review.error.patient_login_required'), 'error');
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
    setFormMessage('patientReviewMsg', t('review.error.required_fields'), 'error');
    return;
  }

  const booking = appData.bookings.find(
    (item) => item.id === sessionBookingId && item.patientUsername === currentUserName
  );
  if (!booking) {
    setFormMessage('patientReviewMsg', t('review.error.session_unavailable'), 'error');
    return;
  }

  const finalDoctorId = booking.doctorId || doctorId;
  const doctor = getDoctorById(finalDoctorId);
  if (!doctor) {
    setFormMessage('patientReviewMsg', t('review.error.doctor_unavailable'), 'error');
    return;
  }

  const profile = getPatientProfile(currentUserName);
  const patientName = profile.patientDisplayName || currentUserName || t('common.patient');

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

  setFormMessage('patientReviewMsg', t('review.success.submitted_message'), 'success');
  renderDoctorDashboard();
  renderPatientDashboard();
  showToast(t('review.success.submitted_toast'), 'success');
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

  return t('common.doctor');
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
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('review.empty.no_patient_reviews')}</div></div>`;
    return;
  }

  list.innerHTML = appData.doctorReviews
    .slice(0, 8)
    .map((review) => `
      <div class="stack-item">
        <div class="stack-item-title">${getReviewDoctorName(review)} · ${Number(review.rating || 0)}/5</div>
        <div class="stack-item-sub">${t('review.label.by')} ${review.patientName || t('common.patient')}</div>
        <div class="stack-item-sub">${getReviewComment(review) || t('review.empty.no_comment')}</div>
        <div class="stack-item-sub">${new Date(review.createdAt).toLocaleString(getCurrentLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        <span class="status-badge status-approved">${t('review.patient_feedback')}</span>
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
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('review.empty.login_to_see')}</div></div>`;
    return;
  }

  const rows = appData.doctorReviews.filter((r) => r.patientUsername === currentUserName);
  if (rows.length === 0) {
    list.innerHTML = `<div class="stack-item"><div class="stack-item-sub">${t('review.empty.none_submitted')}</div></div>`;
    return;
  }

  list.innerHTML = rows
    .slice(0, 6)
    .map((review) => `
      <div class="stack-item">
        <div class="stack-item-title">${getReviewDoctorName(review)}</div>
        <div class="stack-item-sub">${getConditionLabel(review.disease || '')}${review.sessionDate ? ` · ${formatSessionDate(review.sessionDate, review.sessionTime)}` : ''}</div>
        <div class="stack-item-sub">${getReviewComment(review) || t('review.empty.no_comment')}</div>
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

// ================= DOCTORS DIRECTORY =================
let registeredDoctorsCache = [];

async function loadRegisteredDoctors() {
  if (typeof fbLoadRegisteredDoctors === 'function') {
    try {
      registeredDoctorsCache = await fbLoadRegisteredDoctors();
    } catch (err) {
      console.warn('Failed to load registered doctors:', err);
      registeredDoctorsCache = [];
    }
  }
}

function renderDoctorsDirectory() {
  const grid = byId('doctorsDirectoryGrid');
  if (!grid) return;

  let html = '';

  // Local doctors (from hardcoded directory)
  doctorsDirectory.forEach(function(doctor) {
    var specialties = doctor.specialties.map(function(s) {
      return typeof getSpecialtyLabel === 'function' ? getSpecialtyLabel(s) : s;
    }).join(' · ');

    html += '<div class="doctor-card">' +
      '<div class="doctor-card-avatar">👨‍⚕️</div>' +
      '<div class="doctor-card-name">' + doctor.name + '</div>' +
      '<div class="doctor-card-spec">' + specialties + '</div>' +
      '<div class="doctor-card-meta">' +
        doctor.rating + '★ · ' + doctor.experience + ' years experience<br>' +
        '🏥 ' + localizeHospitalNameByValue(doctor.hospital) +
      '</div>' +
      '<span class="doctor-card-badge badge-local">Local Doctor</span>' +
    '</div>';
  });

  // Registered doctors (from Firebase)
  registeredDoctorsCache.forEach(function(doc) {
    // Skip default users
    if (doc.isDefault) return;

    var displayName = doc.displayName || doc.username || 'Doctor';
    var location = [doc.address, doc.state].filter(Boolean).join(', ') || 'MedReach Platform';

    html += '<div class="doctor-card">' +
      '<div class="doctor-card-avatar">🩺</div>' +
      '<div class="doctor-card-name">Dr. ' + displayName.charAt(0).toUpperCase() + displayName.slice(1) + '</div>' +
      '<div class="doctor-card-spec">General Practitioner</div>' +
      '<div class="doctor-card-meta">' +
        (doc.phone ? '📞 ' + doc.phone + '<br>' : '') +
        (doc.email ? '✉️ ' + doc.email + '<br>' : '') +
        '📍 ' + location +
      '</div>' +
      '<span class="doctor-card-badge badge-registered">Registered Doctor</span>' +
    '</div>';
  });

  if (!html) {
    html = '<div style="color:var(--text-muted);padding:20px;text-align:center;">No doctors available yet.</div>';
  }

  grid.innerHTML = html;
}

// ================= PATIENT DETAILS (Doctor adds) =================
function populateDetailsBookingSelect() {
  var select = byId('detailsBookingSelect');
  if (!select) return;

  var bookings = appData.bookings.filter(function(b) {
    return b.status === 'Approved' || b.status === 'Pending' || b.status === 'Completed';
  }).sort(function(a, b) {
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  if (bookings.length === 0) {
    select.innerHTML = '<option value="">No patient bookings available</option>';
    return;
  }

  select.innerHTML = bookings.map(function(b) {
    var condLabel = getConditionLabel(b.disease);
    var dateLabel = formatSessionDate(b.date, b.time);
    return '<option value="' + b.id + '">' + b.patientName + ' — ' + condLabel + ' (' + dateLabel + ')</option>';
  }).join('');
}

function savePatientDetails(event) {
  if (event) event.preventDefault();

  if (!ensureDoctorAccess('Add patient details')) return;

  var selectEl = byId('detailsBookingSelect');
  var diagnosisEl = byId('detailsDiagnosis');
  var prescriptionEl = byId('detailsPrescription');
  var notesEl = byId('detailsNotes');

  var bookingId = selectEl ? Number(selectEl.value) : 0;
  var diagnosis = diagnosisEl ? diagnosisEl.value.trim() : '';
  var prescription = prescriptionEl ? prescriptionEl.value.trim() : '';
  var notes = notesEl ? notesEl.value.trim() : '';

  if (!bookingId) {
    setFormMessage('detailsMsg', 'Please select a patient booking.', 'error');
    return;
  }

  if (!diagnosis) {
    setFormMessage('detailsMsg', 'Please enter a diagnosis.', 'error');
    return;
  }

  var booking = appData.bookings.find(function(b) { return b.id === bookingId; });
  if (!booking) {
    setFormMessage('detailsMsg', 'Booking not found.', 'error');
    return;
  }

  // Store patient details in appData
  if (!appData.patientDetails) appData.patientDetails = [];

  var detail = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    bookingId: bookingId,
    patientName: booking.patientName,
    patientUsername: booking.patientUsername,
    patientAge: booking.patientAge,
    disease: booking.disease,
    diagnosis: diagnosis,
    prescription: prescription,
    doctorNotes: notes,
    doctorName: currentUserName,
    sessionDate: booking.date,
    sessionTime: booking.time,
    createdAt: new Date().toISOString()
  };

  appData.patientDetails.unshift(detail);

  // Mark booking as completed
  booking.status = 'Completed';
  booking.updatedAt = new Date().toISOString();

  saveAppData();

  // Also save to Firebase
  if (typeof fbSavePatientDetails === 'function') {
    fbSavePatientDetails(detail.id, detail);
  }

  // Clear form
  if (diagnosisEl) diagnosisEl.value = '';
  if (prescriptionEl) prescriptionEl.value = '';
  if (notesEl) notesEl.value = '';

  setFormMessage('detailsMsg', '✅ Patient details saved successfully!', 'success');
  renderDoctorDashboard();
  renderBookSessionPage();
  renderPatientDashboard();
  showToast('✅ Patient details saved for ' + booking.patientName, 'success');
}

function renderSavedPatientDetails() {
  var list = byId('savedPatientDetailsList');
  if (!list) return;

  var details = Array.isArray(appData.patientDetails) ? appData.patientDetails : [];

  if (details.length === 0) {
    list.innerHTML = '<div class="stack-item"><div class="stack-item-sub">No patient records yet. Add details from the form above.</div></div>';
    return;
  }

  list.innerHTML = details.slice(0, 10).map(function(d) {
    return '<div class="patient-record-item">' +
      '<div class="stack-item-title" style="margin-bottom:8px;">' + (d.patientName || 'Patient') + ' · ' + (d.patientAge || '') + ' yrs</div>' +
      '<div class="record-label">Disease</div>' +
      '<div class="record-value">' + getConditionLabel(d.disease) + '</div>' +
      '<div class="record-label">Diagnosis</div>' +
      '<div class="record-value">' + (d.diagnosis || '-') + '</div>' +
      '<div class="record-label">Prescription</div>' +
      '<div class="record-value">' + (d.prescription || '-') + '</div>' +
      (d.doctorNotes ? '<div class="record-label">Doctor\'s Notes</div><div class="record-value">' + d.doctorNotes + '</div>' : '') +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:6px;">📅 ' + new Date(d.createdAt).toLocaleString(getCurrentLocale(), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</div>' +
    '</div>';
  }).join('');
}

// ================= AUTO-ADD APPROVED BOOKINGS TO QUEUE =================
function autoAddApprovedBookingsToQueue(bookingId) {
  var booking = appData.bookings.find(function(b) { return b.id === bookingId; });
  if (!booking) return;

  // Check if this booking is already in the queue
  var alreadyInQueue = patientQueue.some(function(p) {
    return p.bookingId === bookingId;
  });

  if (alreadyInQueue) return;

  var entry = {
    id: Date.now(),
    bookingId: bookingId,
    patientUsername: booking.patientUsername || null,
    name: booking.patientName,
    condition: booking.disease,
    conditionKey: booking.disease,
    severity: 'medium',
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: getWaitLabelBySeverity('medium'),
    caseStudy: {
      disease: getConditionLabel(booking.disease),
      recoveryDetails: booking.notes || 'Booked session - ' + formatSessionDate(booking.date, booking.time),
      addedBy: 'Booking System',
      addedAt: new Date().toISOString()
    }
  };

  patientQueue.push(entry);
  patientQueue.sort(function(a, b) {
    var order = { critical: 0, medium: 1, low: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });

  recordVisit(entry);
  saveAppData();
  renderQueue();
  showToast('📋 ' + booking.patientName + ' added to doctor queue from booking', 'info');
}

function renderDoctorDashboard() {
  renderDoctorStats();
  renderDoctorBookingList();
  populateDetailsBookingSelect();
  renderSavedPatientDetails();
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
      const match = doctor.specialties.includes(targetSpecialty) ? t('best_doctor.best_match') : t('best_doctor.alternative');
      const specialties = doctor.specialties.map((item) => getSpecialtyLabel(item)).join(', ');
      return `
        <div class="stack-item">
          <div class="stack-item-title">#${index + 1} ${doctor.name}</div>
          <div class="stack-item-sub">${specialties}</div>
          <div class="stack-item-sub">${localizeHospitalNameByValue(doctor.hospital)} · ${doctor.experience} ${t('common.years_exp')} · ${doctor.rating.toFixed(1)}★</div>
          <span class="status-badge ${doctor.specialties.includes(targetSpecialty) ? 'status-approved' : 'status-pending'}">${match}</span>
        </div>
      `;
    })
    .join('');
}

function suggestBestDoctors() {
  if (!hasPageAccess('patient-dashboard')) {
    showToast(t('auth.error.patient_portal_only'), 'error');
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
    list.innerHTML = `<div style="color:var(--text-muted);text-align:center;padding:40px;font-size:14px;">${t('queue.empty')}</div>`;
  } else {
    list.innerHTML = patientQueue
      .map((p, idx) => {
        const severityClass =
          p.severity === 'critical' ? 'priority-critical' : p.severity === 'medium' ? 'priority-medium' : 'priority-low';
        const conditionText = getQueueConditionText(p);
        const addedAtText = p.caseStudy && p.caseStudy.addedAt
          ? new Date(p.caseStudy.addedAt).toLocaleString(getCurrentLocale())
          : '-';
        return `
          <div class="queue-item ${severityClass}">
            <div class="queue-num">${idx + 1}</div>
            <div class="queue-main">
              <div class="queue-name"><strong>${t('queue.label.name')}:</strong> ${p.name}</div>
              <div class="queue-cond"><strong>${t('queue.label.disease')}:</strong> ${conditionText}</div>
              <div class="queue-meta">
                <span class="queue-severity">${getSeverityLabel(p.severity)}</span>
                <span class="queue-time">${p.time}</span>
                <span class="queue-wait">${localizeQueueWaitValue(p.wait, p.severity)}</span>
              </div>
              <div class="queue-case-study">
                <div><strong>${t('queue.label.recovery_case')}:</strong> ${p.caseStudy && p.caseStudy.recoveryDetails ? p.caseStudy.recoveryDetails : '-'}</div>
                <div style="font-size:11px;color:var(--text-muted)"><strong>${t('queue.label.added_by')}:</strong> ${p.caseStudy && p.caseStudy.addedBy ? p.caseStudy.addedBy : '-'} | <strong>${t('queue.label.date')}:</strong> ${addedAtText}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  const total = byId('stat-total');
  const critical = byId('stat-critical');
  const medium = byId('stat-medium');
  const low = byId('stat-low');

  if (total) total.textContent = patientQueue.length;
  if (critical) critical.textContent = patientQueue.filter((p) => p.severity === 'critical').length;
  if (medium) medium.textContent = patientQueue.filter((p) => p.severity === 'medium').length;
  if (low) low.textContent = patientQueue.filter((p) => p.severity === 'low').length;
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
    tips.push(t('tips.add_reminders'));
  } else if (completionRate < 50) {
    tips.push(t('tips.low_adherence'));
  } else {
    tips.push(t('tips.good_adherence'));
  }

  const profile = getPatientProfile(currentUserName);
  if (profile.lastCondition) {
    tips.push(t('tips.condition_monitor', { condition: getConditionLabel(profile.lastCondition) }));
  }

  const pendingBookings = appData.bookings.filter(
    (b) => b.patientUsername === currentUserName && (b.status === 'Pending' || b.status === 'Approved')
  ).length;

  if (pendingBookings > 0) {
    tips.push(t('tips.pending_bookings', { count: pendingBookings }));
  } else {
    tips.push(t('tips.book_followup'));
  }

  list.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join('');
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
    showToast(t('emergency.toast.hospital_selected', { hospital: getLocalizedHospitalName(idx) }), 'info');
  }
}

function triggerSOS() {
  if (!currentUserRole) {
    showToast(t('auth.error.login_first'), 'error');
    return;
  }

  if (ambulanceRunning) {
    showToast(t('emergency.error.already_dispatched'), 'error');
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
    showToast(t('emergency.error.ui_unavailable'), 'error');
    return;
  }

  const dispatchHospital = getLocalizedHospitalName(safeIdx) || getLocalizedHospitalName(0);
  const allHospitalsText = hospitalNames.map((_, index) => getLocalizedHospitalName(index)).join(', ');
  sosStatus.innerHTML = `<span style="color:var(--critical)">🚨 ${t('emergency.status.alert_broadcast', {
    hospitals: allHospitalsText,
    dispatch: dispatchHospital
  })}</span>`;
  dot.style.left = hospitalPositions[safeIdx].l;
  dot.style.top = hospitalPositions[safeIdx].t;
  dot.style.display = 'block';
  status.style.display = 'block';

  const profile = getPatientProfile(currentUserName);
  const emergencyPatientName =
    profile.patientDisplayName || (currentUserRole === 'patient' ? currentUserName : '') || t('emergency.sos_patient');

  appData.emergencyRequests.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    requestedBy: currentUserName || 'unknown',
    role: currentUserRole || 'guest',
    patientName: emergencyPatientName,
    dispatchedFrom: hospitalNames[safeIdx] || hospitalNames[0],
    notifiedHospitals: hospitalNames,
    createdAt: new Date().toISOString()
  });

  // Add to queue as critical
  const emergencyEntry = {
    id: Date.now(),
    patientUsername: currentUserRole === 'patient' ? currentUserName : null,
    name: emergencyPatientName,
    condition: 'emergency_alert',
    conditionKey: 'emergency_alert',
    severity: 'critical',
    time: new Date().toLocaleTimeString(getCurrentLocale(), { hour: '2-digit', minute: '2-digit' }),
    wait: getWaitLabelBySeverity('critical')
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

  const steps = [t('emergency.step.en_route'), t('emergency.step.approaching'), t('emergency.step.arrived_location')];
  let step = 0;

  const interval = setInterval(() => {
    if (step >= waypoints.length) {
      clearInterval(interval);
      ambulanceRunning = false;
      status.textContent = t('emergency.step.arrived_confirmed');

      setTimeout(() => {
        dot.style.display = 'none';
        status.style.display = 'none';
        sosStatus.textContent = '';
      }, 4000);

      showToast(t('emergency.toast.arrived'), 'success');
      return;
    }

    dot.style.left = waypoints[step].l;
    dot.style.top = waypoints[step].t;
    status.textContent = steps[step];
    step += 1;
  }, 2000);

  showToast(t('emergency.toast.alert_sent'), 'error');
}

// ================= REMINDERS =================
function addToReminder() {
  if (!hasPageAccess('reminder')) {
    showToast(t('auth.error.patient_portal_only'), 'error');
    return;
  }

  if (!currentResult) {
    showToast(t('symptom.error.analyze_first'), 'error');
    return;
  }

  const meds = currentResult.data.medicines;
  meds.forEach((medicine) => {
    reminders.push({
      id: Date.now() + Math.random(),
      name: medicine,
      time: 'Morning 8:00 AM',
      freq: 'Daily',
      notes: t('reminder.note.as_prescribed'),
      done: false
    });
  });

  persistRemindersForCurrentUser();
  renderReminders();
  renderPatientDashboard();
  showToast(t('reminder.success.bulk_added', { count: meds.length }), 'success');
  goPage('reminder');
}

function addReminder() {
  if (!hasPageAccess('reminder')) {
    showToast(t('auth.error.patient_portal_only'), 'error');
    return;
  }

  const medNameEl = byId('medName');
  const medTimeEl = byId('medTime');
  const medFreqEl = byId('medFreq');
  const medNotesEl = byId('medNotes');

  const name = medNameEl ? medNameEl.value.trim() : '';
  if (!name) {
    showToast(t('reminder.error.name_required'), 'error');
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
  showToast(t('reminder.success.added'), 'success');
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
  count.textContent = t('reminder.count_taken', { done, total: reminders.length });

  if (reminders.length === 0) {
    list.innerHTML = `<div style="color:var(--text-muted);font-size:14px;padding:20px 0;text-align:center;">${t('reminder.empty')}</div>`;
    return;
  }

  list.innerHTML = reminders
    .map((r) => `
    <div class="reminder-item ${r.done ? 'done' : ''}">
      <div class="rem-icon">💊</div>
      <div class="rem-info">
        <div class="rem-name" style="${r.done ? 'text-decoration:line-through' : ''}">${r.name}</div>
        <div class="rem-time">⏰ ${localizeReminderTimeLabel(r.time)} · ${localizeReminderFrequencyLabel(r.freq)}${r.notes ? ' · ' + r.notes : ''}</div>
      </div>
      <button class="rem-check ${r.done ? 'checked' : ''}" onclick="toggleDone(${r.id})">✓</button>
      <button onclick="deleteReminder(${r.id})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:4px;" title="${t('common.delete')}">🗑</button>
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

  // Initialize Firebase default users in the background
  if (typeof fbInitDefaultUsers === 'function') {
    fbInitDefaultUsers(defaultCredentials).then(function() {
      console.log('✅ Firebase default users ready');
    }).catch(function(err) {
      console.warn('Firebase default user init failed (non-critical):', err);
    });
  }
}

// ---- Init ----
initializeApp();
