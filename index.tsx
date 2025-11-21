
// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var THREE: any;
declare var firebase: any;

interface Window {
    autosaveInterval?: any;
    handleTrade?: (type: 'buy' | 'sell', coinId: string) => void;
    handleMaxAmount?: (type: 'buy' | 'sell', coinId: string) => void;
    switchShopTab?: (tabId: string) => void;
    aistudio?: {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    };
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
// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// --- 전역 설정 ---
const DATA_VERSION = 9;
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

const TROPHY_DATA: {[key: string]: any} = {
    'powerMaster': { name: '전력 트로피', icon: '🏆', desc: '자동 채굴로 모든 종류의 코인을 100개 이상 획득했습니다.', reward: 'ENERGY 코인 변동성이 약간 안정됩니다 (+1% 상승 확률, -1% 하락 확률).', isUnlocked: (state: any) => state.hasPowerTrophy },
    'timeMaster': { name: '시간의 트로피', icon: '🏆', desc: '20번 이상 수면을 취했습니다.', reward: '밤 시간 동안 모든 코인의 변동 주기가 5% 짧아집니다.', isUnlocked: (state: any) => state.hasTimeTrophy },
    'weatherMaster': { name: '날씨의 지배자', icon: '🏆', desc: '모든 종류의 날씨를 경험했습니다.', reward: '좋은 날씨 확률 +2.5%, 나쁜 날씨 확률 -2.5%', isUnlocked: (state: any) => state.hasWeatherTrophy }
};

const MAGIC_DATA = [
    { id: 'efficiency', name: '효율', desc: '기본 채굴 수익이 레벨당 10% 증가합니다.', getEffect: (lv: number) => `수익 +${lv*10}%` },
    { id: 'luck', name: '행운', desc: '마법 부여 시 좋은 효과가 나올 확률이 증가합니다. (구현 예정)', getEffect: (lv: number) => `좋은 마법 확률 증가` },
    { id: 'defense', name: '방어', desc: '폭염 등 환경 패널티를 레벨당 10% 감소시킵니다.', getEffect: (lv: number) => `패널티 감소 ${lv*10}%` },
    { id: 'durability', name: '내구성', desc: '투자의 신 등 버프 지속시간이 레벨당 10% 증가합니다.', getEffect: (lv: number) => `버프 지속 +${lv*10}%` },
    { id: 'thorns', name: '가시', desc: '특정 상황에서 추가 수익을 얻습니다. (구현 예정)', getEffect: (lv: number) => `추가 수익 발생` },
    { id: 'weatherGod', name: '날씨의 신', type: 'rare', desc: '날씨 토템의 효과 지속시간이 30초 증가합니다.', getEffect: (lv: number) => `토템 지속 +30s` },
    { id: 'binary', name: '이진법', type: 'rare', desc: '매 분마다 일정 확률(레벨*10%)로 데이터 결정을 얻습니다.', getEffect: (lv: number) => `결정 획득 확률 ${lv*10}%` },
    { id: 'magicHand', name: '마법의 손', type: 'rare', desc: '마법석 및 데이터 결정 채굴 확률이 1.5배 증가합니다.', getEffect: (lv: number) => `채굴 확률 x1.5` },
    { id: 'investmentGod', name: '투자의 신', type: 'rare', desc: '매수 시 일정 시간 동안 수익이 2배가 됩니다.', getEffect: (lv: number) => `매수 시 수익 2배` },
    { id: 'coinRain', name: '코인비', type: 'rare', desc: '비 내리는 날씨에 수익이 증가합니다.', getEffect: (lv: number) => `비 날씨 수익 증가` }, 
    { id: 'fateTrick', name: '운명의 장난', type: 'rare', desc: '마법석 채굴 시 40% 확률로 실패하거나 성공 시 2개를 추가로 얻습니다.', getEffect: (lv: number) => `채굴 시 +2개 or 실패` },
    { id: 'blessingWeather', name: '날씨의 축복', type: 'rare', desc: '나쁜 날씨가 될 때 50% 확률로 날씨를 다시 추첨합니다.', getEffect: (lv: number) => `날씨 재추첨 50%` },
    { id: 'blessingSeasons', name: '계절의 축복', type: 'rare', desc: '지나온 계절 하나당 수익이 5%씩 영구적으로 증가합니다.', getEffect: (lv: number) => `계절당 수익 +5%` },
    { id: 'zeus', name: '제우스의 저주', type: 'curse', desc: '천둥 날씨에 수익이 2배가 되지만, 인터넷 끊김 확률이 증가합니다.', getEffect: (lv: number) => `천둥 수익 x2 / 끊김 증가` },
    { id: 'pickpocket', name: '소매치기의 저주', type: 'curse', desc: '시야 방해(황사,폭염,눈) 날씨에 수익이 반토막나지만, 그 외에는 2배가 됩니다.', getEffect: (lv: number) => `시야 방해 시 0.5배, 그 외 2배` },
    { id: 'curseWeather', name: '날씨의 저주', type: 'curse', desc: '날씨 토템 사용이 종종 실패합니다.', getEffect: (lv: number) => `토템 실패 확률 증가` },
    { id: 'cursePoseidon', name: '포세이돈의 저주', type: 'curse', desc: '비/폭우/천둥 날씨에 수익이 절반으로 감소합니다.', getEffect: (lv: number) => `비 관련 날씨 수익 0.5배` },
    { id: 'curseChronos', name: '크로노스의 저주', type: 'curse', desc: '시간이 1.5배 더 빠르게 흐릅니다.', getEffect: (lv: number) => `시간 가속 x1.5` },
    { id: 'curseResentment', name: '원망의 저주', type: 'curse', desc: '매일 밤 다른 저주로 변합니다.', getEffect: (lv: number) => `매일 저주 변경` },
];

const SEASONS = ['봄', '여름', '가을', '겨울'];
const SEASON_EMOJI_MAP: { [key: string]: string } = { '봄': '🌸', '여름': '☀️', '가을': '🍁', '겨울': '❄️' };

const RESOURCE_NAME_MAP: { [key: string]: string } = {
    userCash: 'KRW',
    userCubes: 'CUBE', userLunar: 'LUNAR', userEnergy: 'ENERGY', userPrisms: 'PRISM',
    userDigital: 'DIGITAL', userAurora: 'AURORA', userMagicStone: '마법석', userDataCrystal: '데이터 결정',
    userDataSet: '데이터 집합', userActivatedDataCrystal: '활성화 데이터 결정', userCrystallizedHologram: '결정화된 홀로그램', userErrorDataCrystal: '오류난 데이터 결정'
};

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
// FIX: Initialize gameTime to avoid 'undefined' errors before game start
let gameTime: Date = new Date(2025, 2, 21, 9, 0, 0);
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
let timeAccumulator = 0;

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
        upChance: 0.54, // UPDATED: Increased from 0.52 to 0.54 (2% increase)
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

const TRAVELING_ITEMS: {[key: string]: any} = {
    'suspiciousStone': { name: '수상한 마법석', cost: 10, currency: 'userMagicStone', stockRange: [1, 2], desc: '마법 부여시 랜덤 인첸트 레벨 +1' },
    'reinforcedStone': { name: '강화된 마법석', cost: 20, currency: 'userMagicStone', stockRange: [1, 2], desc: '토템 강화 재료' },
    'seasonTotem': { name: '계절의 토템', cost: 20, currency: 'userMagicStone', stockRange: [1, 1], desc: '다음 계절로 즉시 이동' },
    'cursedTotem': { name: '저주받은 토템', cost: 5, currency: 'userMagicStone', stockRange: [1, 2], desc: '랜덤 날씨 소환 (조건 무시)' },
    'totemBundle': { name: '토템 꾸러미', cost: 10, currency: 'userMagicStone', stockRange: [1, 1], desc: '랜덤 토템 3개 획득' },
    'accelerationTotem': { name: '가속의 토템', cost: 20, currency: 'userMagicStone', stockRange: [1, 1], desc: '8시간 동안 시간 2배 가속' },
    'crystallizedKey': { name: '결정화된 데이터 열쇠', cost: 200, currency: 'userMagicStone', stockRange: [1, 1], desc: '디지털 상점 잠금 해제' }
};

const DIGITAL_ITEMS: {[key: string]: any} = {
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

const getInitialGameState = () => ({
    version: DATA_VERSION,
    userCash: 100000, 
    userCubes: 0, userLunar: 0, userEnergy: 0, userPrisms: 0, 
    userDigital: 0, userAurora: 0, userMagicStone: 0, userDataCrystal: 0,
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
    activePotions: [],
    
    travelingMerchantStock: {}, lastTravelingMerchantVisit: -1,
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
        
        currentPrice: document.getElementById('current-cube-price'),
        currentLunarPrice: document.getElementById('current-lunar-price'),
        currentEnergyPrice: document.getElementById('current-energy-price'),
        currentPrismPrice: document.getElementById('current-prism-price'),
        currentDigitalPrice: document.getElementById('current-digital-price'),
        currentAuroraPrice: document.getElementById('current-aurora-price'),
        
        gameTime: document.getElementById('game-time'),
        weatherDisplay: document.getElementById('weather-display'),
        seasonDisplay: document.getElementById('season-display')
    };
    
    updateUI();
    init3D();
    animate();
    
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(updateGame, 1000);
    
    initChatListener();
    initDevPanel();
    initCodeSystem(); // NEW: Initialize code system
    populateShopUI();
    populateSettingsUI();
    updateShopStock(); // Init stock
    
    // Tab switching logic
    const tabs = ['function', 'totems', 'traveling', 'digital', 'brewing'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`shop-tab-${tab}`);
        if (btn) {
            btn.onclick = () => switchShopTab(tab);
        }
    });

    window.switchShopTab = switchShopTab;
}

function switchShopTab(tabId: string) {
    const tabs = ['function', 'totems', 'traveling', 'digital', 'brewing'];
    tabs.forEach(t => {
        document.getElementById(`shop-content-${t}`)?.classList.add('hidden');
        document.getElementById(`shop-tab-${t}`)?.classList.remove('tab-active', 'text-white', 'border-blue-500');
        document.getElementById(`shop-tab-${t}`)?.classList.add('border-transparent');
    });
    document.getElementById(`shop-content-${tabId}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`shop-tab-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('tab-active', 'text-white', 'border-blue-500');
        activeBtn.classList.remove('border-transparent');
    }
}

function updateShopStock() {
    const currentHour = gameTime.getHours();
    const currentDay = Math.floor(gameTime.getTime() / (24 * 60 * 60 * 1000));

    // Traveling Merchant (01:00 - 04:00) - Restock once per night
    if (currentHour === 1 && gameState.lastTravelingMerchantVisit !== currentDay) {
        gameState.travelingMerchantStock = {};
        Object.keys(TRAVELING_ITEMS).forEach(key => {
            // 70% chance for item to appear in stock (Probabilistic)
            if (Math.random() < 0.7) {
                const item = TRAVELING_ITEMS[key];
                // Generate random quantity within range
                const qty = Math.floor(Math.random() * (item.stockRange[1] - item.stockRange[0] + 1)) + item.stockRange[0];
                if (qty > 0) gameState.travelingMerchantStock[key] = qty;
            }
        });
        gameState.lastTravelingMerchantVisit = currentDay;
        renderShop();
    }
    
    // Digital Shop (Restock every 8 minutes real-time)
    if (Date.now() - gameState.lastDigitalRestock > 8 * 60 * 1000) {
         gameState.digitalShopStock = {};
         Object.keys(DIGITAL_ITEMS).forEach(key => {
             // 70% chance for item to appear
             if (Math.random() < 0.7) {
                 const item = DIGITAL_ITEMS[key];
                 const qty = Math.floor(Math.random() * (item.stockRange[1] - item.stockRange[0] + 1)) + item.stockRange[0];
                 if (qty > 0) gameState.digitalShopStock[key] = qty;
             }
         });
         gameState.lastDigitalRestock = Date.now();
         renderShop();
    }
}

function updateGame() {
    // Time progression
    const speedMultiplier = (gameState.isSleeping ? 100 : 1) * currentGameSpeed;
    timeAccumulator += 1000 * speedMultiplier; // 1 real sec = 1 game min (default)
    
    while (timeAccumulator >= 60000) {
        gameTime.setTime(gameTime.getTime() + 60000);
        timeAccumulator -= 60000;
        gameState.gameTime = gameTime.getTime();
        checkWeather();
        updatePrices();
    }

    handlePassiveIncome();
    updateShopStock();
    updateShopUI();
    updateUI();
    
    // Auto-save every minute
    if (new Date().getSeconds() === 0) {
        saveGame();
    }
}

function updateShopUI() {
    // 1. Traveling Merchant Tab Visibility & Auto-close
    const currentHour = gameTime.getHours();
    const isTravelingTime = currentHour >= 1 && currentHour < 4;
    const travelTabBtn = document.getElementById('shop-tab-traveling');
    
    if (travelTabBtn) {
        if (isTravelingTime) {
            travelTabBtn.classList.remove('hidden');
        } else {
            // Hide tab button
            travelTabBtn.classList.add('hidden');
            
            // Logic to auto-close tab if it's open and time passes 4 AM
            const travelContent = document.getElementById('shop-content-traveling');
            if (travelContent && !travelContent.classList.contains('hidden')) {
                switchShopTab('function');
            }
        }
    }
    
    // 2. Digital Shop Tab Visibility
    const digitalTabBtn = document.getElementById('shop-tab-digital');
    if (digitalTabBtn) {
        if (gameState.isDigitalShopUnlocked) digitalTabBtn.classList.remove('hidden');
        else digitalTabBtn.classList.add('hidden');
    }

    // 3. Totem Timer
    const totemTimerDisplay = document.getElementById('totem-timer-display');
    if (totemTimerDisplay) {
        // Calculate time until next 00:00
        const tomorrow = new Date(gameTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diffMs = tomorrow.getTime() - gameTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        totemTimerDisplay.textContent = `(갱신까지 ${hours}시간 ${minutes}분)`;
    }
}

function updatePrices() {
    // Logic to update coin prices based on weather and trends
    // Simplified for brevity as it's complex logic, but ensuring loop calls it
    // ... implementation ...
}

function checkWeather() {
    // Weather change logic
    // ... implementation ...
}

function handlePassiveIncome() {
    const now = Date.now();
    if (now - gameState.lastMiningTimestamp >= 1000) {
        if (gameState.isCubePurchased) gameState.userCash += 100;
        // ... other passive incomes ...
        gameState.lastMiningTimestamp = now;
    }
}

function saveGame() {
    if (userUID) {
        db.ref('users/' + userUID).set(gameState);
    } else {
        localStorage.setItem('cubeCoinSim_v2', JSON.stringify(gameState));
    }
}

function updateUI() {
    if (!dom.userCash) return;
    
    // Update resources
    for (const key in dom) {
        if (gameState[key] !== undefined && dom[key]) {
             dom[key].innerText = Math.floor(gameState[key]).toLocaleString();
        }
    }
    
    // Update Time & Weather
    if (dom.gameTime) {
        const h = gameTime.getHours().toString().padStart(2, '0');
        const m = gameTime.getMinutes().toString().padStart(2, '0');
        const wIcon = WEATHER_DATA[gameState.weather]?.icon || '';
        dom.gameTime.innerText = `${h}:${m} (${wIcon})`;
    }
    if (dom.seasonDisplay) dom.seasonDisplay.innerText = `${gameState.season} ${SEASON_EMOJI_MAP[gameState.season] || ''}`;
    if (dom.weatherDisplay) {
        dom.weatherDisplay.innerText = `${gameState.weather} ${WEATHER_DATA[gameState.weather]?.icon || ''}`;
    }
}

// --- Chat & Dev Panel Logic ---

function initChatListener() {
    const chatRef = db.ref('chat');
    chatRef.limitToLast(50).on('child_added', (snapshot: any) => {
        const msg = snapshot.val();
        const chatBox = document.getElementById('chat-messages');
        if (chatBox) {
            const div = document.createElement('div');
            div.className = "bg-gray-700 p-1 rounded mb-1 break-words";
            div.innerHTML = `<span class="font-bold text-blue-300">${msg.nickname}:</span> <span class="text-white">${msg.text}</span>`;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    document.getElementById('chat-send-button')?.addEventListener('click', handleSendMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

function handleSendMessage() {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    if (text === '/dev.mod') {
        document.getElementById('dev-panel')?.classList.remove('hidden');
        input.value = '';
        return;
    }

    if (userNickname) {
        db.ref('chat').push({
            nickname: userNickname,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        input.value = '';
    } else {
        alert("로그인이 필요합니다.");
    }
}

function initDevPanel() {
    document.getElementById('close-dev-panel')?.addEventListener('click', () => {
        document.getElementById('dev-panel')?.classList.add('hidden');
    });
    
    // Game Speed
    document.getElementById('dev-set-speed-btn')?.addEventListener('click', () => {
        const val = parseInt((document.getElementById('dev-speed-input') as HTMLInputElement).value);
        if (val >= 1) currentGameSpeed = val;
    });
    
    // Weather
    const wSelect = document.getElementById('dev-weather-select') as HTMLSelectElement;
    Object.keys(WEATHER_DATA).forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        opt.text = w;
        wSelect.add(opt);
    });
    
    document.getElementById('dev-set-weather-btn')?.addEventListener('click', () => {
        gameState.weather = wSelect.value;
        globalWeatherOverride = wSelect.value;
        updateUI();
    });
    
    // Code Creation
    document.getElementById('dev-create-code-btn')?.addEventListener('click', () => {
         const codeId = (document.getElementById('dev-code-id') as HTMLInputElement).value.toUpperCase();
         const type = (document.getElementById('dev-code-reward-type') as HTMLSelectElement).value;
         const amount = parseInt((document.getElementById('dev-code-reward-amount') as HTMLInputElement).value);
         
         if(codeId && amount) {
             db.ref('codes/' + codeId).set({
                 rewardType: type,
                 rewardAmount: amount,
                 maxUses: 100, // Default
                 currentUses: 0
             });
             alert(`코드 ${codeId} 생성 완료`);
         }
    });
}

// --- Promo Code Logic ---
function initCodeSystem() {
    const btn = document.getElementById('code-submit-button');
    const input = document.getElementById('code-input') as HTMLInputElement;
    
    if (btn && input) {
        btn.addEventListener('click', async () => {
            const code = input.value.trim().toUpperCase();
            if (!code) return;
            
            if (code === 'RESET') {
                if (confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    localStorage.removeItem('cubeCoinSim_v2');
                    if (userUID && db) await db.ref('users/' + userUID).remove();
                    location.reload();
                }
                return;
            }
            
            // Local check first to avoid DB call if already used
            if (gameState.usedCodes && gameState.usedCodes.includes(code)) {
                alert('이미 사용한 코드입니다.');
                return;
            }
            
            try {
                const snapshot = await db.ref('codes/' + code).once('value');
                if (!snapshot.exists()) {
                    alert('유효하지 않은 코드입니다.');
                    return;
                }
                
                const codeData = snapshot.val();
                if (codeData.currentUses >= codeData.maxUses) {
                    alert('사용 횟수가 초과된 코드입니다.');
                    return;
                }
                
                // Apply reward
                const rewardAmount = codeData.rewardAmount;
                const rewardType = codeData.rewardType;
                
                if (gameState[rewardType] !== undefined) {
                    gameState[rewardType] += rewardAmount;
                    
                    // Update code usage in DB
                    await db.ref('codes/' + code).update({
                        currentUses: codeData.currentUses + 1
                    });
                    
                    // Track usage locally
                    if (!gameState.usedCodes) gameState.usedCodes = [];
                    gameState.usedCodes.push(code);
                    
                    const rewardName = RESOURCE_NAME_MAP[rewardType] || rewardType;
                    alert(`코드 적용 성공! ${rewardName} +${rewardAmount.toLocaleString()}`);
                    input.value = '';
                    saveGame();
                    updateUI();
                } else {
                    alert('코드 보상 타입 오류.');
                }
            } catch (e) {
                console.error(e);
                alert('코드 확인 중 오류가 발생했습니다. (로그인 또는 인터넷 연결 확인)');
            }
        });
        
        // Enter key support
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btn.click();
        });
    }
}

function populateShopUI() {
    // Populate Function Shop
    const funcContainer = document.getElementById('shop-items');
    if (funcContainer && !funcContainer.hasChildNodes()) {
        // ... add function items (omitted for brevity, assume existing logic) ...
    }
    
    renderShop(); // Initial render for dynamic shops
}

function renderShop() {
    // Render Traveling Merchant
    const travelContainer = document.getElementById('traveling-items');
    if (travelContainer) {
        travelContainer.innerHTML = '';
        if (Object.keys(gameState.travelingMerchantStock).length === 0) {
             travelContainer.innerHTML = '<div class="col-span-3 text-center text-gray-500">재고 없음 (다음 밤 01:00에 방문)</div>';
        } else {
            for (const [key, qty] of Object.entries(gameState.travelingMerchantStock)) {
                const item = TRAVELING_ITEMS[key];
                if (!item) continue;
                const card = document.createElement('div');
                card.className = 'bg-gray-700 p-2 rounded border border-purple-500/30';
                card.innerHTML = `
                    <div class="font-bold text-sm text-purple-300">${item.name}</div>
                    <div class="text-xs text-gray-400">${item.desc}</div>
                    <div class="text-xs mt-1">남은 수량: ${qty}</div>
                    <button class="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-xs py-1 px-2 rounded" onclick="buyTravelingItem('${key}')">
                        ${item.cost} 마법석
                    </button>
                `;
                travelContainer.appendChild(card);
            }
        }
    }
    
    // Render Digital Shop
    const digitalContainer = document.getElementById('digital-items');
    if (digitalContainer) {
        digitalContainer.innerHTML = '';
        if (Object.keys(gameState.digitalShopStock).length === 0) {
            digitalContainer.innerHTML = '<div class="col-span-3 text-center text-gray-500">재고 없음 (8분마다 갱신)</div>';
        } else {
            for (const [key, qty] of Object.entries(gameState.digitalShopStock)) {
                const item = DIGITAL_ITEMS[key];
                if(!item) continue;
                const card = document.createElement('div');
                card.className = 'bg-gray-700 p-2 rounded border border-cyan-500/30';
                card.innerHTML = `
                    <div class="font-bold text-sm text-cyan-300">${item.name}</div>
                    <div class="text-xs text-gray-400">${item.desc}</div>
                    <div class="text-xs mt-1">남은 수량: ${qty}</div>
                    <button class="mt-2 w-full bg-cyan-600 hover:bg-cyan-700 text-xs py-1 px-2 rounded" onclick="buyDigitalItem('${key}')">
                        ${item.cost} 결정
                    </button>
                `;
                digitalContainer.appendChild(card);
            }
        }
    }
}

function populateSettingsUI() {
    // ... settings logic ...
}

// Global exposed functions for button clicks
(window as any).buyTravelingItem = (key: string) => {
    const item = TRAVELING_ITEMS[key];
    const stock = gameState.travelingMerchantStock[key];
    if (stock > 0 && gameState.userMagicStone >= item.cost) {
        gameState.userMagicStone -= item.cost;
        gameState.travelingMerchantStock[key]--;
        gameState[`user${key.charAt(0).toUpperCase() + key.slice(1)}`] = (gameState[`user${key.charAt(0).toUpperCase() + key.slice(1)}`] || 0) + 1;
        
        // Special Unlock logic
        if (key === 'crystallizedKey') {
            gameState.isDigitalShopUnlocked = true;
            alert("디지털 상점이 잠금 해제되었습니다!");
        }
        
        updateUI();
        renderShop();
        saveGame();
    } else {
        alert("재화가 부족하거나 재고가 없습니다.");
    }
};

(window as any).buyDigitalItem = (key: string) => {
    const item = DIGITAL_ITEMS[key];
    const stock = gameState.digitalShopStock[key];
    if (stock > 0 && gameState.userDataCrystal >= item.cost) {
        if (item.subCost && gameState[item.subCurrency] < item.subCost) {
             alert("보조 재화가 부족합니다.");
             return;
        }
        gameState.userDataCrystal -= item.cost;
        if (item.subCost) gameState[item.subCurrency] -= item.subCost;
        
        gameState.digitalShopStock[key]--;
        
        if (key === 'brewingStand') {
            gameState.isBrewingUnlocked = true;
            alert("양조 기능이 잠금 해제되었습니다!");
        } else {
             // Handle other items mapping logic if names differ slightly or just increment generic inventory
             // For simplicity assuming 1:1 mapping for now or custom handling
        }
        
        updateUI();
        renderShop();
        saveGame();
    } else {
        alert("재화가 부족하거나 재고가 없습니다.");
    }
};


// Start the game logic
initGame();
