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
const DATA_VERSION = 8; // Incremented for Major Update (Shops/Brewing)
const V2_UPDATE_TIMESTAMP = new Date('2024-09-01T09:00:00Z').getTime();
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
    '오류': { icon: '👾', short_desc: '시스템 오류', long_desc: '모든 코인 변화 속도 5배 증가. 확률 50/50 고정.', isBad: true },
    '가뭄': { icon: '🌵', short_desc: '코인 하락세', long_desc: '증가 확률 -1%, 감소 확률 +1%. 비가 올 때까지 지속됩니다.', isBad: true },
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
    userDigital: 'DIGITAL', userAurora: 'AURORA', userMagicStone: '마법석', userDataCrystal: '데이터 결정',
    userDataSet: '데이터 집합', userActivatedDataCrystal: '활성화 데이터 결정', userCrystallizedHologram: '결정화된 홀로그램', userErrorDataCrystal: '오류난 데이터 결정'
};

// Special Items Map for inventory display
const SPECIAL_ITEMS_MAP: { [key: string]: string } = {
    userSuspiciousStone: '수상한 마법석',
    userReinforcedStone: '강화된 마법석',
    userSeasonTotem: '계절의 토템',
    userCursedTotem: '저주받은 토템',
    userAccelerationTotem: '가속의 토템',
    userTotemBundle: '토템 꾸러미',
    userCrystallizedKey: '결정화된 데이터 열쇠',
    
    userDataFiedStone: '데이터화 마법석',
    userLuckyStone: '행운의 마법석',
    userBrewingStand: '양조기',
    userShimmeringDataCrystal: '일렁이는 데이터 결정',
    userErrorTotem: '#%>*& 토템'
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
let timeAccumulator = 0; // For Chronos curse fractional time

const COIN_DATA: {[key: string]: any} = {
    Cube: {
        priceKey: 'currentPrice',
        amountKey: 'userCubes',
        minPrice: 5000,
        maxPrice: 25000,
        interval: 2000,
        upChance: 0.53,
        fluctuation: { day: { small: 0.6, medium: 0.35, large: 0.05 }, night: { small: 0.6, medium: 0.35, large: 0.05 } }
    },
    Lunar: {
        priceKey: 'currentLunarPrice',
        amountKey: 'userLunar',
        minPrice: 10000,
        maxPrice: 50000,
        interval: { day: 2500, night: 1500 },
        upChance: { day: 0.45, night: 0.55 },
        fluctuation: { day: { small: 0.7, medium: 0.3, large: 0 }, night: { small: 0.5, medium: 0.4, large: 0.1 } }
    },
    Energy: {
        priceKey: 'currentEnergyPrice',
        amountKey: 'userEnergy',
        minPrice: 20000,
        maxPrice: 100000,
        interval: 3500,
        upChance: 0.50,
        fluctuation: { day: { small: 0, medium: 0.9, large: 0.1 }, night: { small: 0, medium: 0.9, large: 0.1 } }
    },
    Prism: {
        priceKey: 'currentPrismPrice',
        amountKey: 'userPrisms',
        minPrice: 40000,
        maxPrice: 200000,
        interval: 3000,
        upChance: 0.47, 
        fluctuation: { day: { small: 0.6, medium: 0.38, large: 0.02 }, night: { small: 0.6, medium: 0.38, large: 0.02 } }
    },
    Digital: {
        priceKey: 'currentDigitalPrice',
        amountKey: 'userDigital',
        minPrice: 80000,
        maxPrice: 500000,
        interval: 3000,
        upChance: 0.50, 
        fluctuation: { day: { small: 0.98, medium: 0, large: 0.02 }, night: { small: 0.98, medium: 0, large: 0.02 } }
    },
    Aurora: {
        priceKey: 'currentAuroraPrice',
        amountKey: 'userAurora',
        minPrice: 100000,
        maxPrice: 2000000,
        interval: 4000,
        upChance: 0.51,
        fluctuation: { day: { small: 0.7, medium: 0.3, large: 0 }, night: { small: 0.7, medium: 0.3, large: 0 } }
    }
};

// Updated Computer Data
const COMPUTER_DATA = [
    { name: '컴퓨터 없음', cost: {}, effect: {} },
    { name: 'Tier 1 컴퓨터', cost: { userDataCrystal: 5 }, effect: { Cube: 0.025, Lunar: 0.02, Energy: 0.015, Prism: 0.01, Digital: 0.005 } },
    { name: 'Tier 2 컴퓨터', cost: { userDataCrystal: 20 }, effect: { Cube: 0.05, Lunar: 0.04, Energy: 0.03, Prism: 0.02, Digital: 0.01 } },
    { name: 'Tier 3 컴퓨터', cost: { userDataCrystal: 50 }, effect: { Cube: 0.075, Lunar: 0.06, Energy: 0.045, Prism: 0.03, Digital: 0.015 } },
    { name: 'Tier 4 컴퓨터', cost: { userDataSet: 16 }, effect: { Cube: 0.10, Lunar: 0.08, Energy: 0.06, Prism: 0.04, Digital: 0.02 } },
    { name: 'Tier 5 컴퓨터', cost: { userDataSet: 40 }, effect: { Cube: 0.125, Lunar: 0.10, Energy: 0.075, Prism: 0.05, Digital: 0.025 } },
    { name: 'Tier 6 컴퓨터', cost: { userActivatedDataCrystal: 10 }, effect: { Cube: 0.15, Lunar: 0.12, Energy: 0.09, Prism: 0.06, Digital: 0.03 } },
    { name: 'Tier 7 컴퓨터', cost: { userActivatedDataCrystal: 20 }, effect: { Cube: 0.175, Lunar: 0.14, Energy: 0.105, Prism: 0.07, Digital: 0.035 } },
    { name: 'Tier 8 컴퓨터', cost: { userCrystallizedHologram: 20 }, effect: { Cube: 0.20, Lunar: 0.16, Energy: 0.12, Prism: 0.08, Digital: 0.04 } },
    { name: 'Tier 9 컴퓨터', cost: { userCrystallizedHologram: 40 }, effect: { Cube: 0.225, Lunar: 0.18, Energy: 0.135, Prism: 0.09, Digital: 0.045 } },
    { name: 'Tier 10 컴퓨터', cost: { userErrorDataCrystal: 1 }, effect: { Cube: 0.25, Lunar: 0.20, Energy: 0.15, Prism: 0.10, Digital: 0.05 } },
];

// Shops Data
const TRAVELING_ITEMS = {
    'suspiciousStone': { name: '수상한 마법석', cost: 10, currency: 'userMagicStone', stockRange: [1, 2], desc: '마법 부여시 랜덤 인첸트 레벨 +1' },
    'reinforcedStone': { name: '강화된 마법석', cost: 20, currency: 'userMagicStone', stockRange: [1, 2], desc: '토템 강화 재료' },
    'seasonTotem': { name: '계절의 토템', cost: 20, currency: 'userMagicStone', stockRange: [1, 1], desc: '다음 계절로 즉시 이동' },
    'cursedTotem': { name: '저주받은 토템', cost: 5, currency: 'userMagicStone', stockRange: [1, 2], desc: '랜덤 날씨 소환 (조건 무시)' },
    'totemBundle': { name: '토템 꾸러미', cost: 10, currency: 'userMagicStone', stockRange: [1, 1], desc: '랜덤 토템 3개 획득' },
    'accelerationTotem': { name: '가속의 토템', cost: 20, currency: 'userMagicStone', stockRange: [1, 1], desc: '8시간 동안 시간 2배 가속' },
    'crystallizedKey': { name: '결정화된 데이터 열쇠', cost: 200, currency: 'userMagicStone', stockRange: [1, 1], desc: '디지털 상점 잠금 해제' }
};

const DIGITAL_ITEMS = {
    'dataFiedStone': { name: '데이터화 마법석', cost: 10, currency: 'userDataCrystal', subCost: 1, subCurrency: 'userMagicStone', stockRange: [0, 2], desc: '마법 부여 시 10개 선택지 제공' },
    'dataSet': { name: '데이터 집합', cost: 5, currency: 'userDataCrystal', stockRange: [0, 2], desc: '4-5티어 컴퓨터 업그레이드 재료' },
    'deactivatedCrystal': { name: '비활성화 데이터 결정', cost: 10, currency: 'userDataCrystal', stockRange: [0, 2], desc: '마법 부여 시 20% 확률로 활성화' },
    'luckyStone': { name: '행운의 마법석', cost: 5, currency: 'userDataCrystal', subCost: 1, subCurrency: 'userMagicStone', stockRange: [0, 2], desc: '희귀/저주/축복 확률 1.5배' },
    'brewingStand': { name: '양조기', cost: 100, currency: 'userDataCrystal', subCost: 200, subCurrency: 'userMagicStone', stockRange: [0, 1], desc: '양조 기능 잠금 해제' },
    'crystallizedHologram': { name: '결정화된 홀로그램', cost: 40, currency: 'userDataCrystal', stockRange: [0, 2], desc: '8-9티어 컴퓨터 업그레이드 재료' },
    'shimmeringCrystal': { name: '일렁이는 데이터 결정', cost: 2000, currency: 'userDataCrystal', stockRange: [0, 1], desc: '오류 날씨에 오류 결정으로 변환' },
    'errorTotem': { name: '#%>*& 토템', cost: 1000, currency: 'userDataCrystal', stockRange: [0, 1], desc: '오류 날씨 소환' }
};

const TABLE_UPGRADE_COSTS = [
    { cash: 50000, stones: 0 }, { cash: 100000, stones: 5 }, { cash: 200000, stones: 20 },
    { cash: 500000, stones: 40 }, { cash: 1000000, stones: 100 }, { cash: 2000000, stones: 200 },
    { cash: 5000000, stones: 500 }, { cash: 10000000, stones: 1000 }
];

const TABLE_DATA = [
    { tier: 0, name: '없음', cost: 0, stoneCost: 0, maxEnchants: 0 },
    { tier: 1, name: '1티어 마법 부여대', cost: 50000, stoneCost: 1, maxEnchants: 2, maxLevel: 3 }, 
    { tier: 2, name: '2티어 마법 부여대', cost: 100000, stoneCost: 3, maxEnchants: 3, maxLevel: 4 }, 
    { tier: 3, name: '3티어 마법 부여대', cost: 200000, stoneCost: 5, maxEnchants: 3, maxLevel: 5 }, 
    { tier: 4, name: '4티어 마법 부여대', cost: 500000, stoneCost: 8, maxEnchants: 4, maxLevel: 6 }, 
    { tier: 5, name: '5티어 마법 부여대', cost: 1000000, stoneCost: 10, maxEnchants: 5, maxLevel: 7 },
    { tier: 6, name: '6티어 마법 부여대', cost: 2000000, stoneCost: 12, maxEnchants: 5, minEnchants: 3, maxLevel: 10 },
    { tier: 7, name: '7티어 마법 부여대', cost: 5000000, stoneCost: 16, maxEnchants: 6, minEnchants: 4, maxLevel: 10 },
    { tier: 8, name: '8티어 마법 부여대', cost: 10000000, stoneCost: 20, maxEnchants: 7, minEnchants: 5, maxLevel: 10 }
];

const TOTEM_DATA: {[key: string]: any} = {
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

const UPGRADE_COSTS_LUNAR = [40, 80, 160, 320, 640];
const UPGRADE_COSTS_DIGITAL = [10, 20, 30, 40, 50];

const getInitialGameState = () => ({
    version: DATA_VERSION,
    userCash: 100000, 
    userCubes: 0, userLunar: 0, userEnergy: 0, userPrisms: 0, 
    userDigital: 0, userAurora: 0, userMagicStone: 0, userDataCrystal: 0,
    // New Materials & Items
    userDataSet: 0, userActivatedDataCrystal: 0, userCrystallizedHologram: 0, userErrorDataCrystal: 0,
    userSuspiciousStone: 0, userReinforcedStone: 0, userSeasonTotem: 0, userCursedTotem: 0, userAccelerationTotem: 0, userTotemBundle: 0, userCrystallizedKey: 0,
    userDataFiedStone: 0, userLuckyStone: 0, userBrewingStand: 0, userShimmeringDataCrystal: 0, userErrorTotem: 0,
    
    currentPrice: 10000, lastPrice: 10000, 
    currentLunarPrice: 20000, lastLunarPrice: 20000,
    currentEnergyPrice: 50000, lastEnergyPrice: 50000, 
    currentPrismPrice: 100000, lastPrismPrice: 100000,
    currentDigitalPrice: 200000, lastDigitalPrice: 200000,
    currentAuroraPrice: 500000, lastAuroraPrice: 500000,
    computerTier: 0,
    isCubePurchased: false, isEnergyUpgraded: false, isPrismUpgraded: false, isAuroraUpgraded: false,
    isDigitalShopUnlocked: false, isBrewingUnlocked: false,
    lunarMiningLevel: 0, digitalMiningLevel: 0,
    weather: '맑음', experiencedWeathers: { '맑음': true },
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false, magicBook: false }, 
    isInternetOutage: false, isInternetOutageCooldown: 0,
    gameTime: new Date(2025, 2, 21, 9, 0, 0).getTime(),
    isSleeping: false, usedCodes: [], lastOnlineTimestamp: Date.now(),
    transactionHistory: [],
    exceptionalState: { isActive: false, expiresAt: 0 },
    season: '봄', dayInSeason: 1, totalSeasonsPassed: 0,
    hasWeatherTrophy: false, hasPowerTrophy: false, hasTimeTrophy: false,
    minedCoins: { CUBE: 0, LUNAR: 0, ENERGY: 0, PRISM: 0 }, sleepCount: 0,
    totemPurchaseCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totemStock: {}, lastTotemRefresh: 0,
    nextWeatherOverride: null,
    enchantTableTier: 0, activeEnchants: [],
    investmentBonus: { isActive: false, expiresAt: 0 },
    totemWeatherActive: { isActive: false, expiresAt: 0 },
    accelerationActive: { isActive: false, expiresAt: 0 },
    activePotions: [], // { type: 'exp', tier: number, expiresAt: number }
    
    // Shops
    travelingMerchantStock: {}, 
    digitalShopStock: {}, lastDigitalRestock: 0,

    settings: { showNotifications: true, notificationDuration: 3000 },
    dataCrystalTick: 0, lastMiningTimestamp: Date.now(),
});

gameState = getInitialGameState();

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
    else if (gameState.digitalMiningLevel > 0) { geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); materialProps.color = 0x06b6d4; }
    else if (gameState.isPrismUpgraded) { geometry = new THREE.IcosahedronGeometry(1.5, 0); materialProps.color = 0xf472b6; } 
    else if (gameState.isEnergyUpgraded) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xfacc15; }
    else if (gameState.lunarMiningLevel > 0) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xa855f7; }
    else { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0x60a5fa; }
    const material = new THREE.MeshStandardMaterial(materialProps); cube = new THREE.Mesh(geometry, material); scene.add(cube);
}

function animate() {
    if(!renderer) return;
    requestAnimationFrame(animate);
    if (cube) { cube.rotation.x += 0.003; cube.rotation.y += 0.003; }
    if (renderer && scene && camera) { renderer.render(scene, camera); }
}

function initGame() {
    gameTime = new Date(gameState.gameTime);
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
        extraAssets: document.getElementById('extra-assets'),

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
        magicAlmanacActive: document.getElementById('magic-almanac-active'),
        
        trophyList: document.getElementById('trophy-list'), transactionHistoryList: document.getElementById('transaction-history-list'),
        chatMessages: document.getElementById('chat-messages'), chatInput: document.getElementById('chat-input'), chatSendButton: document.getElementById('chat-send-button'), logoutButton: document.getElementById('logout-button'),
        
        shopTabFunction: document.getElementById('shop-tab-function'), shopTabTotems: document.getElementById('shop-tab-totems'),
        shopTabTraveling: document.getElementById('shop-tab-traveling'), shopTabDigital: document.getElementById('shop-tab-digital'), shopTabBrewing: document.getElementById('shop-tab-brewing'),
        shopContentFunction: document.getElementById('shop-content-function'), shopContentTotems: document.getElementById('shop-content-totems'),
        shopContentTraveling: document.getElementById('shop-content-traveling'), shopContentDigital: document.getElementById('shop-content-digital'), shopContentBrewing: document.getElementById('shop-content-brewing'),
        
        totemItems: document.getElementById('totem-items'), totemTimerDisplay: document.getElementById('totem-timer-display'),
        travelingItems: document.getElementById('traveling-items'), digitalItems: document.getElementById('digital-items'), brewingSection: document.getElementById('brewing-section'),
        
        yellowDustOverlay: document.getElementById('yellow-dust-overlay'), heatWaveOverlay: document.getElementById('heat-wave-overlay'), snowOverlay: document.getElementById('snow-overlay'),
        updateBanner: document.getElementById('update-banner'), countdownTimer: document.getElementById('countdown-timer'),
        
        enchantmentContainer: document.getElementById('enchantment-container'),
        enchantTableTierText: document.getElementById('enchant-table-tier-text'),
        enchantCostText: document.getElementById('enchant-cost-text'),
        doEnchantButton: document.getElementById('do-enchant-button'),
        upgradeTableButton: document.getElementById('upgrade-table-button'),
        enchantActionPanel: document.getElementById('enchant-action-panel'),
        activeEnchantsList: document.getElementById('active-enchants-list'),
        enchantModifiers: document.getElementById('enchant-modifiers'),
        
        devPanel: document.getElementById('dev-panel'), closeDevPanel: document.getElementById('close-dev-panel'), devWeatherSelect: document.getElementById('dev-weather-select'),
        weatherTimer: document.getElementById('weather-timer'),
        probMagicStone: document.getElementById('prob-magic-stone'),
        probDataCrystal: document.getElementById('prob-data-crystal'),

        // Toggle Buttons
        toggleAssets: document.getElementById('toggle-assets'), contentAssets: document.getElementById('content-assets'),
        toggleTrade: document.getElementById('toggle-trade'), contentTrade: document.getElementById('content-trade'),
        toggleHistory: document.getElementById('toggle-history'), contentHistory: document.getElementById('content-history'),
        toggleShop: document.getElementById('toggle-shop'), contentShop: document.getElementById('content-shop'),
        toggleEnchant: document.getElementById('toggle-enchant'), contentEnchant: document.getElementById('content-enchant'),
        toggleComputer: document.getElementById('toggle-computer'), contentComputer: document.getElementById('content-computer'),
        toggleAlmanac: document.getElementById('toggle-almanac'), contentAlmanac: document.getElementById('content-almanac'),
        toggleMagicAlmanac: document.getElementById('toggle-magic-almanac'), contentMagicAlmanac: document.getElementById('content-magic-almanac'),
        toggleTrophy: document.getElementById('toggle-trophy'), contentTrophy: document.getElementById('content-trophy'),
        toggleCode: document.getElementById('toggle-code'), contentCode: document.getElementById('content-code'),
        toggleSettings: document.getElementById('toggle-settings'), contentSettings: document.getElementById('content-settings'),
    };
    
    // Toggle Event Listeners
    const toggles = [
        ['toggleAssets', 'contentAssets'], ['toggleTrade', 'contentTrade'], ['toggleHistory', 'contentHistory'],
        ['toggleShop', 'contentShop'], ['toggleEnchant', 'contentEnchant'], ['toggleComputer', 'contentComputer'],
        ['toggleAlmanac', 'contentAlmanac'], ['toggleMagicAlmanac', 'contentMagicAlmanac'], ['toggleTrophy', 'contentTrophy'],
        ['toggleCode', 'contentCode'], ['toggleSettings', 'contentSettings']
    ];
    toggles.forEach(([btnId, contentId]) => {
        const btn = dom[btnId]; const content = dom[contentId];
        if (btn && content) {
            btn.addEventListener('click', () => {
                content.classList.toggle('hidden');
                const icon = btn.querySelector('svg');
                if (icon) icon.classList.toggle('rotate-180');
            });
        }
    });

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
    
    ['function', 'totems', 'traveling', 'digital', 'brewing'].forEach(t => {
        const tab = dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`];
        if(tab) tab.addEventListener('click', () => switchShopTab(t));
    });

    const showToggle = document.getElementById('setting-show-notifications') as HTMLInputElement;
    const saveDurationBtn = document.getElementById('setting-save-duration-btn');
    const durationInput = document.getElementById('setting-notification-duration') as HTMLInputElement;
    if(showToggle) showToggle.addEventListener('change', () => { gameState.settings.showNotifications = showToggle.checked; saveGameState(); showNotification(`알림이 ${showToggle.checked ? '활성화' : '비활성화'}되었습니다.`, false); });
    if(saveDurationBtn && durationInput) saveDurationBtn.addEventListener('click', () => { const duration = parseInt(durationInput.value, 10); if (!isNaN(duration) && duration >= 1 && duration <= 30) { gameState.settings.notificationDuration = duration * 1000; saveGameState(); showNotification(`알림 표시 시간이 ${duration}초로 설정되었습니다.`, false); } else { showNotification('1초에서 30초 사이의 값을 입력해주세요.', true); } });

    initDevPanel();
    populateTradeUI();
    populateShopUI();
    populateSettingsUI();
    init3D();
}

function restartGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
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
    if (!gameState.settings.showNotifications && !message.includes('알림이')) return;
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
    // Map resources
    const resourceMap = { ...RESOURCE_NAME_MAP };
    for(const key in resourceMap) { 
        if(dom[key]) dom[key].textContent = Math.floor(Number((state as any)[key] || 0)).toLocaleString('ko-KR'); 
    }

    // Asset Visibility
    if (dom.assetAuroraContainer) dom.assetAuroraContainer.classList.toggle('hidden', state.userAurora <= 0);
    if (dom.tickerAurora) dom.tickerAurora.classList.toggle('hidden', state.weather !== '오로라');

    // Extra Assets (Inventory)
    if (dom.extraAssets) {
        dom.extraAssets.innerHTML = '';
        let hasExtra = false;
        for (const key in SPECIAL_ITEMS_MAP) {
            const count = state[key];
            if (count > 0) {
                hasExtra = true;
                const div = document.createElement('div');
                div.className = 'bg-gray-600 p-3 rounded-lg col-span-2 md:col-span-1';
                div.innerHTML = `<h3 class="text-xs font-semibold text-gray-300">${SPECIAL_ITEMS_MAP[key]}</h3><div class="text-lg font-bold text-gray-200">${count}</div>`;
                dom.extraAssets.appendChild(div);
            }
        }
    }

    const updatePriceDisplay = (priceEl: HTMLElement, changeEl: HTMLElement, current: number, last: number) => { if (!priceEl || !changeEl) return; priceEl.textContent = `${current.toLocaleString('ko-KR')} KRW`; const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : '0.00'; if (change > 0) changeEl.innerHTML = `<span class="text-green-500">▲ +${pct}%</span>`; else if (change < 0) changeEl.innerHTML = `<span class="text-red-500">▼ ${pct}%</span>`; else changeEl.innerHTML = `0.00%`; };
    
    updatePriceDisplay(dom.currentCubePrice, dom.cubePriceChange, Number(state.currentPrice), Number(state.lastPrice));
    updatePriceDisplay(dom.currentLunarPrice, dom.lunarPriceChange, Number(state.currentLunarPrice), Number(state.lastLunarPrice));
    updatePriceDisplay(dom.currentEnergyPrice, dom.energyPriceChange, Number(state.currentEnergyPrice), Number(state.lastEnergyPrice));
    updatePriceDisplay(dom.currentPrismPrice, dom.prismPriceChange, Number(state.currentPrismPrice), Number(state.lastPrismPrice));
    updatePriceDisplay(dom.currentDigitalPrice, dom.digitalPriceChange, Number(state.currentDigitalPrice), Number(state.lastDigitalPrice));
    updatePriceDisplay(dom.currentAuroraPrice, dom.auroraPriceChange, Number(state.currentAuroraPrice), Number(state.lastAuroraPrice));

    if (dom.weatherDisplay) dom.weatherDisplay.textContent = `${state.weather} ${WEATHER_DATA[state.weather]?.icon || ''}`;
    if (dom.seasonDisplay) dom.seasonDisplay.textContent = `${state.season} ${SEASON_EMOJI_MAP[state.season as keyof typeof SEASON_EMOJI_MAP]} ${state.dayInSeason}일차`;

    let baseProduction = 0;
    if (state.isCubePurchased) { 
        baseProduction = 100; 
        if (state.isAuroraUpgraded) baseProduction = 1000;
        else if (state.digitalMiningLevel > 0) baseProduction = 700;
        else if (state.isPrismUpgraded) baseProduction = 400; 
        else if (state.isEnergyUpgraded) baseProduction = 200; 
    }
    
    let totalIncome = baseProduction;
    
    const efficiency = state.activeEnchants.find((e: any) => e.id === 'efficiency');
    if (efficiency) totalIncome *= (1 + (efficiency.level * 0.1));

    if (state.investmentBonus && state.investmentBonus.isActive && Date.now() < state.investmentBonus.expiresAt) totalIncome *= 2;
    if (state.totemWeatherActive && state.totemWeatherActive.isActive && Date.now() < state.totemWeatherActive.expiresAt) totalIncome *= 2;

    const pickpocket = state.activeEnchants.find((e: any) => e.id === 'pickpocket');
    const resentment = state.activeEnchants.find((e: any) => e.id === 'curseResentment');
    
    // Curse checks...
    if (pickpocket || (resentment && resentment.resentCurseId === 'pickpocket')) {
        const isScreenBlock = ['황사', '폭염', '눈'].includes(state.weather);
        totalIncome *= isScreenBlock ? 0.5 : 2;
    }
    const zeus = state.activeEnchants.find((e: any) => e.id === 'zeus');
    if ((zeus || (resentment && resentment.resentCurseId === 'zeus')) && state.weather === '천둥') totalIncome *= 2;
    
    const poseidon = state.activeEnchants.find((e: any) => e.id === 'cursePoseidon');
    if ((poseidon || (resentment && resentment.resentCurseId === 'cursePoseidon')) && ['비', '폭우', '천둥'].includes(state.weather)) totalIncome *= 0.5;

    let weatherMultiplier = 1;
    const defense = state.activeEnchants.find((e: any) => e.id === 'defense');
    const defenseReduction = defense ? (defense.level * 0.1) : 0;
    if (state.weather === '폭염') weatherMultiplier = 0.5 + (0.5 * defenseReduction);
    totalIncome *= weatherMultiplier;
    
    const blessingSeasons = state.activeEnchants.find((e: any) => e.id === 'blessingSeasons');
    if (blessingSeasons) totalIncome *= (1 + ((state.totalSeasonsPassed || 0) * 0.05));

    // Brewing Potions
    if (state.activePotions) {
        state.activePotions.forEach((potion: any) => {
            if (Date.now() < potion.expiresAt) {
                totalIncome *= (1 + (potion.tier * 0.2));
            }
        });
        // Cleanup expired
        state.activePotions = state.activePotions.filter((p: any) => Date.now() < p.expiresAt);
    }

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
    const isMaxTier = tier >= 10; 
    
    const safeTier = Math.max(0, Math.min(tier, COMPUTER_DATA.length - 1));
    const currentData = COMPUTER_DATA[safeTier] || COMPUTER_DATA[0];

    dom.computerTierText.textContent = tier > 0 ? `Tier ${tier} 컴퓨터` : '컴퓨터 없음';
    
    if (tier > 0) {
        let effectText = '';
        const effects = currentData.effect;
        Object.keys(effects).forEach(k => {
             effectText += `${k}: ${(effects[k] * 100).toFixed(1)}% `;
        });
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

// --- Shops ---

function populateShopUI() {
    populateFunctionItems();
    populateTotemItems();
    refreshTravelingMerchant(false); // Render only
    refreshDigitalShop(false); // Render only
}

function switchShopTab(tabName: string) {
    const tabs = ['function', 'totems', 'traveling', 'digital', 'brewing'];
    tabs.forEach(t => {
        const content = dom[`shopContent${t.charAt(0).toUpperCase() + t.slice(1)}`];
        const tab = dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`];
        
        // Specific unlock checks
        if (t === 'digital' && !gameState.isDigitalShopUnlocked && tab) { tab.classList.add('hidden'); return; }
        if (t === 'brewing' && !gameState.isBrewingUnlocked && tab) { tab.classList.add('hidden'); return; }
        if (t === 'traveling') {
            const hour = gameTime.getHours();
            const isTime = hour >= 1 && hour < 4;
            if (!isTime && tab) { tab.classList.add('hidden'); return; }
            if (tab) tab.classList.remove('hidden');
        }
        if (t === 'digital' && tab) tab.classList.remove('hidden');
        if (t === 'brewing' && tab) tab.classList.remove('hidden');

        if (content) content.classList.toggle('hidden', t !== tabName);
        if (tab) tab.classList.toggle('tab-active', t !== tabName);
    });
    
    // Render Brewing Tab content
    if (tabName === 'brewing') populateBrewingUI();
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
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `<div><h4 class="font-bold text-base">${item.name}</h4><p class="text-xs text-gray-400 my-1">${item.desc}</p></div><button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${isOwned ? 'bg-green-700 cursor-default' : 'bg-blue-600 hover:bg-blue-700'}" ${isOwned ? 'disabled' : ''}>${isOwned ? '보유중' : `${item.cost.toLocaleString()} KRW`}</button>`;
        if (!isOwned) itemEl.querySelector('button')?.addEventListener('click', () => handleShopBuy(item.id, item.cost));
        dom.shopItems.appendChild(itemEl);
    });
}

function refreshTotemStock() {
    const stock: {[key: string]: number} = {};
    Object.keys(TOTEM_DATA).forEach(key => {
        const totem = TOTEM_DATA[key];
        const chance = (500000 / totem.cost) * 0.01;
        if (Math.random() < chance) {
            let quantity = Math.floor(Math.random() * 3) + 1;
            if (totem.tier === 5) quantity = 1; 
            stock[key] = quantity;
        }
    });
    gameState.totemStock = stock;
    gameState.lastTotemRefresh = Date.now();
    saveGameState();
    populateTotemItems();
}

function populateTotemItems() {
    if (!dom.totemItems) return; dom.totemItems.innerHTML = '';
    if (!gameState.totemStock || Object.keys(gameState.totemStock).length === 0) refreshTotemStock();

    Object.keys(TOTEM_DATA).forEach(key => {
        const stock = gameState.totemStock[key] || 0;
        if (stock <= 0) return; // Only show in-stock

        const totem = TOTEM_DATA[key];
        const hasExperienced = totem.type === 'weather' ? gameState.experiencedWeathers[totem.effect] : true;
        const magicStoneCost = Math.floor(totem.cost / 10000);
        let buttonText = `${totem.cost.toLocaleString()} KRW + ${magicStoneCost} MS`;
        let isDisabled = false;
        let totemName = totem.name;

        if (totem.type === 'weather' && !hasExperienced) {
            totemName = '???'; buttonText = '경험 필요'; isDisabled = true;
        }

        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `<div><h4 class="font-bold text-base flex justify-between">${totemName} <span class="text-xs font-normal bg-gray-700 px-1 rounded">재고: ${stock}</span></h4><p class="text-xs text-gray-400 my-1">${totem.desc}</p></div><button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${isDisabled ? 'btn-disabled' : 'bg-purple-600 hover:bg-purple-700'}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>`;
        if(!isDisabled) itemEl.querySelector('button')?.addEventListener('click', () => handleTotemBuy(key));
        dom.totemItems.appendChild(itemEl);
    });
}

function refreshTravelingMerchant(force = false) {
    const hour = gameTime.getHours();
    const isTime = hour >= 1 && hour < 4;
    
    if (!isTime) {
        gameState.travelingMerchantStock = {};
        if(dom.shopTabTraveling) dom.shopTabTraveling.classList.add('hidden');
        return;
    }
    
    if(dom.shopTabTraveling) dom.shopTabTraveling.classList.remove('hidden');

    // Generate stock if empty during open hours
    if (force || Object.keys(gameState.travelingMerchantStock).length === 0) {
         const stock: any = {};
         Object.keys(TRAVELING_ITEMS).forEach(key => {
             const item = TRAVELING_ITEMS[key as keyof typeof TRAVELING_ITEMS];
             const qty = Math.floor(Math.random() * (item.stockRange[1] - item.stockRange[0] + 1)) + item.stockRange[0];
             stock[key] = qty;
         });
         gameState.travelingMerchantStock = stock;
         saveGameState();
    }
    
    if(!dom.travelingItems) return;
    dom.travelingItems.innerHTML = '';
    
    Object.keys(TRAVELING_ITEMS).forEach(key => {
        const stock = gameState.travelingMerchantStock[key] || 0;
        if (stock <= 0) return;
        
        const item = TRAVELING_ITEMS[key as keyof typeof TRAVELING_ITEMS];
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between border border-purple-500/30';
        itemEl.innerHTML = `<div><h4 class="font-bold text-base text-purple-200 flex justify-between">${item.name} <span class="text-xs text-white bg-purple-900 px-1 rounded">재고: ${stock}</span></h4><p class="text-xs text-gray-400 my-1">${item.desc}</p></div><button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg bg-purple-800 hover:bg-purple-700">${item.cost} MS</button>`;
        
        itemEl.querySelector('button')?.addEventListener('click', () => handleBuyMerchantItem(key, 'traveling'));
        dom.travelingItems.appendChild(itemEl);
    });
}

function refreshDigitalShop(force = false) {
    if (!gameState.isDigitalShopUnlocked) {
        if(dom.shopTabDigital) dom.shopTabDigital.classList.add('hidden');
        return;
    }
    if(dom.shopTabDigital) dom.shopTabDigital.classList.remove('hidden');

    const now = Date.now();
    if (force || (now - gameState.lastDigitalRestock > 8 * 60 * 1000) || Object.keys(gameState.digitalShopStock).length === 0) {
        const stock: any = {};
         Object.keys(DIGITAL_ITEMS).forEach(key => {
             const item = DIGITAL_ITEMS[key as keyof typeof DIGITAL_ITEMS];
             const qty = Math.floor(Math.random() * (item.stockRange[1] - item.stockRange[0] + 1)) + item.stockRange[0];
             if(qty > 0) stock[key] = qty;
         });
         gameState.digitalShopStock = stock;
         gameState.lastDigitalRestock = now;
         saveGameState();
    }

    if(!dom.digitalItems) return;
    dom.digitalItems.innerHTML = '';

    Object.keys(DIGITAL_ITEMS).forEach(key => {
        const stock = gameState.digitalShopStock[key] || 0;
        if (stock <= 0) return;
        
        const item = DIGITAL_ITEMS[key as keyof typeof DIGITAL_ITEMS];
        let costText = `${item.cost} DF`;
        // FIX: Cast item to any to safely access subCost which may not exist on all items
        if ((item as any).subCost) costText += ` + ${(item as any).subCost} MS`;
        
        let nameClass = 'text-cyan-200';
        if (key === 'shimmeringCrystal') nameClass = 'text-orange-400 animate-pulse';
        if (key === 'errorTotem') nameClass = 'text-red-500 font-mono';

        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between border border-cyan-500/30';
        itemEl.innerHTML = `<div><h4 class="font-bold text-base ${nameClass} flex justify-between">${item.name} <span class="text-xs text-white bg-cyan-900 px-1 rounded">재고: ${stock}</span></h4><p class="text-xs text-gray-400 my-1">${item.desc}</p></div><button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg bg-cyan-800 hover:bg-cyan-700">${costText}</button>`;
        
        itemEl.querySelector('button')?.addEventListener('click', () => handleBuyMerchantItem(key, 'digital'));
        dom.digitalItems.appendChild(itemEl);
    });
}

function handleBuyMerchantItem(key: string, shopType: 'traveling' | 'digital') {
    let itemData, stockRef: any, currencyKey, subCurrencyKey, cost, subCost;
    
    if (shopType === 'traveling') {
        itemData = TRAVELING_ITEMS[key as keyof typeof TRAVELING_ITEMS];
        stockRef = gameState.travelingMerchantStock;
        currencyKey = 'userMagicStone';
    } else {
        itemData = DIGITAL_ITEMS[key as keyof typeof DIGITAL_ITEMS];
        stockRef = gameState.digitalShopStock;
        currencyKey = 'userDataCrystal';
    }
    
    if (!itemData || !stockRef[key]) return;
    cost = itemData.cost;
    // FIX: Safely access subCost and subCurrency as they might not exist on all item types
    subCost = (itemData as any).subCost || 0;
    subCurrencyKey = (itemData as any).subCurrency;

    if (gameState[currencyKey] < cost) { showNotification('자원이 부족합니다.', true); return; }
    if (subCost > 0 && subCurrencyKey && gameState[subCurrencyKey] < subCost) { showNotification('보조 자원이 부족합니다.', true); return; }

    gameState[currencyKey] -= cost;
    if(subCost > 0 && subCurrencyKey) gameState[subCurrencyKey] -= subCost;
    
    stockRef[key]--;
    
    // Grant Item
    if (key === 'crystallizedKey') {
        gameState.isDigitalShopUnlocked = true;
        showNotification('디지털 상점이 잠금 해제되었습니다!', false);
        switchShopTab('digital');
    } else if (key === 'brewingStand') {
        gameState.isBrewingUnlocked = true;
        showNotification('양조 기능이 잠금 해제되었습니다!', false);
        switchShopTab('brewing');
    } else if (key === 'totemBundle') {
         const keys = Object.keys(TOTEM_DATA);
         let got = [];
         for(let i=0; i<3; i++) {
             const rKey = keys[Math.floor(Math.random() * keys.length)];
             gameState.totemStock[rKey] = (gameState.totemStock[rKey] || 0) + 1;
             got.push(TOTEM_DATA[rKey].name);
         }
         showNotification(`토템 획득: ${got.join(', ')}`, false);
    } else if (key === 'seasonTotem') {
        gameState.userSeasonTotem = (gameState.userSeasonTotem || 0) + 1;
        // Immediate use logic could be here, but let's treat as inventory for consistency or immediate consume?
        // Prompt implies inventory item "Season Totem". But typical totems are consumed from stock.
        // Let's keep it simple: It's an inventory item, but we need a way to use it.
        // For now, let's auto-consume or add to totem stock? 
        // "Season Totem" is rare. Let's treat strictly as an inventory item that shows in "Extra Assets" and can be used via a button there?
        // Or simpler: Just add a special button in Totems tab if owned? 
        // Given complexity, let's make it CONSUME IMMEDIATELY upon buying for now, OR add to inventory.
        // Re-reading: "Appears with 6 items... Season Totem... Skips to next season".
        // Let's treat as inventory.
    } else {
        // Generic Item add
        const invKey = 'user' + key.charAt(0).toUpperCase() + key.slice(1);
        gameState[invKey] = (gameState[invKey] || 0) + 1;
    }

    showNotification(`${itemData.name} 구매 완료!`, false);
    
    if (shopType === 'traveling') refreshTravelingMerchant(false);
    else refreshDigitalShop(false);
    saveGameState();
}

// --- Brewing ---
function populateBrewingUI() {
    if(!dom.brewingSection) return;
    dom.brewingSection.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg text-center">
            <h3 class="text-xl font-bold text-yellow-500 mb-4">🧪 경험의 포션 양조</h3>
            <p class="text-gray-300 mb-4">마법석 5개를 사용하여 포션을 제작합니다.</p>
            <button id="brew-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                양조하기 (5 MS)
            </button>
            <div id="active-potions" class="mt-6 text-left space-y-2"></div>
        </div>
    `;
    
    document.getElementById('brew-btn')?.addEventListener('click', handleBrew);
    updateActivePotionsUI();
}

function handleBrew() {
    if (gameState.userMagicStone < 5) { showNotification('마법석이 부족합니다.', true); return; }
    gameState.userMagicStone -= 5;

    const rand = Math.random();
    let tier = 1;
    if (rand < 0.001) tier = 8;
    else if (rand < 0.02) tier = 7;
    else if (rand < 0.11) tier = 6;
    else if (rand < 0.15) tier = 5;
    else if (rand < 0.30) tier = 4;
    else if (rand < 0.45) tier = 3;
    else if (rand < 0.75) tier = 2;
    else tier = 1;

    const duration = tier * 2 * 60 * 1000; // mins to ms
    const effect = tier * 0.2;
    
    gameState.activePotions.push({ tier: tier, expiresAt: Date.now() + duration });
    showNotification(`경험의 포션 (Tier ${tier}) 제작 성공! ${duration/60000}분간 수익 +${(effect*100).toFixed(0)}%`, false);
    updateActivePotionsUI();
    saveGameState();
}

function updateActivePotionsUI() {
    const container = document.getElementById('active-potions');
    if (!container) return;
    container.innerHTML = '<h4 class="font-bold text-gray-400 text-sm mb-2">활성화된 효과</h4>';
    if (!gameState.activePotions || gameState.activePotions.length === 0) {
        container.innerHTML += '<p class="text-xs text-gray-500">없음</p>';
        return;
    }
    gameState.activePotions.forEach((p: any) => {
        const left = Math.max(0, Math.ceil((p.expiresAt - Date.now()) / 1000));
        container.innerHTML += `<div class="bg-yellow-900/30 p-2 rounded text-xs text-yellow-200">Tier ${p.tier} 포션: ${(p.tier*20)}% 수익 증가 (${left}s)</div>`;
    });
}

// --- Enchants ---
function updateEnchantUI() {
    if (!dom.enchantmentContainer) return;
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
        
        if (tier < 8 && dom.upgradeTableButton) { 
             const nextCost = TABLE_UPGRADE_COSTS[tier];
             dom.upgradeTableButton.textContent = `다음 티어 강화 (${nextCost.cash.toLocaleString()} KRW + ${nextCost.stones} MS)`;
             dom.upgradeTableButton.classList.remove('hidden');
        } else {
            dom.upgradeTableButton.classList.add('hidden');
        }

        if(dom.enchantActionPanel) dom.enchantActionPanel.classList.remove('hidden');
        dom.enchantCostText.textContent = `${tableData.stoneCost} 마법석`;
        
        // Modifiers UI
        if (dom.enchantModifiers) {
            dom.enchantModifiers.innerHTML = `
                <label class="block text-xs text-gray-400 mb-1"><input type="checkbox" id="use-suspicious" ${gameState.userSuspiciousStone > 0 ? '' : 'disabled'}> 수상한 마법석 (${gameState.userSuspiciousStone})</label>
                <label class="block text-xs text-gray-400 mb-1"><input type="checkbox" id="use-datafied" ${gameState.userDataFiedStone > 0 ? '' : 'disabled'}> 데이터화 마법석 (${gameState.userDataFiedStone})</label>
                <label class="block text-xs text-gray-400 mb-1"><input type="checkbox" id="use-lucky" ${gameState.userLuckyStone > 0 ? '' : 'disabled'}> 행운의 마법석 (${gameState.userLuckyStone})</label>
            `;
        }
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
            let levelText = (enc.type !== 'curse' && enc.type !== 'rare') ? ` ${enc.level}` : '';
            div.className = 'bg-gray-800 border border-gray-600 p-2 rounded flex justify-between items-center';
            div.innerHTML = `<span class="${colorClass} font-bold">${enc.name}${levelText}${enc.resentCurseId ? ` (${enc.resentCurseId})` : ''}</span>`;
            dom.activeEnchantsList.appendChild(div);
        });
    }
}

function handleEnchant() {
    const tier = gameState.enchantTableTier;
    if (tier === 0) return;
    const tableData = TABLE_DATA[tier];
    
    // Modifier Checks
    const useSuspicious = (document.getElementById('use-suspicious') as HTMLInputElement)?.checked;
    const useDatafied = (document.getElementById('use-datafied') as HTMLInputElement)?.checked;
    const useLucky = (document.getElementById('use-lucky') as HTMLInputElement)?.checked;

    // Check Modifiers Stock
    if (useSuspicious && gameState.userSuspiciousStone < 1) return showNotification('수상한 마법석이 없습니다.', true);
    if (useDatafied && gameState.userDataFiedStone < 1) return showNotification('데이터화 마법석이 없습니다.', true);
    if (useLucky && gameState.userLuckyStone < 1) return showNotification('행운의 마법석이 없습니다.', true);

    // Cost Logic (Datafied changes base cost to Data Crystals)
    let costCurrency = 'userMagicStone';
    let costAmount = tableData.stoneCost;
    
    if (useDatafied) {
        costCurrency = 'userDataCrystal';
        costAmount = 10; // 10 DF + 1 MS (handled in item buy, wait... this is enchant cost)
        // Prompt says: "Data-fied Stone (Item) allows using Digital Enchant Table". 
        // It doesn't explicitly change the *table cost* to crystals, but usually such items consume the item itself + table cost.
        // Let's assume normal table cost applies unless specified.
        // Wait, item desc: "Use 1 per enchant, changes table to Digital Table for 1 use".
    }

    if (gameState[costCurrency] < costAmount) return showNotification('마법 부여 비용이 부족합니다.', true);

    // Consume
    gameState[costCurrency] -= costAmount;
    if (useSuspicious) gameState.userSuspiciousStone--;
    if (useDatafied) gameState.userDataFiedStone--;
    if (useLucky) gameState.userLuckyStone--;
    
    // Deactivated Crystal Chance
    if (gameState.userDeactivatedCrystal > 0 && Math.random() < 0.2) {
        gameState.userDeactivatedCrystal--;
        gameState.userActivatedDataCrystal = (gameState.userActivatedDataCrystal || 0) + 1;
        showNotification('✨ 비활성화 데이터 결정이 활성화되었습니다!', false);
    }

    // Enchant Generation Logic
    const minEnchants = tableData.minEnchants || Math.max(1, tableData.maxEnchants - 2);
    const range = tableData.maxEnchants - minEnchants + 1;
    const numEnchants = useDatafied ? 10 : Math.floor(Math.random() * range) + minEnchants;

    // Pools (Reuse existing pool logic, apply multipliers)
    let efficiencyRange = [1, 3]; let luckRange = [1, 2]; let defenseRange = [1, 3]; let durabilityRange = [1, 2]; let thornsRange = [1, 2];
    if (tier >= 6) { efficiencyRange = [5, 8]; luckRange = [3, 6]; defenseRange = [5, 8]; durabilityRange = [4, 6]; thornsRange = [4, 6]; }
    else if (tier >= 4) { efficiencyRange = [3, 7]; luckRange = [2, 5]; defenseRange = [3, 7]; durabilityRange = [2, 5]; thornsRange = [2, 5]; }
    if (tier >= 7) { efficiencyRange = [6, 9]; luckRange = [4, 7]; defenseRange = [6, 9]; durabilityRange = [5, 7]; thornsRange = [5, 7]; }
    if (tier >= 8) { efficiencyRange = [7, 10]; luckRange = [5, 8]; defenseRange = [7, 10]; durabilityRange = [5, 8]; thornsRange = [5, 8]; }

    const pool = [ { id: 'efficiency', name: '효율', range: efficiencyRange }, { id: 'luck', name: '행운', range: luckRange }, { id: 'defense', name: '방어', range: defenseRange }, { id: 'durability', name: '내구성', range: durabilityRange }, { id: 'thorns', name: '가시', range: thornsRange } ];
    const rarePool = [ { id: 'weatherGod', name: '날씨의 신', type: 'rare' }, { id: 'binary', name: '이진법', type: 'rare' }, { id: 'magicHand', name: '마법의 손', type: 'rare' } ];
    const rarePoolT4 = [ { id: 'investmentGod', name: '투자의 신', type: 'rare' }, { id: 'coinRain', name: '코인비', type: 'rare' } ];
    const rarePoolT6 = [ { id: 'fateTrick', name: '운명의 장난', type: 'rare' } ];
    const rarePoolT8 = [ { id: 'blessingWeather', name: '날씨의 축복', type: 'rare' }, { id: 'blessingSeasons', name: '계절의 축복', type: 'rare' } ];
    const cursePool = [ { id: 'zeus', name: '제우스의 저주', type: 'curse' }, { id: 'pickpocket', name: '소매치기의 저주', type: 'curse' } ];
    const cursePoolT6 = [ { id: 'curseWeather', name: '날씨의 저주', type: 'curse' }, { id: 'cursePoseidon', name: '포세이돈의 저주', type: 'curse' }, { id: 'curseChronos', name: '크로노스의 저주', type: 'curse' } ];
    const cursePoolT7 = [ { id: 'curseResentment', name: '원망의 저주', type: 'curse' } ];

    const generatedEnchants: any[] = [];
    const multiplier = useLucky ? 1.5 : 1;

    for(let i=0; i<numEnchants; i++) {
        let selected; let level = 1; let isRare = false; let isCurse = false;
        const typeRoll = Math.random();

        if (tier >= 8 && typeRoll < (0.03 * multiplier)) { 
             const combined = [...rarePool, ...rarePoolT4, ...rarePoolT6, ...rarePoolT8]; selected = combined[Math.floor(Math.random() * combined.length)]; isRare = true;
        } else if (tier >= 7 && typeRoll < (0.01 * multiplier)) {
             selected = cursePoolT7[0]; isCurse = true;
        } else if (tier >= 6 && typeRoll < (0.02 * multiplier)) {
            if (Math.random() < 0.5) { selected = [...cursePool, ...cursePoolT6][Math.floor(Math.random() * (cursePool.length + cursePoolT6.length))]; isCurse = true; }
            else { selected = [...rarePool, ...rarePoolT4, ...rarePoolT6][Math.floor(Math.random() * (rarePool.length + rarePoolT4.length + rarePoolT6.length))]; isRare = true; }
        } else if (tier >= 5 && typeRoll < (0.01 * multiplier)) { selected = cursePool[Math.floor(Math.random() * cursePool.length)]; isCurse = true; }
        else if (tier >= 4 && typeRoll < (0.02 * multiplier)) { selected = [...rarePool, ...rarePoolT4][Math.floor(Math.random() * (rarePool.length + rarePoolT4.length))]; isRare = true; }
        else if (tier >= 1 && typeRoll < (0.015 * multiplier)) { selected = rarePool[Math.floor(Math.random() * rarePool.length)]; isRare = true; }
        else { selected = pool[Math.floor(Math.random() * pool.length)]; }

        if (!isRare && !isCurse) {
             const range = (selected as any).range || [1, 1];
             level = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
             if(useSuspicious) level++;
        }

        if (!generatedEnchants.find(e => e.id === selected.id)) {
            const enchantObj: any = { id: selected.id, name: selected.name, level: level, type: (selected as any).type || 'normal' };
            if (selected.id === 'curseResentment') enchantObj.resentCurseId = ['zeus', 'pickpocket', 'curseWeather', 'cursePoseidon', 'curseChronos'][Math.floor(Math.random() * 5)];
            generatedEnchants.push(enchantObj);
        }
    }

    // If Data-fied, select top N (N = maxEnchants of current tier)
    if (useDatafied) {
        // Simple sorting: Rare/Curse > Level high
        generatedEnchants.sort((a, b) => {
            const typeScore = (t: string) => t === 'rare' ? 3 : t === 'curse' ? 2 : 1;
            if (typeScore(a.type) !== typeScore(b.type)) return typeScore(b.type) - typeScore(a.type);
            return b.level - a.level;
        });
        gameState.activeEnchants = generatedEnchants.slice(0, tableData.maxEnchants);
        showNotification(`데이터화 마법석: 최적의 ${tableData.maxEnchants}개 마법이 선택되었습니다.`, false);
    } else {
        gameState.activeEnchants = generatedEnchants;
    }
    
    updateEnchantUI();
    saveGameState();
}

function updateMagicAlmanacUI() {
    if (!dom.magicAlmanacSection || !dom.magicAlmanacContent) return;
    const hasBook = gameState.shopItems.magicBook;
    dom.magicAlmanacSection.classList.toggle('hidden', !hasBook);
    if(!hasBook) return;
    
    // Show active effects if bought
    if (dom.magicAlmanacActive) {
        dom.magicAlmanacActive.innerHTML = '<h5 class="font-bold text-green-300 mb-2">현재 적용 중</h5>';
        if(gameState.activeEnchants.length === 0) dom.magicAlmanacActive.innerHTML += '<p class="text-xs text-gray-500">없음</p>';
        else {
            gameState.activeEnchants.forEach((e: any) => {
                dom.magicAlmanacActive.innerHTML += `<div class="text-xs text-white">${e.name} Lv.${e.level}</div>`;
            });
        }
    }

    dom.magicAlmanacContent.innerHTML = '';
    const enchants = [
        { name: '효율 (Efficiency)', desc: '패시브 수입이 레벨당 10% 증가합니다.' },
        { name: '행운 (Luck)', desc: '5% 확률로 수입 틱이 2배가 됩니다.' },
        { name: '방어 (Defense)', desc: '나쁜 날씨의 페널티를 레벨당 10% 감소시킵니다.' },
        { name: '내구성 (Durability)', desc: '좋은 효과가 레벨당 10% 더 오래 지속됩니다.' },
        { name: '가시 (Thorns)', desc: '나쁜 날씨에 일정 확률로 페널티를 무시합니다.' },
        { name: '날씨의 신 (Rare)', desc: '토템으로 날씨 변경 시 30초간 수입이 2배가 됩니다.' },
        { name: '이진법 (Rare)', desc: '매 분마다 일정 확률로 데이터 결정을 채굴합니다.' },
        { name: '마법의 손 (Rare)', desc: '마법석 채굴 확률이 1.5배 증가합니다.' },
        { name: '투자의 신 (Rare)', desc: '매수 시 5초간 수입이 2배가 됩니다.' },
        { name: '코인비 (Rare)', desc: '비 날씨에 1% 확률로 랜덤 코인을 획득합니다.' },
        { name: '운명의 장난 (Rare)', desc: '마법석 채굴시 60%로 +2개 채굴하지만, 40%로 실패합니다.' },
        { name: '날씨의 축복 (Rare)', desc: '좋은 날씨 확률 2배, 나쁜 날씨 확률 0.5배.' },
        { name: '계절의 축복 (Rare)', desc: '지나간 계절당 수입이 5%씩 추가로 증가합니다.' },
        { name: '제우스의 저주 (Curse)', desc: '천둥 날씨에 인터넷이 끊길 확률이 증가하지만, 수입도 2배가 됩니다.' },
        { name: '소매치기의 저주 (Curse)', desc: '시야 차단 날씨(황사/폭염/눈)에 수입이 반토막납니다. 그 외에는 2배입니다.' },
        { name: '날씨의 저주 (Curse)', desc: '토템 날씨 지속시간 +10초, 하지만 토템 사용 실패율 20%.' },
        { name: '포세이돈의 저주 (Curse)', desc: '비/폭우/천둥 날씨에 수입이 50% 감소합니다.' },
        { name: '크로노스의 저주 (Curse)', desc: '게임 시간 1.5배 빠름, 날씨 변화 1.2배 느림.' },
        { name: '원망의 저주 (Curse)', desc: '매일 랜덤한 저주로 바뀝니다. 중복 시 파괴됩니다.' },
    ];

    enchants.forEach(enc => {
        const div = document.createElement('div');
        div.className = 'bg-gray-800/50 p-2 rounded';
        div.innerHTML = `<h5 class="font-bold text-purple-300">${enc.name}</h5><p class="text-xs text-gray-400">${enc.desc}</p>`;
        dom.magicAlmanacContent.appendChild(div);
    });
}

function gameLoop() {
    const state = gameState; if(state.isSleeping) return; 
    const previousMinutes = gameTime.getMinutes();
    
    let timeIncrement = 1;
    const curseChronos = state.activeEnchants.find((e: any) => e.id === 'curseChronos');
    const resentment = state.activeEnchants.find((e: any) => e.id === 'curseResentment');
    if (curseChronos || (resentment && resentment.resentCurseId === 'curseChronos')) timeIncrement = 1.5;
    if (state.accelerationActive.isActive && Date.now() < state.accelerationActive.expiresAt) timeIncrement *= 2;

    timeAccumulator += timeIncrement;
    if (timeAccumulator >= 1) {
        const minutesToAdd = Math.floor(timeAccumulator);
        gameTime.setMinutes(gameTime.getMinutes() + minutesToAdd);
        timeAccumulator -= minutesToAdd;
    }
    
    const currentMinutes = gameTime.getMinutes();
    const hour = gameTime.getHours();

    // Error Weather Check at 19:00 (Day -> Night)
    if (hour === 19 && currentMinutes === 0 && previousMinutes !== 0) {
        if (Math.random() < 0.002) { // 0.2%
            state.weather = '오류';
            showNotification('시스템 오류 발생! 코인 변동성이 이상합니다!', true);
            startPriceUpdateLoops();
        }
    }

    const oldIsNight = hour < 9 || hour >= 19;
    if (currentMinutes === 0) { 
        updateWeather();
        const newIsNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        if(oldIsNight !== newIsNight) startPriceUpdateLoops();
    }

    // Traveling Merchant Tick
    if (hour === 1 && currentMinutes === 0) refreshTravelingMerchant(true);
    if (hour === 4 && currentMinutes === 0) refreshTravelingMerchant(false);

    // Digital Shop Tick
    if (Date.now() - state.lastDigitalRestock > 8 * 60 * 1000) refreshDigitalShop(true);

    // Updates UI
    if (dom.weatherTimer) {
        const minutesLeft = 60 - currentMinutes;
        const secondsLeft = Math.ceil(minutesLeft * 0.25 / currentGameSpeed);
        dom.weatherTimer.textContent = `${secondsLeft}s`;
    }
    
    updateTotemTimers();

    // Computer Mining
    if (state.computerTier > 0) {
        const now = Date.now();
        if (now - (state.lastMiningTimestamp || 0) >= 60000) {
            state.lastMiningTimestamp = now;
            const tier = state.computerTier;
            const safeTier = Math.min(tier, COMPUTER_DATA.length-1);
            const effects = COMPUTER_DATA[safeTier].effect;
            
            let mined = [];
            if (Math.random() < effects.Cube) { state.userCubes++; mined.push('CUBE'); }
            if (Math.random() < effects.Lunar) { state.userLunar++; mined.push('LUNAR'); }
            if (Math.random() < effects.Energy) { state.userEnergy++; mined.push('ENERGY'); }
            if (Math.random() < effects.Prism) { state.userPrisms++; mined.push('PRISM'); }
            if (Math.random() < effects.Digital) { state.userDigital++; mined.push('DIGITAL'); }
            if (mined.length > 0) showNotification(`🖥️ 컴퓨터 채굴: ${mined.join(', ')}`, false);
        }
    }

    if (gameTime.getHours() === 0 && currentMinutes === 0) { 
        state.dayInSeason++; 
        // Resentment Logic
        if (resentment) {
             const cursePoolIds = ['zeus', 'pickpocket', 'curseWeather', 'cursePoseidon', 'curseChronos'];
             const randomCurseId = cursePoolIds[Math.floor(Math.random() * cursePoolIds.length)];
             const duplicate = state.activeEnchants.find((e: any) => e.id === randomCurseId);
             if (duplicate) {
                 state.activeEnchants = state.activeEnchants.filter((e: any) => e.id !== 'curseResentment');
                 showNotification('원망의 저주가 중복되어 소멸했습니다.', false);
             } else {
                 resentment.resentCurseId = randomCurseId;
                 showNotification(`원망의 저주가 변화했습니다: ${randomCurseId}`, false);
             }
             updateEnchantUI();
        }

        if (state.dayInSeason > 3) { 
            state.dayInSeason = 1; 
            state.totalSeasonsPassed = (state.totalSeasonsPassed || 0) + 1;
            state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length]; 
            state.totemPurchaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; 
            populateShopUI(); 
        } 
    }
    
    // ... (Mining & Income Logic) ...
    // LUNAR Mining
    let magicStoneChance = state.lunarMiningLevel >= 1 ? 0.10 : 0;
    if (magicStoneChance > 0) {
        if (state.isEnergyUpgraded) magicStoneChance *= 2;
        if (state.isPrismUpgraded) magicStoneChance *= 2; 
        if (oldIsNight) magicStoneChance *= 2;
        if (state.weather === '별똥별') magicStoneChance *= 4;
        if (state.weather === '오로라') magicStoneChance *= 8;
        const magicHand = state.activeEnchants.find((e: any) => e.id === 'magicHand');
        if (magicHand) magicStoneChance *= 1.5;
    }
    if (dom.probMagicStone) dom.probMagicStone.textContent = `${(magicStoneChance * 100).toFixed(1)}% (20min)`;

    if (state.lunarMiningLevel >= 1 && currentMinutes % 20 === 0 && currentMinutes !== previousMinutes) {
        const fateTrick = state.activeEnchants.find((e: any) => e.id === 'fateTrick');
        let success = true; let quantity = 1;
        if (fateTrick) { if (Math.random() < 0.4) success = false; else quantity += 2; }

        if (success && Math.random() < magicStoneChance) {
            // Level 3+ Triple Chance (Implicit in upgrade description? "3개씩 채굴 확률")
            // Level 2+ Double Chance
            if (state.lunarMiningLevel >= 3 && Math.random() < ((state.lunarMiningLevel-2) * 0.1)) quantity += 2;
            else if (state.lunarMiningLevel >= 2 && Math.random() < ((state.lunarMiningLevel-1) * 0.1)) quantity += 1;
            
            state.userMagicStone = (state.userMagicStone || 0) + quantity;
            showNotification(`마법석 ${quantity}개를 채굴했습니다!`, false);
        }
    }

    // DIGITAL Mining
    let dcChance = state.digitalMiningLevel >= 1 ? state.digitalMiningLevel * 0.10 : 0;
    if (dom.probDataCrystal) dom.probDataCrystal.textContent = `${(dcChance * 100).toFixed(0)}% (2s)`;
    state.dataCrystalTick = (state.dataCrystalTick || 0) + 1;
    if (state.digitalMiningLevel >= 1 && state.dataCrystalTick >= 8) {
        state.dataCrystalTick = 0;
        if (Math.random() < dcChance) {
             let qty = 1;
             // Digital Level 3+ Bonus
             if (state.digitalMiningLevel >= 3 && Math.random() < ((state.digitalMiningLevel-2)*0.1)) qty = 3;
             state.userDataCrystal = (state.userDataCrystal || 0) + qty;
        }
    }

    const binary = state.activeEnchants.find((e: any) => e.id === 'binary');
    if (binary && currentMinutes !== previousMinutes) {
        let chance = (binary.level * 0.1);
        const magicHand = state.activeEnchants.find((e: any) => e.id === 'magicHand');
        if (magicHand) chance *= 1.5;
        if (Math.random() < chance) state.userDataCrystal = (state.userDataCrystal || 0) + 1;
    }
    
    // ... (Income duplicated logic from updateUI for accumulation) ...
    // Simplified income accum to just trigger updateUI which handles display calc? 
    // No, updateUI is for display. We need to add cash.
    // Re-implementing income logic concisely:
    let totalIncome = 0;
    if(state.isCubePurchased) {
        totalIncome = 100;
        if(state.isAuroraUpgraded) totalIncome = 1000;
        else if(state.digitalMiningLevel > 0) totalIncome = 700;
        else if(state.isPrismUpgraded) totalIncome = 400;
        else if(state.isEnergyUpgraded) totalIncome = 200;
    }
    
    // Enchants
    // FIX: Define variables inside gameLoop scope
    const efficiency = state.activeEnchants.find((e: any) => e.id === 'efficiency');
    const zeus = state.activeEnchants.find((e: any) => e.id === 'zeus');
    const defense = state.activeEnchants.find((e: any) => e.id === 'defense');
    const poseidon = state.activeEnchants.find((e: any) => e.id === 'cursePoseidon');

    if(efficiency) totalIncome *= (1 + (efficiency.level * 0.1));
    // Potions
    if (state.activePotions) {
        state.activePotions.forEach((p: any) => { if(Date.now() < p.expiresAt) totalIncome *= (1 + (p.tier * 0.2)); });
    }
    // Weather/Curses (Simplified copy)
    if(zeus && state.weather === '천둥') totalIncome *= 2;
    if(state.weather === '폭염') totalIncome *= (0.5 + (0.5 * (defense ? defense.level * 0.1 : 0)));
    if(poseidon && ['비','폭우','천둥'].includes(state.weather)) totalIncome *= 0.5;
    
    if(state.investmentBonus.isActive && Date.now() < state.investmentBonus.expiresAt) totalIncome *= 2;
    if(state.totemWeatherActive.isActive && Date.now() < state.totemWeatherActive.expiresAt) totalIncome *= 2;
    
    state.userCash += totalIncome / 4; // 4 ticks per second
    updateUI();
}

function updateWeather() {
    if (globalWeatherOverride) return;
    if (gameState.weather === '오류') return; // Error weather persists until manual override or ??? (Assume typical cycle breaks it? Prompt says it replaces night, imply 1 night?)
    // Actually prompt says "Appears 0.2% when Day->Night". Doesn't say when it ends. Assume 1 hour like others or until day? 
    // Let's treat it like normal weather for rotation, it just has high weight to NOT stay if not forced.
    
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const season = gameState.season;

    // Drought Check
    if (gameState.weather === '가뭄') {
        // Persist until rain
        // We roll new weather, if it's not rain/heavyrain/thunder/acid, we keep drought
        const rainTypes = ['비', '폭우', '천둥', '산성비'];
        // Calculate normal next weather
        // If result is NOT in rainTypes, force '가뭄'
    }

    // ... (Standard weight logic) ...
    let weights: { [key: string]: number } = {};
    const addWeight = (w: string, val: number) => { weights[w] = (weights[w] || 0) + val; };
    addWeight('맑음', 20); addWeight('구름', 20); addWeight('비', 15); addWeight('바람', 10);
    addWeight('무지개', 1); addWeight('산성비', 2); addWeight('천둥', 2);

    if (season === '봄') { addWeight('비', 15); addWeight('황사', 5); weights['구름'] -= 5; } 
    else if (season === '여름') { 
        addWeight('맑음', 15); addWeight('폭염', 5); addWeight('천둥', 5); addWeight('폭우', 5); weights['비'] -= 5; 
    } 
    else if (season === '가을') { addWeight('구름', 15); addWeight('바람', 15); } 
    else if (season === '겨울') { delete weights['비']; addWeight('눈', 20); addWeight('우박', 2); }
    
    if (isNight) { addWeight('별똥별', 5); if (season === '겨울') { addWeight('오로라', 1); weights['별똥별'] -= 1;} }
    
    // Drought Logic Implementation: Replaces Summer Clouds (20%)
    if (season === '여름' && Math.random() < 0.2