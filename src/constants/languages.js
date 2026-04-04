export const LANG_FLAG = {
  'English':    'GB',
  'French':     'FR',
  'German':     'DE',
  'Spanish':    'ES',
  'Italian':    'IT',
  'Portuguese': 'PT',
  'Dutch':      'NL',
  'Japanese':   'JP',
  'Chinese':    'CN',
  'Korean':     'KR',
  'Arabic':     'AR',
  'Russian':    'RU',
  'Hindi':      'HI',
}

export const AVAILABLE_LANGUAGES = Object.keys(LANG_FLAG)

export function flagCode(language) {
  return LANG_FLAG[language] || language?.slice(0, 2).toUpperCase() || 'GB'
}
