
// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var THREE: any;
declare var firebase: any;

interface Window {
    // FIX: Changed timer handle type to 'any' to support both browser (number) and Node.js (Timeout) return types from setInterval.
    autosaveInterval?: any;
    handleTrade?: (type: 'buy' | 'sell', coinId: string) => void;
    handleMaxAmount?: (type: 'buy' | 'sell', coinId: string) => void;
}

// --- Firebase 설정 ---
const firebaseConfig = {
  apiKey: "AIzaSyB5bYYQ7sIPOy1hjhKz0gqWIk28PK-ma9E",
  authDomain: "real-d1d0a.firebaseapp.com",
  databaseURL: "https://real-d1d0a-default-rtdb.firebaseio.com",
  projectId: "real-d1d0a",
  storageBucket: "real-d1d0a.firebasestorage.app",
  messagingSenderId: "362480200866",
  appId: "1:362480200866:web:ae6e59d94a9e3fef51fbfb",
  measurementId: "G-Q40RNTCZW5"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();


// --- 전역 설정 ---
const DATA_VERSION = 4; // Data version for migration/reset
const V2_UPDATE_TIMESTAMP = new Date('2024-09-01T09:00:00Z').getTime(); // v2 업데이트 예시 시간 (UTC)
const WEATHER_DATA: {[key: string]: { icon: string, short_desc: string, long_desc: string, isBad?: boolean, isGood?: boolean }} = {
    '맑음': { icon: '☀️', short_desc: '상승 확률 소폭 증가', long_desc: '코인 증가 확률 +0.5%, 감소 확률 -0.5%', isGood: true },
    '비': { icon: '🌧️', short_desc: 'CUBE 상승 확률 증가', long_desc: 'CUBE 코인 증가 확률 +1%, 감소 확률 -1%.', isGood: true },
    '구름': { icon: '☁️', short_desc: '효과 없음', long_desc: '특별한 효과는 없습니다.' },
    '산성비': { icon: '☣️', short_desc: '하락 확률 증가', long_desc: '코인 증가 확률 -2.5%, 코인 감소 확률 +2.5%.', isBad: true },
    '천둥': { icon: '⛈️', short_desc: '인터넷 끊김 주의', long_desc: '5% 확률로 인터넷 연결이 끊겨 거래 등 일부 행동이 제한됩니다.', isBad: true },
    '무지개': { icon: '🌈', short_desc: '상승 확률 대폭 증가', long_desc: '코인 증가 확률 +2.5%, 감소 확률 -2.5%.', isGood: true },
    '바람': { icon: '💨', short_desc: '효과 없음', long_desc: '현재 특별한 효과 없음.' },
    '황사': { icon: '😷', short_desc: '코인 변화 시간 증가', long_desc: '모든 코인 변화에 걸리는 시간이 10% 증가합니다.', isBad: true },
    '폭염': { icon: '🥵🔥', short_desc: '패시브 수입 감소', long_desc: '3D 큐브의 패시브 KRW 수입이 50% 감소합니다.', isBad: true },
    '폭우': { icon: '🌊', short_desc: '자동화 기능 정지', long_desc: '채굴 컴퓨터가 작동하지 않습니다. 디지털 시계가 가끔 오류를 일으킵니다.', isBad: true },
    '눈': { icon: '❄️', short_desc: '수면 불가', long_desc: '눈이 내려 수면을 취할 수 없습니다.', isBad: true },
    '별똥별': { icon: '🌠', short_desc: '상승 확률 증가', long_desc: '모든 코인 증가 확률 +2.5%, 감소 확률 -2.5%.', isGood: true },
    '우박': { icon: '🌨️', short_desc: '하락 확률 증가', long_desc: '모든 코인 증가 확률 -2.5%, 감소 확률 +2.5%.', isBad: true },
    '오로라': { icon: '✨', short_desc: '최고의 환경', long_desc: '모든 코인 증가 확률 +5%, 감소 확률 -5%. 모든 코인 변화 시간 -20%.', isGood: true },
};

const TROPHY_DATA = {
    'powerMaster': { name: '전력 트로피', icon: '🏆', desc: '자동 채굴로 모든 종류의 코인을 100개 이상 획득했습니다.', reward: 'ENERGY 코인 변동성이 약간 안정됩니다 (+1% 상승 확률, -1% 하락 확률).', isUnlocked: (state: any) => state.hasPowerTrophy },
    'timeMaster': { name: '시간의 트로피', icon: '🏆', desc: '20번 이상 수면을 취했습니다.', reward: '밤 시간 동안 모든 코인의 변동 주기가 5% 짧아집니다.', isUnlocked: (state: any) => state.hasTimeTrophy },
    'weatherMaster': { name: '날씨의 지배자', icon: '🏆', desc: '모든 종류의 날씨를 경험했습니다.', reward: '좋은 날씨 확률 +2.5%, 나쁜 날씨 확률 -2.5%', isUnlocked: (state: any) => state.hasWeatherTrophy }
};

const SEASONS = ['봄', '여름', '가을', '겨울'];
const SEASON_EMOJI_MAP: { [key: string]: string } = { '봄': '🌸', '여름': '☀️', '가을': '🍁', '겨울': '❄️' };

const RESOURCE_NAME_MAP: { [key: string]: string } = {
    userCash: 'KRW',
    userCubes: 'CUBE', userLunar: 'LUNAR', userEnergy: 'ENERGY', userPrisms: 'PRISM',
    userDigital: 'DIGITAL', userAurora: 'AURORA', userMagicStone: '마법석', userDataCrystal: '데이터 결정'
};

let gameLoopInterval: any = null;
let priceUpdateIntervals: any = {};
let gameTime: Date;
let dom: any = {};
let notificationTimeout: any = null;
let announcementInterval: any = null;
let userNickname: string | null = null;
let userUID: string | null = null;
let scene: any, camera: any, renderer: any, cube: any;
let globalWeatherOverride: string | null = null;
let globalPriceOverrides: any = null;
let currentGameSpeed = 1;
let gameState: any;
let nextWeatherTime = 0; // Used for display calculation

const COIN_DATA: {[key: string]: any} = {
    Cube: {
        priceKey: 'currentPrice',
        amountKey: 'userCubes',
        minPrice: 5000,
        maxPrice: 25000,
        interval: 2000,
        upChance: 0.53, // -2%
        fluctuation: {
            day: { small: 0.6, medium: 0.35, large: 0.05 },
            night: { small: 0.6, medium: 0.35, large: 0.05 }
        }
    },
    Lunar: {
        priceKey: 'currentLunarPrice',
        amountKey: 'userLunar',
        minPrice: 10000,
        maxPrice: 50000,
        interval: { day: 2500, night: 1500 },
        upChance: { day: 0.45, night: 0.55 },
        fluctuation: {
            day: { small: 0.7, medium: 0.3, large: 0 },
            night: { small: 0.5, medium: 0.4, large: 0.1 }
        }
    },
    Energy: {
        priceKey: 'currentEnergyPrice',
        amountKey: 'userEnergy',
        minPrice: 20000,
        maxPrice: 100000,
        interval: 3500,
        upChance: 0.50,
        fluctuation: {
            day: { small: 0, medium: 0.9, large: 0.1 },
            night: { small: 0, medium: 0.9, large: 0.1 }
        }
    },
    Prism: {
        priceKey: 'currentPrismPrice',
        amountKey: 'userPrisms',
        minPrice: 40000,
        maxPrice: 200000,
        interval: 3000,
        upChance: 0.47, // -4% total (was 0.49)
        fluctuation: {
            day: { small: 0.6, medium: 0.38, large: 0.02 },
            night: { small: 0.6, medium: 0.38, large: 0.02 }
        }
    },
    Digital: {
        priceKey: 'currentDigitalPrice',
        amountKey: 'userDigital',
        minPrice: 80000,
        maxPrice: 500000,
        interval: 3000,
        upChance: 0.50, // -4% total (was 0.52)
        fluctuation: {
            day: { small: 0.98, medium: 0, large: 0.02 },
            night: { small: 0.98, medium: 0, large: 0.02 }
        }
    },
    Aurora: {
        priceKey: 'currentAuroraPrice',
        amountKey: 'userAurora',
        minPrice: 100000,
        maxPrice: 2000000,
        interval: 4000,
        upChance: 0.51,
        fluctuation: {
            day: { small: 0.7, medium: 0.3, large: 0 },
            night: { small: 0.7, medium: 0.3, large: 0 }
        }
    }
};

// --- 게임 데이터 정의 ---
// Computer effects are now probabilities per minute (0.025 = 2.5%)
const COMPUTER_DATA = [
    { name: '컴퓨터 없음', cost: {}, effect: {} },
    { name: 'Tier 1 컴퓨터', cost: { userDataCrystal: 5 }, effect: { Cube: 0.025, Lunar: 0.02, Energy: 0.015, Prism: 0.01, Digital: 0.005 } },
    { name: 'Tier 2 컴퓨터', cost: { userDataCrystal: 20 }, effect: { Cube: 0.05, Lunar: 0.04, Energy: 0.03, Prism: 0.02, Digital: 0.01 } },
    { name: 'Tier 3 컴퓨터', cost: { userDataCrystal: 40 }, effect: { Cube: 0.075, Lunar: 0.06, Energy: 0.045, Prism: 0.03, Digital: 0.015 } },
    { name: 'Tier 4 컴퓨터', cost: { userDataCrystal: 50 }, effect: { Cube: 0.10, Lunar: 0.08, Energy: 0.06, Prism: 0.04, Digital: 0.02 } },
    { name: 'Tier 5 컴퓨터', cost: { userDataCrystal: 80 }, effect: { Cube: 0.125, Lunar: 0.10, Energy: 0.075, Prism: 0.05, Digital: 0.025 } },
];

// Enchantment Table Upgrade Data (Unlock/Upgrade costs)
const TABLE_UPGRADE_COSTS = [
    { cash: 50000, stones: 0 },   // Tier 0 -> 1
    { cash: 100000, stones: 5 },  // Tier 1 -> 2
    { cash: 200000, stones: 20 }, // Tier 2 -> 3
    { cash: 500000, stones: 40 }, // Tier 3 -> 4
    { cash: 1000000, stones: 100 } // Tier 4 -> 5
];

// Enchantment Data
const TABLE_DATA = [
    { tier: 0, name: '없음', cost: 0, stoneCost: 0, maxEnchants: 0 },
    { tier: 1, name: '1티어 마법 부여대', cost: 50000, stoneCost: 1, maxEnchants: 2, maxLevel: 3 }, 
    { tier: 2, name: '2티어 마법 부여대', cost: 100000, stoneCost: 3, maxEnchants: 3, maxLevel: 4 }, 
    { tier: 3, name: '3티어 마법 부여대', cost: 200000, stoneCost: 5, maxEnchants: 3, maxLevel: 5 }, 
    { tier: 4, name: '4티어 마법 부여대', cost: 500000, stoneCost: 8, maxEnchants: 4, maxLevel: 6 }, 
    { tier: 5, name: '5티어 마법 부여대', cost: 1000000, stoneCost: 10, maxEnchants: 5, maxLevel: 7 } 
];

const TOTEM_DATA: {[key: string]: { name: string, desc: string, cost: number, tier: number, type: 'weather' | 'time', effect: any, conditions: { season?: string[], time?: 'day' | 'night' } }} = {
    'acidRainTotem': { name: '산성비 토템', desc: '다음 날씨를 산성비로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '산성비', conditions: {} },
    'thunderTotem': { name: '천둥 토템', desc: '다음 날씨를 천둥으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '천둥', conditions: { season: ['여름'] } },
    'yellowDustTotem': { name: '황사 토템', desc: '다음 날씨를 황사로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '황사', conditions: { season: ['봄'] } },
    'heatWaveTotem': { name: '폭염 토템', desc: '다음 날씨를 폭염으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '폭염', conditions: { season: ['여름'] } },
    'snowTotem': { name: '눈 토템', desc: '다음 날씨를 눈으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '눈', conditions: { season: ['겨울'] } },
    'hailTotem': { name: '우박 토템', desc: '다음 날씨를 우박으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '우박', conditions: { season: ['겨울'] } },
    
    'sunTotem': { name: '맑음 토템', desc: '다음 날씨를 맑음으로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '맑음', conditions: {} },
    'rainTotem': { name: '비 토템', desc: '다음 날씨를 비로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '비', conditions: { season: ['봄', '여름', '가을'] } },
    'heavyRainTotem': { name: '폭우 토템', desc: '다음 날씨를 폭우로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '폭우', conditions: { season: ['여름'] } },

    'meteorTotem': { name: '별똥별 토템', desc: '다음 날씨를 별똥별로 바꿉니다.', cost: 100000, tier: 4, type: 'weather', effect: '별똥별', conditions: { time: 'night' } },
    'rainbowTotem': { name: '무지개 토템', desc: '다음 날씨를 무지개로 바꿉니다.', cost: 100000, tier: 4, type: 'weather', effect: '무지개', conditions: {} },
    
    'auroraTotem': { name: '오로라 토템', desc: '다음 날씨를 오로라로 바꿉니다.', cost: 500000, tier: 5, type: 'weather', effect: '오로라', conditions: { season: ['겨울'], time: 'night' } },
    
    'timeTotem': { name: '시간의 토템', desc: '게임 시간을 즉시 8시간 뒤로 이동시킵니다.', cost: 20000, tier: 2, type: 'time', effect: 8, conditions: {} },
};
const TOTEM_PURCHASE_LIMITS = { 1: 7, 2: 7, 3: 4, 4: 2, 5: 1 };

const getInitialGameState = () => ({
    version: DATA_VERSION,
    userCash: 100000, 
    userCubes: 0, userLunar: 0, userEnergy: 0, userPrisms: 0, 
    userDigital: 0, userAurora: 0, userMagicStone: 0, userDataCrystal: 0,
    currentPrice: 10000, lastPrice: 10000, 
    currentLunarPrice: 20000, lastLunarPrice: 20000,
    currentEnergyPrice: 50000, lastEnergyPrice: 50000, 
    currentPrismPrice: 100000, lastPrismPrice: 100000,
    currentDigitalPrice: 200000, lastDigitalPrice: 200000,
    currentAuroraPrice: 500000, lastAuroraPrice: 500000,
    computerTier: 0,
    isCubePurchased: false, isLunarUpgraded: false, isEnergyUpgraded: false, isPrismUpgraded: false, isDigitalUpgraded: false, isAuroraUpgraded: false,
    lunarMiningLevel: 0, // 0: locked, 1: unlocked (base). No higher levels.
    weather: '맑음', experiencedWeathers: { '맑음': true },
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false, magicBook: false }, 
    isInternetOutage: false, isInternetOutageCooldown: 0,
    gameTime: new Date(2025, 2, 21, 9, 0, 0).getTime(), // Start in Spring
    isSleeping: false, usedCodes: [], lastOnlineTimestamp: Date.now(),
    transactionHistory: [],
    exceptionalState: { isActive: false, expiresAt: 0 },
    // Season
    season: '봄', dayInSeason: 1,
    // Trophies
    hasWeatherTrophy: false, hasPowerTrophy: false, hasTimeTrophy: false,
    minedCoins: { CUBE: 0, LUNAR: 0, ENERGY: 0, PRISM: 0 }, sleepCount: 0,
    // Totems
    totemPurchaseCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totemStock: {}, // { totemId: quantity }
    lastTotemRefresh: 0,
    nextWeatherOverride: null,
    // Enchantment
    enchantTableTier: 0,
    activeEnchants: [], // { id: string, level: number, name: string }
    investmentBonus: { isActive: false, expiresAt: 0 },
    totemWeatherActive: { isActive: false, expiresAt: 0 },
    // Settings
    settings: {
        showNotifications: true,
        notificationDuration: 3000, // in ms
    },
    dataCrystalTick: 0, // helper for mining timing
    lastMiningTimestamp: Date.now(), // For computer mining (1 min real time)
});

gameState = getInitialGameState();

// =======================================================
// 3D 렌더링
// =======================================================
function init3D() {
    const container = document.getElementById('cube-container');
    if (!container) return;
    while (container.firstChild) { container.removeChild(container.firstChild); }
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1); pointLight.position.set(5, 5, 5); scene.add(pointLight);
    updateCubeAppearance();
    window.addEventListener('resize', () => { if (!renderer || !container || !container.clientWidth || !container.clientHeight) return; renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); }, false);
}

function updateCubeAppearance() {
    if (!scene) return;
    if(cube) scene.remove(cube);
    let geometry; const materialProps: { [key: string]: any } = { metalness: 0.6, roughness: 0.4, emissive: 0x102040, };
    
    if (gameState.isAuroraUpgraded) { geometry = new THREE.IcosahedronGeometry(1.7, 1); materialProps.color = 0x10b981; materialProps.emissive = 0x059669; }
    else if (gameState.isDigitalUpgraded) { geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); materialProps.color = 0x06b6d4; }
    else if (gameState.isPrismUpgraded) { geometry = new THREE.IcosahedronGeometry(1.5, 0); materialProps.color = 0xf472b6; } 
    else if (gameState.isEnergyUpgraded) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xfacc15; }
    else if (gameState.isLunarUpgraded) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xa855f7; }
    else { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0x60a5fa; }
    const material = new THREE.MeshStandardMaterial(materialProps); cube = new THREE.Mesh(geometry, material); scene.add(cube);
}

function animate() {
    if(!renderer) return; // Stop animation if game stopped
    requestAnimationFrame(animate);
    if (cube) { cube.rotation.x += 0.003; cube.rotation.y += 0.003; }
    if (renderer && scene && camera) { renderer.render(scene, camera); }
}

// =======================================================
// 게임 로직
// =======================================================
function initGame() {
    dom = {
        userCash: document.getElementById('user-cash'), 
        userCubes: document.getElementById('user-cubes'), 
        userLunar: document.getElementById('user-lunar'), 
        userEnergy: document.getElementById('user-energy'), 
        userPrisms: document.getElementById('user-prisms'),
        userDigital: document.getElementById('user-digital'),
        userAurora: document.getElementById('user-aurora'),
        userMagicStone: document.getElementById('user-magic-stone'),
        userDataCrystal: document.getElementById('user-data-crystal'),
        assetAuroraContainer: document.getElementById('asset-aurora-container'),

        currentCubePrice: document.getElementById('current-cube-price'), cubePriceChange: document.getElementById('cube-price-change'), 
        currentLunarPrice: document.getElementById('current-lunar-price'), lunarPriceChange: document.getElementById('lunar-price-change'), 
        currentEnergyPrice: document.getElementById('current-energy-price'), energyPriceChange: document.getElementById('energy-price-change'), 
        currentPrismPrice: document.getElementById('current-prism-price'), prismPriceChange: document.getElementById('prism-price-change'),
        currentDigitalPrice: document.getElementById('current-digital-price'), digitalPriceChange: document.getElementById('digital-price-change'),
        currentAuroraPrice: document.getElementById('current-aurora-price'), auroraPriceChange: document.getElementById('aurora-price-change'),
        tickerAurora: document.getElementById('ticker-aurora'),

        notification: document.getElementById('notification'), internetOutage: document.getElementById('internet-outage'),
        buyCubeButton: document.getElementById('buy-cube-button'), cubePurchaseOverlay: document.getElementById('cube-purchase-overlay'), passiveIncomeDisplay: document.getElementById('passive-income-display'), incomePerSecond: document.getElementById('income-per-second'),
        exceptionalStatus: document.getElementById('exceptional-status'), exceptionalTimer: document.getElementById('exceptional-timer'),
        computerInfo: document.getElementById('computer-info'), computerTierText: document.getElementById('computer-tier-text'), computerStatsText: document.getElementById('computer-stats-text'), computerUpgradeButton: document.getElementById('computer-upgrade-button'),
        tradeContainer: document.getElementById('trade-container'),
        timeContainer: document.getElementById('time-container'), gameTime: document.getElementById('game-time'), weatherContainer: document.getElementById('weather-container'), weatherDisplay: document.getElementById('weather-display'), seasonDisplay: document.getElementById('season-display'),
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'), codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'), lunarLevelText: document.getElementById('lunar-level-text'),
        upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'), 
        upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        upgradeDigitalSection: document.getElementById('upgrade-digital-section'), upgradeDigitalButton: document.getElementById('upgrade-digital-button'),
        upgradeAuroraSection: document.getElementById('upgrade-aurora-section'), upgradeAuroraButton: document.getElementById('upgrade-aurora-button'),

        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'), incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
        magicAlmanacSection: document.getElementById('magic-almanac-section'), magicAlmanacContent: document.getElementById('magic-almanac-content'),
        
        trophyList: document.getElementById('trophy-list'), transactionHistoryList: document.getElementById('transaction-history-list'),
        chatMessages: document.getElementById('chat-messages'), chatInput: document.getElementById('chat-input'), chatSendButton: document.getElementById('chat-send-button'), logoutButton: document.getElementById('logout-button'),
        shopTabFunction: document.getElementById('shop-tab-function'), shopTabTotems: document.getElementById('shop-tab-totems'),
        shopContentFunction: document.getElementById('shop-content-function'), shopContentTotems: document.getElementById('shop-content-totems'),
        totemItems: document.getElementById('totem-items'), totemTimerDisplay: document.getElementById('totem-timer-display'),
        yellowDustOverlay: document.getElementById('yellow-dust-overlay'), heatWaveOverlay: document.getElementById('heat-wave-overlay'), snowOverlay: document.getElementById('snow-overlay'),
        updateBanner: document.getElementById('update-banner'), countdownTimer: document.getElementById('countdown-timer'),
        
        // Enchantment
        enchantmentContainer: document.getElementById('enchantment-container'),
        enchantTableTierText: document.getElementById('enchant-table-tier-text'),
        enchantCostText: document.getElementById('enchant-cost-text'),
        doEnchantButton: document.getElementById('do-enchant-button'),
        upgradeTableButton: document.getElementById('upgrade-table-button'),
        enchantActionPanel: document.getElementById('enchant-action-panel'),
        activeEnchantsList: document.getElementById('active-enchants-list'),
        
        // Dev Panel
        devPanel: document.getElementById('dev-panel'), closeDevPanel: document.getElementById('close-dev-panel'), devWeatherSelect: document.getElementById('dev-weather-select'),
        weatherTimer: document.getElementById('weather-timer'),
        probMagicStone: document.getElementById('prob-magic-stone'),
        probDataCrystal: document.getElementById('prob-data-crystal'),
        // Removed openDevPanelBtn as button is removed from UI
    };
    
    if (dom.buyCubeButton) dom.buyCubeButton.addEventListener('click', handleBuy3DCube);
    if (dom.computerUpgradeButton) dom.computerUpgradeButton.addEventListener('click', handleComputerUpgrade);
    if (dom.codeSubmitButton) dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (dom.upgradeLunarButton) dom.upgradeLunarButton.addEventListener('click', handleUpgradeLunar);
    if (dom.upgradeEnergyButton) dom.upgradeEnergyButton.addEventListener('click', handleUpgradeEnergy);
    if (dom.upgradePrismButton) dom.upgradePrismButton.addEventListener('click', handleUpgradePrism);
    if (dom.upgradeDigitalButton) dom.upgradeDigitalButton.addEventListener('click', handleUpgradeDigital);
    if (dom.upgradeAuroraButton) dom.upgradeAuroraButton.addEventListener('click', handleUpgradeAurora);
    if (dom.doEnchantButton) dom.doEnchantButton.addEventListener('click', handleEnchant);
    if (dom.upgradeTableButton) dom.upgradeTableButton.addEventListener('click', handleEnchantTableUpgrade);
    if (dom.chatSendButton) dom.chatSendButton.addEventListener('click', handleSendMessage);
    if (dom.chatInput) dom.chatInput.addEventListener('keydown', (e: KeyboardEvent) => { if(e.key === 'Enter') handleSendMessage(); });
    if (dom.logoutButton) dom.logoutButton.addEventListener('click', handleLogout);
    
    ['function', 'totems'].forEach(t => dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`]?.addEventListener('click', () => switchShopTab(t)));
    
    const showToggle = document.getElementById('setting-show-notifications') as HTMLInputElement;
    const saveDurationBtn = document.getElementById('setting-save-duration-btn');
    const durationInput = document.getElementById('setting-notification-duration') as HTMLInputElement;
    
    if(showToggle) {
        showToggle.addEventListener('change', () => {
            gameState.settings.showNotifications = showToggle.checked;
            saveGameState();
            showNotification(`알림이 ${showToggle.checked ? '활성화' : '비활성화'}되었습니다.`, false);
        });
    }

    if(saveDurationBtn && durationInput) {
        saveDurationBtn.addEventListener('click', () => {
            const duration = parseInt(durationInput.value, 10);
            if (!isNaN(duration) && duration >= 1 && duration <= 30) {
                gameState.settings.notificationDuration = duration * 1000; // s to ms
                saveGameState();
                showNotification(`알림 표시 시간이 ${duration}초로 설정되었습니다.`, false);
            } else {
                showNotification('1초에서 30초 사이의 값을 입력해주세요.', true);
            }
        });
    }

    initDevPanel();
    populateTradeUI();
    populateShopUI();
    populateSettingsUI();
    init3D();
}

function restartGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    // weatherInterval removed

    gameLoopInterval = setInterval(gameLoop, 250 / currentGameSpeed);
}

function startGame() {
    gameTime = new Date(gameState.gameTime);
    restoreUIState(); updateTrophyUI(); updateTransactionHistoryUI(); updateEnchantUI();
    restartGameLoop();
    startPriceUpdateLoops();
    if(renderer) animate();
}

function stopGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    Object.values(priceUpdateIntervals).forEach((interval: any) => clearInterval(interval));
    priceUpdateIntervals = {};
    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    gameLoopInterval = null;
    window.autosaveInterval = null;
}

function showNotification(message: string, isError = true) {
    if (!gameState.settings.showNotifications && !message.includes('알림이')) return; // Allow settings notifications to always show
    if (!dom.notification) return; if (notificationTimeout) { clearTimeout(notificationTimeout); }
    dom.notification.innerHTML = `<span>${message}</span><button id="notification-close-btn" class="ml-4 font-bold text-xl leading-none transition-transform hover:scale-125">&times;</button>`;
    dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 transition-all duration-300 flex items-center justify-between ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    dom.notification.classList.remove('opacity-0', 'translate-y-10'); dom.notification.classList.add('opacity-100', 'translate-y-0');
    const hideNotification = () => { if (!dom.notification) return; dom.notification.classList.remove('opacity-100', 'translate-y-0'); dom.notification.classList.add('opacity-0', 'translate-y-10'); notificationTimeout = null; };
    document.getElementById('notification-close-btn')?.addEventListener('click', hideNotification, { once: true });
    notificationTimeout = setTimeout(hideNotification, gameState.settings.notificationDuration);
}

function updateUI() {
    const state: any = gameState; if (!dom.userCash) return;
    const resourceMap = {
        userCash: state.userCash, userCubes: state.userCubes, userLunar: state.userLunar, userEnergy: state.userEnergy, userPrisms: state.userPrisms,
        userDigital: state.userDigital, userAurora: state.userAurora, userMagicStone: state.userMagicStone, userDataCrystal: state.userDataCrystal
    };
    // FIX: Use Number() for safer type conversion, as values from gameState can be of mixed types.
    for(const key in resourceMap) { if(dom[key]) dom[key].textContent = Math.floor(Number((resourceMap as any)[key])).toLocaleString('ko-KR'); }

    // Handle Aurora Asset Visibility (Asset dashboard)
    if (dom.assetAuroraContainer) {
        dom.assetAuroraContainer.classList.toggle('hidden', state.userAurora <= 0);
    }

    // Handle Aurora Ticker Visibility (Header)
    if (dom.tickerAurora) {
        dom.tickerAurora.classList.toggle('hidden', state.weather !== '오로라');
    }

    const updatePriceDisplay = (priceEl: HTMLElement, changeEl: HTMLElement, current: number, last: number) => { if (!priceEl || !changeEl) return; priceEl.textContent = `${current.toLocaleString('ko-KR')} KRW`; const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : '0.00'; if (change > 0) changeEl.innerHTML = `<span class="text-green-500">▲ +${pct}%</span>`; else if (change < 0) changeEl.innerHTML = `<span class="text-red-500">▼ ${pct}%</span>`; else changeEl.innerHTML = `0.00%`; };
    
    updatePriceDisplay(dom.currentCubePrice, dom.cubePriceChange, Number(state.currentPrice), Number(state.lastPrice));
    updatePriceDisplay(dom.currentLunarPrice, dom.lunarPriceChange, Number(state.currentLunarPrice), Number(state.lastLunarPrice));
    updatePriceDisplay(dom.currentEnergyPrice, dom.energyPriceChange, Number(state.currentEnergyPrice), Number(state.lastEnergyPrice));
    updatePriceDisplay(dom.currentPrismPrice, dom.prismPriceChange, Number(state.currentPrismPrice), Number(state.lastPrismPrice));
    updatePriceDisplay(dom.currentDigitalPrice, dom.digitalPriceChange, Number(state.currentDigitalPrice), Number(state.lastDigitalPrice));
    updatePriceDisplay(dom.currentAuroraPrice, dom.auroraPriceChange, Number(state.currentAuroraPrice), Number(state.lastAuroraPrice));

    if (dom.weatherDisplay) dom.weatherDisplay.textContent = `${state.weather} ${WEATHER_DATA[state.weather].icon}`;
    if (dom.seasonDisplay) dom.seasonDisplay.textContent = `${state.season} ${SEASON_EMOJI_MAP[state.season as keyof typeof SEASON_EMOJI_MAP]} ${state.dayInSeason}일차`;

    // --- Income Calculation ---
    let baseProduction = 0;
    if (state.isCubePurchased) { 
        baseProduction = 100; 
        if (state.isAuroraUpgraded) baseProduction = 1000;
        else if (state.isDigitalUpgraded) baseProduction = 700;
        else if (state.isPrismUpgraded) baseProduction = 400; 
        else if (state.isEnergyUpgraded) baseProduction = 200; 
    }
    
    let totalIncome = baseProduction;
    
    // Enchant: Efficiency
    const efficiency = state.activeEnchants.find((e: any) => e.id === 'efficiency');
    if (efficiency) {
        totalIncome *= (1 + (efficiency.level * 0.1));
    }

    // Enchant: Investment God (Rare)
    if (state.investmentBonus && state.investmentBonus.isActive) {
        if (Date.now() < state.investmentBonus.expiresAt) {
            totalIncome *= 2;
        } else {
            state.investmentBonus.isActive = false;
        }
    }

    // Enchant: Weather God (Rare)
    if (state.totemWeatherActive && state.totemWeatherActive.isActive) {
        if (Date.now() < state.totemWeatherActive.expiresAt) {
            totalIncome *= 2;
        } else {
            state.totemWeatherActive.isActive = false;
        }
    }

    // Enchant: Pickpocket Curse
    const pickpocket = state.activeEnchants.find((e: any) => e.id === 'pickpocket');
    if (pickpocket) {
        const isScreenBlock = ['황사', '폭염', '눈'].includes(state.weather);
        if (isScreenBlock) {
            totalIncome *= 0.5;
        } else {
            totalIncome *= 2;
        }
    }

    // Enchant: Zeus Curse
    const zeus = state.activeEnchants.find((e: any) => e.id === 'zeus');
    if (zeus && state.weather === '천둥') {
        totalIncome *= 2;
    }


    // Weather & Debuffs
    let weatherMultiplier = 1;
    const defense = state.activeEnchants.find((e: any) => e.id === 'defense');
    const defenseReduction = defense ? (defense.level * 0.1) : 0;

    if (state.weather === '폭염') {
         weatherMultiplier = 0.5 + (0.5 * defenseReduction); 
    }
    totalIncome *= weatherMultiplier;
    
    if (state.exceptionalState.isActive) { 
        totalIncome *= 2; 
        dom.exceptionalStatus.classList.remove('hidden'); 
        const timeLeft = Math.max(0, state.exceptionalState.expiresAt - Date.now()); 
        const minutes = Math.floor(timeLeft / 60000); 
        const seconds = Math.floor((timeLeft % 60000) / 1000); 
        dom.exceptionalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} 남음`; 
    }
    else { dom.exceptionalStatus.classList.add('hidden'); }
    
    if (dom.incomePerSecond) dom.incomePerSecond.textContent = `+${totalIncome.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} KRW / sec`;

    if (dom.gameTime) {
        const gameHours = gameTime.getHours(); let gameMinutes = String(gameTime.getMinutes()).padStart(2, '0');
        if (state.weather === '폭우' && Math.random() < 0.1) { gameMinutes = '##'; }
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        dom.gameTime.textContent = `${String(gameHours).padStart(2, '0')}:${gameMinutes} (${isNight ? '🌙' : '☀️'})`;
    }

    dom.yellowDustOverlay.classList.toggle('hidden', state.weather !== '황사');
    dom.heatWaveOverlay.classList.toggle('hidden', state.weather !== '폭염');
    dom.snowOverlay.classList.toggle('hidden', state.weather === '눈' || state.weather === '우박');
    
    updateComputerUI(); 
}

function updateComputerUI() {
    if (!dom.computerTierText || !dom.computerStatsText || !dom.computerUpgradeButton) return;
    const tier = gameState.computerTier;
    const isMaxTier = tier >= 5; 
    
    const safeTier = Math.max(0, Math.min(tier, COMPUTER_DATA.length - 1));
    const currentData = COMPUTER_DATA[safeTier] || COMPUTER_DATA[0];

    dom.computerTierText.textContent = tier > 0 ? `Tier ${tier} 컴퓨터` : '컴퓨터 없음';
    
    // Display Effect Stats
    if (tier > 0) {
        let effectText = '';
        const effects = currentData.effect;
        effectText += `Cube: ${(effects.Cube * 100).toFixed(1)}% `;
        effectText += `Lunar: ${(effects.Lunar * 100).toFixed(1)}% `;
        effectText += `Energy: ${(effects.Energy * 100).toFixed(1)}% `;
        effectText += `Prism: ${(effects.Prism * 100).toFixed(1)}% `;
        effectText += `Digital: ${(effects.Digital * 100).toFixed(1)}%`;
        dom.computerStatsText.innerHTML = `<span class="text-xs">분당 채굴 확률:<br/>${effectText}</span>`;
    } else {
        dom.computerStatsText.textContent = '효과 없음';
    }
    
    dom.computerUpgradeButton.classList.toggle('hidden', isMaxTier);
    if (!isMaxTier) {
        const nextTierData = COMPUTER_DATA[tier + 1];
        if (nextTierData) {
            const cost = nextTierData.cost;
            let costString = '';
            for(const item in cost) { 
                const itemName = RESOURCE_NAME_MAP[item] || item;
                costString += `${(cost as any)[item].toLocaleString()} ${itemName} `;
            }
            dom.computerUpgradeButton.textContent = `Tier ${tier + 1} 업그레이드 (${costString.trim()})`;
        }
    } else {
         dom.computerUpgradeButton.textContent = '최고 티어';
    }
}
function populateTradeUI() { 
    if(!dom.tradeContainer) return;
    dom.tradeContainer.innerHTML = '';
    const coins = [
        { id: 'Cube', name: 'CUBE', price: gameState.currentPrice, owned: gameState.userCubes, color: 'blue' },
        { id: 'Lunar', name: 'LUNAR', price: gameState.currentLunarPrice, owned: gameState.userLunar, color: 'purple' },
        { id: 'Energy', name: 'ENERGY', price: gameState.currentEnergyPrice, owned: gameState.userEnergy, color: 'yellow' },
        { id: 'Prism', name: 'PRISM', price: gameState.currentPrismPrice, owned: gameState.userPrisms, color: 'pink' },
        { id: 'Digital', name: 'DIGITAL', price: gameState.currentDigitalPrice, owned: gameState.userDigital, color: 'cyan' },
        { id: 'Aurora', name: 'AURORA', price: gameState.currentAuroraPrice, owned: gameState.userAurora, color: 'green' }
    ];

    coins.forEach(coin => {
        const tradeBox = document.createElement('div');
        tradeBox.className = 'bg-gray-800 p-4 rounded-lg flex flex-col gap-3';
        tradeBox.innerHTML = `
            <div>
                <h4 class="font-bold text-lg text-${coin.color}-400">${coin.name}</h4>
                <p class="text-sm text-gray-400">보유: ${coin.owned.toLocaleString()}개</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" id="trade-amount-${coin.id}" class="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-${coin.color}-500" placeholder="수량" min="1">
                <button onclick="handleMaxAmount('buy', '${coin.id}')" class="bg-gray-600 hover:bg-gray-500 text-xs font-bold px-2 py-1 rounded-md">MAX</button>
            </div>
            <div class="flex gap-2">
                <button onclick="handleTrade('buy', '${coin.id}')" class="flex-1 bg-${coin.color}-600 hover:bg-${coin.color}-700 text-white font-bold py-2 px-3 rounded-lg text-sm">매수</button>
                <button onclick="handleTrade('sell', '${coin.id}')" class="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm">매도</button>
            </div>
        `;
        dom.tradeContainer.appendChild(tradeBox);
    });
    window.handleTrade = handleTrade;
    window.handleMaxAmount = handleMaxAmount;
}

function populateShopUI() {
    populateFunctionItems();
    populateTotemItems();
}
function populateFunctionItems() {
    if (!dom.shopItems) return; dom.shopItems.innerHTML = '';
    const functionItems = [ 
        { id: 'digitalClock', name: '디지털 시계', desc: '게임 내 시간과 날씨를 화면에 표시합니다.', cost: 10000 },
        { id: 'weatherAlmanac', name: '날씨 도감', desc: '지금까지 경험한 날씨의 효과를 기록하고 확인할 수 있습니다.', cost: 25000 },
        { id: 'magicBook', name: '마법 도감', desc: '마법 부여의 종류와 효과를 확인할 수 있습니다.', cost: 30000 },
        { id: 'bed', name: '침대', desc: '수면을 취하여 다음 날 아침으로 즉시 이동할 수 있게 됩니다.', cost: 15000 },
    ];
    functionItems.forEach(item => {
        const isOwned = gameState.shopItems[item.id];
        const cost = item.cost;
        const canAfford = gameState.userCash >= cost;
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 my-1">${item.desc}</p>
            </div>
            <button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${isOwned ? 'bg-green-700 cursor-default' : (canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'btn-disabled')}" ${isOwned || !canAfford ? 'disabled' : ''}>
                ${isOwned ? '보유중' : `${cost.toLocaleString()} KRW`}
            </button>
        `;
        if (!isOwned) {
            itemEl.querySelector('button')?.addEventListener('click', () => handleShopBuy(item.id, cost));
        }
        dom.shopItems.appendChild(itemEl);
    });
}

// Helper to generate daily stock
function refreshTotemStock() {
    const stock: {[key: string]: number} = {};
    Object.keys(TOTEM_DATA).forEach(key => {
        const totem = TOTEM_DATA[key];
        const chance = (500000 / totem.cost) * 0.01;
        
        if (Math.random() < chance) {
            let quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3
            if (totem.tier === 5) quantity = 1; // Aurora max 1
            stock[key] = quantity;
        }
    });
    gameState.totemStock = stock;
    gameState.lastTotemRefresh = Date.now();
    saveGameState();
    populateTotemItems();
}

function populateTotemItems() {
    if (!dom.totemItems) return;
    dom.totemItems.innerHTML = ''; // Clear previous items to prevent duplicates
    
    if (!gameState.totemStock || Object.keys(gameState.totemStock).length === 0) {
        if (Date.now() - gameState.lastTotemRefresh > 5 * 60 * 1000) {
            refreshTotemStock();
        }
    }

    Object.keys(TOTEM_DATA).forEach(key => {
        const totem = TOTEM_DATA[key];
        const hasExperienced = totem.type === 'weather' ? gameState.experiencedWeathers[totem.effect] : true;
        
        const stock = gameState.totemStock[key] || 0;
        const canAffordCash = gameState.userCash >= totem.cost;
        
        const magicStoneCost = Math.floor(totem.cost / 10000);
        const canAffordStones = gameState.userMagicStone >= magicStoneCost;

        // Clarified Cost Display: KRW + Magic Stone
        let buttonText = `${totem.cost.toLocaleString()} KRW + ${magicStoneCost} MS`;
        let isDisabled = false;
        let buttonClass = 'bg-purple-600 hover:bg-purple-700';
        let totemName = totem.name;
        let totemDesc = totem.desc;

        if (totem.type === 'weather' && !hasExperienced) {
            totemName = '???';
            totemDesc = '해당 날씨를 경험하면 잠금 해제됩니다.';
            isDisabled = true;
            buttonText = '경험 필요';
            buttonClass = 'btn-disabled';
        } else if (stock <= 0) {
            buttonText = '품절 (계산 중...)'; // Text updated via loop
            isDisabled = true;
            buttonClass = 'bg-gray-500 cursor-default';
        } else if (!canAffordCash || !canAffordStones) {
            isDisabled = true;
            buttonClass = 'btn-disabled';
        }

        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.setAttribute('data-totem-id', key); // For updates
        
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base flex justify-between">${totemName} <span class="text-xs font-normal bg-gray-700 px-1 rounded">재고: ${stock}</span></h4>
                <p class="text-xs text-gray-400 my-1">${totemDesc}</p>
            </div>
            <button id="buy-totem-${key}" class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${buttonClass}" ${isDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
        if (!isDisabled) {
            itemEl.querySelector('button')?.addEventListener('click', () => handleTotemBuy(key));
        }
        dom.totemItems.appendChild(itemEl);
    });
}

function updateTotemTimers() {
    if (!dom.totemItems) return;
    const now = Date.now();
    const restockTime = gameState.lastTotemRefresh + (5 * 60 * 1000);
    const diff = Math.max(0, restockTime - now);
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update Header Timer
    if (dom.totemTimerDisplay) {
        dom.totemTimerDisplay.textContent = `(갱신 까지: ${timerText})`;
    }

    const buttons = dom.totemItems.querySelectorAll('button');
    buttons.forEach((btn: HTMLButtonElement) => {
        if (btn.disabled && btn.textContent?.includes('품절')) {
             btn.textContent = `품절 (${timerText} 후 갱신)`;
        }
    });
}

function handleTotemBuy(totemId: string) {
    const totem = TOTEM_DATA[totemId];
    if (!totem) return;

    const stock = gameState.totemStock[totemId] || 0;
    if (stock <= 0) { showNotification('재고가 없습니다.', true); return; }

    const magicStoneCost = Math.floor(totem.cost / 10000);

    if (gameState.userCash < totem.cost) { showNotification('자금이 부족합니다.', true); return; }
    if (gameState.userMagicStone < magicStoneCost) { showNotification('마법석이 부족합니다.', true); return; }

    gameState.userCash -= totem.cost;
    gameState.userMagicStone -= magicStoneCost;
    gameState.totemStock[totemId]--;
    gameState.totemPurchaseCounts[totem.tier] = (gameState.totemPurchaseCounts[totem.tier] || 0) + 1;

    if (totem.type === 'weather') {
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        const season = gameState.season;
        const conditions = totem.conditions;
        const seasonMatch = !conditions.season || conditions.season.includes(season);
        const timeMatch = !conditions.time || (conditions.time === 'night' && isNight) || (conditions.time === 'day' && !isNight);

        if (seasonMatch && timeMatch) {
            gameState.weather = totem.effect;
            gameState.experiencedWeathers[totem.effect] = true;
            
            const weatherGod = gameState.activeEnchants.find((e: any) => e.id === 'weatherGod');
            if (weatherGod) {
                gameState.totemWeatherActive = { isActive: true, expiresAt: Date.now() + 30000 };
                showNotification(`${totem.name} 효과 발동! 날씨의 신 효과로 30초간 수익 2배!`, false);
            } else {
                showNotification(`${totem.name} 효과로 날씨가 즉시 변경되었습니다!`, false);
            }
            checkTrophies();
            startPriceUpdateLoops();
        } else {
             showNotification(`${totem.name} 구매 완료! 다음 날씨 변경 시 조건이 맞으면 적용됩니다.`, false);
             gameState.nextWeatherOverride = totem.effect;
        }

    } else if (totem.type === 'time') {
        gameTime.setHours(gameTime.getHours() + totem.effect);
        showNotification(`${totem.name} 효과로 시간이 8시간 경과했습니다.`, false);
        startPriceUpdateLoops();
    }
    
    populateTotemItems(); // Re-render shop
    saveGameState();
}

function handleShopBuy(itemId: string, cost: number) {
    if (gameState.userCash >= cost && !gameState.shopItems[itemId]) {
        gameState.userCash -= cost;
        gameState.shopItems[itemId] = true;
        showNotification(`${itemId} 구매 완료!`, false);
        populateShopUI();
        restoreUIState();
        saveGameState();
    } else {
        showNotification('자금이 부족하거나 이미 보유한 아이템입니다.', true);
    }
}

function updateWeatherAlmanacUI() {
    if (!dom.weatherAlmanacSection || !dom.weatherAlmanacContent) return;

    const hasAlmanac = gameState.shopItems.weatherAlmanac;
    dom.weatherAlmanacSection.classList.toggle('hidden', !hasAlmanac);
    if (!hasAlmanac) return;

    dom.weatherAlmanacContent.innerHTML = '';
    const experienced = Object.keys(gameState.experiencedWeathers);
    
    Object.keys(WEATHER_DATA).forEach(weatherName => {
        const weather = WEATHER_DATA[weatherName];
        const hasExperienced = experienced.includes(weatherName);
        const el = document.createElement('div');
        el.className = 'bg-gray-800/50 p-2 rounded flex items-center gap-3';
        
        if (hasExperienced) {
            el.innerHTML = `
                <span class="text-2xl">${weather.icon}</span>
                <div>
                    <h5 class="font-bold">${weatherName}</h5>
                    <p class="text-xs text-gray-400">${weather.long_desc}</p>
                </div>
            `;
        } else {
            el.innerHTML = `
                <span class="text-2xl">❓</span>
                <div>
                    <h5 class="font-bold text-gray-500">???</h5>
                    <p class="text-xs text-gray-500">아직 경험하지 못했습니다.</p>
                </div>
            `;
        }
        dom.weatherAlmanacContent.appendChild(el);
    });
}

function updateMagicAlmanacUI() {
    if (!dom.magicAlmanacSection || !dom.magicAlmanacContent) return;
    const hasBook = gameState.shopItems.magicBook;
    dom.magicAlmanacSection.classList.toggle('hidden', !hasBook);
    if(!hasBook) return;

    dom.magicAlmanacContent.innerHTML = '';

    const enchants = [
        { name: '효율 (Efficiency)', desc: '패시브 수입이 레벨당 10% 증가합니다.' },
        { name: '행운 (Luck)', desc: '5% 확률로 수입 틱이 2배가 됩니다.' },
        { name: '방어 (Defense)', desc: '나쁜 날씨의 페널티를 레벨당 10% 감소시킵니다.' },
        { name: '내구성 (Durability)', desc: '아이템이 파괴될 확률을 줄여줍니다. (현재 미구현 효과)' },
        { name: '가시 (Thorns)', desc: '나쁜 날씨에 일정 확률로 페널티를 무시합니다.' },
        { name: '날씨의 신 (Rare)', desc: '토템으로 날씨 변경 시 30초간 수입이 2배가 됩니다.' },
        { name: '이진법 (Rare)', desc: '매 분마다 일정 확률로 데이터 결정을 채굴합니다.' },
        { name: '마법의 손 (Rare)', desc: '마법석 채굴 확률이 1.5배 증가합니다.' },
        { name: '투자의 신 (Rare)', desc: '매수 시 5초간 수입이 2배가 됩니다.' },
        { name: '코인비 (Rare)', desc: '비 날씨에 1% 확률로 랜덤 코인을 획득합니다.' },
        { name: '제우스의 저주 (Curse)', desc: '천둥 날씨에 인터넷이 끊길 확률이 증가하지만, 수입도 2배가 됩니다.' },
        { name: '소매치기의 저주 (Curse)', desc: '시야 차단 날씨(황사/폭염/눈)에 수입이 반토막납니다. 그 외에는 2배입니다.' },
    ];

    enchants.forEach(enc => {
        const div = document.createElement('div');
        div.className = 'bg-gray-800/50 p-2 rounded';
        div.innerHTML = `<h5 class="font-bold text-purple-300">${enc.name}</h5><p class="text-xs text-gray-400">${enc.desc}</p>`;
        dom.magicAlmanacContent.appendChild(div);
    });
}

function updateTrophyUI() {
    if (!dom.trophyList) return;
    dom.trophyList.innerHTML = '';

    Object.keys(TROPHY_DATA).forEach(key => {
        const trophy = TROPHY_DATA[key as keyof typeof TROPHY_DATA];
        const isUnlocked = trophy.isUnlocked(gameState);
        const el = document.createElement('div');
        el.className = `p-3 rounded-lg flex items-center gap-4 ${isUnlocked ? 'bg-yellow-800/50' : 'bg-gray-800/50'}`;
        el.innerHTML = `
            <span class="text-4xl">${isUnlocked ? trophy.icon : '❓'}</span>
            <div>
                <h4 class="font-bold ${isUnlocked ? 'text-yellow-300' : ''}">${trophy.name}</h4>
                <p class="text-xs text-gray-400">${trophy.desc}</p>
                ${isUnlocked ? `<p class="text-xs text-green-400 mt-1">보상: ${trophy.reward}</p>` : ''}
            </div>
        `;
        dom.trophyList.appendChild(el);
    });
}
function checkTrophies() {
    const state = gameState;
    if (!state.hasWeatherTrophy) { if (Object.keys(state.experiencedWeathers).length >= Object.keys(WEATHER_DATA).length) { state.hasWeatherTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.weatherMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasPowerTrophy) { const {CUBE, LUNAR, ENERGY, PRISM} = state.minedCoins; if (CUBE >= 100 && LUNAR >= 100 && ENERGY >= 100 && PRISM >= 100) { state.hasPowerTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.powerMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasTimeTrophy) { if (state.sleepCount >= 20) { state.hasTimeTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.timeMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
}

function getNewPrice(coinId: string) {
    if (globalPriceOverrides && globalPriceOverrides[coinId]) {
        return globalPriceOverrides[coinId];
    }

    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return gameState[coinConfig.priceKey];

    if (coinId === 'Aurora' && gameState.weather !== '오로라') {
        return gameState[coinConfig.priceKey];
    }

    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const timeOfDay = isNight ? 'night' : 'day';

    let upChance = (typeof coinConfig.upChance === 'object') ? coinConfig.upChance[timeOfDay] : coinConfig.upChance;
    const fluctuation = coinConfig.fluctuation[timeOfDay];

    const weatherEffect = WEATHER_DATA[gameState.weather];
    if (weatherEffect.isGood) upChance += 0.025;
    if (weatherEffect.isBad) upChance -= 0.025;
    if (gameState.weather === '비' && coinId === 'Cube') upChance += 0.01;
    if (gameState.weather === '오로라') upChance += 0.05;
    if (gameState.weather === '별똥별') upChance += 0.025;
    if (gameState.weather === '우박') upChance -= 0.025;

    if (gameState.hasPowerTrophy && coinId === 'Energy') upChance += 0.01;

    // Computer Boost REMOVED (Moved to mining mechanics)
    
    const rand = Math.random();
    let magnitude;
    if (rand < fluctuation.large) {
        magnitude = (Math.random() * 0.08) + 0.07;
    } else if (rand < fluctuation.large + fluctuation.medium) {
        magnitude = (Math.random() * 0.04) + 0.03;
    } else {
        magnitude = (Math.random() * 0.02) + 0.01;
    }

    let multiplier = 1 + magnitude;
    const currentPrice = gameState[coinConfig.priceKey];
    let newPrice;

    if (Math.random() < upChance) {
        newPrice = currentPrice * multiplier;
    } else {
        newPrice = currentPrice / multiplier;
    }
    return Math.floor(Math.max(coinConfig.minPrice, Math.min(coinConfig.maxPrice, newPrice)));
}


function startPriceUpdateLoops() {
    Object.keys(priceUpdateIntervals).forEach(key => clearInterval(priceUpdateIntervals[key]));
    priceUpdateIntervals = {};

    Object.keys(COIN_DATA).forEach(coinId => {
        const coinConfig = COIN_DATA[coinId];
        const lastPriceKey = coinConfig.priceKey === 'currentPrice' ? 'lastPrice' : `last${coinId}Price`;
        
        const updatePrice = () => {
            const newPrice = getNewPrice(coinId);
            gameState[lastPriceKey] = gameState[coinConfig.priceKey];
            gameState[coinConfig.priceKey] = newPrice;
        };
        
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        let interval = (typeof coinConfig.interval === 'object') ? coinConfig.interval[isNight ? 'night' : 'day'] : coinConfig.interval;

        if (gameState.weather === '황사') interval *= 1.1;
        if (gameState.weather === '오로라') interval *= 0.8;
        if (isNight && gameState.hasTimeTrophy) interval *= 0.95;

        priceUpdateIntervals[coinId] = setInterval(updatePrice, interval / currentGameSpeed);
    });
}

function gameLoop() {
    const state = gameState; if(state.isSleeping) return; 
    const previousMinutes = gameTime.getMinutes();
    gameTime.setMinutes(gameTime.getMinutes() + 1);
    const currentMinutes = gameTime.getMinutes();

    const oldIsNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    if (currentMinutes === 0) { 
        // New Hour: Update Weather
        updateWeather();
        
        const newIsNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        if(oldIsNight !== newIsNight) {
            startPriceUpdateLoops();
        }
    }
    
    // Update Weather Timer
    if (dom.weatherTimer) {
        const minutesLeft = 60 - currentMinutes;
        const secondsLeft = Math.ceil(minutesLeft * 0.25 / currentGameSpeed);
        dom.weatherTimer.textContent = `${secondsLeft}s`;
    }
    
    // Update Totem Timers
    updateTotemTimers();

    // Computer Mining (Real Time 1 Minute)
    if (state.computerTier > 0) {
        const now = Date.now();
        if (now - (state.lastMiningTimestamp || 0) >= 60000) { // 60000ms = 1 min
            state.lastMiningTimestamp = now;
            
            const tier = state.computerTier;
            const probs = {
                userCubes: 0.025 * tier,
                userLunar: 0.02 * tier,
                userEnergy: 0.015 * tier,
                userPrisms: 0.01 * tier,
                userDigital: 0.005 * tier
            };
            
            let mined = [];
            if (Math.random() < probs.userCubes) { state.userCubes++; mined.push('CUBE'); }
            if (Math.random() < probs.userLunar) { state.userLunar++; mined.push('LUNAR'); }
            if (Math.random() < probs.userEnergy) { state.userEnergy++; mined.push('ENERGY'); }
            if (Math.random() < probs.userPrisms) { state.userPrisms++; mined.push('PRISM'); }
            if (Math.random() < probs.userDigital) { state.userDigital++; mined.push('DIGITAL'); }
            
            if (mined.length > 0) {
                showNotification(`🖥️ 컴퓨터 채굴 성공: ${mined.join(', ')}`, false);
            }
        }
    }

    // Totem Refresh (Every 5 real minutes)
    if (Date.now() - state.lastTotemRefresh > 5 * 60 * 1000) {
        refreshTotemStock();
    }

    if (gameTime.getHours() === 0 && currentMinutes === 0) { state.dayInSeason++; if (state.dayInSeason > 3) { state.dayInSeason = 1; state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length]; state.totemPurchaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; populateShopUI(); } }
    
    if (globalWeatherOverride) { if(gameState.weather !== globalWeatherOverride) { gameState.weather = globalWeatherOverride; startPriceUpdateLoops(); } }
    
    let outageChance = 0.05;
    const zeus = state.activeEnchants.find((e: any) => e.id === 'zeus');
    if (zeus && state.weather === '천둥') outageChance = 0.1;

    if (state.weather === '천둥' && Math.random() < outageChance && !state.isInternetOutage) {
        state.isInternetOutage = true;
        state.isInternetOutageCooldown = Date.now() + 10000;
        showNotification('인터넷 연결이 끊겼습니다!', true);
    }

    if (state.isInternetOutage && Date.now() > state.isInternetOutageCooldown) { state.isInternetOutage = false; showNotification('인터넷 연결이 복구되었습니다.', false); }
    if (dom.internetOutage) dom.internetOutage.classList.toggle('hidden', !state.isInternetOutage);
    
    // --- Mining Logic (User Actions & Passive) ---
    // Calculate Magic Stone Probability for Display
    let magicStoneChance = 0.10; // Base 10%
    // Lunar multiplier removed. Now just base unlock.
    if (state.lunarMiningLevel < 1) magicStoneChance = 0;

    if (state.lunarMiningLevel >= 1) {
        if (state.isEnergyUpgraded) magicStoneChance *= 2;
        if (state.isPrismUpgraded) magicStoneChance *= 2; // CHANGED: Prism now 2x (was 4x)
        if (oldIsNight) magicStoneChance *= 2;
        if (state.weather === '별똥별') magicStoneChance *= 4;
        if (state.weather === '오로라') magicStoneChance *= 8;
        const magicHand = state.activeEnchants.find((e: any) => e.id === 'magicHand');
        if (magicHand) magicStoneChance *= 1.5;
    }

    if (dom.probMagicStone) dom.probMagicStone.textContent = `${(magicStoneChance * 100).toFixed(1)}% (20min)`;

    // 1. LUNAR Upgrade: Magic Stone Mining (Every 20 mins)
    if (state.lunarMiningLevel >= 1 && currentMinutes % 20 === 0 && currentMinutes !== previousMinutes) {
        if (Math.random() < magicStoneChance) {
            state.userMagicStone = (state.userMagicStone || 0) + 1;
            showNotification('마법석을 채굴했습니다!', false);
        }
    }

    // 2. Binary Enchant OR Digital Upgrade: Data Crystal Mining
    const binary = state.activeEnchants.find((e: any) => e.id === 'binary');
    
    // Binary Logic (per minute)
    if (binary && currentMinutes !== previousMinutes) {
        let chance = (binary.level * 0.1);
        const magicHand = state.activeEnchants.find((e: any) => e.id === 'magicHand');
        if (magicHand) chance *= 1.5;
        if (Math.random() < chance) {
            state.userDataCrystal = (state.userDataCrystal || 0) + 1;
        }
    }

    // Digital Upgrade Logic (per 2 seconds)
    let dcChance = 0;
    if (state.isDigitalUpgraded) dcChance = 0.1;
    if (dom.probDataCrystal) dom.probDataCrystal.textContent = `${(dcChance * 100).toFixed(0)}% (2s)`;

    state.dataCrystalTick = (state.dataCrystalTick || 0) + 1;
    if (state.isDigitalUpgraded && state.dataCrystalTick >= 8) { // Approx 2 seconds
        state.dataCrystalTick = 0;
        if (Math.random() < dcChance) {
             state.userDataCrystal = (state.userDataCrystal || 0) + 1;
        }
    }
    
    const coinRain = state.activeEnchants.find((e: any) => e.id === 'coinRain');
    if (coinRain && state.weather === '비' && Math.random() < 0.01) {
        const coins = ['userCubes', 'userLunar', 'userEnergy', 'userPrisms'];
        const randCoin = coins[Math.floor(Math.random() * coins.length)];
        state[randCoin] += 1;
    }

    // Income Logic
    let baseProduction = 0; 
    if(state.isCubePurchased) { 
        baseProduction = 100; 
        if (state.isAuroraUpgraded) baseProduction = 1000;
        else if (state.isDigitalUpgraded) baseProduction = 700;
        else if (state.isPrismUpgraded) baseProduction = 400; 
        else if (state.isEnergyUpgraded) baseProduction = 200; 
    }
    
    let totalIncome = baseProduction; 

    const efficiency = state.activeEnchants.find((e: any) => e.id === 'efficiency');
    if (efficiency) totalIncome *= (1 + (efficiency.level * 0.1));

    if (zeus && state.weather === '천둥') totalIncome *= 2;

    const pickpocket = state.activeEnchants.find((e: any) => e.id === 'pickpocket');
    if (pickpocket) {
        const isScreenBlock = ['황사', '폭염', '눈'].includes(state.weather);
        if (isScreenBlock) totalIncome *= 0.5;
        else totalIncome *= 2;
    }

    const defense = state.activeEnchants.find((e: any) => e.id === 'defense');
    const defenseReduction = defense ? (defense.level * 0.1) : 0;
    const thorns = state.activeEnchants.find((e: any) => e.id === 'thorns');
    let thornsTriggered = false;
    if (thorns && WEATHER_DATA[state.weather].isBad && Math.random() < (thorns.level * 0.05)) {
        thornsTriggered = true;
    }

    if (state.weather === '폭염') {
        if (thornsTriggered) {}
        else totalIncome *= (0.5 + (0.5 * defenseReduction));
    }

    if (state.investmentBonus && state.investmentBonus.isActive && Date.now() < state.investmentBonus.expiresAt) {
        totalIncome *= 2;
    }
    if (state.totemWeatherActive && state.totemWeatherActive.isActive && Date.now() < state.totemWeatherActive.expiresAt) {
        totalIncome *= 2;
    }

    if (state.exceptionalState.isActive) { if(Date.now() > state.exceptionalState.expiresAt) { state.exceptionalState.isActive = false; } else { totalIncome *= 2; } }
    
    const luck = state.activeEnchants.find((e: any) => e.id === 'luck');
    if (luck && Math.random() < (luck.level * 0.05)) {
        totalIncome *= 2;
    }

    state.userCash += totalIncome / 4;
    
    if (dom.updateBanner && dom.countdownTimer) {
        const showBannerThreshold = 5 * 60 * 60 * 1000; // 5 hours in ms
        const timeToUpdate = V2_UPDATE_TIMESTAMP - Date.now();
        if (timeToUpdate > 0 && timeToUpdate < showBannerThreshold) {
            dom.updateBanner.classList.remove('hidden');
            const hours = Math.floor(timeToUpdate / (1000 * 60 * 60));
            const minutes = Math.floor((timeToUpdate % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeToUpdate % (1000 * 60)) / 1000);
            dom.countdownTimer.textContent = `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초`;
        } else {
            // Keeping the new banner visible always as per "USE CODE MAGIC"
            // We will just let the banner defined in HTML stay.
            // Or override text if timer is not needed.
        }
    }

    updateUI();
}

function updateWeather() {
    if (globalWeatherOverride) { return; }
    
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const season = gameState.season;

    if (gameState.nextWeatherOverride) {
        const targetWeather = gameState.nextWeatherOverride;
        gameState.nextWeatherOverride = null; 
        
        const totemKey = Object.keys(TOTEM_DATA).find(k => TOTEM_DATA[k].effect === targetWeather);
        if (totemKey) {
            const conditions = TOTEM_DATA[totemKey].conditions;
            const seasonMatch = !conditions.season || conditions.season.includes(season);
            const timeMatch = !conditions.time || (conditions.time === 'night' && isNight) || (conditions.time === 'day' && !isNight);

            if (seasonMatch && timeMatch) {
                if (gameState.weather !== targetWeather) {
                    gameState.weather = targetWeather;
                    gameState.experiencedWeathers[targetWeather] = true;
                    
                    const weatherGod = gameState.activeEnchants.find((e: any) => e.id === 'weatherGod');
                    if (weatherGod) {
                        gameState.totemWeatherActive = { isActive: true, expiresAt: Date.now() + 30000 };
                        showNotification(`토템 효과로 날씨 변경! 날씨의 신 효과로 30초간 수익 2배!`, false);
                    } else {
                        showNotification(`토템 효과로 날씨가 ${targetWeather}(으)로 변경됩니다!`, false);
                    }

                    checkTrophies();
                    startPriceUpdateLoops();
                }
                return;
            } else {
                showNotification(`${targetWeather} 토템을 사용하기 위한 계절/시간 조건이 맞지 않아 실패했습니다.`, true);
            }
        }
    }

    let weights: { [key: string]: number } = {};
    const addWeight = (w: string, val: number) => { weights[w] = (weights[w] || 0) + val; };

    addWeight('맑음', 20); addWeight('구름', 20); addWeight('비', 15); addWeight('바람', 10);
    addWeight('무지개', 1); addWeight('산성비', 2); addWeight('천둥', 2);

    if (season === '봄') {
        addWeight('비', 15); addWeight('황사', 5); weights['구름'] -= 5;
    } else if (season === '여름') {
        addWeight('맑음', 15); addWeight('폭염', 5); addWeight('천둥', 5);
        addWeight('폭우', 5); weights['비'] -= 5;
    } else if (season === '가을') {
        addWeight('구름', 15); addWeight('바람', 15);
    } else if (season === '겨울') {
       delete weights['비'];
       addWeight('눈', 20); addWeight('우박', 2);
    }
    
    if (isNight) {
        addWeight('별똥별', 5);
        if (season === '겨울') { addWeight('오로라', 1); weights['별똥별'] -= 1;}
    }

    if (gameState.hasWeatherTrophy) {
        Object.keys(weights).forEach(w => {
            if (WEATHER_DATA[w]?.isGood) weights[w] *= 1.025;
            if (WEATHER_DATA[w]?.isBad) weights[w] *= 0.975;
        });
    }

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    let newWeather = '맑음';

    for (const weather in weights) {
        random -= weights[weather];
        if (random <= 0) {
            newWeather = weather;
            break;
        }
    }
    
    if (gameState.weather !== newWeather) {
        gameState.weather = newWeather;
        gameState.experiencedWeathers[newWeather] = true;
        checkTrophies();
        startPriceUpdateLoops();
    }
}


function addTransaction(type: 'buy' | 'sell', coin: string, amount: number, price: number) {
    const transaction = {
        type: type,
        coin: coin,
        amount: amount,
        price: price,
        timestamp: new Date(gameTime).toLocaleTimeString('ko-KR')
    };
    gameState.transactionHistory.unshift(transaction);
    if (gameState.transactionHistory.length > 50) gameState.transactionHistory.pop();
}

function handleTrade(type: 'buy' | 'sell', coinId: string) {
    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return;

    const amountInput = document.getElementById(`trade-amount-${coinId}`) as HTMLInputElement;
    const amount = parseInt(amountInput.value, 10);

    if (isNaN(amount) || amount <= 0) {
        showNotification('유효한 수량을 입력하세요.', true);
        return;
    }

    const price = gameState[coinConfig.priceKey];
    const totalCost = price * amount;

    if (type === 'buy') {
        if (gameState.userCash >= totalCost) {
            gameState.userCash -= totalCost;
            gameState[coinConfig.amountKey] += amount;
            addTransaction(type, coinId, amount, price);
            
            const investGod = gameState.activeEnchants.find((e: any) => e.id === 'investmentGod');
            if (investGod) {
                gameState.investmentBonus = { isActive: true, expiresAt: Date.now() + 5000 };
                showNotification('투자의 신 발동! 5초간 수익 2배!', false);
            }

        } else {
            showNotification('자금이 부족합니다.', true);
        }
    } else if (type === 'sell') {
        if (gameState[coinConfig.amountKey] >= amount) {
            gameState.userCash += totalCost;
            gameState[coinConfig.amountKey] -= amount;
            addTransaction(type, coinId, amount, price);
        } else {
            showNotification('보유한 코인이 부족합니다.', true);
        }
    }
    amountInput.value = '';
    updateTransactionHistoryUI();
}

function handleMaxAmount(type: 'buy' | 'sell', coinId: string) {
    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return;

    const amountInput = document.getElementById(`trade-amount-${coinId}`) as HTMLInputElement;
    const price = gameState[coinConfig.priceKey];

    if (type === 'buy') {
        const maxCanBuy = Math.floor(gameState.userCash / price);
        amountInput.value = String(maxCanBuy > 0 ? maxCanBuy : '');
    } else { // 'sell'
        const maxCanSell = gameState[coinConfig.amountKey];
        amountInput.value = String(maxCanSell > 0 ? maxCanSell : '');
    }
}

function updateTransactionHistoryUI() {
    if (!dom.transactionHistoryList) return;
    dom.transactionHistoryList.innerHTML = '';
    if (gameState.transactionHistory.length === 0) {
        dom.transactionHistoryList.innerHTML = '<li class="text-sm text-gray-500 italic">거래 기록이 없습니다.</li>';
        return;
    }
    gameState.transactionHistory.forEach((tx: any) => {
        const el = document.createElement('li');
        const isBuy = tx.type === 'buy';
        const color = isBuy ? 'text-green-400' : 'text-red-400';
        const typeText = isBuy ? '매수' : '매도';
        el.className = 'text-sm flex justify-between items-center p-1 bg-gray-800/50 rounded';
        el.innerHTML = `
            <span class="${color} font-semibold w-12">${typeText}</span>
            <span class="flex-1">${tx.coin.toUpperCase()} ${tx.amount.toLocaleString()}개</span>
            <span class="w-24 text-right">${tx.price.toLocaleString()} KRW</span>
            <span class="w-20 text-right text-gray-400 text-xs">${tx.timestamp}</span>
        `;
        dom.transactionHistoryList.appendChild(el);
    });
}
function handleBuy3DCube() {
    if (gameState.userCash >= 1000000 && !gameState.isCubePurchased) {
        gameState.userCash -= 1000000;
        gameState.isCubePurchased = true;
        showNotification('패시브 수입원 활성화 완료!', false);
        restoreUIState();
        saveGameState();
    } else {
        showNotification('자금이 부족합니다.', true);
    }
}
function handleComputerUpgrade() {
    const tier = gameState.computerTier;
    if (tier >= 5) { // Capped at Tier 5
        showNotification('이미 최고 티어입니다.', true);
        return;
    }
    const costData = COMPUTER_DATA[tier + 1];
    const cost = costData.cost;
    
    const canAfford = Object.keys(cost).every(key => gameState[key] >= cost[key as keyof typeof cost]);

    if (canAfford) {
        for(const key in cost) { gameState[key as keyof typeof cost] -= cost[key as keyof typeof cost]; }
        gameState.computerTier++;
        showNotification(`컴퓨터를 Tier ${gameState.computerTier}으로 업그레이드했습니다!`, false);
        updateComputerUI();
        saveGameState();
    } else {
        let missing = [];
        for (const key in cost) {
            const needed = (cost as any)[key];
            const owned = gameState[key] || 0;
            if (owned < needed) {
                missing.push(`${needed - owned} ${RESOURCE_NAME_MAP[key]}`);
            }
        }
        showNotification(`업그레이드 재료 부족: ${missing.join(', ')}`, true);
    }
}

function handleUpgradeLunar() {
    // Unlock logic (Level 0 -> 1) ONLY. No more scaling.
    if (gameState.lunarMiningLevel === 0) {
        if (gameState.userLunar >= 200) {
            gameState.userLunar -= 200;
            gameState.isLunarUpgraded = true;
            gameState.lunarMiningLevel = 1;
            showNotification('LUNAR 강화 잠금 해제! 마법석 채굴 시작 (Lv.1)', false);
            restoreUIState(); saveGameState();
        } else { showNotification('LUNAR 코인이 부족합니다 (200개 필요).', true); }
    } else {
        showNotification('LUNAR 강화가 이미 완료되었습니다.', true);
    }
}

function handleUpgradeEnergy() {
    if (gameState.userEnergy >= 100 && !gameState.isEnergyUpgraded) {
        gameState.userEnergy -= 100;
        gameState.isEnergyUpgraded = true;
        showNotification('ENERGY 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('ENERGY 코인이 부족합니다.', true); }
}
function handleUpgradePrism() {
    if (gameState.userPrisms >= 100 && !gameState.isPrismUpgraded) {
        gameState.userPrisms -= 100;
        gameState.isPrismUpgraded = true;
        showNotification('PRISM 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('PRISM 코인이 부족합니다.', true); }
}
function handleUpgradeDigital() {
    // Cost changed to DIGITAL (from Prism)
    if (gameState.userDigital >= 100 && !gameState.isDigitalUpgraded) {
        gameState.userDigital -= 100; 
        gameState.isDigitalUpgraded = true;
        showNotification('DIGITAL 강화 완료! 데이터 결정 채굴 시작.', false);
        restoreUIState(); saveGameState();
    } else { showNotification('DIGITAL 코인이 부족합니다 (100개 필요).', true); }
}
function handleUpgradeAurora() {
    // Cost changed to AURORA (from Digital)
    if (gameState.userAurora >= 100 && !gameState.isAuroraUpgraded) {
        gameState.userAurora -= 100;
        gameState.isAuroraUpgraded = true;
        showNotification('AURORA 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('AURORA 코인이 부족합니다.', true); }
}

function handleEnchantTableUpgrade() {
    const nextTier = gameState.enchantTableTier + 1;
    if (nextTier > 5) {
        showNotification('이미 최고 등급입니다.', true);
        return;
    }

    const upgradeCost = TABLE_UPGRADE_COSTS[nextTier - 1]; // Array index 0 is Tier 1 cost
    
    if (gameState.userCash < upgradeCost.cash) {
        showNotification(`자금이 부족합니다 (${upgradeCost.cash.toLocaleString()} KRW 필요)`, true);
        return;
    }
    if (gameState.userMagicStone < upgradeCost.stones) {
        showNotification(`마법석이 부족합니다 (${upgradeCost.stones}개 필요)`, true);
        return;
    }

    gameState.userCash -= upgradeCost.cash;
    gameState.userMagicStone -= upgradeCost.stones;
    gameState.enchantTableTier = nextTier;
    
    showNotification(`${TABLE_DATA[nextTier].name} 구매/강화 완료!`, false);
    updateEnchantUI();
    saveGameState();
}

// --- Enchantment Logic ---
function handleEnchant() {
    const tier = gameState.enchantTableTier;
    if (tier === 0) {
        showNotification('마법 부여대가 없습니다. 구매해주세요.', true);
        return;
    }
    const tableData = TABLE_DATA[tier];
    if (gameState.userMagicStone < tableData.stoneCost) {
        showNotification(`마법석이 부족합니다. (필요: ${tableData.stoneCost}개)`, true);
        return;
    }

    gameState.userMagicStone -= tableData.stoneCost;
    
    const minEnchants = Math.max(1, tableData.maxEnchants - 2);
    const range = tableData.maxEnchants - minEnchants + 1; // +1 for inclusive
    const numEnchants = Math.floor(Math.random() * range) + minEnchants;

    const pool = [
        { id: 'efficiency', name: '효율', maxLevel: 7 },
        { id: 'luck', name: '행운', maxLevel: 5 },
        { id: 'defense', name: '방어', maxLevel: 7 },
        { id: 'durability', name: '내구성', maxLevel: 5 },
        { id: 'thorns', name: '가시', maxLevel: 5 },
    ];

    const rarePool = [
        { id: 'weatherGod', name: '날씨의 신', maxLevel: 1, type: 'rare' },
        { id: 'binary', name: '이진법', maxLevel: 1, type: 'rare' },
        { id: 'magicHand', name: '마법의 손', maxLevel: 1, type: 'rare' },
    ];
    
    const rarePoolTier4 = [
        { id: 'investmentGod', name: '투자의 신', maxLevel: 1, type: 'rare' },
        { id: 'coinRain', name: '코인비', maxLevel: 1, type: 'rare' },
    ];

    const cursePool = [
        { id: 'zeus', name: '제우스의 저주', maxLevel: 1, type: 'curse' },
        { id: 'pickpocket', name: '소매치기의 저주', maxLevel: 1, type: 'curse' },
    ];

    const newEnchants: any[] = [];

    for(let i=0; i<numEnchants; i++) {
        let selected;
        let level = 1;
        let isRare = false;
        let isCurse = false;

        const typeRoll = Math.random();
        
        // Reduced Rare probabilities by ~3x again
        // Curse: 0.01 (1%), Rare T4: 0.02 (2%), Rare: 0.015 (1.5%)
        if (tier >= 5 && typeRoll < 0.01) { 
            selected = cursePool[Math.floor(Math.random() * cursePool.length)];
            isCurse = true;
        } else if (tier >= 4 && typeRoll < 0.02) { 
            const combinedRare = [...rarePool, ...rarePoolTier4];
            selected = combinedRare[Math.floor(Math.random() * combinedRare.length)];
            isRare = true;
        } else if (tier >= 1 && typeRoll < 0.015) { 
            selected = rarePool[Math.floor(Math.random() * rarePool.length)];
            isRare = true;
        } else {
            selected = pool[Math.floor(Math.random() * pool.length)];
        }

        if (!isRare && !isCurse) {
             const tableMax = tableData.maxLevel;
             const lvlRoll = Math.random();
             if (lvlRoll < 0.5) level = 1;
             else if (lvlRoll < 0.8) level = Math.min(2, tableMax);
             else if (lvlRoll < 0.95) level = Math.min(3, tableMax);
             else level = Math.min(Math.floor(Math.random() * tableMax) + 1, tableMax);
        }

        if (!newEnchants.find(e => e.id === selected.id)) {
            newEnchants.push({ id: selected.id, name: selected.name, level: level, type: (selected as any).type || 'normal' });
        }
    }

    gameState.activeEnchants = newEnchants;
    showNotification('마법 부여가 완료되었습니다!', false);
    updateEnchantUI();
    saveGameState();
}

function updateEnchantUI() {
    if (!dom.enchantmentContainer) return;
    
    // Always show container now, but content varies
    dom.enchantmentContainer.classList.toggle('hidden', !gameState.isCubePurchased); 
    if (!gameState.isCubePurchased) return;

    const tier = gameState.enchantTableTier;
    
    if (tier === 0) {
        dom.enchantTableTierText.textContent = "마법 부여대 없음";
        if(dom.upgradeTableButton) {
            const nextCost = TABLE_UPGRADE_COSTS[0];
            dom.upgradeTableButton.textContent = `1티어 구매 (${nextCost.cash.toLocaleString()} KRW)`;
            dom.upgradeTableButton.classList.remove('hidden');
        }
        if(dom.enchantActionPanel) dom.enchantActionPanel.classList.add('hidden');
    } else {
        const tableData = TABLE_DATA[tier];
        dom.enchantTableTierText.textContent = tableData.name;
        
        // Upgrade Button logic
        if (tier < 5 && dom.upgradeTableButton) {
             const nextCost = TABLE_UPGRADE_COSTS[tier]; // Index tier corresponds to next tier cost
             dom.upgradeTableButton.textContent = `다음 티어 강화 (${nextCost.cash.toLocaleString()} KRW + ${nextCost.stones} MS)`;
             dom.upgradeTableButton.classList.remove('hidden');
        } else {
            dom.upgradeTableButton.classList.add('hidden');
        }

        if(dom.enchantActionPanel) dom.enchantActionPanel.classList.remove('hidden');
        dom.enchantCostText.textContent = `${tableData.stoneCost} 마법석`;
    }
    
    dom.activeEnchantsList.innerHTML = '';
    if (gameState.activeEnchants.length === 0) {
        dom.activeEnchantsList.innerHTML = '<div class="text-gray-500 text-sm italic">적용된 마법이 없습니다.</div>';
    } else {
        gameState.activeEnchants.forEach((enc: any) => {
            const div = document.createElement('div');
            let colorClass = 'text-blue-300';
            if (enc.type === 'rare') colorClass = 'text-rare';
            if (enc.type === 'curse') colorClass = 'text-curse';
            
            const levelRoman = enc.level === 1 ? 'I' : enc.level === 2 ? 'II' : enc.level === 3 ? 'III' : enc.level === 4 ? 'IV' : enc.level === 5 ? 'V' : enc.level === 6 ? 'VI' : 'VII';
            
            div.className = 'bg-gray-800 border border-gray-600 p-2 rounded flex justify-between items-center';
            div.innerHTML = `<span class="${colorClass} font-bold">${enc.name} ${enc.type !== 'curse' && enc.type !== 'rare' ? levelRoman : ''}</span>`;
            dom.activeEnchantsList.appendChild(div);
        });
    }
}

function handleSleep() {
    const state = gameState;
    if (state.weather === '눈') { showNotification('눈이 와서 잘 수 없습니다.', true); return; }
    if (!state.shopItems.bed) { showNotification('침대가 없어서 잘 수 없습니다. 상점에서 구매하세요.', true); return; }
    state.sleepCount++;
    const currentHour = gameTime.getHours();
    if (currentHour >= 19 || currentHour < 9) {
        if(currentHour >= 19) { gameTime.setDate(gameTime.getDate() + 1); }
        gameTime.setHours(9, 0, 0, 0);
        showNotification('수면을 취하고 다음 날 아침이 되었습니다.', false);
        startPriceUpdateLoops(); // Day/night change
        checkTrophies();
    } else {
        showNotification('밤에만 잘 수 있습니다.', true);
    }
}

function switchShopTab(tabName: string) {
    const tabs = ['function', 'totems'];
    tabs.forEach(t => {
        const content = dom[`shopContent${t.charAt(0).toUpperCase() + t.slice(1)}`];
        const tab = dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`];
        if (content) content.classList.toggle('hidden', t !== tabName);
        if (tab) tab.classList.toggle('tab-active', t !== tabName);
    });
}
function restoreUIState() {
    const state = gameState; if (!dom.cubePurchaseOverlay) return;
    dom.cubePurchaseOverlay.classList.toggle('hidden', state.isCubePurchased);
    dom.incomeSourceUpgrades.classList.toggle('hidden', !state.isCubePurchased);
    dom.timeContainer.classList.toggle('hidden', !state.shopItems.digitalClock);
    dom.weatherContainer.classList.toggle('hidden', !state.shopItems.digitalClock);
    
    if (dom.upgradeLunarSection) {
        dom.upgradeLunarSection.classList.toggle('hidden', !state.isCubePurchased);
        // Lunar is buy once now
        dom.upgradeLunarButton.textContent = state.lunarMiningLevel > 0 ? '구매 완료' : '200 LUNAR';
        if (state.lunarMiningLevel > 0) dom.upgradeLunarButton.classList.add('btn-disabled');
        else dom.upgradeLunarButton.classList.remove('btn-disabled');
    }

    if (dom.upgradeEnergySection) dom.upgradeEnergySection.classList.toggle('hidden', !state.isLunarUpgraded || state.isEnergyUpgraded);
    if (dom.upgradePrismSection) dom.upgradePrismSection.classList.toggle('hidden', !state.isEnergyUpgraded || state.isPrismUpgraded);
    if (dom.upgradeDigitalSection) dom.upgradeDigitalSection.classList.toggle('hidden', !state.isPrismUpgraded || state.isDigitalUpgraded);
    
    if (dom.upgradeDigitalButton) dom.upgradeDigitalButton.textContent = '100 DIGITAL'; // Updated Text
    
    if (dom.upgradeAuroraSection) dom.upgradeAuroraSection.classList.toggle('hidden', !state.isDigitalUpgraded || state.isAuroraUpgraded);
    if (dom.upgradeAuroraButton) dom.upgradeAuroraButton.textContent = '100 AURORA'; // Updated Text
    
    updateCubeAppearance(); updateWeatherAlmanacUI(); updateMagicAlmanacUI(); updateUI(); updateEnchantUI();
}
async function resetUserData() {
    if (confirm('정말로 모든 게임 데이터를 삭제하고 처음부터 다시 시작하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        gameState = getInitialGameState();
        await saveGameState();
        window.location.reload();
    }
}
async function handleCodeSubmit() {
    const codeInput = dom.codeInput as HTMLInputElement;
    const code = codeInput.value.toUpperCase().trim();
    if (!code) return;

    if (code === 'RESET') {
        resetUserData();
        return;
    }
    
    if (code === 'MAGIC') {
        if (gameState.usedCodes && gameState.usedCodes.includes(code)) {
            showNotification('이미 사용한 코드입니다.', true);
            return;
        }
        gameState.userMagicStone = (gameState.userMagicStone || 0) + 10;
        if (!gameState.usedCodes) gameState.usedCodes = [];
        gameState.usedCodes.push(code);
        showNotification('마법석 10개를 획득했습니다!', false);
        codeInput.value = '';
        await saveGameState();
        return;
    }

    if (gameState.usedCodes && gameState.usedCodes.includes(code)) {
        showNotification('이미 사용한 코드입니다.', true);
        return;
    }

    const codeRef = db.ref(`promoCodes/${code}`);
    const snapshot = await codeRef.get();

    if (snapshot.exists()) {
        const reward = snapshot.val();
        gameState[reward.rewardType] = (gameState[reward.rewardType] || 0) + reward.amount;
        
        if (!gameState.usedCodes) {
            gameState.usedCodes = [];
        }
        gameState.usedCodes.push(code);

        showNotification(`보상 획득: ${RESOURCE_NAME_MAP[reward.rewardType] || reward.rewardType} ${reward.amount.toLocaleString()}!`, false);
        codeInput.value = '';
        await saveGameState();
    } else {
        showNotification('유효하지 않은 코드입니다.', true);
    }
}
function migrateAndMergeState(loadedData: any): any {
    const initialState = getInitialGameState(); const migratedState: any = {};
    for (const key in initialState) {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            const initialValue = initialState[key as keyof typeof initialState]; const loadedValue = loadedData[key];
            if (loadedValue !== undefined) { if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && typeof loadedValue === 'object' && loadedValue !== null && !Array.isArray(loadedValue)) { migratedState[key] = { ...initialValue, ...loadedValue }; } else { migratedState[key] = loadedValue; } }
            else { migratedState[key] = initialValue; }
        }
    }
    return migratedState;
}
async function saveGameState() {
    if (!userUID) return;
    try {
        const stateToSave = { ...gameState, lastOnlineTimestamp: Date.now() };
        await db.ref(`users/${userUID}`).set(stateToSave);
    } catch (error) {
        console.error("Error saving game state:", error);
    }
}
async function loadGameState() {
    if (!userUID) return false;
    const snapshot = await db.ref(`users/${userUID}`).get();
    if (snapshot.exists()) {
        const loadedData = snapshot.val();
        
        // Data Version Check - No auto reset, just merge if version differs to be safe
        if (loadedData.version !== DATA_VERSION) {
             // We update the version in state but try to keep data.
             // Only strict structure changes might need manual migration logic here.
             console.log("Data version mismatch, migrating...");
             gameState = migrateAndMergeState(loadedData);
             gameState.version = DATA_VERSION;
             await saveGameState();
             return true;
        }

        gameState = migrateAndMergeState(loadedData);

        const now = Date.now();
        const offlineTimeMs = now - (gameState.lastOnlineTimestamp || now);
        const offlineSeconds = Math.floor(offlineTimeMs / 1000);
        
        if (offlineSeconds > 10) { 
            let baseProduction = 0;
            if(gameState.isCubePurchased) { 
                baseProduction = 100; 
                if(gameState.isAuroraUpgraded) baseProduction = 1000;
                else if(gameState.isDigitalUpgraded) baseProduction = 700;
                else if(gameState.isPrismUpgraded) baseProduction = 400; 
                else if(gameState.isEnergyUpgraded) baseProduction = 200; 
            }
            
            let offlineKRW = baseProduction * offlineSeconds;
            gameState.userCash += offlineKRW;
            showNotification(`오프라인 보상: ${Math.floor(offlineKRW).toLocaleString()} KRW를 획득했습니다!`, false);
        }
        
        gameState.lastOnlineTimestamp = now;
        return true;
    }
    return false;
}
function handleSendMessage() {
    const input = dom.chatInput as HTMLInputElement;
    const text = input.value.trim();

    if (text === '/dev.mod') {
        dom.devPanel.classList.remove('hidden');
        input.value = '';
        return;
    }

    if (text && userNickname) {
        db.ref('chat').push({
            nickname: userNickname,
            text: text,
        });
        input.value = '';
    }
}
function appendChatMessage(message: { nickname: string, text: string }) {
    if (!dom.chatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.innerHTML = `<span class="font-semibold text-blue-300">${message.nickname}</span>: <span>${message.text}</span>`;
    dom.chatMessages.appendChild(msgEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

async function handleLogin(e: Event) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password-input') as HTMLInputElement;
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        console.error("Login failed:", error);
        showNotification(`로그인 실패: ${error.message}`, true);
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const emailInput = document.getElementById('register-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('register-password-input') as HTMLInputElement;
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (password.length < 6) {
        showNotification('비밀번호는 6자 이상이어야 합니다.', true);
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        console.error("Registration failed:", error);
        showNotification(`회원가입 실패: ${error.message}`, true);
    }
}

function handleLogout() {
    saveGameState().then(() => {
         auth.signOut().catch((error: any) => {
            console.error("Logout failed:", error);
            showNotification(`로그아웃 실패: ${error.message}`, true);
        });
    });
}

async function onLoginSuccess(user: any) {
    userNickname = user.email.split('@')[0];
    userUID = user.uid;
    
    document.getElementById('auth-container')?.classList.add('hidden');
    document.getElementById('main-content')?.classList.remove('hidden');

    const loaded = await loadGameState();
    if (!loaded) {
        gameState = getInitialGameState();
        await saveGameState();
    }
    
    stopGame(); // Stop any leftover intervals from a previous session
    initGame();
    startGame();
    
    const chatRef = db.ref('chat').limitToLast(100);
    chatRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message) {
            appendChatMessage(message);
        }
    });

    db.ref('chat').on('child_removed', () => {
        dom.chatMessages.innerHTML = ''; // Clear chat on client side
    });

    const globalRef = db.ref('globalState');
    globalRef.on('value', (snapshot) => {
        const globals = snapshot.val() || {};
        const newSpeed = globals.speed || 1;
        if (newSpeed !== currentGameSpeed) {
            currentGameSpeed = newSpeed;
            restartGameLoop();
            startPriceUpdateLoops();
        }
        globalWeatherOverride = globals.weather || null;
        globalPriceOverrides = globals.prices || null;
        if(globalPriceOverrides) {
           Object.keys(globalPriceOverrides).forEach(coinId => {
               const coinConfig = COIN_DATA[coinId];
               if(coinConfig) {
                   gameState[coinConfig.priceKey] = globalPriceOverrides[coinId];
               }
           });
        }
        handleAnnouncementUpdate(globals.announcement || null);
    });


    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = setInterval(saveGameState, 30000);
}

function handleAnnouncementUpdate(announcement: { text: string, duration: number, timestamp: number } | null) {
    const banner = document.getElementById('global-announcement');
    const textSpan = document.getElementById('announcement-text');
    const timerSpan = document.getElementById('announcement-timer');
    
    if (announcementInterval) clearInterval(announcementInterval);

    if (announcement && announcement.text) {
        const now = Date.now();
        const endTime = announcement.timestamp + (announcement.duration * 1000);
        
        if (now < endTime) {
            if (banner && textSpan) {
                textSpan.textContent = announcement.text;
                banner.classList.remove('hidden');
            }

            const updateTimer = () => {
                const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                if (timerSpan) timerSpan.textContent = `${remaining}s`;
                if (remaining <= 0) {
                    banner?.classList.add('hidden');
                    clearInterval(announcementInterval);
                }
            };
            updateTimer();
            announcementInterval = setInterval(updateTimer, 1000);
        } else {
            banner?.classList.add('hidden');
        }
    } else {
        banner?.classList.add('hidden');
    }
}

// --- Dev Panel Logic ---
function initDevPanel() {
    if (!dom.devWeatherSelect) return;
    
    // Populate Weather Select
    dom.devWeatherSelect.innerHTML = '';
    Object.keys(WEATHER_DATA).forEach(w => {
        const option = document.createElement('option');
        option.value = w;
        option.textContent = w;
        dom.devWeatherSelect.appendChild(option);
    });

    // Close Button
    dom.closeDevPanel?.addEventListener('click', () => {
        dom.devPanel.classList.add('hidden');
    });

    // Announcement
    document.getElementById('dev-post-announcement-btn')?.addEventListener('click', () => {
        const text = (document.getElementById('dev-announcement-text') as HTMLInputElement).value;
        const duration = parseInt((document.getElementById('dev-announcement-duration') as HTMLInputElement).value) || 15;
        if (text) {
            db.ref('globalState/announcement').set({
                text: text,
                duration: duration,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            alert('공지가 게시되었습니다.');
        }
    });

    document.getElementById('dev-clear-announcement-btn')?.addEventListener('click', () => {
        db.ref('globalState/announcement').remove();
        alert('공지가 삭제되었습니다.');
    });

    // Speed
    document.getElementById('dev-set-speed-btn')?.addEventListener('click', () => {
        const speed = parseInt((document.getElementById('dev-speed-input') as HTMLInputElement).value);
        if (speed >= 1 && speed <= 10) {
            db.ref('globalState/speed').set(speed);
            alert(`게임 속도가 ${speed}배로 설정되었습니다.`);
        }
    });

    // Chat Clear
    document.getElementById('dev-clear-chat-btn')?.addEventListener('click', () => {
        if(confirm('정말 채팅 기록을 모두 삭제하시겠습니까?')) {
            db.ref('chat').remove();
            alert('채팅 기록이 삭제되었습니다.');
        }
    });

    // Weather
    document.getElementById('dev-set-weather-btn')?.addEventListener('click', () => {
        const weather = (document.getElementById('dev-weather-select') as HTMLSelectElement).value;
        db.ref('globalState/weather').set(weather);
        alert(`날씨가 ${weather}로 고정되었습니다.`);
    });

    document.getElementById('dev-clear-weather-btn')?.addEventListener('click', () => {
        db.ref('globalState/weather').remove();
        alert('날씨 고정이 해제되었습니다.');
    });

    // Prices
    document.getElementById('dev-set-prices-btn')?.addEventListener('click', () => {
        const prices: any = {};
        const ids = ['cube', 'lunar', 'energy', 'prism', 'digital', 'aurora'];
        let hasValue = false;
        ids.forEach(id => {
            const val = (document.getElementById(`dev-price-${id}`) as HTMLInputElement).value;
            if (val) {
                prices[id.charAt(0).toUpperCase() + id.slice(1)] = parseInt(val);
                hasValue = true;
            }
        });

        if (hasValue) {
            db.ref('globalState/prices').set(prices);
            alert('코인 가격이 고정되었습니다.');
        }
    });

    document.getElementById('dev-clear-prices-btn')?.addEventListener('click', () => {
        db.ref('globalState/prices').remove();
        alert('코인 가격 고정이 해제되었습니다.');
    });

    // Promo Code
    document.getElementById('dev-create-code-btn')?.addEventListener('click', () => {
        const code = (document.getElementById('dev-code-id') as HTMLInputElement).value.toUpperCase();
        const type = (document.getElementById('dev-code-reward-type') as HTMLSelectElement).value;
        const amount = parseInt((document.getElementById('dev-code-reward-amount') as HTMLInputElement).value);

        if (code && amount > 0) {
            db.ref(`promoCodes/${code}`).set({
                rewardType: type,
                amount: amount
            });
            alert(`코드 ${code}가 생성되었습니다.`);
        }
    });
    
    // User Reset
    document.getElementById('dev-reset-user-btn')?.addEventListener('click', () => {
        const uid = (document.getElementById('dev-reset-uid') as HTMLInputElement).value.trim();
        if(uid) {
            if(confirm(`정말 유저 ${uid}의 데이터를 초기화하시겠습니까?`)) {
                db.ref(`users/${uid}`).remove()
                .then(() => alert('데이터 삭제 완료'))
                .catch((e: any) => alert('오류: ' + e.message));
            }
        }
    });
}

function populateSettingsUI() {
    if(!dom.devPanel) return; // Just a check
    const durationInput = document.getElementById('setting-notification-duration') as HTMLInputElement;
    const showToggle = document.getElementById('setting-show-notifications') as HTMLInputElement;
    
    if(durationInput) durationInput.value = (gameState.settings.notificationDuration / 1000).toString();
    if(showToggle) showToggle.checked = gameState.settings.showNotifications;
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const closeAnnouncement = document.getElementById('close-announcement');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    if (showRegisterLink && loginView && registerView) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.classList.add('hidden');
            registerView.classList.remove('hidden');
        });
    }

    if (showLoginLink && loginView && registerView) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }
    
    if (closeAnnouncement) {
        closeAnnouncement.addEventListener('click', () => {
            document.getElementById('global-announcement')?.classList.add('hidden');
        });
    }

    auth.onAuthStateChanged((user: any) => {
        if (user) {
            onLoginSuccess(user);
        } else {
            document.getElementById('auth-container')?.classList.remove('hidden');
            document.getElementById('main-content')?.classList.add('hidden');
            stopGame();
        }
    });
});
