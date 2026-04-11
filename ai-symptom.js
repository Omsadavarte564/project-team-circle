// ================= AI SYMPTOM CHECKER =================
// MedReach — AI Doctor powered by Groq API (Llama 3)
// Supports English, Hindi, and Marathi

const AI_API_KEY_STORAGE = 'medreach_groq_api_key';
const DEFAULT_GROQ_KEY = '__GROQ_API_KEY__';

// ---- Multilingual Labels ----
const aiLabels = {
  en: {
    sectionTag: 'AI Assistant',
    sectionTitle: '🤖 AI Doctor',
    sectionSub: 'Describe your symptoms in your own words — in English, Hindi, or Marathi. The AI will analyze and suggest the best doctor for you.',
    apiKeyLabel: 'Groq API Key',
    apiKeyPlaceholder: 'Paste your Groq API key',
    apiKeyHelp: 'Get your free key from',
    apiKeySave: 'Save Key',
    apiKeySet: '✅ API Key saved',
    changeKey: 'Change',
    describeLabel: 'Describe your symptoms',
    describePlaceholder: 'e.g. I have been having headaches and fever for 2 days, feeling very tired and nauseous...',
    askButton: '🤖 Ask AI Doctor',
    analyzing: '🔄 Analyzing your symptoms...',
    noResultText: 'Describe your symptoms and click <strong style="color:var(--accent)">Ask AI Doctor</strong> for an AI-powered analysis.',
    suggestedMeds: '💊 Suggested Medicines',
    recommendation: '📌 Recommendation',
    bestDoctor: '👨‍⚕️ Recommended Doctor',
    followUp: '💬 You can also ask',
    bookSession: '🗓 Book Session with this Doctor',
    addToQueue: '➕ Add to Queue',
    setReminder: '💊 Set Reminder',
    disclaimer: '⚠️ This is AI-assisted guidance only. Always consult a qualified doctor for professional medical advice.',
    errorNoKey: 'Please set your Groq API Key first to use the AI Doctor.',
    errorNoInput: 'Please describe your symptoms first.',
    errorApi: 'AI analysis failed. Please try again.',
    errorNetwork: 'Network error. Please check your internet connection.',
    whyDoctor: 'Why this doctor?',
    experience: 'years exp',
    hospital: 'Hospital'
  },
  hi: {
    sectionTag: 'AI सहायक',
    sectionTitle: '🤖 AI डॉक्टर',
    sectionSub: 'अपने लक्षणों का वर्णन अपने शब्दों में करें — हिंदी, मराठी या अंग्रेजी में। AI विश्लेषण करेगा और सबसे अच्छे डॉक्टर का सुझाव देगा।',
    apiKeyLabel: 'Groq API कुंजी',
    apiKeyPlaceholder: 'अपनी Groq API कुंजी पेस्ट करें',
    apiKeyHelp: 'अपनी मुफ्त कुंजी यहाँ से प्राप्त करें',
    apiKeySave: 'कुंजी सेव करें',
    apiKeySet: '✅ API कुंजी सहेजी गई',
    changeKey: 'बदलें',
    describeLabel: 'अपने लक्षण बताएं',
    describePlaceholder: 'जैसे: मुझे 2 दिनों से सिरदर्द और बुखार है, बहुत थकान और उल्टी जैसा लग रहा है...',
    askButton: '🤖 AI डॉक्टर से पूछें',
    analyzing: '🔄 आपके लक्षणों का विश्लेषण हो रहा है...',
    noResultText: 'अपने लक्षण बताएं और <strong style="color:var(--accent)">AI डॉक्टर से पूछें</strong> पर क्लिक करें।',
    suggestedMeds: '💊 सुझावित दवाइयां',
    recommendation: '📌 सिफारिश',
    bestDoctor: '👨‍⚕️ सुझावित डॉक्टर',
    followUp: '💬 आप यह भी पूछ सकते हैं',
    bookSession: '🗓 इस डॉक्टर से अपॉइंटमेंट लें',
    addToQueue: '➕ कतार में जोड़ें',
    setReminder: '💊 रिमाइंडर सेट करें',
    disclaimer: '⚠️ यह केवल AI-सहायित मार्गदर्शन है। पेशेवर चिकित्सा सलाह के लिए हमेशा योग्य डॉक्टर से परामर्श करें।',
    errorNoKey: 'AI डॉक्टर का उपयोग करने के लिए कृपया पहले Groq API कुंजी सेट करें।',
    errorNoInput: 'कृपया पहले अपने लक्षण बताएं।',
    errorApi: 'AI विश्लेषण विफल। कृपया पुनः प्रयास करें।',
    errorNetwork: 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।',
    whyDoctor: 'यह डॉक्टर क्यों?',
    experience: 'वर्ष अनुभव',
    hospital: 'अस्पताल'
  },
  mr: {
    sectionTag: 'AI सहाय्यक',
    sectionTitle: '🤖 AI डॉक्टर',
    sectionSub: 'तुमच्या लक्षणांचे वर्णन तुमच्या स्वतःच्या शब्दांत करा — मराठी, हिंदी किंवा इंग्रजीमध्ये. AI विश्लेषण करेल आणि सर्वोत्तम डॉक्टर सुचवेल.',
    apiKeyLabel: 'Groq API की',
    apiKeyPlaceholder: 'तुमची Groq API की पेस्ट करा',
    apiKeyHelp: 'तुमची मोफत की येथून मिळवा',
    apiKeySave: 'की सेव्ह करा',
    apiKeySet: '✅ API की सेव्ह केली',
    changeKey: 'बदला',
    describeLabel: 'तुमची लक्षणे सांगा',
    describePlaceholder: 'उदा: मला 2 दिवसांपासून डोकेदुखी आणि ताप आहे, खूप थकवा आणि मळमळ जाणवते...',
    askButton: '🤖 AI डॉक्टरला विचारा',
    analyzing: '🔄 तुमच्या लक्षणांचे विश्लेषण सुरू आहे...',
    noResultText: 'तुमची लक्षणे सांगा आणि <strong style="color:var(--accent)">AI डॉक्टरला विचारा</strong> वर क्लिक करा.',
    suggestedMeds: '💊 सुचवलेली औषधे',
    recommendation: '📌 शिफारस',
    bestDoctor: '👨‍⚕️ शिफारस केलेले डॉक्टर',
    followUp: '💬 तुम्ही हे देखील विचारू शकता',
    bookSession: '🗓 या डॉक्टरशी अपॉइंटमेंट घ्या',
    addToQueue: '➕ रांगेत जोडा',
    setReminder: '💊 रिमाइंडर सेट करा',
    disclaimer: '⚠️ हे केवळ AI-सहाय्यित मार्गदर्शन आहे. व्यावसायिक वैद्यकीय सल्ल्यासाठी नेहमी पात्र डॉक्टरांचा सल्ला घ्या.',
    errorNoKey: 'AI डॉक्टर वापरण्यासाठी कृपया प्रथम Groq API की सेट करा.',
    errorNoInput: 'कृपया प्रथम तुमची लक्षणे सांगा.',
    errorApi: 'AI विश्लेषण अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    errorNetwork: 'नेटवर्क त्रुटी. कृपया तुमचे इंटरनेट कनेक्शन तपासा.',
    whyDoctor: 'हे डॉक्टर का?',
    experience: 'वर्षे अनुभव',
    hospital: 'रुग्णालय'
  }
};

// ---- Label Helpers ----
function aiL(key) {
  const lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'en';
  const pack = aiLabels[lang] || aiLabels.en;
  return pack[key] || aiLabels.en[key] || key;
}

function getLanguageNameForAI(code) {
  const map = { en: 'English', hi: 'Hindi (हिन्दी)', mr: 'Marathi (मराठी)' };
  return map[code] || 'English';
}

// ---- API Key Management ----
function getAIApiKey() {
  // Check if the build-time key was injected (not the placeholder)
  if (DEFAULT_GROQ_KEY && DEFAULT_GROQ_KEY !== '__GROQ_API_KEY__') return DEFAULT_GROQ_KEY;
  try { return localStorage.getItem(AI_API_KEY_STORAGE) || ''; }
  catch (e) { return ''; }
}

function saveAIApiKeyValue(key) {
  try { localStorage.setItem(AI_API_KEY_STORAGE, key.trim()); }
  catch (e) { /* ignore */ }
}

function handleAIApiKeySave() {
  var input = document.getElementById('aiApiKeyInput');
  var key = input ? input.value.trim() : '';
  if (!key) {
    if (typeof showToast === 'function') showToast(aiL('errorNoKey'), 'error');
    return;
  }
  saveAIApiKeyValue(key);
  refreshAIKeyUI();
  if (typeof showToast === 'function') showToast(aiL('apiKeySet'), 'success');
}

function showAIKeyInput() {
  var section = document.getElementById('aiKeySection');
  var status = document.getElementById('aiKeyStatus');
  if (section) section.classList.remove('hidden');
  if (status) status.classList.add('hidden');
  var input = document.getElementById('aiApiKeyInput');
  if (input) { input.value = getAIApiKey(); input.focus(); }
}

function refreshAIKeyUI() {
  var section = document.getElementById('aiKeySection');
  var status = document.getElementById('aiKeyStatus');
  // If a real key was injected at build time, hide both sections completely
  if (DEFAULT_GROQ_KEY && DEFAULT_GROQ_KEY !== '__GROQ_API_KEY__') {
    if (section) section.classList.add('hidden');
    if (status) status.classList.add('hidden');
    return;
  }
  var hasKey = !!getAIApiKey();
  if (section) section.classList.toggle('hidden', hasKey);
  if (status) status.classList.toggle('hidden', !hasKey);
}

// ---- Prompt Builder ----
function buildDoctorContextForAI() {
  if (typeof doctorsDirectory === 'undefined') return '';
  return doctorsDirectory.map(function(d) {
    return '- ' + d.name + ' (ID: ' + d.id + '): ' + d.specialties.join(', ') +
      ', ' + d.rating + '★, ' + d.experience + ' years experience, ' + d.hospital;
  }).join('\n');
}

function buildSymptomPrompt(message, age, language) {
  var langName = getLanguageNameForAI(language);
  var doctorCtx = buildDoctorContextForAI();

  return 'You are a compassionate and knowledgeable medical AI assistant for MedReach, a smart rural healthcare system serving communities in India.\n\n' +
    'A patient is describing their symptoms or health concerns. Your tasks:\n' +
    '1. Carefully analyze their symptoms\n' +
    '2. Identify the most likely medical condition\n' +
    '3. Assess severity (critical = needs immediate ER, medium = see doctor soon, low = manageable at home)\n' +
    '4. Suggest appropriate over-the-counter medicines with dosages\n' +
    '5. Give clear, easy-to-understand recommendations\n' +
    '6. Recommend the BEST matching doctor from the directory below based on their specialties\n\n' +
    'IMPORTANT RULES:\n' +
    '- Be empathetic, warm, and explain things simply (for rural patients)\n' +
    '- Include a medical disclaimer\n' +
    '- Respond ENTIRELY in ' + langName + ' language\n' +
    '- Understand patient input in ANY language (English, Hindi, or Marathi)\n' +
    '- Return ONLY valid JSON — no markdown, no code fences, no extra text\n\n' +
    'Available Doctors:\n' + doctorCtx + '\n\n' +
    'Patient\'s age: ' + (age || 'Not provided') + '\n' +
    'Patient\'s message: "' + message + '"\n\n' +
    'Respond with this exact JSON structure (all text values must be in ' + langName + '):\n' +
    '{\n' +
    '  "condition": "name of the likely condition",\n' +
    '  "severity": "critical" or "medium" or "low",\n' +
    '  "description": "A clear, empathetic 2-3 sentence explanation that a rural patient can understand easily",\n' +
    '  "medicines": ["medicine1 with dosage", "medicine2 with dosage", "medicine3 with dosage"],\n' +
    '  "recommendation": "Clear, actionable advice including warning signs to watch for",\n' +
    '  "doctorId": "the exact id of the best doctor from the directory",\n' +
    '  "doctorName": "full name of the recommended doctor",\n' +
    '  "doctorReason": "1-2 sentence explanation of why this doctor is the best match for this condition",\n' +
    '  "followUpQuestions": ["relevant follow-up question 1 in ' + langName + '", "relevant follow-up question 2 in ' + langName + '"]\n' +
    '}';
}

// ---- Groq API Call (OpenAI-compatible format) ----
async function callGroqAPI(prompt) {
  var apiKey = getAIApiKey();
  if (!apiKey) {
    return { success: false, error: 'no_key', message: aiL('errorNoKey') };
  }

  var url = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    var response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant. Always respond with valid JSON only. No markdown, no code fences, no extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      var errData = {};
      try { errData = await response.json(); } catch(e) {}
      var errMsg = (errData && errData.error && errData.error.message) ? errData.error.message : 'API error ' + response.status;
      return { success: false, error: 'api_error', message: errMsg };
    }

    var data = await response.json();
    var text = '';
    try { text = data.choices[0].message.content; } catch(e) {}

    if (!text) {
      return { success: false, error: 'empty_response', message: aiL('errorApi') };
    }

    // Parse JSON — handle potential markdown wrapping
    var cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    var parsed = JSON.parse(cleaned);

    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'parse_error', message: aiL('errorApi') };
    }
    return { success: false, error: 'network_error', message: aiL('errorNetwork') };
  }
}

// ---- Main Handler ----
var lastAIResult = null;

async function handleAIAnalysis() {
  var inputEl = document.getElementById('aiSymptomInput');
  var message = inputEl ? inputEl.value.trim() : '';

  if (!getAIApiKey()) {
    showAIKeyInput();
    if (typeof showToast === 'function') showToast(aiL('errorNoKey'), 'error');
    return;
  }

  if (!message) {
    if (typeof showToast === 'function') showToast(aiL('errorNoInput'), 'error');
    return;
  }

  // Get age from existing symptom form
  var ageEl = document.getElementById('patientAge');
  var age = ageEl ? ageEl.value : '';

  var lang = (typeof currentLanguage !== 'undefined') ? currentLanguage : 'en';

  // Show loading state
  var btn = document.getElementById('aiAnalyzeBtn');
  var originalText = btn ? btn.textContent : '';
  if (btn) {
    btn.textContent = aiL('analyzing');
    btn.disabled = true;
    btn.classList.add('ai-loading');
  }

  var noResult = document.getElementById('aiNoResult');
  var resultCard = document.getElementById('aiResultCard');
  if (noResult) noResult.style.display = 'none';
  if (resultCard) {
    resultCard.style.display = 'block';
    resultCard.innerHTML = '<div class="ai-loading-animation"><div class="ai-pulse"></div><p>' + aiL('analyzing') + '</p></div>';
  }

  // Call Groq API
  var prompt = buildSymptomPrompt(message, age, lang);
  var result = await callGroqAPI(prompt);

  // Restore button
  if (btn) {
    btn.textContent = originalText || aiL('askButton');
    btn.disabled = false;
    btn.classList.remove('ai-loading');
  }

  if (!result.success) {
    if (resultCard) {
      resultCard.innerHTML = '<div class="ai-error-msg">❌ ' + (result.message || aiL('errorApi')) + '</div>';
    }
    if (typeof showToast === 'function') showToast(result.message || aiL('errorApi'), 'error');
    return;
  }

  lastAIResult = result.data;
  renderAIResult(result.data);

  // Save to patient profile
  if (typeof setPatientProfile === 'function' && result.data.condition) {
    setPatientProfile({
      lastAICondition: result.data.condition,
      lastAISeverity: result.data.severity,
      lastAIAnalyzedAt: new Date().toISOString(),
      lastAIDoctorId: result.data.doctorId || ''
    });
  }

  if (typeof showToast === 'function') showToast('✅ ' + (result.data.condition || 'Analysis complete'), 'success');
}

// ---- Render AI Result ----
function renderAIResult(data) {
  var card = document.getElementById('aiResultCard');
  if (!card) return;

  var severity = (data.severity || 'low').toLowerCase();
  var severityIcons = { critical: '🔴', medium: '🟡', low: '🟢' };
  var severityIcon = severityIcons[severity] || '🟢';
  var severityClass = 'severity-' + severity;

  // Find doctor details from directory
  var doctor = null;
  if (data.doctorId && typeof doctorsDirectory !== 'undefined') {
    doctor = doctorsDirectory.find(function(d) { return d.id === data.doctorId; });
  }

  var html = '';

  // Disclaimer
  html += '<div class="ai-disclaimer">' + aiL('disclaimer') + '</div>';

  // Severity Badge
  var sevLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
  html += '<div class="severity-badge ' + severityClass + '">' + severityIcon + ' ' + sevLabel + '</div>';

  // Condition Name
  html += '<div class="condition-name">' + (data.condition || '') + '</div>';

  // Description
  html += '<p class="ai-description">' + (data.description || '') + '</p>';

  // Medicines
  html += '<div class="divider"></div>';
  html += '<div class="ai-section-label">' + aiL('suggestedMeds') + '</div>';
  if (data.medicines && data.medicines.length) {
    html += '<ul class="medicines-list">';
    data.medicines.forEach(function(med) {
      html += '<li class="med-chip">💊 ' + med + '</li>';
    });
    html += '</ul>';
  }

  // Recommendation
  html += '<div class="divider"></div>';
  html += '<div class="ai-section-label">' + aiL('recommendation') + '</div>';
  html += '<p class="ai-recommendation-text">' + (data.recommendation || '') + '</p>';

  // Recommended Doctor
  if (doctor || data.doctorName) {
    html += '<div class="divider"></div>';
    html += '<div class="ai-section-label">' + aiL('bestDoctor') + '</div>';
    html += '<div class="ai-doctor-card">';
    html += '  <div class="ai-doctor-avatar">👨‍⚕️</div>';
    html += '  <div class="ai-doctor-details">';
    html += '    <div class="ai-doctor-name">' + (doctor ? doctor.name : data.doctorName || '') + '</div>';
    if (doctor) {
      var specLabels = doctor.specialties.map(function(s) {
        return (typeof getSpecialtyLabel === 'function') ? getSpecialtyLabel(s) : s;
      });
      html += '    <div class="ai-doctor-spec">' + specLabels.join(' · ') + '</div>';
      html += '    <div class="ai-doctor-meta">' + doctor.rating + '★ · ' + doctor.experience + ' ' + aiL('experience') + ' · ' + doctor.hospital + '</div>';
    }
    if (data.doctorReason) {
      html += '    <div class="ai-doctor-reason"><strong>' + aiL('whyDoctor') + '</strong> ' + data.doctorReason + '</div>';
    }
    html += '  </div>';
    html += '</div>';

    // Action buttons
    var doctorIdForBook = doctor ? doctor.id : (data.doctorId || '');
    html += '<div class="action-bar ai-actions">';
    html += '  <button class="btn-sec" onclick="bookDoctorFromAI(\'' + doctorIdForBook + '\')">' + aiL('bookSession') + '</button>';
    html += '  <button class="btn-sec" onclick="addAIResultToQueue()">' + aiL('addToQueue') + '</button>';
    html += '</div>';
  }

  // Follow-up Questions
  if (data.followUpQuestions && data.followUpQuestions.length) {
    html += '<div class="divider"></div>';
    html += '<div class="ai-section-label">' + aiL('followUp') + '</div>';
    html += '<div class="ai-followup-chips">';
    data.followUpQuestions.forEach(function(q) {
      var escaped = q.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      html += '<div class="chip ai-followup-chip" onclick="handleFollowUpClick(\'' + escaped + '\')">' + q + '</div>';
    });
    html += '</div>';
  }

  card.style.display = 'block';
  card.innerHTML = html;
}

// ---- Follow-up Question Handler ----
function handleFollowUpClick(question) {
  var input = document.getElementById('aiSymptomInput');
  if (input) {
    input.value = question;
    input.focus();
  }
  handleAIAnalysis();
}

// ---- Book Doctor from AI ----
function bookDoctorFromAI(doctorId) {
  if (typeof goPage === 'function') {
    goPage('book-session');
  }
  // Pre-select the doctor in the booking form
  setTimeout(function() {
    var doctorSelect = document.getElementById('bookingDoctor');
    if (doctorSelect && doctorId) {
      doctorSelect.value = doctorId;
    }
    // Pre-fill disease if available
    if (lastAIResult && lastAIResult.condition) {
      var diseaseSelect = document.getElementById('bookingDisease');
      if (diseaseSelect) {
        // Try to match condition to a dropdown option
        var options = diseaseSelect.options;
        for (var i = 0; i < options.length; i++) {
          var optText = options[i].text.toLowerCase();
          var condText = lastAIResult.condition.toLowerCase();
          if (condText.indexOf(optText) !== -1 || optText.indexOf(condText) !== -1) {
            diseaseSelect.value = options[i].value;
            break;
          }
        }
      }
    }
  }, 200);
}

// ---- Add AI Result to Queue ----
function addAIResultToQueue() {
  if (!lastAIResult) {
    if (typeof showToast === 'function') showToast('No AI result to add', 'error');
    return;
  }

  var nameEl = document.getElementById('patientName');
  var patientName = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() :
    ((typeof currentUserName !== 'undefined') ? currentUserName : 'Patient');

  var severity = (lastAIResult.severity || 'medium').toLowerCase();
  if (!['critical', 'medium', 'low'].includes(severity)) severity = 'medium';

  var p = {
    id: Date.now(),
    patientUsername: (typeof currentUserRole !== 'undefined' && currentUserRole === 'patient' && typeof currentUserName !== 'undefined') ? currentUserName : null,
    name: patientName,
    condition: lastAIResult.condition || 'AI Analyzed Condition',
    conditionKey: 'ai_analysis',
    severity: severity,
    time: new Date().toLocaleTimeString(
      (typeof getCurrentLocale === 'function') ? getCurrentLocale() : 'en-IN',
      { hour: '2-digit', minute: '2-digit' }
    ),
    wait: (typeof getWaitLabelBySeverity === 'function') ? getWaitLabelBySeverity(severity) : '~15 min'
  };

  if (severity === 'critical') {
    patientQueue.unshift(p);
  } else {
    patientQueue.push(p);
  }

  patientQueue.sort(function(a, b) {
    var order = { critical: 0, medium: 1, low: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });

  if (typeof recordVisit === 'function') recordVisit(p);
  if (typeof saveAppData === 'function') saveAppData();
  if (typeof renderQueue === 'function') renderQueue();
  if (typeof renderDoctorDashboard === 'function') renderDoctorDashboard();
  if (typeof renderPatientDashboard === 'function') renderPatientDashboard();
  if (typeof showToast === 'function') showToast('✅ Added to queue: ' + p.name, 'success');
}

// ---- Update AI Labels (called on language change) ----
function updateAILabels() {
  var els = {
    aiSectionTag: 'sectionTag',
    aiSectionTitle: 'sectionTitle',
    aiSectionSub: 'sectionSub',
    aiApiKeyLabel: 'apiKeyLabel',
    aiSaveKeyBtn: 'apiKeySave',
    aiKeyStatusText: 'apiKeySet',
    aiChangeKeyBtn: 'changeKey',
    aiDescribeLabel: 'describeLabel',
    aiAnalyzeBtn: 'askButton'
  };

  Object.keys(els).forEach(function(elId) {
    var el = document.getElementById(elId);
    if (el) el.textContent = aiL(els[elId]);
  });

  // Update placeholder
  var input = document.getElementById('aiSymptomInput');
  if (input) input.placeholder = aiL('describePlaceholder');

  var keyInput = document.getElementById('aiApiKeyInput');
  if (keyInput) keyInput.placeholder = aiL('apiKeyPlaceholder');

  // Update no-result text
  var noResult = document.getElementById('aiNoResult');
  if (noResult) noResult.innerHTML = aiL('noResultText');

  // Re-render result if exists
  if (lastAIResult) {
    renderAIResult(lastAIResult);
  }
}

// ---- Initialize AI Section ----
function initAISection() {
  refreshAIKeyUI();
  updateAILabels();
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initAISection, 100);
  });
} else {
  setTimeout(initAISection, 100);
}

console.log('🤖 AI Doctor module loaded (Groq API)');
