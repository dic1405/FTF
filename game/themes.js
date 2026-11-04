// Themes: the same rules and levels, different creatures, art and movement.
// fish — top-down pond, creatures rotate to their heading and swim constantly.
// cats — side-view yard, creatures flip to face left/right and alternate standing still with short walks;
//        a temperament sets how long each cat stands still (restless cats only appear from level 6).

const catIntro = s => s.replace(/fishes/gi, 'cats').replace(/\bfish\b/g, 'cat').replace(/\bFish\b/g, 'Cat').replace(/Algae/g, 'Catnip');

export const THEMES = {
  fish: {
    key: 'fish', title: ['FEED THE', 'FISHES'], saveKey: 'ftf_stars',
    sheets: { creature: 'assets/out/fish', tiles: 'assets/out/tiles', props: 'assets/out/props', extra: null },
    types: ['koi', 'goldfish', 'catfish'],            // wants one / likes either / combo eater
    size: { s: { L: 32, W: 10 }, m: { L: 44, W: 13 }, l: { L: 56, W: 16 } },
    rotate: true, spin: true, landFx: 'splash', idle: false,
    speed: { koi: { min: 14, max: 20, turn: 700 }, goldfish: { min: 5, max: 8, turn: 1200 }, catfish: { min: 8, max: 12, turn: 900 } },
    intro: s => s, allFull: 'ALL FISH FULL!', hungryTip: 'TRY: FEED FISH THAT SHARE A FOOD TOGETHER, AND KEEP BAD FOOD OUT.',
    menuDemo: [['goldfish_m_swim', 60, 445, 1], ['koi_l_swim', 200, 445, -1]],
    menuHint: ['DRAG FOOD INTO THE SLOTS. PRESS FEED.', 'FILL EVERY HEART BEFORE THE TURNS RUN OUT.'],
    tiers: [
      { sfx: '', props: [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_lily_big', 30, 300], ['prop_lily_a', 48, 314], ['prop_lily_b', 226, 296], ['prop_lily_flower', 240, 312], ['prop_lily_a', 10, 180], ['prop_lily_flower', 250, 150], ['prop_rock', 120, 352], ['prop_grass', 60, 356], ['prop_grass', 200, 358], ['prop_reed', 150, 346]] },
      { sfx: '_c', props: [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_spout', 118, 344], ['prop_moss_rock', 40, 320], ['prop_moss_rock', 214, 300], ['prop_rock', 60, 60], ['prop_moss_rock', 200, 70], ['prop_grass', 20, 200], ['prop_grass', 244, 240], ['prop_lily_a', 236, 180]] },
      { sfx: '_l', props: [['prop_planter', 2, 0], ['prop_planter_b', 222, 4], ['prop_lily_big', 26, 290], ['prop_lily_flower', 44, 308], ['prop_lily_a', 36, 322], ['prop_lily_big', 226, 300], ['prop_lily_flower', 244, 286], ['prop_lily_b', 232, 320], ['prop_lily_flower', 12, 150], ['prop_lily_a', 248, 120], ['prop_lily_flower', 128, 352], ['prop_lily_b', 14, 230], ['prop_grass', 100, 356], ['prop_grass', 180, 358]] },
      { sfx: '_t', props: [['prop_lantern', 8, 2], ['prop_lantern', 250, 2], ['prop_lantern', 8, 334], ['prop_lantern', 250, 334], ['prop_lily_big', 120, 10], ['prop_lily_a', 24, 180], ['prop_lily_b', 240, 200], ['prop_rock', 40, 340], ['prop_grass', 200, 356]] },
    ],
  },
  cats: {
    key: 'cats', title: ['FEED THE', 'CATS'], saveKey: 'ftc_stars',
    sheets: { creature: 'assets/cats_out/cats', tiles: 'assets/cats_out/tiles', props: 'assets/cats_out/props', extra: 'assets/cats_out/ui_extra' },
    types: ['tabby', 'chonk', 'fluffy'],
    size: { s: { L: 34, W: 26 }, m: { L: 44, W: 32 }, l: { L: 54, W: 40 } },
    rotate: false, spin: false, landFx: 'dust', idle: true,
    walkSpeed: [14, 18],
    // how long a cat stands still vs walks, in ms; restless cats never appear before level 6
    tempers: {
      lazy: { idle: [4000, 8000], move: [700, 1400] },
      normal: { idle: [2000, 4000], move: [1000, 2000] },
      restless: { idle: [300, 1000], move: [1800, 3200] },
    },
    temperFor: (level, i) => level.id <= 5 ? (i % 2 ? 'normal' : 'lazy') : ['restless', 'lazy', 'normal', 'restless'][i % 4],
    intro: catIntro, allFull: 'ALL CATS FULL!', hungryTip: 'TRY: FEED CATS THAT SHARE A FOOD TOGETHER, AND KEEP BAD FOOD OUT.',
    menuDemo: [['chonk_m_idle_a', 60, 445, 1], ['tabby_l_swim', 200, 445, -1]],
    menuHint: ['DRAG FOOD INTO THE SLOTS. PRESS FEED.', 'FILL EVERY HEART BEFORE THE TURNS RUN OUT.'],
    tiers: [
      { sfx: '', props: [['prop_bush', 14, 14], ['prop_pot', 236, 12], ['prop_stump', 30, 300], ['prop_flowers', 220, 300], ['prop_bowl', 128, 340], ['prop_flowers', 20, 180], ['prop_rock', 238, 200]] },
      { sfx: '_c', props: [['prop_pot', 10, 10], ['prop_pot', 240, 10], ['prop_rock', 40, 320], ['prop_moss_rock', 214, 300], ['prop_stump', 120, 50], ['prop_bowl', 128, 340], ['prop_flowers', 240, 240]] },
      { sfx: '_l', props: [['prop_bush', 14, 14], ['prop_bush', 232, 14], ['prop_flowers', 26, 290], ['prop_flowers', 44, 308], ['prop_flowers', 226, 300], ['prop_flowers', 244, 286], ['prop_flowers', 12, 150], ['prop_flowers', 248, 120], ['prop_bowl', 128, 340]] },
      { sfx: '_t', props: [['prop_lantern', 8, 2], ['prop_lantern', 250, 2], ['prop_lantern', 8, 334], ['prop_lantern', 250, 334], ['prop_stump', 120, 10], ['prop_bush', 24, 180], ['prop_bowl', 128, 340], ['prop_rock', 236, 200]] },
    ],
  },
};
