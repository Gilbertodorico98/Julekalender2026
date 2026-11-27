// Indholdet bag hver låge. Ret frit i teksterne.
export type DoorContent = { emoji: string; title: string; text: string }

export const DOOR_CONTENT: Record<number, DoorContent> = {
  1: { emoji: '🎄', title: 'Velkommen!', text: 'Julekalenderen er skudt i gang. 23 låger tilbage.' },
  2: { emoji: '🍪', title: 'Småkagetid', text: 'Vaniljekranse smager bedst, når dejen har hvilet natten over.' },
  3: { emoji: '🕯️', title: 'Kalenderlys', text: 'Husk at brænde lyset ned til 3-tallet i dag.' },
  4: { emoji: '🧦', title: 'Julesokker', text: 'Hvad kalder man en nisse med solbriller? En cool-nisse.' },
  5: { emoji: '❄️', title: 'Snefnug', text: 'Intet snefnug har seks helt ens arme. Hver eneste er unik.' },
  6: { emoji: '🦌', title: 'Rensdyr', text: 'Både han- og hunrensdyr har gevir. Hunnerne beholder dem vinteren over.' },
  7: { emoji: '🎁', title: 'Gaveliste', text: 'I dag er en god dag til at skrive ønskesedlen færdig.' },
  8: { emoji: '☕', title: 'Gløgg', text: 'Gløgg har rødder i middelalderens krydrede vine.' },
  9: { emoji: '⭐', title: 'Stjernen', text: 'Stjernen i toppen af træet symboliserer Betlehemsstjernen.' },
  10: { emoji: '💆', title: 'Dagens gave', text: '10 minutters massage! Indløs den, når du har lyst.' },
  11: { emoji: '🍊', title: 'Klementiner', text: 'Ét stykke frugt om dagen holder nissen væk. Næsten.' },
  12: { emoji: '🔔', title: 'Klokker', text: 'Halvvejs! Tolv låger åbnet, tolv tilbage.' },
  13: { emoji: '👑', title: 'Lucia', text: 'Luciadag fejres med lys i håret og lussekatte.' },
  14: { emoji: '🧤', title: 'Vanter', text: 'Tag vanterne på og gå en tur i mørket med lommelygte.' },
  15: { emoji: '🎶', title: 'Julesang', text: 'Dagens udfordring: syng et helt vers uden at kigge.' },
  16: { emoji: '🥜', title: 'Nødder', text: 'Brændte mandler duftede allerede på julemarkeder for 100 år siden.' },
  17: { emoji: '⛄', title: 'Snemand', text: 'Hvorfor er snemænd så rolige? De tager det med is.' },
  18: { emoji: '📜', title: 'Julekort', text: 'Send et julekort til én, du ikke har talt med længe.' },
  19: { emoji: '🍚', title: 'Risalamande', text: 'Hvem finder mandlen i år? Øv dig i pokerfjæs.' },
  20: { emoji: '🌟', title: 'Fire dage', text: 'Kun fire låger tilbage. Er gaverne pakket ind?' },
  21: { emoji: '🌑', title: 'Vintersolhverv', text: 'Årets korteste dag. Fra i morgen bliver dagene længere.' },
  22: { emoji: '🎀', title: 'Gavepapir', text: 'Mål papiret, før du klipper. Spar tape og nerver.' },
  23: { emoji: '🏠', title: 'Lillejuleaften', text: 'Pynt træet, se julekalender og sov godt.' },
  24: { emoji: '❤️', title: 'Glædelig jul!', text: 'Rigtig glædelig jul og godt nytår 2027!' },
}

/** Adventsgaverne (fysiske gaver), nøglet efter søndag 1-4. Ret teksterne frit. */
export const ADVENT_CONTENT: Record<number, DoorContent> = {
  1: { emoji: '🎁', title: 'Gave til 1. advent', text: 'Der ligger en gave til dig! Kig under juletræet.' },
  2: { emoji: '🎁', title: 'Gave til 2. advent', text: 'Der ligger en gave til dig! Kig i skabet i entréen.' },
  3: { emoji: '🎁', title: 'Gave til 3. advent', text: 'Der ligger en gave til dig! Kig under din hovedpude.' },
  4: { emoji: '🎁', title: 'Gave til 4. advent', text: 'Den sidste adventsgave! Kig bag sofaen.' },
}

/** Fast, blandet rækkefølge af lågerne i gitteret. */
export const DOOR_ORDER = [
  7, 15, 2, 21, 11, 4, 18, 9, 24, 13, 1, 20, 6, 16, 23, 3, 10, 19, 14, 5, 22, 8, 17, 12,
]
