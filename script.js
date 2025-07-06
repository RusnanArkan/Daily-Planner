// --- Global Data Storage ---
// Main data store, keyed by date (YYYY-MM-DD)
let allActivities = {};

// Current active date, will be synchronized with the #currentDate input value
let currentDate = '';

// Template for a single day's activities structure (used for initialization)
const defaultDayActivities = {
  currentTime: '', // Added for daily time tracking
  quran: { completed: [], target: 0, notes: '', photos: [] },
  study: { completed: [], target: 0, notes: '', photos: [] },
  sports: { completed: [], target: 0, notes: '', photos: [], customActivities: [] },
  fun: { completed: [], target: 0, notes: '', photos: [], customActivities: [] },
};

// Quran surahs (static data)
const quranSurahs = [
  'Al-Fatihah',
  'An-Naas',
  'Al-Falaq',
  'Al-Ikhlas',
  'Al-Lahab',
  'An-Nashr',
  'Al-Kafirun',
  'Al-Kautsar',
  "Al-Ma'un",
  'Quraisy',
  'Al-Fil',
  'Al-Humazah',
  'Al-Ashr',
  'At-Takatsur',
  "Al-Qari'ah",
  'Al-Adiyat',
  'Az-Zalzalah',
  'Al-Bayyinah',
  'Al-Qadr',
  'Al-Alaq',
  'At-Tin',
  'Al-Insyirah',
  'Adh-Dhuha',
  'Al-Lail',
  'Asy-Syams',
  'Al-Balad',
  'Al-Fajr',
  'Al-Ghasyiyah',
  "Al-A'laa",
  'At-Thariq',
  'Al-Buruj',
  'Al-Insyiqaq',
  'Al-Mutaffifin',
  'Al-Infitar',
  'At-Takwir',
  "Abasa'",
  "An-Nazi'at",
  "An-Naba'",
];

// Study subjects (static data)
const studySubjects = ['Mengaji', 'Informatika', 'PJOK', 'Bahasa Inggris', 'MTK (Matematika)', 'PAI (Pendidikan Agama Islam)', 'Bahasa Arab', 'BPI (Bimbingan Penyuluhan Islam)', 'Hadist', 'Seni Budaya', 'Pancasila', 'Bahasa Indonesia'];

// --- Utility Functions ---
function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateDateLabel(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dateLabel').textContent = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', options);
}

// --- LocalStorage Functions ---
function saveAllActivitiesToLocalStorage() {
  try {
    localStorage.setItem('allActivitiesData', JSON.stringify(allActivities));
    localStorage.setItem('lastSelectedDate', currentDate); // Save the last selected date
    console.log('All activities data and current date saved to localStorage. Size:', JSON.stringify(allActivities).length, 'bytes');
  } catch (e) {
    console.error('Error saving to localStorage:', e);
    alert('Maaf, tidak dapat menyimpan data. Ruang penyimpanan browser mungkin penuh atau data terlalu besar.');
  }
}

function loadAllActivitiesFromLocalStorage() {
  try {
    const storedData = localStorage.getItem('allActivitiesData');
    console.log('Retrieved from localStorage (allActivitiesData):', storedData ? 'Data found' : 'No data found'); // Log presence of data
    if (storedData) {
      allActivities = JSON.parse(storedData);
      console.log('All activities data loaded from localStorage:', allActivities); // Log the loaded data
    } else {
      allActivities = {}; // Initialize if no data found
      console.log('No activities data found in localStorage. Initializing empty allActivities.');
    }

    const lastSelectedDate = localStorage.getItem('lastSelectedDate');
    console.log('Retrieved from localStorage (lastSelectedDate):', lastSelectedDate || 'No last selected date found'); // Log presence of last selected date
    if (lastSelectedDate) {
      currentDate = lastSelectedDate;
      console.log('Last selected date loaded:', currentDate);
    } else {
      // If no last selected date, default to today
      currentDate = getFormattedDate(new Date());
      console.log('No last selected date found. Defaulting to today:', currentDate);
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    alert('Maaf, tidak dapat memuat data. Data mungkin rusak atau tidak valid.');
    allActivities = {}; // Reset data if parsing fails
    currentDate = getFormattedDate(new Date()); // Reset current date
  }
}

// --- Render List Functions (for checkboxes/custom activities) ---
function renderQuranList(completedSurahs) {
  const quranListDiv = document.getElementById('quranList');
  quranListDiv.innerHTML = ''; // Clear previous list

  quranSurahs.forEach((surah) => {
    const isChecked = completedSurahs.includes(surah);
    quranListDiv.innerHTML += `
            <label class="flex items-center space-x-3">
                <input type="checkbox" value="${surah}" class="form-checkbox h-5 w-5 text-pink-600 rounded-md" ${isChecked ? 'checked' : ''}>
                <span class="text-gray-800">${surah}</span>
            </label>
        `;
  });

  // Add event listeners to checkboxes
  document.querySelectorAll('#quranList input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', saveQuranActivity);
  });
}

function renderStudyList(completedSubjects) {
  const studyListDiv = document.getElementById('studyList');
  studyListDiv.innerHTML = ''; // Clear previous list

  studySubjects.forEach((subject) => {
    const isChecked = completedSubjects.includes(subject);
    studyListDiv.innerHTML += `
            <label class="flex items-center space-x-3">
                <input type="checkbox" value="${subject}" class="form-checkbox h-5 w-5 text-blue-600 rounded-md" ${isChecked ? 'checked' : ''}>
                <span class="text-gray-800">${subject}</span>
            </label>
        `;
  });

  // Add event listeners to checkboxes
  document.querySelectorAll('#studyList input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', saveStudyActivity);
  });
}

function renderSportsList(customActivities) {
  const sportsListDiv = document.getElementById('sportsList');
  sportsListDiv.innerHTML = ''; // Clear previous list

  customActivities.forEach((activity) => {
    sportsListDiv.innerHTML += `
            <div class="flex items-center justify-between bg-purple-100 p-2 rounded-lg mb-2">
                <span class="text-gray-800">${activity}</span>
                <button onclick="removeSportsActivity('${activity}')" class="text-purple-600 hover:text-purple-800 focus:outline-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
  });
}

function renderFunList(customActivities) {
  const funListDiv = document.getElementById('funList');
  funListDiv.innerHTML = ''; // Clear previous list

  customActivities.forEach((activity) => {
    funListDiv.innerHTML += `
            <div class="flex items-center justify-between bg-yellow-100 p-2 rounded-lg mb-2">
                <span class="text-gray-800">${activity}</span>
                <button onclick="removeFunActivity('${activity}')" class="text-yellow-600 hover:text-yellow-800 focus:outline-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
  });
}

// --- Update Progress Functions ---
function updateQuranProgress(completedCount, target) {
  const progressText = document.getElementById('quranProgressText');
  const progressBar = document.getElementById('quranProgressBar');
  const percentage = target > 0 ? (completedCount / target) * 100 : 0;
  progressText.textContent = `${completedCount}/${target}`;
  progressBar.style.width = `${Math.min(percentage, 100)}%`;
  progressBar.classList.toggle('bg-pink-500', percentage < 100);
  progressBar.classList.toggle('bg-green-500', percentage >= 100);
}

function updateStudyProgress(completedCount, target) {
  const progressText = document.getElementById('studyProgressText');
  const progressBar = document.getElementById('studyProgressBar');
  const percentage = target > 0 ? (completedCount / target) * 100 : 0;
  progressText.textContent = `${completedCount}/${target}`;
  progressBar.style.width = `${Math.min(percentage, 100)}%`;
  progressBar.classList.toggle('bg-blue-500', percentage < 100);
  progressBar.classList.toggle('bg-green-500', percentage >= 100);
}

function updateSportsProgress(completedCount, target) {
  const progressText = document.getElementById('sportsProgressText');
  const progressBar = document.getElementById('sportsProgressBar');
  const percentage = target > 0 ? (completedCount / target) * 100 : 0;
  progressText.textContent = `${completedCount}/${target}`;
  progressBar.style.width = `${Math.min(percentage, 100)}%`;
  progressBar.classList.toggle('bg-purple-500', percentage < 100);
  progressBar.classList.toggle('bg-green-500', percentage >= 100);
}

function updateFunProgress(completedCount, target) {
  const progressText = document.getElementById('funProgressText');
  const progressBar = document.getElementById('funProgressBar');
  const percentage = target > 0 ? (completedCount / target) * 100 : 0;
  progressText.textContent = `${completedCount}/${target}`;
  progressBar.style.width = `${Math.min(percentage, 100)}%`;
  progressBar.classList.toggle('bg-yellow-500', percentage < 100);
  progressBar.classList.toggle('bg-green-500', percentage >= 100);
}

// --- Main UI Update Function for Current Date ---
function renderCurrentDateUI() {
  const dateInput = document.getElementById('currentDate');
  dateInput.value = currentDate;
  updateDateLabel(currentDate);

  // Ensure data structure exists for the current date
  if (!allActivities[currentDate]) {
    // Deep copy defaultDayActivities to avoid reference issues
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
    console.log(`Initialized new data structure for date: ${currentDate}`);
  }

  const dayData = allActivities[currentDate];

  // Populate Time Input
  document.getElementById('currentTime').value = dayData.currentTime || '';

  // Populate Quran Modal
  document.getElementById('quranDailyTarget').value = dayData.quran.target || '';
  document.getElementById('quranNotes').value = dayData.quran.notes || '';
  renderQuranList(dayData.quran.completed);
  updateQuranProgress(dayData.quran.completed.length, dayData.quran.target);

  // Populate Study Modal
  document.getElementById('studyDailyTarget').value = dayData.study.target || '';
  document.getElementById('studyNotes').value = dayData.study.notes || '';
  renderStudyList(dayData.study.completed);
  updateStudyProgress(dayData.study.completed.length, dayData.study.target);

  // Populate Sports Modal
  document.getElementById('sportsDailyTarget').value = dayData.sports.target || '';
  document.getElementById('sportsNotes').value = dayData.sports.notes || '';
  renderSportsList(dayData.sports.customActivities); // Use customActivities for rendering
  updateSportsProgress(dayData.sports.customActivities.length, dayData.sports.target);

  // Populate Fun Modal
  document.getElementById('funDailyTarget').value = dayData.fun.target || '';
  document.getElementById('funNotes').value = dayData.fun.notes || '';
  renderFunList(dayData.fun.customActivities); // Use customActivities for rendering
  updateFunProgress(dayData.fun.customActivities.length, dayData.fun.target);

  // Render Photo Gallery
  renderPhotoGallery(dayData);

  // Update overall progress bars
  updateOverallProgress();
}

// --- Save Activity Functions (triggered by user input/actions) ---
function saveQuranActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.quran.target = parseInt(document.getElementById('quranDailyTarget').value) || 0;
  dayData.quran.notes = document.getElementById('quranNotes').value;
  dayData.quran.completed = [];
  document.querySelectorAll('#quranList input[type="checkbox"]:checked').forEach((checkbox) => {
    dayData.quran.completed.push(checkbox.value);
  });

  const quranPhotoInput = document.getElementById('quranPhoto');
  if (quranPhotoInput.files.length > 0) {
    const photoFile = quranPhotoInput.files[0];
    // For simplicity, we store just the file name and a timestamp.
    // In a real app, you'd upload the file and store its URL.
    const photoInfo = { name: photoFile.name, date: new Date().toISOString() };
    if (!dayData.quran.photos.some((p) => p.name === photoInfo.name)) {
      // Prevent duplicates by name
      dayData.quran.photos.push(photoInfo);
    }
  }

  renderQuranList(dayData.quran.completed);
  updateQuranProgress(dayData.quran.completed.length, dayData.quran.target);
  saveAllActivitiesToLocalStorage();
  renderPhotoGallery(dayData);
  updateOverallProgress();
}

function saveStudyActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.study.target = parseInt(document.getElementById('studyDailyTarget').value) || 0;
  dayData.study.notes = document.getElementById('studyNotes').value;
  dayData.study.completed = [];
  document.querySelectorAll('#studyList input[type="checkbox"]:checked').forEach((checkbox) => {
    dayData.study.completed.push(checkbox.value);
  });

  const studyPhotoInput = document.getElementById('studyPhoto');
  if (studyPhotoInput.files.length > 0) {
    const photoFile = studyPhotoInput.files[0];
    const photoInfo = { name: photoFile.name, date: new Date().toISOString() };
    if (!dayData.study.photos.some((p) => p.name === photoInfo.name)) {
      dayData.study.photos.push(photoInfo);
    }
  }

  renderStudyList(dayData.study.completed);
  updateStudyProgress(dayData.study.completed.length, dayData.study.target);
  saveAllActivitiesToLocalStorage();
  renderPhotoGallery(dayData);
  updateOverallProgress();
}

function saveSportsActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.sports.target = parseInt(document.getElementById('sportsDailyTarget').value) || 0;
  dayData.sports.notes = document.getElementById('sportsNotes').value;
  // customActivities are updated via addSportsActivity/removeSportsActivity

  const sportsPhotoInput = document.getElementById('sportsPhoto');
  if (sportsPhotoInput.files.length > 0) {
    const photoFile = sportsPhotoInput.files[0];
    const photoInfo = { name: photoFile.name, date: new Date().toISOString() };
    if (!dayData.sports.photos.some((p) => p.name === photoInfo.name)) {
      dayData.sports.photos.push(photoInfo);
    }
  }

  renderSportsList(dayData.sports.customActivities); // Ensure this is called
  updateSportsProgress(dayData.sports.customActivities.length, dayData.sports.target);
  saveAllActivitiesToLocalStorage();
  renderPhotoGallery(dayData);
  updateOverallProgress();
}

function saveFunActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.fun.target = parseInt(document.getElementById('funDailyTarget').value) || 0;
  dayData.fun.notes = document.getElementById('funNotes').value;
  // customActivities are updated via addFunActivity/removeFunActivity

  const funPhotoInput = document.getElementById('funPhoto');
  if (funPhotoInput.files.length > 0) {
    const photoFile = funPhotoInput.files[0];
    const photoInfo = { name: photoFile.name, date: new Date().toISOString() };
    if (!dayData.fun.photos.some((p) => p.name === photoInfo.name)) {
      dayData.fun.photos.push(photoInfo);
    }
  }

  renderFunList(dayData.fun.customActivities); // Ensure this is called
  updateFunProgress(dayData.fun.customActivities.length, dayData.fun.target);
  saveAllActivitiesToLocalStorage();
  renderPhotoGallery(dayData);
  updateOverallProgress();
}

// --- Add/Remove Custom Activities ---
function addSportsActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  const newActivityInput = document.getElementById('newSportsActivity');
  const activityName = newActivityInput.value.trim();

  if (activityName && !dayData.sports.customActivities.includes(activityName)) {
    dayData.sports.customActivities.push(activityName);
    newActivityInput.value = ''; // Clear input
    saveSportsActivity(); // Calls renderSportsList, updateSportsProgress, saveAllActivitiesToLocalStorage
  }
}

function removeSportsActivity(activityName) {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.sports.customActivities = dayData.sports.customActivities.filter((a) => a !== activityName);
  saveSportsActivity(); // Calls renderSportsList, updateSportsProgress, saveAllActivitiesToLocalStorage
}

function addFunActivity() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  const newActivityInput = document.getElementById('newFunActivity');
  const activityName = newActivityInput.value.trim();

  if (activityName && !dayData.fun.customActivities.includes(activityName)) {
    dayData.fun.customActivities.push(activityName);
    newActivityInput.value = ''; // Clear input
    saveFunActivity(); // Calls renderFunList, updateFunProgress, saveAllActivitiesToLocalStorage
  }
}

function removeFunActivity(activityName) {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  dayData.fun.customActivities = dayData.fun.customActivities.filter((a) => a !== activityName);
  saveFunActivity(); // Calls renderFunList, updateFunProgress, saveAllActivitiesToLocalStorage
}

// --- Date Navigation Functions ---
function changeDate(offset) {
  const current = new Date(currentDate + 'T00:00:00');
  current.setDate(current.getDate() + offset);
  currentDate = getFormattedDate(current);
  renderCurrentDateUI();
  saveAllActivitiesToLocalStorage(); // Save current date selection
}

function loadDateData() {
  // This acts as an adapter, as the main rendering is handled by renderCurrentDateUI
  const dateInput = document.getElementById('currentDate');
  currentDate = dateInput.value;
  renderCurrentDateUI();
  saveAllActivitiesToLocalStorage(); // Save current date selection
}

function goToToday() {
  currentDate = getFormattedDate(new Date());
  renderCurrentDateUI();
  saveAllActivitiesToLocalStorage(); // Save current date selection
}

// --- Overall Progress Functions ---
function updateOverallProgress() {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  const dayData = allActivities[currentDate];

  let totalTargets = 0;
  let totalCompleted = 0;

  if (dayData.quran.target > 0) {
    totalTargets += dayData.quran.target;
    totalCompleted += dayData.quran.completed.length;
  }
  if (dayData.study.target > 0) {
    totalTargets += dayData.study.target;
    totalCompleted += dayData.study.completed.length;
  }
  if (dayData.sports.target > 0) {
    totalTargets += dayData.sports.target;
    totalCompleted += dayData.sports.customActivities.length;
  }
  if (dayData.fun.target > 0) {
    totalTargets += dayData.fun.target;
    totalCompleted += dayData.fun.customActivities.length;
  }

  const dailyProgress = totalTargets > 0 ? (totalCompleted / totalTargets) * 100 : 0;
  document.getElementById('dailyProgress').textContent = `${Math.round(Math.min(dailyProgress, 100))}%`;
  document.getElementById('dailyProgressBar').style.width = `${Math.min(dailyProgress, 100)}%`;
  document.getElementById('dailyProgressBar').classList.toggle('bg-pink-500', dailyProgress < 100);
  document.getElementById('dailyProgressBar').classList.toggle('bg-green-500', dailyProgress >= 100);

  calculateWeeklyAndMonthlyProgress();
}

function calculateWeeklyAndMonthlyProgress() {
  const today = new Date(getFormattedDate(new Date()) + 'T00:00:00');
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  let weeklyTargets = 0;
  let weeklyCompleted = 0;
  let monthlyTargets = 0;
  let monthlyCompleted = 0;

  const sortedDates = Object.keys(allActivities).sort(); // Sort dates ascending

  sortedDates.forEach((dateKey) => {
    const activityDate = new Date(dateKey + 'T00:00:00');
    const dayData = allActivities[dateKey];

    // Weekly
    if (activityDate >= oneWeekAgo && activityDate <= today) {
      weeklyTargets += (dayData.quran.target || 0) + (dayData.study.target || 0) + (dayData.sports.target || 0) + (dayData.fun.target || 0);
      weeklyCompleted += dayData.quran.completed.length + dayData.study.completed.length + dayData.sports.customActivities.length + dayData.fun.customActivities.length;
    }

    // Monthly
    if (activityDate >= oneMonthAgo && activityDate <= today) {
      monthlyTargets += (dayData.quran.target || 0) + (dayData.study.target || 0) + (dayData.sports.target || 0) + (dayData.fun.target || 0);
      monthlyCompleted += dayData.quran.completed.length + dayData.study.completed.length + dayData.sports.customActivities.length + dayData.fun.customActivities.length;
    }
  });

  const weeklyProgress = weeklyTargets > 0 ? (weeklyCompleted / weeklyTargets) * 100 : 0;
  document.getElementById('weeklyProgress').textContent = `${Math.round(Math.min(weeklyProgress, 100))}%`;
  document.getElementById('weeklyProgressBar').style.width = `${Math.min(weeklyProgress, 100)}%`;
  document.getElementById('weeklyProgressBar').classList.toggle('bg-purple-500', weeklyProgress < 100);
  document.getElementById('weeklyProgressBar').classList.toggle('bg-green-500', weeklyProgress >= 100);

  const monthlyProgress = monthlyTargets > 0 ? (monthlyCompleted / monthlyTargets) * 100 : 0;
  document.getElementById('monthlyProgress').textContent = `${Math.round(Math.min(monthlyProgress, 100))}%`;
  document.getElementById('monthlyProgressBar').style.width = `${Math.min(monthlyProgress, 100)}%`;
  document.getElementById('monthlyProgressBar').classList.toggle('bg-blue-500', monthlyProgress < 100);
  document.getElementById('monthlyProgressBar').classList.toggle('bg-green-500', monthlyProgress >= 100);
}

// --- Photo Gallery Functions ---
function renderPhotoGallery(dayData) {
  const photoGalleryDiv = document.getElementById('photoGallery');
  // Clear existing photos but keep the upload placeholder
  photoGalleryDiv.innerHTML = `
        <div class="bg-pink-100 rounded-2xl p-8 text-center border-2 border-dashed border-pink-300">
            <div class="text-4xl text-pink-400 mb-2">📷</div>
            <p class="text-pink-500 text-sm">Upload foto kegiatanmu!</p>
        </div>
    `;

  const allPhotosForDay = [...(dayData.quran.photos || []), ...(dayData.study.photos || []), ...(dayData.sports.photos || []), ...(dayData.fun.photos || [])];

  // Sort photos by date (newest first)
  allPhotosForDay.sort((a, b) => new Date(b.date) - new Date(a.date));

  allPhotosForDay.forEach((photo) => {
    // Placeholder for actual image display. In a real app, you'd handle file storage/URLs.
    // For now, it shows a placeholder image with the file name.
    photoGalleryDiv.innerHTML += `
            <div class="relative group rounded-2xl overflow-hidden shadow-lg border border-pink-200">
                <img src="https://via.placeholder.com/150/FFC0CB/FFFFFF?text=${encodeURIComponent(photo.name.substring(0, Math.min(photo.name.length, 10)))}" alt="${photo.name}" class="w-full h-32 object-cover">
                <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <p class="text-white text-sm text-center">${photo.name}</p>
                </div>
            </div>
        `;
  });
}

// --- Export to Excel Function ---
function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet: Ringkasan Harian
  const dailySummaryData = [
    [
      'Tanggal',
      'Waktu',
      'Quran (Target)',
      'Quran (Selesai)',
      'Quran (Catatan)',
      'Belajar (Target)',
      'Belajar (Selesai)',
      'Belajar (Catatan)',
      'Olahraga (Target)',
      'Olahraga (Selesai)',
      'Olahraga (Catatan)',
      'Fun (Target)',
      'Fun (Selesai)',
      'Fun (Catatan)',
    ],
  ];

  const sortedDates = Object.keys(allActivities).sort(); // Sort dates ascending

  sortedDates.forEach((dateKey) => {
    const dayData = allActivities[dateKey];
    const row = [
      new Date(dateKey + 'T00:00:00').toLocaleDateString('id-ID'),
      dayData.currentTime || '',
      dayData.quran.target || 0,
      dayData.quran.completed.length,
      dayData.quran.notes || '',
      dayData.study.target || 0,
      dayData.study.completed.length,
      dayData.study.notes || '',
      dayData.sports.target || 0,
      dayData.sports.customActivities.length,
      dayData.sports.notes || '',
      dayData.fun.target || 0,
      dayData.fun.customActivities.length,
      dayData.fun.notes || '',
    ];
    dailySummaryData.push(row);
  });

  const dailySummaryWs = XLSX.utils.aoa_to_sheet(dailySummaryData);
  XLSX.utils.book_append_sheet(wb, dailySummaryWs, 'Ringkasan Harian');

  // Sheet: Daftar Foto
  const photosData = [['Tanggal', 'Kategori', 'Nama File', 'Waktu Upload']];
  let hasPhotosInExport = false;

  sortedDates.forEach((dateKey) => {
    const dayData = allActivities[dateKey];
    const dateFormatted = new Date(dateKey + 'T00:00:00').toLocaleDateString('id-ID');

    ['quran', 'study', 'sports', 'fun'].forEach((category) => {
      if (dayData[category] && dayData[category].photos && dayData[category].photos.length > 0) {
        dayData[category].photos.forEach((photo) => {
          photosData.push([
            dateFormatted,
            category.charAt(0).toUpperCase() + category.slice(1), // Capitalize category
            photo.name,
            new Date(photo.date).toLocaleString('id-ID'),
          ]);
          hasPhotosInExport = true;
        });
      }
    });
  });

  if (!hasPhotosInExport) {
    photosData.push(['Tidak ada foto yang diupload']);
  }

  const photosWs = XLSX.utils.aoa_to_sheet(photosData);
  XLSX.utils.book_append_sheet(wb, photosWs, 'Daftar Foto');

  // Save the workbook
  XLSX.writeFile(wb, 'Hasil_Rekap_Asha.xlsx');
}

// --- Reset Data Function ---
function resetAllData() {
  if (confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.')) {
    allActivities = {}; // Clear all in-memory data
    localStorage.removeItem('allActivitiesData'); // Clear from localStorage
    localStorage.removeItem('lastSelectedDate'); // Clear last selected date

    currentDate = getFormattedDate(new Date()); // Reset current date to today
    renderCurrentDateUI(); // Re-render the UI with default/empty data
    alert('Semua data telah direset!');
    console.log('All data has been reset.');
  }
}

// --- Event Listeners ---
// Date navigation buttons
document.getElementById('prevDay').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDay').addEventListener('click', () => changeDate(1));
document.getElementById('goToToday').addEventListener('click', goToToday);
document.getElementById('currentDate').addEventListener('change', loadDateData);

// Custom activity buttons
document.getElementById('addSportsActivityBtn').addEventListener('click', addSportsActivity);
document.getElementById('addFunActivityBtn').addEventListener('click', addFunActivity);

// Save buttons for modals
document.getElementById('saveQuran').addEventListener('click', saveQuranActivity);
document.getElementById('saveStudy').addEventListener('click', saveStudyActivity);
document.getElementById('saveSports').addEventListener('click', saveSportsActivity);
document.getElementById('saveFun').addEventListener('click', saveFunActivity);

// Export button
document.getElementById('exportExcel').addEventListener('click', exportToExcel);

// NEW: Reset Data button
document.getElementById('resetData').addEventListener('click', resetAllData);

// Direct input changes to trigger saves for inputs not directly tied to a "save" button
document.getElementById('currentTime').addEventListener('change', () => {
  if (!allActivities[currentDate]) {
    allActivities[currentDate] = JSON.parse(JSON.stringify(defaultDayActivities));
  }
  allActivities[currentDate].currentTime = document.getElementById('currentTime').value;
  saveAllActivitiesToLocalStorage();
});

// Photo inputs (their change listeners call the respective save functions)
document.getElementById('quranPhoto').addEventListener('change', saveQuranActivity);
document.getElementById('studyPhoto').addEventListener('change', saveStudyActivity);
document.getElementById('sportsPhoto').addEventListener('change', saveSportsActivity);
document.getElementById('funPhoto').addEventListener('change', saveFunActivity);

// Daily targets and notes also call their respective save functions,
// which in turn call saveAllActivitiesToLocalStorage
document.getElementById('quranDailyTarget').addEventListener('change', saveQuranActivity);
document.getElementById('quranNotes').addEventListener('change', saveQuranActivity);

document.getElementById('studyDailyTarget').addEventListener('change', saveStudyActivity);
document.getElementById('studyNotes').addEventListener('change', saveStudyActivity);

document.getElementById('sportsDailyTarget').addEventListener('change', saveSportsActivity);
document.getElementById('sportsNotes').addEventListener('change', saveSportsActivity);

document.getElementById('funDailyTarget').addEventListener('change', saveFunActivity);
document.getElementById('funNotes').addEventListener('change', saveFunActivity);

// --- Initial Load on Page DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
  loadAllActivitiesFromLocalStorage(); // Load all data including last selected date
  // Set the date input to the loaded date, and this will trigger renderCurrentDateUI
  document.getElementById('currentDate').value = currentDate;
  renderCurrentDateUI(); // Render UI for the initial/loaded current date
});
