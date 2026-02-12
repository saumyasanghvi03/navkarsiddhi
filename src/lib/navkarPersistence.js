const TODAY_FORMATTER = new Intl.DateTimeFormat('en-CA');

export const getTodayDate = (date = new Date()) => {
  const parts = TODAY_FORMATTER.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

export const parseSafeJson = (rawValue, fallbackValue) => {
  if (!rawValue) return fallbackValue;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
};

export const loadInitialState = ({ totalRaw, historyRaw, prefsRaw }) => {
  const totalNavkars = Number(totalRaw || 0);
  const history = parseSafeJson(historyRaw, []);
  const prefs = parseSafeJson(prefsRaw, {});

  return {
    totalNavkars: Number.isFinite(totalNavkars) ? totalNavkars : 0,
    history: Array.isArray(history) ? history : [],
    mode: prefs.mode || 'GRID',
    malaSize: prefs.malaSize,
  };
};

export const computeUpdatedHistory = ({
  history,
  focus = 0,
  calm = 0,
  date = new Date(),
}) => {
  const today = getTodayDate(date);
  const nextHistory = [...history];
  const todayIndex = nextHistory.findIndex(item => item.date === today);
  const mantraScore = Math.round((focus + calm) / 2);

  if (todayIndex >= 0) {
    const dayData = nextHistory[todayIndex];
    dayData.navkars += 1;
    dayData.stabilitySum = (dayData.stabilitySum || 0) + mantraScore;
    dayData.samples = (dayData.samples || 0) + 1;

    if (dayData.navkars % 108 === 0) {
      dayData.malas = (dayData.malas || 0) + 1;
    }
  } else {
    nextHistory.push({
      date: today,
      navkars: 1,
      malas: 0,
      stabilitySum: mantraScore,
      samples: 1,
    });
  }

  return nextHistory;
};
