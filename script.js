const navLinks = document.querySelectorAll('.nav-link');
const routeButton = document.querySelector('#routeButton');
const binValue = document.querySelector('.bin-shape b');
const currentDateTime = document.querySelector('#currentDateTime');
const binShape = document.querySelector('.bin-shape');
const fillMetric = document.querySelector('.metrics strong');
let currentBin;

// Production authentication uses Supabase Auth; only the public anon key belongs here.
const loginForm = document.querySelector('#loginForm');
const loginScreen = document.querySelector('#loginScreen');
const loginStatus = document.querySelector('#loginStatus');
const accountMenu = document.querySelector('#accountMenu');
const accountTrigger = document.querySelector('.account-trigger');
const logoutButton = document.querySelector('#logoutButton');
const supabaseUrl = 'PASTE_SUPABASE_PROJECT_URL_HERE';
const supabaseAnonKey = 'PASTE_SUPABASE_ANON_KEY_HERE';
const hasSupabaseConfig = !supabaseUrl.startsWith('PASTE_') && !supabaseAnonKey.startsWith('PASTE_');
const supabaseClient = hasSupabaseConfig && window.supabase
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : null;
const localDemoEmail = 'mandeep@cleancity.gov';
const localDemoPassword = 'MandeepMIT#2026!';

accountTrigger.addEventListener('click', () => {
  const isOpen = accountMenu.classList.toggle('open');
  accountTrigger.setAttribute('aria-expanded', String(isOpen));
});

logoutButton.addEventListener('click', async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  window.location.reload();
});

function unlockDashboard() {
  document.body.classList.remove('auth-locked');
  loginScreen.remove();
  window.requestAnimationFrame(() => map.invalidateSize({ animate: false }));
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#loginEmail').value.trim().toLowerCase();
  const password = document.querySelector('#loginPassword').value;
  if (!supabaseClient && (email !== localDemoEmail || password !== localDemoPassword)) {
    loginStatus.textContent = 'Invalid email or password.';
    return;
  }
  if (!supabaseClient) {
    unlockDashboard();
    return;
  }
  loginStatus.textContent = 'Signing in...';
  let authResult;
  try {
    authResult = await supabaseClient.auth.signInWithPassword({ email, password });
  } catch (error) {
    loginStatus.textContent = 'Login service unavailable. Try again later.';
    return;
  }
  const { error } = authResult;
  if (error) {
    loginStatus.textContent = 'Invalid email or password.';
    return;
  }
  unlockDashboard();
});

if (supabaseClient) {
  supabaseClient.auth.getSession().then(({ data }) => {
    if (data.session) unlockDashboard();
  });
}

// Demo locations used to distribute bins across Delhi, Noida, and Greater Noida.
const highFootfallLocations = [
  { name: 'New Delhi Railway Station', lat: 28.6426, lng: 77.2197 },
  { name: 'Old Delhi Railway Station', lat: 28.6619, lng: 77.2274 },
  { name: 'Anand Vihar Railway Station', lat: 28.6469, lng: 77.3150 },
  { name: 'Kashmere Gate ISBT', lat: 28.6675, lng: 77.2282 },
  { name: 'Anand Vihar ISBT', lat: 28.6469, lng: 77.3160 },
  { name: 'Kashmere Gate Metro', lat: 28.6675, lng: 77.2282 },
  { name: 'Rajiv Chowk Metro', lat: 28.6328, lng: 77.2197 },
  { name: 'Hauz Khas Metro', lat: 28.5433, lng: 77.2066 },
  { name: 'Chandni Chowk Market', lat: 28.6506, lng: 77.2303 },
  { name: 'Sarojini Nagar Market', lat: 28.5753, lng: 77.1991 },
  { name: 'Lajpat Nagar Central Market', lat: 28.5677, lng: 77.2433 },
  { name: 'Connaught Place Market', lat: 28.6315, lng: 77.2167 },
  { name: 'Saket Metro and Mall', lat: 28.5244, lng: 77.2066 },
  { name: 'Select Citywalk Mall', lat: 28.5287, lng: 77.2197 },
  { name: 'AIIMS Hospital', lat: 28.5672, lng: 77.2100 },
  { name: 'Safdarjung Hospital', lat: 28.5687, lng: 77.2070 },
  { name: 'Jawaharlal Nehru Stadium', lat: 28.5833, lng: 77.2333 },
  { name: 'India Gate Tourist Area', lat: 28.6129, lng: 77.2295 },
  { name: 'Rohini Sector 10 Market', lat: 28.7301, lng: 77.1130 },
  { name: 'Dwarka Sector 21 Metro', lat: 28.5526, lng: 77.0586 }
];

const randomLocations = [
  { name: 'Rohini Residential Area', lat: 28.7496, lng: 77.0565 },
  { name: 'Dwarka Residential Area', lat: 28.5921, lng: 77.0460 },
  { name: 'Janakpuri Residential Area', lat: 28.6219, lng: 77.0878 },
  { name: 'Pitampura Residential Area', lat: 28.7033, lng: 77.1322 },
  { name: 'Shahdara Residential Area', lat: 28.6735, lng: 77.2890 },
  { name: 'Mayur Vihar Residential Area', lat: 28.6047, lng: 77.2948 },
  { name: 'Vasant Kunj Residential Area', lat: 28.5206, lng: 77.1587 },
  { name: 'Civil Lines Residential Area', lat: 28.6767, lng: 77.2250 },
  { name: 'Okhla Industrial Area', lat: 28.5355, lng: 77.2732 },
  { name: 'Mehrauli Local Area', lat: 28.5245, lng: 77.1855 },
  { name: 'Punjabi Bagh Local Area', lat: 28.6680, lng: 77.1320 },
  { name: 'Greater Kailash Local Area', lat: 28.5414, lng: 77.2382 },
  { name: 'West Delhi Janakpuri', lat: 28.6219, lng: 77.0878 },
  { name: 'West Delhi Rajouri Garden', lat: 28.6469, lng: 77.1220 },
  { name: 'West Delhi Tilak Nagar', lat: 28.6360, lng: 77.0960 },
  { name: 'North Delhi Model Town', lat: 28.7041, lng: 77.1930 },
  { name: 'North Delhi Civil Lines', lat: 28.6767, lng: 77.2250 },
  { name: 'North Delhi Rohini', lat: 28.7496, lng: 77.0565 },
  { name: 'South Delhi Saket', lat: 28.5244, lng: 77.2066 },
  { name: 'South Delhi Vasant Kunj', lat: 28.5206, lng: 77.1587 },
  { name: 'South Delhi Kalkaji', lat: 28.5355, lng: 77.2577 },
  { name: 'East Delhi Laxmi Nagar', lat: 28.6304, lng: 77.2773 },
  { name: 'East Delhi Mayur Vihar', lat: 28.6047, lng: 77.2948 },
  { name: 'East Delhi Shahdara', lat: 28.6735, lng: 77.2890 },
  { name: 'Noida Sector 18', lat: 28.5706, lng: 77.3219 },
  { name: 'Noida Sector 62', lat: 28.6271, lng: 77.3730 },
  { name: 'Noida Sector 137', lat: 28.5095, lng: 77.4100 },
  { name: 'Greater Noida Pari Chowk', lat: 28.4650, lng: 77.5080 },
  { name: 'Greater Noida Knowledge Park', lat: 28.4744, lng: 77.4830 },
  { name: 'Greater Noida Techzone', lat: 28.5860, lng: 77.4300 }
];

const allLocations = [...highFootfallLocations, ...randomLocations];

function createBins() {
  // Generate the prototype's 100 bins with fill, rate, status, and collection data.
  const daySeed = Math.floor(Date.now() / 86400000);
  return Array.from({ length: 100 }, (_, index) => {
    const id = 100001 + index;
    const dailyOffset = (daySeed + index * 13) % 17;
    const isCritical = (index + daySeed) % 8 === 0 || (index + daySeed) % 43 === 0;
    const isWarning = !isCritical && ((index + daySeed) % 4 === 1 || (index + daySeed) % 9 === 4);
    const wasteWeight = isCritical
      ? 45 + ((dailyOffset * 2) % 6)
      : isWarning
        ? 25 + ((index * 5 + daySeed) % 11)
        : 1 + ((index * 37 + daySeed + 11) % 20);
    const fill = getFillPercentage(wasteWeight, 50);
    const wasteRate = (1.5 + index * 0.1).toFixed(1);
    const collectedDay = 1 + (index % 28);
    const collectedMonth = ['Aug', 'Sep', 'Oct', 'Nov'][Math.floor(index / 28)];
    const collectedHour = 6 + (index % 12);
    const status = getBinStatus(fill);
    const isHighFootfall = index < 60;
    const location = allLocations[(index * 7) % allLocations.length];
    const latitude = location.lat + (((index * 17) % 11) - 5) / 1000;
    const longitude = location.lng + (((index * 23) % 11) - 5) / 1000;

    return {
      id,
      name: `${location.name}${isHighFootfall ? '' : ', Zone ' + ((index % 5) + 1)}`,
      lat: latitude,
      lng: longitude,
      fill,
      wasteWeight,
      capacity: 50,
      initialFill: fill,
      initialWasteWeight: wasteWeight,
      wasteRate,
      lastCollected: `${collectedDay} ${collectedMonth} 2026, ${collectedHour}:30 AM`,
      status
    };
  });
}

const binLocations = createBins();
const binById = new Map(binLocations.map((bin) => [String(bin.id), bin]));
const searchInput = document.querySelector('.filters input');
const zoneFilter = document.querySelector('.filters select');
const zoneLabel = document.createElement('span');
zoneLabel.className = 'zone-label';
zoneLabel.textContent = 'All Zones';
zoneLabel.style.color = '#ffffff';
zoneLabel.style.fontWeight = '700';
zoneLabel.style.padding = '8px 10px';
zoneFilter.replaceWith(zoneLabel);
const binPanelTitle = document.querySelector('.bin-panel h2');
const binPanelLocation = document.querySelector('.bin-panel .location');
const metricValues = document.querySelectorAll('.bin-panel .metrics strong');
const predictedCriticalTime = document.querySelector('#predictedCriticalTime');
const overflowRisk = document.querySelector('#overflowRisk');
const collectionPriority = document.querySelector('#collectionPriority');
const selectedBinMarker = new Map();
const areaWasteBars = document.querySelectorAll('#areaWasteBars [data-area]');
const dashboardView = document.querySelector('#dashboard');
const liveBinsView = document.querySelector('#liveBinsView');
const liveBinsTable = document.querySelector('#liveBinsTable');
const liveBinsSearch = document.querySelector('#liveBinsSearch');
const liveListSearch = document.querySelector('#liveListSearch');
const liveZoneFilter = document.querySelector('#liveZoneFilter');
const liveStatusFilter = document.querySelector('#liveStatusFilter');

// Marker appearance and per-bin status helpers.
function createBinIcon(status) {
  return L.divIcon({
    className: `bin-marker ${status}`,
    html: '<span>▥</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

function getBinStatus(fill) {
  return fill >= 100 ? 'critical' : fill > 70 ? 'high' : fill > 40 ? 'warning' : 'normal';
}

function getFillPercentage(weight, capacity) {
  return Math.round((weight / capacity) * 100);
}

function getPredictedCriticalMinutes(bin) {
  const minutesToFull = Math.max(0, ((bin.capacity - bin.wasteWeight) / Number(bin.wasteRate)) * 60);
  const predictionVariation = (bin.id * 11) % 36;
  return Math.min(600, Math.max(5, Math.round(minutesToFull + predictionVariation)));
}

function formatPredictionTime(minutes) {
  if (minutes < 60) return `${minutes} minutes`;
  return `${(minutes / 60).toFixed(1)} hours`;
}

function updateAreaWasteChart() {
  const daySeed = Math.floor(Date.now() / 86400000);
  const baseWeights = [52, 88, 64, 46, 58];
  const values = Array.from(areaWasteBars, (bar, index) => {
    const dailyChange = ((daySeed + (index * 13)) % 19) - 9;
    return baseWeights[index] + dailyChange;
  });
  const maximum = Math.max(...values);

  areaWasteBars.forEach((bar, index) => {
    const waste = values[index];
    bar.style.setProperty('--h', `${Math.round((waste / maximum) * 100)}%`);
    bar.title = `${bar.dataset.area}: ${waste} kg generated today`;
  });
}

function updateWasteTrendChart() {
  const trendChart = document.querySelector('.line-chart svg');
  if (!trendChart) return;

  const trendLine = trendChart.querySelector('path');
  const trendArea = trendChart.querySelectorAll('path')[1];
  const trendPoints = trendChart.querySelectorAll('circle');
  const xPositions = [25, 95, 165, 235, 305, 375, 455];
  const daySeed = Math.floor(Date.now() / 86400000);
  const baseValues = [54, 62, 58, 76, 68, 84, 79];
  const values = baseValues.map((value, index) => value + ((daySeed + index * 7) % 17) - 8);
  const points = values.map((value, index) => `${xPositions[index]} ${140 - value}`).join(' L');

  trendLine.setAttribute('d', `M${points}`);
  trendArea.setAttribute('d', `M${points} V140 H25Z`);
  trendPoints.forEach((point, index) => {
    point.setAttribute('cy', 140 - values[index]);
    point.setAttribute('data-waste-kg', `${values[index]} kg`);
  });
}

function updateWasteComposition() {
  const daySeed = Math.floor(Date.now() / 86400000);
  const totalTons = 13300 + ((daySeed % 9) - 4) * 50;
  const composition = [
    { name: 'Organic', percentage: 52 },
    { name: 'Plastic', percentage: 18 },
    { name: 'Paper', percentage: 12 },
    { name: 'Metal', percentage: 8 },
    { name: 'Others', percentage: 10 }
  ];
  const totalElement = document.querySelector('.composition .donut strong');
  const compositionItems = document.querySelectorAll('.composition li');

  document.querySelector('.composition h2').textContent = 'Waste Composition (Daily)';
  totalElement.textContent = `${totalTons.toLocaleString('en-IN')} tons`;
  compositionItems.forEach((item, index) => {
    const entry = composition[index];
    const amount = index === composition.length - 1
      ? totalTons - composition.slice(0, -1).reduce((sum, category) => sum + Math.round(totalTons * category.percentage / 100), 0)
      : Math.round(totalTons * entry.percentage / 100);
    item.querySelector('b').textContent = `${entry.percentage}% (${amount.toLocaleString('en-IN')} t)`;
    item.title = `${entry.name}: ${amount.toLocaleString('en-IN')} tons per day`;
  });
}

// In-page View All screens for collection priority and alert history.
function keepPriorityBinsInPlan() {
  document.querySelectorAll('.plan-panel tbody tr').forEach((row) => {
    const priorityDot = row.querySelector('i.dot');
    const isPriorityBin = priorityDot?.classList.contains('critical') || priorityDot?.classList.contains('warning');
    if (!isPriorityBin) row.remove();
  });
}

function renderCollectionView(priorityBins, routeGenerated = false) {
  const rows = priorityBins.map((bin, index) => `<tr><td>${index + 1}</td><td><i class="dot ${bin.status === 'critical' ? 'critical' : 'warning'}"></i> #${bin.id}</td><td>${bin.name}</td><td>${bin.fill}%</td><td>${formatPredictionTime(getPredictedCriticalMinutes(bin))}</td></tr>`).join('');
  const collectionView = document.querySelector('#collectionView');
  const dashboardMap = document.querySelector('#map');
  collectionView.innerHTML = `<div class="collection-view-card"><div class="collection-view-head"><div><span class="eyebrow">AI COLLECTION CONTROL</span><h2>Priority Collection Bins</h2><p>${priorityBins.length} red and yellow bins require collection attention.</p></div><button class="collection-close" type="button" aria-label="Close collection view">×</button></div><div class="collection-view-actions"><button class="route-button collection-route" type="button">♧ &nbsp; ${routeGenerated ? 'Route Optimized' : 'Generate Optimized Route'}</button><span>${routeGenerated ? 'Sorted by predicted critical time' : 'Ready for route planning'}</span></div><div class="collection-table-wrap"><table><thead><tr><th>Priority</th><th>Bin</th><th>Location</th><th>Fill</th><th>Critical In</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  const collectionCard = collectionView.querySelector('.collection-view-card');
  collectionCard.style.maxWidth = '1100px';
  collectionCard.style.padding = '18px';
  collectionCard.style.borderRadius = '12px';
  collectionView.querySelector('.collection-route').style.color = '#ffffff';
  collectionView.classList.add('open');
  dashboardMap.style.visibility = 'hidden';
  collectionView.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  collectionView.querySelector('.collection-close').addEventListener('click', () => {
    collectionView.classList.remove('open');
    dashboardMap.style.visibility = '';
    collectionView.style.overflow = '';
    document.body.style.overflow = '';
  });
  collectionView.querySelector('.collection-route').addEventListener('click', () => {
    const optimizedBins = [...priorityBins].sort((firstBin, secondBin) => getPredictedCriticalMinutes(firstBin) - getPredictedCriticalMinutes(secondBin));
    renderCollectionView(optimizedBins, true);
  });
}

function setupCollectionView() {
  const planViewAll = document.querySelector('.plan-panel .panel-title a');
  if (!planViewAll) return;

  const collectionView = document.createElement('section');
  collectionView.id = 'collectionView';
  collectionView.className = 'collection-view';
  collectionView.style.background = '#06131eb8';
  collectionView.style.opacity = '1';
  collectionView.style.backdropFilter = 'blur(5px)';
  document.body.append(collectionView);
  collectionView.addEventListener('click', (event) => {
    if (event.target === collectionView) collectionView.querySelector('.collection-close')?.click();
  });
  planViewAll.addEventListener('click', (event) => {
    event.preventDefault();
    const priorityBins = binLocations.filter((bin) => bin.status === 'critical' || bin.status === 'warning');
    renderCollectionView(priorityBins);
  });
}

function setupAlertsView() {
  const alertsViewAll = document.querySelector('.alerts-panel .panel-title a');
  if (!alertsViewAll) return;

  const alertsView = document.createElement('section');
  alertsView.id = 'alertsView';
  alertsView.className = 'collection-view';
  alertsView.style.zIndex = '9999';
  alertsView.style.background = '#06131eb8';
  alertsView.style.opacity = '1';
  alertsView.style.backdropFilter = 'blur(5px)';
  document.body.append(alertsView);
  alertsView.addEventListener('click', (event) => {
    if (event.target === alertsView) alertsView.querySelector('.collection-close')?.click();
  });

  alertsViewAll.addEventListener('click', (event) => {
    event.preventDefault();
    const today = new Date();
    const historyRows = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const daySeed = Math.floor(date.getTime() / 86400000);
      const criticalAlerts = 3 + (daySeed % 5);
      const warningAlerts = 6 + ((daySeed * 3) % 7);
      const collectionAlerts = 4 + ((daySeed * 5) % 6);
      const totalAlerts = criticalAlerts + warningAlerts + collectionAlerts;
      return `<tr><td>${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td><i class="dot critical"></i>${criticalAlerts}</td><td><i class="dot warning"></i>${warningAlerts}</td><td>${collectionAlerts}</td><td>${totalAlerts} alerts handled</td></tr>`;
    }).join('');

    alertsView.innerHTML = `<div class="collection-view-card"><div class="collection-view-head"><div><span class="eyebrow">ALERT MONITORING HISTORY</span><h2>Past 7 Days Live Alerts</h2><p>Daily critical, warning and collection alerts from the municipal network.</p></div><button class="collection-close" type="button" aria-label="Close alert history">×</button></div><div class="collection-table-wrap"><table><thead><tr><th>Date</th><th>Critical</th><th>Warning</th><th>Collection</th><th>Daily Summary</th></tr></thead><tbody>${historyRows}</tbody></table></div></div>`;
    const alertsCard = alertsView.querySelector('.collection-view-card');
    alertsCard.style.maxWidth = '900px';
    alertsCard.style.padding = '18px';
    alertsCard.style.borderRadius = '12px';
    alertsView.classList.add('open');
    alertsView.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    alertsView.querySelector('.collection-close').addEventListener('click', () => {
      alertsView.classList.remove('open');
      alertsView.style.overflow = '';
      document.body.style.overflow = '';
    });
  });
}

function updatePredictionPanel(bin) {
  predictedCriticalTime.textContent = formatPredictionTime(getPredictedCriticalMinutes(bin));
  overflowRisk.textContent = `● ${bin.fill >= 100 ? 'High' : bin.fill > 70 ? 'Medium' : 'Low'}`;
  collectionPriority.textContent = `● ${bin.fill > 70 ? 'High' : bin.fill > 40 ? 'Medium' : 'Normal'}`;
}

const map = L.map('map', {
  zoomControl: true,
  preferCanvas: true,
  zoomAnimation: false,
  fadeAnimation: false,
  markerZoomAnimation: false,
  inertia: true,
  worldCopyJump: false
}).setView([28.6139, 77.2090], 11);

// OpenStreetMap tiles provide the live map background.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1,
  detectRetina: false,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function popupContent(bin) {
  return `<b>Bin #${bin.id}</b><br><span>${bin.name}</span><hr><p>Fill Level <strong>${bin.fill}%</strong></p><p>Waste Weight <strong>${bin.wasteWeight} kg</strong></p><p>Status <strong>${bin.status}</strong></p><p>Predicted Critical Time <strong>${formatPredictionTime(getPredictedCriticalMinutes(bin))}</strong></p>`;
}

function restoreBin(bin) {
  bin.wasteWeight = bin.initialWasteWeight;
  bin.fill = bin.initialFill;
  bin.status = getBinStatus(bin.fill);
  const marker = selectedBinMarker.get(String(bin.id));
  if (marker) {
    marker.setIcon(createBinIcon(bin.status));
    marker.setPopupContent(popupContent(bin));
  }
}

function updateBinVisuals(bin) {
  const marker = selectedBinMarker.get(String(bin.id));
  binValue.textContent = `${bin.fill}%`;
  fillMetric.textContent = `${bin.fill}%`;
  metricValues[1].textContent = `${bin.wasteWeight} kg`;
  binShape.style.setProperty('--fill-level', `${bin.fill}%`);
  binShape.classList.remove('empty', 'warning', 'high', 'full');
  if (bin.fill === 0) binShape.classList.add('empty');
  else if (bin.fill > 70) binShape.classList.add(bin.fill >= 100 ? 'full' : 'high');
  else if (bin.fill > 40) binShape.classList.add('warning');
  if (marker) {
    marker.setIcon(createBinIcon(bin.status));
    marker.setPopupContent(popupContent(bin));
  }
}

function showBin(bin, focus = true) {
  if (currentBin && currentBin !== bin) restoreBin(currentBin);
  currentBin = bin;
  const marker = selectedBinMarker.get(String(bin.id));
  binPanelTitle.textContent = `▥ Bin #${bin.id}`;
  binPanelLocation.textContent = `⌖ ${bin.name}`;
  metricValues[0].textContent = `${bin.fill}%`;
  metricValues[1].textContent = `${bin.wasteWeight} kg`;
  metricValues[2].textContent = `${bin.wasteRate} kg/hr`;
  metricValues[4].textContent = bin.lastCollected;
  updatePredictionPanel(bin);
  updateBinVisuals(bin);
  if (marker && focus) {
    marker.openPopup();
    map.panTo(marker.getLatLng(), { animate: false });
  }
}

binLocations.forEach((bin) => {
  const marker = L.marker([bin.lat, bin.lng], { icon: createBinIcon(bin.status) }).addTo(map);
  selectedBinMarker.set(String(bin.id), marker);
  marker.bindPopup(popupContent(bin));
  marker.on('click', () => showBin(bin));
});

const demoBin = binLocations[0];
showBin(demoBin, false);

function liveStatusLabel(status) {
  return status === 'normal' ? 'Normal' : status === 'warning' ? 'Attention' : status[0].toUpperCase() + status.slice(1);
}

function renderLiveBinsTable() {
  const query = (liveListSearch.value || liveBinsSearch.value).trim().toLowerCase();
  const zone = liveZoneFilter.value;
  const status = liveStatusFilter.value;
  const filteredBins = binLocations.filter((bin) => {
    const matchesQuery = !query || String(bin.id).includes(query) || bin.name.toLowerCase().includes(query);
    const matchesStatus = status === 'All Status' || liveStatusLabel(bin.status) === status;
    const name = bin.name.toLowerCase();
    const matchesZone = zone === 'All Zones' || (zone === 'Market Area' && /market|mall|connaught place|saket/.test(name)) || (zone === 'Civil Lines' && name.includes('civil lines'));
    return matchesQuery && matchesStatus && matchesZone;
  }).slice(0, 100);

  liveBinsTable.innerHTML = filteredBins.map((bin) => `<tr data-bin-id="${bin.id}"><td>#${String(bin.id).slice(-2)}</td><td>${bin.name.replace(/, Zone \d+$/, '')}</td><td>${bin.fill}%</td><td><span class="live-status ${bin.status}">${liveStatusLabel(bin.status)}</span></td></tr>`).join('');
  liveBinsTable.querySelectorAll('tr').forEach((row) => row.addEventListener('click', () => {
    const bin = binById.get(row.dataset.binId);
    if (bin) {
      showBin(bin);
      liveMap.setView([bin.lat, bin.lng], 13);
    }
  }));
}

const liveMap = L.map('liveBinsMap', { zoomControl: true, preferCanvas: true, zoomAnimation: false, fadeAnimation: false }).setView([28.6139, 77.2090], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(liveMap);
binLocations.forEach((bin) => {
  const marker = L.marker([bin.lat, bin.lng], { icon: createBinIcon(bin.status) }).addTo(liveMap);
  marker.bindPopup(popupContent(bin));
  marker.on('click', () => showBin(bin, false));
});
renderLiveBinsTable();
[liveBinsSearch, liveListSearch, liveZoneFilter, liveStatusFilter].forEach((control) => control.addEventListener('input', renderLiveBinsTable));

function switchView(viewName) {
  const isLiveBins = viewName === 'Live Bins';
  dashboardView.style.display = isLiveBins ? 'none' : '';
  liveBinsView.classList.toggle('open', isLiveBins);
  document.body.style.overflow = isLiveBins ? 'hidden' : '';
  if (isLiveBins) window.requestAnimationFrame(() => {
    liveMap.invalidateSize({ animate: false });
    liveMap.setView([28.6139, 77.2090], 11, { animate: false });
  });
}

function searchBin() {
  const bin = binById.get(searchInput.value.trim());
  if (bin) showBin(bin);
}

searchInput.addEventListener('input', () => {
  if (/^\d{6}$/.test(searchInput.value.trim())) searchBin();
});
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchBin();
});

zoneFilter.addEventListener('change', () => {
  const zone = zoneFilter.value;
  binLocations.forEach((bin) => {
    const marker = selectedBinMarker.get(String(bin.id));
    const name = bin.name.toLowerCase();
    const visible = zone === 'All Zones'
      || (zone === 'Market Area' && /market|mall|connaught place|saket/.test(name))
      || (zone === 'Civil Lines' && name.includes('civil lines'));
    if (visible) marker.addTo(map);
    else map.removeLayer(marker);
  });
});

function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

  currentDateTime.innerHTML = `${date}<br><b>${time}</b>`;
}

updateDateTime();
updateAreaWasteChart();
updateWasteTrendChart();
updateWasteComposition();
keepPriorityBinsInPlan();
setupCollectionView();
setupAlertsView();
window.setInterval(updateDateTime, 1000);

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    switchView(link.dataset.view);
  });
});

document.querySelectorAll('[data-return-view]').forEach((link) => {
  link.addEventListener('click', () => {
    const viewName = link.dataset.returnView;
    const matchingNav = Array.from(navLinks).find((navLink) => navLink.dataset.view === viewName);
    matchingNav?.click();
  });
});

document.querySelectorAll('.map-pin').forEach((pin) => {
  pin.addEventListener('click', () => {
    document.querySelectorAll('.map-pin').forEach((item) => item.classList.remove('selected'));
    pin.classList.add('selected');
  });
});

document.querySelectorAll('[data-add]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentBin) return;
    const weightChange = Number(button.dataset.add);
    currentBin.wasteWeight = Math.max(0, Math.min(currentBin.capacity, currentBin.wasteWeight + weightChange));
    currentBin.fill = getFillPercentage(currentBin.wasteWeight, currentBin.capacity);
    currentBin.status = getBinStatus(currentBin.fill);
    updateBinVisuals(currentBin);
    metricValues[0].textContent = `${currentBin.fill}%`;
    updatePredictionPanel(currentBin);
  });
});

routeButton.addEventListener('click', () => {
  routeButton.textContent = '✓ Route Optimized';
  routeButton.classList.add('done');
  window.setTimeout(() => {
    routeButton.textContent = '♧  Generate Optimized Route';
    routeButton.classList.remove('done');
  }, 2200);
});
