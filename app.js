// ============================================================
// DATA
// ============================================================
const MAX_LEVEL = 150;          // Max player level
const PTS_PER_PACK = 25;        // Each stat pack = 25 pts into one attribute
const MILESTONE_INTERVAL = 10;  // Every 10 levels, +1 to all stats
const RADAR_SCALE = 300;        // Max value for radar chart display
const MAX_DREAM_POINTS = 100;   // Max total dream points (post-max-level)

const ATTRIBUTES = [
  { key: 'physicality', name: 'Physicality', desc: 'M1 & M2 damage' },
  { key: 'durability',  name: 'Durability',  desc: 'Max HP' },
  { key: 'output',      name: 'Output',      desc: 'Skill/ability damage' },
  { key: 'efficiency',  name: 'Efficiency',  desc: 'Technique bar cost reduction' },
  { key: 'awareness',   name: 'Awareness',   desc: 'Block stamina, Black Flash chance' },
  { key: 'dexterity',   name: 'Dexterity',   desc: 'Movement speed' },
];

// Grade thresholds (official)
const GRADE_THRESHOLDS = [
    0,   2,   4,   6,   8,
   10,  12,  14,  16,  18,
   20,  23,  26,  29,  32,
   35,  40,  45,  50,  55,
   60,  66,  72,  78,  84,
   90,  97, 104, 111, 118,
  125, 133, 141, 149, 157,
  165, 174, 183, 192, 201,
  210, 220, 230, 240, 250,
  260, 271, 282, 293, 304,
  315, 327, 339, 351, 363,
  375, 388, 401, 414, 427,
  440, 552, 664, 776, 888,
];

const GRADE_LETTERS = ['F','E','D','C','B','A','SF','SE','SD','SC','SB','SA','SS'];
const SOFT_CAP_INDEX = 30; // SF1 = index 30

const GRADE_NAMES = [];
GRADE_LETTERS.forEach(letter => {
  for (let i = 1; i <= 5; i++) GRADE_NAMES.push(letter + i);
});

function getGrade(val) {
  let grade = 'F1';
  for (let i = 0; i < GRADE_THRESHOLDS.length; i++) {
    if (val >= GRADE_THRESHOLDS[i]) grade = GRADE_NAMES[i];
    else break;
  }
  return grade;
}

function gradeClass(grade) {
  if (grade.startsWith('SS')) return 'grade-SS';
  if (grade.startsWith('S'))  return 'grade-S';
  return 'grade-' + grade.charAt(0);
}

function isAboveSoftCap(val) {
  return val >= GRADE_THRESHOLDS[SOFT_CAP_INDEX];
}

const GEARS = [
  { name:'Executioner', tags:['SWORDSMAN','BRUTE','COMBO'] },
  { name:'Projector',   tags:['MOBILITY','MIXUP','BLITZ'] },
  { name:'Manipulator', tags:['RANGED','MAGE','CE CONTROL'] },
  { name:'Constructor', tags:['VEIL','VERSATILE','FOR GEEKS'] },
  { name:'Ravager',     tags:['COMBO','BRUTE','VERSATILE'] },
  { name:'Sensor',      tags:['TRACKER','GUARD BREAK','AWARENESS'] },
  { name:'Interceptor', tags:['HYBRID','CURSED ENERGY IMBUE','SWORD'] },
  { name:'Usurper',     tags:['MIXUP','VERSATILE','WIDE KIT'] },
  { name:'Hydra',       tags:['DRAIN','HYBRID','STAMINA'] },
];

const CLAN_DATA = {
  'Gojo|royal':      { tier:'royal',  desc:'Start with 5 CT points. Increased Technique Energy and regeneration.' },
  'Kamo|royal':      { tier:'royal',  desc:'M1 attacks grant lifesteal — 0.03% (0.5x with sword) max HP per hit.' },
  'Nier|royal':      { tier:'royal',  desc:'1.2x Cybernetic Load Cap. Auto-upgrade all equipped Cybernetics.' },
  'Zenin|royal':     { tier:'royal',  desc:'+8% damage vs non-royal clans. -3% vs royals. Innate Flicker Image.' },
  'Amai|unique':     { tier:'unique', desc:'M1 & M2 deal 10% less damage. All other attacks deal 10% more.' },
  'Hazenoki|unique': { tier:'unique', desc:'Sword M1/M2 deal 10% more damage. Take 10% more posture damage.' },
  'Itadori|unique':  { tier:'unique', desc:'Land 7 clean hit stacks (resets on getting hit) -> guaranteed Black Flash in 3s.' },
  'Kashimo|unique':  { tier:'unique', desc:'10% chance to apply Shock on hit. 6-second internal cooldown.' },
  'Nishimiya|unique':{ tier:'unique', desc:'Damage increases as HP falls, up to +10% at low HP.' },
  'Panda|unique':    { tier:'unique', desc:'Eat bamboo on expeditions to restore 2% max HP. Passive 6% damage reduction.' },
  'Todo|unique':     { tier:'unique', desc:'Larger size. Flat buff + 5% Physicality & Durability.' },
  'Crow|rare':       { tier:'rare',   desc:'Devastating Strike ignores the damage cap.' },
  'Eve|rare':        { tier:'rare',   desc:'Gain more EXP from all sources.' },
  'Kusakabe|rare':   { tier:'rare',   desc:'+10% Awareness flat. 20% less NSS drain. NSS4 teleports on impact.' },
  'Kuroi|common':    { tier:'common', desc:'+7% Awareness. New Shadow Style has reduced activation cost.' },
  'Storm|rare':      { tier:'rare',   desc:'+15% damage in Windswept environments.' },
  'Yoshino|rare':    { tier:'rare',   desc:'Landing an M1 grants +5 movement speed for 7 seconds.' },
  'Fushiguro|common':{ tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Nanami|common':   { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Okkotsu|common':  { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Hakari|common':   { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Inumaki|common':  { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Miwa|common':     { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Geto|common':     { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
  'Kugisaki|common': { tier:'common', desc:'+25% EXP gain (common clan bonus).' },
};

const TIER_COLORS = { royal:'#ffd700', unique:'#b060e0', rare:'#4a9eff', common:'#aaaacc' };

// All real in-game techniques with roll chances and EVO counts (from Trello)
const TECHNIQUES = [
  // Royal - 0.11%
  { name:'Phantom Tears',      tier:'royal',  roll:0.11, evo:1 },
  { name:'Just A Nibble',      tier:'royal',  roll:0.11, evo:0 },
  { name:'Spin',               tier:'royal',  roll:0.11, evo:1 },
  { name:'Shivas Hands',       tier:'royal',  roll:0.11, evo:1 },
  { name:'Ice',                tier:'royal',  roll:0.11, evo:3 },
  { name:'Grief Wardens',      tier:'royal',  roll:0.11, evo:2 },
  { name:'Divine Cultivation', tier:'royal',  roll:0.11, evo:0 },
  { name:'The Hunter',         tier:'royal',  roll:0.11, evo:0 },
  { name:'Portals',            tier:'royal',  roll:0.11, evo:0 },
  { name:'Sword Saint',        tier:'royal',  roll:0.11, evo:1 },
  { name:'Reversal Fortune',   tier:'royal',  roll:0.11, evo:0 },
  { name:'Sadako',             tier:'royal',  roll:0.11, evo:0 },
  { name:'Luck Manipulation',  tier:'royal',  roll:0.11, evo:0 },
  { name:'Gravity',            tier:'royal',  roll:0.11, evo:0 },
  { name:'Maw Of Gluttony',    tier:'royal',  roll:0.11, evo:1 },
  { name:'The Playbook',       tier:'royal',  roll:0.11, evo:0 },
  { name:'Betsy',              tier:'royal',  roll:0.11, evo:2 },
  { name:'Vector Arrows',      tier:'royal',  roll:0.11, evo:2 },
  { name:'Curse Butler',       tier:'royal',  roll:0.11, evo:3 },
  // Unique - 0.83%
  { name:'Damocles',           tier:'unique', roll:0.83, evo:0 },
  { name:'Lightseeker',        tier:'unique', roll:0.83, evo:0 },
  { name:'Thunder Spears',     tier:'unique', roll:0.83, evo:0 },
  { name:'Seraph',             tier:'unique', roll:0.83, evo:2 },
  { name:'Curse Storm',        tier:'unique', roll:0.83, evo:1 },
  { name:'Basketball',         tier:'unique', roll:0.83, evo:0 },
  { name:'Radiation',          tier:'unique', roll:0.83, evo:1 },
  { name:'Zodiacs',            tier:'unique', roll:0.83, evo:0 },
  { name:'The Watcher',        tier:'unique', roll:0.83, evo:1 },
  { name:'Tremor',             tier:'unique', roll:0.83, evo:3 },
  { name:'Spirit Walker',      tier:'unique', roll:0.83, evo:1 },
  { name:'Ink',                tier:'unique', roll:0.83, evo:3 },
  // Rare - 1.67%
  { name:'Beelzebub',          tier:'rare',   roll:1.67, evo:1 },
  { name:'Fresh Cut',          tier:'rare',   roll:1.67, evo:0 },
  { name:'Medium',             tier:'rare',   roll:1.67, evo:0 },
  { name:'Vampirism',          tier:'rare',   roll:1.67, evo:0 },
  { name:'Energy Control',     tier:'rare',   roll:1.67, evo:0 },
  { name:'Geddon',             tier:'rare',   roll:1.67, evo:1 },
  { name:'Highlight Reel',     tier:'rare',   roll:1.67, evo:0 },
  { name:'Railgun',            tier:'rare',   roll:1.67, evo:2 },
  { name:'War Curse',          tier:'rare',   roll:1.67, evo:1 },
  { name:'Edgelord',           tier:'rare',   roll:1.67, evo:2 },
  { name:'Heavy Rain',         tier:'rare',   roll:1.67, evo:0 },
  { name:'Judgement',          tier:'rare',   roll:1.67, evo:1 },
  { name:'Pain Packer',        tier:'rare',   roll:1.67, evo:0 },
  { name:'The Balance',        tier:'rare',   roll:1.67, evo:0 },
  // Common - 2.42%
  { name:'Ball Of Doom',       tier:'common', roll:2.42, evo:0 },
  { name:'Yang',               tier:'common', roll:2.42, evo:0 },
  { name:'Yin',                tier:'common', roll:2.42, evo:0 },
  { name:'Sun Breather',       tier:'common', roll:2.42, evo:0 },
  { name:'Shadow Realm',       tier:'common', roll:2.42, evo:0 },
  { name:'Sea King',           tier:'common', roll:2.42, evo:1 },
  { name:'Power Of Friendship',tier:'common', roll:2.42, evo:0 },
  { name:'Madness Factor',     tier:'common', roll:2.42, evo:0 },
  { name:'No Enemies',         tier:'common', roll:2.42, evo:0 },
  { name:'Bounce',             tier:'common', roll:2.42, evo:0 },
  { name:'Star Link',          tier:'common', roll:2.42, evo:0 },
  { name:'Ouji',               tier:'common', roll:2.42, evo:1 },
  { name:'Rain God',           tier:'common', roll:2.42, evo:0 },
  { name:'The Dealer',         tier:'common', roll:2.42, evo:0 },
  { name:'The Shipyard',       tier:'common', roll:2.42, evo:0 },
  { name:'Ghostwriter',        tier:'common', roll:2.42, evo:0 },
  { name:'Hot Potato',         tier:'common', roll:2.42, evo:0 },
  { name:'Chains',             tier:'common', roll:2.42, evo:1 },
  { name:'The Meg',            tier:'common', roll:2.42, evo:1 },
  { name:'Gilded Shadow',      tier:'common', roll:2.42, evo:0 },
  { name:'Path To The Grave',  tier:'common', roll:2.42, evo:0 },
  { name:'Moth Flame',         tier:'common', roll:2.42, evo:0 },
  { name:'Sky Rulers',         tier:'common', roll:2.42, evo:0 },
  { name:'Powerup Box',        tier:'common', roll:2.42, evo:0 },
  { name:'Wheres Your Head At',tier:'common', roll:2.42, evo:0 },
];

const CYBER_TYPE_COLORS = { Active:'#c8a96e', Passive:'#4a9eff', Toolbar:'#b060e0', Vow:'#e05555' };

const CYBERNETICS = [
  // ── ACTIVE ──
  { id:'monocyte_1',    name:'Monocyte Breeder Mk.1',           type:'Active',  load:10,  desc:'While holding E + T, the user can quickly regenerate lost limbs at the cost of burning out part of their Technique Bar.' },
  { id:'monocyte_2',    name:'Monocyte Breeder Mk.2',           type:'Active',  load:30,  desc:'While holding E + T, the user can quickly regenerate lost limbs and recently taken damage at the cost of burning out part of their Technique Bar. Successfully hitting opponents will also regenerate recently taken damage.' },
  { id:'monocyte_3',    name:'Monocyte Breeder Mk.3',           type:'Active',  load:70,  desc:'While holding E + T, the user can quickly regenerate lost limbs and any lost health at the cost of burning out part of their Technique Bar. Successfully hitting opponents will also regenerate recently taken damage.' },
  { id:'polyeth_1',     name:'Polyethylene Scales Mk.1',        type:'Active',  load:35,  desc:'When pressing B, the user will activate Cursed Defense. Pressing E when being hit by energy attacks will reduce the damage.' },
  { id:'polyeth_2',     name:'Polyethylene Scales Mk.2',        type:'Active',  load:55,  desc:'When pressing B, the user will activate Cursed Defense. Pressing E when being hit by energy attacks will reduce the damage, and pressing F when being hit by physical attacks will do the same.' },
  { id:'polyeth_3',     name:'Polyethylene Scales Mk.3',        type:'Active',  load:75,  desc:'When pressing B, the user will activate Cursed Defense. Pressing E when being hit by energy attacks will reduce the damage, and pressing F when being hit by physical attacks will do the same. If the user successfully defends against six physical attacks in a row, they will break out of the combo at the cost of burning out part of their Technique Bar.' },
  { id:'sanctified_1',  name:'Sanctified Field Generator Mk.1', type:'Active',  load:20,  desc:'While holding G, the user will consume Technique Bar to activate a basic Simple Domain. This will negate incoming skills and Cursed Techniques, but can be bypassed by M1 and M2 attacks.' },
  { id:'sanctified_2',  name:'Sanctified Field Generator Mk.2', type:'Active',  load:35,  desc:'While holding G, the user will consume Technique Bar to activate a basic Simple Domain. This can now be activated in the middle of a skill to cancel into the Simple Domain, allowing for faster reaction time. This will negate incoming skills and Cursed Techniques, but can be bypassed by M1 and M2 attacks.' },
  { id:'sanctified_3',  name:'Sanctified Field Generator Mk.3', type:'Active',  load:65,  desc:'While holding G, the user will consume Technique Bar to activate an advanced Simple Domain. This will negate incoming skills and Cursed Techniques, but can be bypassed by M1 and M2 attacks. Upon being hit by a skill after activating, the first instance of damage will be reflected onto the attacker.' },
  { id:'phantom_field', name:'Phantom Field Generator',          type:'Active',  load:65,  desc:'While holding G, the user will consume Technique Bar to activate an advanced Simple Domain. The Simple Domain can now be activated in mid-air to suspend the user, and holding M1 will charge and fire a projectile slash after the Simple Domain is cancelled.' },
  { id:'mass_force',    name:'Mass Force Amplifier',             type:'Active',  load:35,  desc:'When holding E before charging an M1 attack, the user can significantly increase the damage. It takes around three seconds to fully charge.' },
  { id:'afterimage',    name:'Afterimage Step Replicator',       type:'Active',  load:35,  desc:"While sprinting, pressing W twice while holding E will increase the user's movement speed based off their Dexterity." },
  // ── PASSIVE ──
  { id:'biofeedback',   name:'Biofeedback Relay',                type:'Passive', load:30,  desc:'When the user is low on stamina, received damage will be converted to stamina.' },
  { id:'red_veil',      name:'Red Veil System',                  type:'Passive', load:45,  desc:'When the user reaches 15% health, damage taken will be delayed by around two seconds.' },
  { id:'coffin_frame',  name:'Coffin Frame',                     type:'Passive', load:50,  desc:'Once per life, the user will be protected from a hit that would normally knock them. Upon being hit, it will shield the user and knock back opponents.' },
  { id:'assault_loop',  name:'Assault Loop Engine',              type:'Passive', load:20,  desc:'The user will receive additional stamina regeneration every four hits. More effective on larger crowds.' },
  { id:'rupture_strain',name:'Rupture Strain',                   type:'Passive', load:60,  desc:"The user's M2 significantly weakens an opponent's block, allowing them to deal more posture damage for a short period." },
  { id:'neural_slip',   name:'Neural Slipstream',                type:'Passive', load:65,  desc:'Using Curse Dodge in sync with nearby allies will increase the move speed of the user and others.' },
  { id:'resonance',     name:'Resonance Module',                 type:'Passive', load:60,  desc:"The user now deals more posture damage to an opponent's block after recently taking damage." },
  { id:'overclock_res', name:'Overclock Resonator',              type:'Passive', load:70,  desc:"M2s and skills will build stacks on an opponent. After three stacks, the fourth skill will cause a small explosion of Cursed Energy on the opponent." },
  { id:'gorilla_arm',   name:'Gorilla Arm Plating',              type:'Passive', load:50,  desc:"M1 attacks will briefly halt an opponent's posture regeneration." },
  { id:'reflector',     name:'Reflector System',                 type:'Passive', load:30,  desc:'When an opponent uses a grab, they will take damage.' },
  { id:'two_handed',    name:'Two-Handed Blade',                 type:'Passive', load:15,  desc:'When wielding a sword, the user switches to a two-handed stance. This stance has faster, more aggressive swings, and changes the sprinting attack to a quick double-slash rather than the usual up tilt.' },
  { id:'stalker',       name:'Stalker',                          type:'Passive', load:35,  desc:'The user gains increased movement speed when their opponent is low on health.' },
  { id:'regeneration',  name:'Regeneration',                     type:'Passive', load:40,  desc:"M1 and M2 attacks will now recover the user's burnt out Technique Bar up to 50%." },
  { id:'steel_bones',   name:'Steel Bones',                      type:'Passive', load:40,  desc:"Single-hit attacks can no longer deal more than 10% of the user's max health, although this has limited charges." },
  { id:'steel_skin',    name:'Steel Skin',                       type:'Passive', load:10,  desc:'The user will be protected against having their limbs severed, although this has limited charges.' },
  { id:'flawless_guard',name:'Flawless Guard',                   type:'Passive', load:25,  desc:'The user will no longer lose stamina when perfectly timing a block.' },
  { id:'guard_fatigue', name:'Guard Fatigue',                    type:'Passive', load:25,  desc:"Attacks to a blocking opponent pause their stamina regeneration for 1.5 seconds." },
  { id:'effortless',    name:'Effortless',                       type:'Passive', load:10,  desc:'M1 and M2 attacks consume less stamina.' },
  { id:'energized',     name:'Energized',                        type:'Passive', load:10,  desc:'Successful parries will restore more stamina.' },
  { id:'invisible',     name:'Invisible',                        type:'Passive', load:10,  desc:'The user is completely immune to Curse Sense, preventing opponents from locating them as easily.' },
  { id:'iron_arm',      name:'Iron Arm',                         type:'Passive', load:10,  desc:'The user can no longer have their right arm severed, ensuring that they can still utilize weapons and certain skills.' },
  { id:'kill_confirmed',name:'Kill Confirmed',                   type:'Passive', load:10,  desc:'The user deals twice as much damage to knocked opponents, helping to finish them off faster.' },
  { id:'looter',        name:'Looter',                           type:'Passive', load:10,  desc:"The user will receive 100% of a defeated opponent's stored time." },
  { id:'metal_legs',    name:'Metal Legs',                       type:'Passive', load:10,  desc:'The user no longer takes fall damage.' },
  { id:'mook_hyang',    name:"Mook Hyang's Wardrobe",            type:'Passive', load:10,  desc:'The user can now wear various accessories from their avatar, such as hats and certain face accessories.' },
  { id:'stable',        name:'Stable',                           type:'Passive', load:10,  desc:'The user no longer sweats at low stamina.' },
  { id:'tsumoe_tear',   name:"Tsumoe's Tear",                    type:'Passive', load:10,  desc:"Single-hit attacks can no longer deal more than 20% of the user's max health." },
  { id:'overclock',     name:'Overclock',                        type:'Passive', load:10,  desc:'When the user is low on health, skill cooldowns are reduced by 25%.' },
  { id:'the_exception', name:'The Exception',                    type:'Passive', load:0,   desc:'When pressing N, the user will tear off their shirt, revealing a muscular physique underneath. Purely cosmetic.' },
  { id:'two_for_one',   name:'Two for One',                      type:'Passive', load:0,   desc:'When purchasing food, the user will receive two for the price of one.' },
  { id:'unbreakable',   name:'Unbreakable',                      type:'Passive', load:0,   desc:"The user's weapon no longer loses durability upon dying." },
  // ── TOOLBAR ──
  { id:'disruptor',     name:'Disruptor Field',                  type:'Toolbar', load:35,  desc:'When activated, knockbacks caused by non-skill attacks will cause a pulse around the user, pushing nearby opponents away to prevent follow-ups.' },
  { id:'graviton',      name:'Graviton Knuckles',                type:'Toolbar', load:50,  desc:'When activated, reduces the knockback of the next skill used by half.' },
  { id:'slip_veil',     name:'Slip Veil',                        type:'Toolbar', load:40,  desc:'When activated, renders the user immune to targeting attacks for five seconds. Any move that locks on to the user will not function.' },
  { id:'entropy_vents', name:'Entropy Vents',                    type:'Toolbar', load:50,  desc:"When activated, M1 attacks will scale off of the user's Output for a short time at the cost of burning out part of their Technique Bar." },
  { id:'entropy_ray',   name:'Entropy Ray System',               type:'Toolbar', load:50,  desc:"When activated, charges and unleashes a beam of Cursed Energy forward that burns out the user's Technique Bar in exchange for stunning and heavily damaging opponents." },
  { id:'neural_pacing', name:'Neural-Pacing Module',             type:'Toolbar', load:50,  desc:'When activated, stops all stamina consumption for a brief period. After the time ends, all would-be used stamina is consumed and may guardbreak the user.' },
  { id:'overdrive',     name:'Overdrive Module',                 type:'Toolbar', load:75,  desc:'When activated, stops all Technique Bar consumption for a brief period. After the time ends, all would-be used Technique Bar is consumed and may guardbreak the user.' },
  { id:'falcon_talons', name:'Falcon Talons',                    type:'Toolbar', load:35,  desc:'When activated, the user will perform a quick backflip before lunging forwards towards the opponent. Useful to avoid attacks before quickly closing the gap.' },
  { id:'pulse_gaunt',   name:'Pulse Gauntlets',                  type:'Toolbar', load:35,  desc:'When activated, increase both the damage and knockback of the next skill.' },
  { id:'output_200',    name:'200% Output',                      type:'Toolbar', load:25,  desc:'When activated, reduces all skill cooldowns by half for 10 seconds.' },
  { id:'limitbreak',    name:'Limitbreak',                       type:'Toolbar', load:35,  desc:'When activated, the next skill used will deal twice as much damage.' },
  // ── VOW ──
  { id:'show_hand',     name:'Show Hand',                        type:'Vow',     load:0,   desc:"The user can make a vow by chanting \"I vow to show my hand.\" and pressing E. This will reveal their stamina bar to opponents, but allow them to see their opponent's stamina in exchange." },
  { id:'embarrassment', name:'Embarassment',                     type:'Vow',     load:0,   desc:'The user can make a vow by chanting "I vow to teach you a lesson." and pressing E. This will lower the user\'s weapon damage to that of training weapons.' },
];

// ============================================================
// TRELLO LINKS
// ============================================================
const GEAR_URLS = {
  'Executioner': 'https://trello.com/c/OlnZs5g9',
  'Projector':   'https://trello.com/c/29X5Dgsq',
  'Manipulator': 'https://trello.com/c/o7edgECO',
  'Constructor': 'https://trello.com/c/eqt8eXGf',
  'Ravager':     'https://trello.com/c/1iKkkVoB',
  'Sensor':      'https://trello.com/c/Veg9QlkR',
  'Interceptor': 'https://trello.com/c/dYDCOORd',
  'Usurper':     'https://trello.com/c/R0tM9hqW',
  'Hydra':       'https://trello.com/c/yCKvuof9',
};

const TECHNIQUE_URLS = {
  'Phantom Tears':       'https://trello.com/c/8uQIPp55',
  'Just A Nibble':       'https://trello.com/c/QLQfkUpt',
  'Spin':                'https://trello.com/c/SKkvI1mp',
  'Shivas Hands':        'https://trello.com/c/CZ78wFwo',
  'Ice':                 'https://trello.com/c/ottgqRdQ',
  'Grief Wardens':       'https://trello.com/c/NRtMUkez',
  'Divine Cultivation':  'https://trello.com/c/OkpAu36p',
  'The Hunter':          'https://trello.com/c/j6amBFBa',
  'Portals':             'https://trello.com/c/2rzTgDsu',
  'Sword Saint':         'https://trello.com/c/FmZqL4JM',
  'Reversal Fortune':    'https://trello.com/c/tzpVNmTC',
  'Sadako':              'https://trello.com/c/549J8gDK',
  'Luck Manipulation':   'https://trello.com/c/RERsSJRU',
  'Gravity':             'https://trello.com/c/f1JV4Ss4',
  'Maw Of Gluttony':     'https://trello.com/c/25CznGtX',
  'The Playbook':        'https://trello.com/c/AblfW4qt',
  'Betsy':               'https://trello.com/c/pA9K1xpB',
  'Vector Arrows':       'https://trello.com/c/SWqyFVoP',
  'Curse Butler':        'https://trello.com/c/mQ8XrQTx',
  'Damocles':            'https://trello.com/c/1o93lzOa',
  'Lightseeker':         'https://trello.com/c/399Nb0VK',
  'Thunder Spears':      'https://trello.com/c/bkZJfhtz',
  'Seraph':              'https://trello.com/c/TU1Eaxes',
  'Curse Storm':         'https://trello.com/c/xK1HfE24',
  'Basketball':          'https://trello.com/c/Z5o5ocSU',
  'Radiation':           'https://trello.com/c/cguJqhin',
  'Zodiacs':             'https://trello.com/c/2757RBzJ',
  'The Watcher':         'https://trello.com/c/emYS7wCF',
  'Tremor':              'https://trello.com/c/iHB6Uk9Z',
  'Spirit Walker':       'https://trello.com/c/xlXC41wG',
  'Beelzebub':           'https://trello.com/c/SFHt8kR6',
  'Fresh Cut':           'https://trello.com/c/MZEGbIsF',
  'Medium':              'https://trello.com/c/KziaHQMm',
  'Vampirism':           'https://trello.com/c/pMJNKMEE',
  'Energy Control':      'https://trello.com/c/5HB0j8uH',
  'Geddon':              'https://trello.com/c/QFtXD1pk',
  'Highlight Reel':      'https://trello.com/c/IkjfRYzs',
  'Railgun':             'https://trello.com/c/qHrY24Fc',
  'War Curse':           'https://trello.com/c/nUnhsEj5',
  'Edgelord':            'https://trello.com/c/ZmtGomUy',
  'Heavy Rain':          'https://trello.com/c/78oepbcS',
  'Judgement':           'https://trello.com/c/GjYdM0TI',
  'Pain Packer':         'https://trello.com/c/HYJts4cM',
  'The Balance':         'https://trello.com/c/t25WCLAY',
  'Ball Of Doom':        'https://trello.com/c/pKUXdq2Z',
  'Yang':                'https://trello.com/c/5KLdqnf2',
  'Yin':                 'https://trello.com/c/SzRLulRa',
  'Sun Breather':        'https://trello.com/c/WX1A91vr',
  'Shadow Realm':        'https://trello.com/c/5KbGbrtL',
  'Sea King':            'https://trello.com/c/2Fno18Wx',
  'Ink':                 'https://trello.com/c/KMfAFUTW',
  'Power Of Friendship': 'https://trello.com/c/SSFlp6Xa',
  'No Enemies':          'https://trello.com/b/zbEwABkY/cursed-gear-official',
  'Madness Factor':      'https://trello.com/c/lyuAxecC',
  'Bounce':              'https://trello.com/c/XM3XXCa7',
  'Star Link':           'https://trello.com/c/4z5FKaAM',
  'Ouji':                'https://trello.com/c/Mt2GTNI7',
  'Rain God':            'https://trello.com/c/AnVmPJKQ',
  'The Dealer':          'https://trello.com/c/BbATy2Dj',
  'The Shipyard':        'https://trello.com/c/E2zxNsuw',
  'Ghostwriter':         'https://trello.com/c/ELAu8KWO',
  'Hot Potato':          'https://trello.com/c/Qz4dSQHR',
  'Chains':              'https://trello.com/c/Nnq3EAyL',
  'The Meg':             'https://trello.com/c/AyPDUMi3',
  'Gilded Shadow':       'https://trello.com/c/2UBcw5EG',
  'Path To The Grave':   'https://trello.com/c/wvvM45d7',
  'Moth Flame':          'https://trello.com/c/dtG2xMDi',
  'Sky Rulers':          'https://trello.com/c/kpQYsLjf',
  'Powerup Box':         'https://trello.com/c/K1mY8Cje',
  'Wheres Your Head At': 'https://trello.com/c/zHBKZJIg',
};

const CYBERNETIC_URLS = {
  'monocyte_1':    'https://trello.com/c/Xcleos5j',
  'monocyte_2':    'https://trello.com/c/Xcleos5j',
  'monocyte_3':    'https://trello.com/c/Xcleos5j',
  'polyeth_1':     'https://trello.com/c/ZSyI06Te',
  'polyeth_2':     'https://trello.com/c/ZSyI06Te',
  'polyeth_3':     'https://trello.com/c/ZSyI06Te',
  'sanctified_1':  'https://trello.com/c/mtbGnR9y',
  'sanctified_2':  'https://trello.com/c/mtbGnR9y',
  'sanctified_3':  'https://trello.com/c/mtbGnR9y',
  'phantom_field': 'https://trello.com/c/aL3dOWDR',
  'mass_force':    'https://trello.com/c/kc45QETS',
  'afterimage':    'https://trello.com/c/SMSMS69c',
  'biofeedback':   'https://trello.com/c/1ghyO5Oq',
  'red_veil':      'https://trello.com/c/o8dB8UT9',
  'coffin_frame':  'https://trello.com/c/AMnWwrFd',
  'assault_loop':  'https://trello.com/c/2hdhvKqP',
  'rupture_strain':'https://trello.com/c/O6sJQXfd',
  'neural_slip':   'https://trello.com/c/1HBbfrk9',
  'resonance':     'https://trello.com/c/ri1ell9X',
  'overclock_res': 'https://trello.com/c/kzHPT3g0',
  'gorilla_arm':   'https://trello.com/c/TbMo5yhM',
  'reflector':     'https://trello.com/c/mUTnZzje',
  'two_handed':    'https://trello.com/c/rDIdwUsg',
  'stalker':       'https://trello.com/c/zq773Yde',
  'regeneration':  'https://trello.com/c/g7jV7Lq1',
  'steel_bones':   'https://trello.com/c/FSSFT1Xi',
  'steel_skin':    'https://trello.com/c/jEiBhBIE',
  'flawless_guard':'https://trello.com/c/14JRrXz3',
  'guard_fatigue': 'https://trello.com/c/8BMOpQoK',
  'effortless':    'https://trello.com/c/RvO365gP',
  'energized':     'https://trello.com/c/z6OCBQJB',
  'invisible':     'https://trello.com/c/akOA6v1d',
  'iron_arm':      'https://trello.com/c/rgm3KvHM',
  'kill_confirmed':'https://trello.com/c/tl8CayG3',
  'looter':        'https://trello.com/c/Uv7JNotq',
  'metal_legs':    'https://trello.com/c/khojXt46',
  'mook_hyang':    'https://trello.com/c/5UABjBFe',
  'stable':        'https://trello.com/c/ByuaoM4j',
  'tsumoe_tear':   'https://trello.com/c/s6bGWCmW',
  'overclock':     'https://trello.com/c/uRmxHkm2',
  'the_exception': 'https://trello.com/c/8qLiHZLr',
  'unbreakable':   'https://trello.com/c/QNAW1B3F',
  'disruptor':     'https://trello.com/c/InFvZnCW',
  'graviton':      'https://trello.com/c/DvejZg5b',
  'slip_veil':     'https://trello.com/c/CqdIP9g4',
  'entropy_vents': 'https://trello.com/c/ABI70VY5',
  'entropy_ray':   'https://trello.com/c/qIfT0349',
  'neural_pacing': 'https://trello.com/c/6o8SxRL2',
  'overdrive':     'https://trello.com/c/UccMAWfP',
  'falcon_talons': 'https://trello.com/c/u3R21WpJ',
  'pulse_gaunt':   'https://trello.com/c/TqiIOT9e',
  'output_200':    'https://trello.com/c/GHKYWC39',
  'limitbreak':    'https://trello.com/c/c6j24w88',
  'show_hand':     'https://trello.com/c/PvDzP1jM',
  'embarrassment': 'https://trello.com/c/XTVyeTJC',
};

function trelloBtn(url) {
  if (!url) return '';
  return `<a class="trello-link" href="${url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗ TRELLO</a>`;
}

// CT upgrade stats — each level costs 1 point flat
// Efficiency / Potency / Haste are the trio group (dynamic colour per investment)
const CT_STATS = [
  { key:'efficiency', name:'Efficiency', group:'trio' },
  { key:'potency',    name:'Potency',    group:'trio' },
  { key:'haste',      name:'Haste',      group:'trio' },
];
const CT_STAT_MAX = 10; // each stat caps at 10

// 60 base + up to 5 drives (×4 pts each) = 80 max
const BASE_CT_POINTS = 60;
const MAX_DRIVES     = 5;
const DRIVE_BONUS    = 4;

function getCtPointsTotal() {
  return BASE_CT_POINTS + (state.memoryDrives || 0) * DRIVE_BONUS;
}

// Cost to go from level (lv-1) to level lv: 1 for lv1-2, 2 for lv3-4, 3 for lv5-6, etc.
function ctLevelCost(lv) {
  if (lv <= 0) return 0;
  return Math.ceil(lv / 2);
}

// Total point cost to reach level lv from 0
function ctTotalCost(lv) {
  let cost = 0;
  for (let i = 1; i <= lv; i++) cost += ctLevelCost(i);
  return cost;
}

// Colour for trio cards based on individual level (0–10)
function trioColor(lv) {
  const stops = [
    '#2e2820','#38301e','#42381e','#524020','#624e24',
    '#7a6028','#926e2e','#aa8838','#c0a040','#c8a84a','#e0c060'
  ];
  return stops[Math.min(lv, 10)];
}
function trioGlow(lv) {
  if (lv === 0) return 'none';
  const alphas = [0,0.05,0.07,0.09,0.12,0.15,0.18,0.22,0.26,0.30,0.38];
  return `0 0 ${4 + lv * 2}px rgba(200,168,74,${alphas[Math.min(lv,10)]})`;
}

// Player Grades — rank system with stat % buff and cybernetic load cap
const PLAYER_GRADES = [
  { name:'Ungraded',        buff:0,  cyberLoad:100 },
  { name:'Grade 4',         buff:5,  cyberLoad:110 },
  { name:'Grade 3',         buff:10, cyberLoad:120 },
  { name:'Semi-Grade 2',    buff:15, cyberLoad:130 },
  { name:'Grade 2',         buff:20, cyberLoad:140 },
  { name:'Semi-Grade 1',    buff:25, cyberLoad:150 },
  { name:'Grade 1',         buff:30, cyberLoad:160 },
  { name:'Special Grade 1', buff:35, cyberLoad:170 },
  { name:'Special Grade',   buff:40, cyberLoad:180 },
];

// ============================================================
// STATE
// ============================================================
let state = {
  buildName: '',
  gear: null,
  clan: '',
  technique: null,
  attrs: { physicality:1, durability:1, output:1, efficiency:1, awareness:1, dexterity:1 },
  packs: { physicality:0, durability:0, output:0, efficiency:0, awareness:0, dexterity:0 },
  dreams: { physicality:0, durability:0, output:0, efficiency:0, awareness:0, dexterity:0 },
  apCyberUpgrades: 0,
  royalAttrBuff: '',
  techFilter: 'all',
  memoryDrives: 0,
  ctLevels: { efficiency:0, potency:0, haste:0, evo:0 },
  playerGrade: '',
  cybernetics: [],
  cyberFilter: 'all',
  relics: { fingerOfShiva: 0 },
};

// Derived helpers
function getPlayerLevel() {
  // Each attr starts at 1 (baseline), so level 1 = all at 1. Subtract the 5 extra baseline points.
  return Object.values(state.attrs).reduce((a, b) => a + b, 0) - (ATTRIBUTES.length - 1);
}

function getMilestoneBonus() {
  return Math.floor(getPlayerLevel() / MILESTONE_INTERVAL);
}

function getAPEarned() {
  return Math.floor(getPlayerLevel() / 25);
}

function getAPMax() {
  return Math.floor(MAX_LEVEL / 25); // 6 — max AP ever earnable
}

function getRelicMultiplier() {
  // Buff only active when all 3 fingers are obtained
  return (state.relics?.fingerOfShiva || 0) >= 3 ? 1.10 : 1.0;
}

function getPacksUsed() {
  return Object.values(state.packs).reduce((a, b) => a + b, 0);
}

function getAPUsed() {
  return getPacksUsed() + (state.apCyberUpgrades || 0);
}

function getAPAvailable() {
  return Math.max(0, getAPEarned() - getAPUsed());
}

function getDreamPointsUsed() {
  return Object.values(state.dreams).reduce((a, b) => a + b, 0);
}

function getStatTotal(key) {
  // Subtract 1 to normalise the baseline: attrs start at 1 visually but grade scaling is identical to the old 0-start behaviour.
  return Math.max(0, (state.attrs[key] || 0) - 1) + getMilestoneBonus() + (state.packs[key] || 0) * PTS_PER_PACK + (state.dreams[key] || 0);
}

function getPlayerGradeData() {
  return PLAYER_GRADES.find(g => g.name === state.playerGrade) || null;
}

function getStatBuff() {
  const g = getPlayerGradeData();
  return g ? g.buff : 0;
}

// Base effective stat — attrs + milestone + packs + cybernetics + relic, NO grade buff
// Used for radar chart and grade letter so the visual doesn't inflate with grade
function getEffectiveStat(key) {
  const base = getStatTotal(key) + getCyberneticStatBonus(key);
  return Math.floor(base * getRelicMultiplier());
}

// Returns true if the selected clan is royal
function isRoyalClan() {
  return CLAN_DATA[state.clan]?.tier === 'royal';
}

// Grade + royal buff combined — shown in brackets next to base stat
function getGradedStat(key) {
  const raw      = getEffectiveStat(key);
  const gradePct = getStatBuff();
  const royalMul = (isRoyalClan() && state.royalAttrBuff === key) ? 1.10 : 1.0;
  if (gradePct === 0 && royalMul === 1.0) return null;
  return Math.floor(raw * (1 + gradePct / 100) * royalMul);
}

function getCyberneticLoadCap() {
  const g = getPlayerGradeData();
  if (!g) return null;
  const nierMult = state.clan === 'Nier|royal' ? 1.2 : 1;
  return Math.floor(g.cyberLoad * nierMult);
}

function getCyberneticLoadUsed() {
  return state.cybernetics.reduce((sum, c) => sum + (c.load || 0), 0);
}

function getCyberneticStatBonus(key) {
  return state.cybernetics.reduce((sum, c) => sum + (c.bonuses?.[key] || 0), 0);
}

// ============================================================
// INIT
// ============================================================
function init() {
  buildAttrList();
  buildRadarChart();
  buildGearGrid();
  buildTechGrid();
  buildEquippedCybernetics();
  updateBudget();
  loadFromHash();
}

// ============================================================
// RADAR CHART
// ============================================================
function buildRadarChart() {
  const svg = document.getElementById('radarSvg');
  const cx = 130, cy = 130, r = 90;
  const attrs = ATTRIBUTES.map((a, i) => {
    const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
    const val = getEffectiveStat(a.key);
    return { ...a, angle, val, pct: Math.min(val / RADAR_SCALE, 1) };
  });

  let html = '';

  // Reference hexagons
  [0.25, 0.5, 0.75, 1.0].forEach(scale => {
    const pts = attrs.map(a => {
      const x = cx + Math.cos(a.angle) * r * scale;
      const y = cy + Math.sin(a.angle) * r * scale;
      return `${x},${y}`;
    }).join(' ');
    html += `<polygon points="${pts}" fill="none" stroke="rgba(200,168,74,${scale===1?0.18:0.07})" stroke-width="1"/>`;
  });

  // Axes
  attrs.forEach(a => {
    const x = cx + Math.cos(a.angle) * r;
    const y = cy + Math.sin(a.angle) * r;
    html += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(200,168,74,0.1)" stroke-width="1"/>`;
  });

  // Data polygon
  const dataPts = attrs.map(a => {
    const x = cx + Math.cos(a.angle) * r * a.pct;
    const y = cy + Math.sin(a.angle) * r * a.pct;
    return `${x},${y}`;
  }).join(' ');
  html += `<polygon points="${dataPts}" fill="rgba(200,168,74,0.1)" stroke="#c8a84a" stroke-width="1.5"/>`;

  // Data points
  attrs.forEach(a => {
    const x = cx + Math.cos(a.angle) * r * a.pct;
    const y = cy + Math.sin(a.angle) * r * a.pct;
    html += `<circle cx="${x}" cy="${y}" r="3" fill="#c8a84a"/>`;
  });

  // Labels
  attrs.forEach(a => {
    const lr = r + 28;
    const x = cx + Math.cos(a.angle) * lr;
    const y = cy + Math.sin(a.angle) * lr;
    const grade = getGrade(a.val);
    const gradedVal = getGradedStat(a.key);
    const gradedGrade = gradedVal !== null ? getGrade(gradedVal) : null;
    html += `<text x="${x}" y="${y-5}" text-anchor="middle" fill="#3a3830" font-family="IBM Plex Mono,monospace" font-size="8" letter-spacing="1">${a.name.toUpperCase()}</text>`;
    html += `<text x="${x}" y="${y+7}" text-anchor="middle" fill="#c8a84a" font-family="IBM Plex Mono,monospace" font-size="10">${grade}</text>`;
    if (gradedGrade) {
      html += `<text x="${x}" y="${y+18}" text-anchor="middle" fill="rgba(200,168,74,0.55)" font-family="IBM Plex Mono,monospace" font-size="8">(${gradedGrade})</text>`;
    }
  });

  svg.innerHTML = html;
}

// ============================================================
// ATTRIBUTES
// ============================================================
function buildAttrList() {
  const container = document.getElementById('attrList');
  container.innerHTML = '';
  const lvl = getPlayerLevel();
  const atMaxLevel = lvl >= MAX_LEVEL;
  const dreamsUsed = getDreamPointsUsed();
  const dreamsLeft = MAX_DREAM_POINTS - dreamsUsed;

  ATTRIBUTES.forEach(attr => {
    const total = getEffectiveStat(attr.key);
    const grade = getGrade(total);
    const gc = gradeClass(grade);
    const fillPct = Math.min(total / RADAR_SCALE * 100, 100);
    const base = state.attrs[attr.key] || 0;
    const packPts = (state.packs[attr.key] || 0) * PTS_PER_PACK;
    const dreamPts = state.dreams[attr.key] || 0;
    const softCap = isAboveSoftCap(total);
    const softCapPct = GRADE_THRESHOLDS[SOFT_CAP_INDEX] / RADAR_SCALE * 100;
    const canAddPack = getAPMax() - getAPUsed() > 0;
    const canRemovePack = (state.packs[attr.key] || 0) > 0;

    const graded = getGradedStat(attr.key);
    const gradedGrade = graded !== null ? getGrade(graded) : null;
    const gradedGc    = gradedGrade ? gradeClass(gradedGrade) : '';

    let bonusTags = '';
    if (packPts > 0) bonusTags += `<div class="attr-pack-pts">+${packPts} SP</div>`;
    if (dreamPts > 0) bonusTags += `<div class="attr-pack-pts" style="color:#b060e0">+${dreamPts} DR</div>`;

    container.innerHTML += `
      <div class="attr-row" title="${attr.desc}">
        <div class="attr-name-cell">
          <div class="attr-name">${attr.name}${softCap ? ' <span class="soft-cap-tag">S</span>' : ''}</div>
          ${bonusTags}
          <div class="attr-grade-row">
            <span class="${gc}" style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:1px">${grade}</span>
            ${gradedGrade ? `<span class="attr-graded-grade ${gradedGc}">(${gradedGrade})</span>` : ''}
          </div>
        </div>
        <div class="attr-track" onclick="trackClick(event,'${attr.key}')">
          <div class="attr-fill ${softCap ? 'above-cap' : ''}" id="fill-${attr.key}" style="width:${fillPct}%"></div>
          <div class="soft-cap-line" style="left:${softCapPct}%"></div>
        </div>
        <input class="attr-input" type="number" min="1" max="${MAX_LEVEL}" value="${base}"
          id="inp-${attr.key}"
          onchange="setAttr('${attr.key}',parseInt(this.value)||1)">
        <div class="attr-total">${total}</div>
        <div class="sp-btn-wrap">
          ${canRemovePack ? `<div class="sp-btn sp-minus" onclick="adjustPack('${attr.key}',-1)" title="Remove stat pack">−</div>` : ''}
          <div class="sp-btn ${canAddPack ? '' : 'disabled'}" onclick="${canAddPack ? `adjustPack('${attr.key}',1)` : ''}" title="${canAddPack ? 'Add stat pack (+'+PTS_PER_PACK+' pts)' : 'No AP left'}">SP</div>
          ${atMaxLevel ? `
            <input type="number" min="0" max="${(state.dreams[attr.key]||0) + dreamsLeft}" value="${state.dreams[attr.key]||0}"
              onchange="setDream('${attr.key}',parseInt(this.value)||0)"
              oninput="setDream('${attr.key}',parseInt(this.value)||0)"
              title="Dream points (${dreamsLeft} left)"
              style="width:36px;text-align:center;border:1px solid #b060e0;background:transparent;color:#b060e0;font-family:'IBM Plex Mono',monospace;font-size:10px;border-radius:2px;padding:1px 2px">
            <div class="sp-btn disabled" style="border-color:#b060e0;color:#b060e0;font-size:8px;cursor:default">DR</div>
          ` : ''}
        </div>
      </div>`;
  });
}


function adjustPack(key, dir) {
  const newVal = (state.packs[key] || 0) + dir;
  if (newVal < 0) return;
  if (dir > 0 && getAPMax() - getAPUsed() <= 0) return;
  state.packs[key] = newVal;
  buildAttrList();
  buildRadarChart();
  updateBudget();
}

function adjustDream(key, dir) {
  const newVal = (state.dreams[key] || 0) + dir;
  if (newVal < 0) return;
  if (dir > 0 && getDreamPointsUsed() >= MAX_DREAM_POINTS) return;
  state.dreams[key] = newVal;
  buildAttrList();
  buildRadarChart();
  updateBudget();
}

function setDream(key, val) {
  const current = state.dreams[key] || 0;
  const used = getDreamPointsUsed();
  const available = MAX_DREAM_POINTS - used + current;
  val = Math.max(0, Math.min(available, val || 0));
  state.dreams[key] = val;
  buildAttrList();
  buildRadarChart();
  updateBudget();
}

function adjustCyberUpgrade(dir) {
  const newVal = (state.apCyberUpgrades || 0) + dir;
  if (newVal < 0) return;
  if (dir > 0 && getAPMax() - getAPUsed() <= 0) return;
  state.apCyberUpgrades = newVal;
  buildAttrList();
  updateBudget();
}

function setAttr(key, val) {
  val = Math.max(1, Math.min(MAX_LEVEL, val || 1));
  const otherSpent = getPlayerLevel() - (state.attrs[key]||0);
  if (otherSpent + val > MAX_LEVEL) val = MAX_LEVEL - otherSpent;
  val = Math.max(1, val);
  state.attrs[key] = val;
  const inp = document.getElementById('inp-'+key);
  if (inp && parseInt(inp.value) !== val) inp.value = val;
  updateBudget();
  buildAttrList();
  buildRadarChart();
}

function trackClick(e, key) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  // Reverse-calc: what base value gets this total?
  const targetTotal = Math.round(pct * RADAR_SCALE);
  const bonus = getMilestoneBonus();
  const packPts = (state.packs[key] || 0) * PTS_PER_PACK;
  const dreamPts = state.dreams[key] || 0;
  setAttr(key, Math.max(1, targetTotal - bonus - packPts - dreamPts));
}

function updateBudget() {
  const lvl = getPlayerLevel();
  const apEarned = getAPEarned();
  const packsUsed = getPacksUsed();
  const cyberUp = state.apCyberUpgrades || 0;
  const dreamsUsed = getDreamPointsUsed();
  document.getElementById('budgetCount').textContent = lvl + ' / ' + MAX_LEVEL;
  document.getElementById('budgetFill').style.width = (lvl/MAX_LEVEL*100) + '%';
  document.getElementById('gradeLabel').textContent = 'LVL ' + lvl;

  // AP budget row
  const apMax = getAPMax();
  const apEl = document.getElementById('apCount');
  if (apEl) apEl.textContent = `${apEarned} earned · ${packsUsed} SP · ${cyberUp} CU · ${apMax - getAPUsed()} left`;

  // Dream points row
  const dreamEl = document.getElementById('dreamCount');
  if (dreamEl) {
    dreamEl.textContent = dreamsUsed + ' / ' + MAX_DREAM_POINTS;
    const dreamRow = dreamEl.closest('.budget-bar');
    if (dreamRow) dreamRow.style.display = lvl >= MAX_LEVEL ? '' : 'none';
  }

  // Cyber upgrade controls
  const cuEl = document.getElementById('cyberUpgradeControls');
  if (cuEl) {
    const canUp = getAPAvailable() > 0;
    const canDown = cyberUp > 0;
    cuEl.innerHTML = `
      <span class="budget-label">Cybernetic Upgrades</span>
      <span class="budget-count" style="display:flex;align-items:center;gap:4px">
        ${canDown ? `<span class="sp-btn sp-minus" onclick="adjustCyberUpgrade(-1)" style="font-size:10px;width:18px;height:18px;line-height:18px">−</span>` : ''}
        <span>${cyberUp}</span>
        ${canUp ? `<span class="sp-btn" onclick="adjustCyberUpgrade(1)" style="font-size:8px;width:18px;height:18px;line-height:18px">+</span>` : ''}
      </span>`;
  }
}

// ============================================================
// CYBERNETICS
// ============================================================
function buildCyberneticsTab() {
  const container = document.getElementById('cyberGrid');
  const filter = state.cyberFilter || 'all';
  const filtered = filter === 'all' ? CYBERNETICS : CYBERNETICS.filter(c => c.type === filter);
  const fingers = state.relics?.fingerOfShiva || 0;
  const hasRelic = fingers === 7;

  // Relic section — always shown at top
  let relicHtml = `
    <div style="grid-column:1/-1;margin-bottom:4px">
      <div style="font-size:9px;letter-spacing:2px;color:var(--text-muted);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border)">RELICS</div>
      <div class="cyber-card ${hasRelic ? 'selected' : ''}" onclick="cycleFinger()" style="border-color:${hasRelic ? '#e0c060' : 'var(--border)'};cursor:pointer">
        <div class="tier-stripe" style="background:#e0c060"></div>
        <div class="cyber-card-header">
          <div class="cyber-name" style="color:#e0c060">Finger of Shiva</div>
          <span class="cyber-type-badge" style="color:#e0c060">RELIC</span>
        </div>
        <div class="cyber-card-meta">
          <span class="cyber-load-tag" style="color:#e0c060">${fingers} / 3 FINGERS</span>
          ${hasRelic ? `<span style="font-size:9px;color:#e0c060;font-weight:600">✦ +10% ALL ATTRS</span>` : ''}
        </div>
        <div class="cyber-desc">An incredibly rare item obtained from Cursed Caches or the Culling Games. Consuming all three fingers grants unique face markings and a permanent +10% buff to all attributes.</div>
      </div>
      <div style="font-size:9px;letter-spacing:2px;color:var(--text-muted);margin-top:12px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border)">CYBERNETICS</div>
    </div>`;

  container.innerHTML = relicHtml;
  filtered.forEach(c => {
    const equipped = state.cybernetics.find(e => e.id === c.id);
    const color = CYBER_TYPE_COLORS[c.type];
    container.innerHTML += `
      <div class="cyber-card ${equipped ? 'selected' : ''}" onclick="toggleCybernetic('${c.id}')">
        <div class="tier-stripe" style="background:${color}"></div>
        <div class="cyber-card-header">
          <div class="cyber-name">${c.name}</div>
          <span class="cyber-type-badge" style="color:${color}">${c.type.toUpperCase()}</span>
        </div>
        <div class="cyber-card-meta">
          <span class="cyber-load-tag">LOAD ${c.load}</span>
          ${trelloBtn(CYBERNETIC_URLS[c.id])}
        </div>
        <div class="cyber-desc">${c.desc}</div>
      </div>`;
  });
}

function cycleFinger() {
  if (!state.relics) state.relics = { fingerOfShiva: 0 };
  state.relics.fingerOfShiva = (state.relics.fingerOfShiva + 3) % 4;
  buildCyberneticsTab();
  buildAttrList();
  buildRadarChart();
}

function filterCyber(type, btn) {
  state.cyberFilter = type;
  document.querySelectorAll('.cyber-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildCyberneticsTab();
}

function toggleCybernetic(id) {
  const idx = state.cybernetics.findIndex(c => c.id === id);
  if (idx >= 0) {
    state.cybernetics.splice(idx, 1);
  } else {
    const base = CYBERNETICS.find(c => c.id === id);
    state.cybernetics.push({
      id,
      load: base.load,
      bonuses: { physicality:0, durability:0, output:0, efficiency:0, awareness:0, dexterity:0 },
    });
  }
  refreshCyberDependents();
  buildCyberneticsTab();
}

function setCyberLoad(id, val) {
  const entry = state.cybernetics.find(c => c.id === id);
  if (!entry) return;
  entry.load = Math.max(0, parseInt(val) || 0);
  updateCyberLoadDisplay();
}

function setCyberBonus(id, attr, val) {
  const entry = state.cybernetics.find(c => c.id === id);
  if (!entry) return;
  const base = CYBERNETICS.find(c => c.id === id);
  if (base && base.load === 0) return;
  entry.bonuses[attr] = Math.max(-30, Math.min(30, parseInt(val) || 0));
  // Auto-recalculate load: base + floor(bonus/10)*5 for each positive bonus
  const extraLoad = ATTRIBUTES.reduce((sum, a) => {
    const b = entry.bonuses[a.key] || 0;
    return sum + (b > 0 ? Math.floor(b / 10) * 5 : 0);
  }, 0);
  entry.load = base.load + extraLoad;
  buildEquippedCybernetics();
  updateCyberLoadDisplay();
  buildAttrList();
  buildRadarChart();
}

function buildEquippedCybernetics() {
  const panel = document.getElementById('equippedCyberPanel');
  if (state.cybernetics.length === 0) { panel.style.display = 'none'; return; }
  panel.style.display = '';
  const used = getCyberneticLoadUsed();
  const cap = getCyberneticLoadCap();
  const overload = cap !== null && used > cap;
  const badge = document.getElementById('cyberLoadBadge');
  badge.textContent = used + (cap !== null ? ' / ' + cap : '') + ' LOAD';
  badge.style.color = overload ? 'var(--accent-red)' : '';
  document.getElementById('equippedCyberList').innerHTML = state.cybernetics.map(entry => {
    const base = CYBERNETICS.find(c => c.id === entry.id);
    if (!base) return '';
    const color = CYBER_TYPE_COLORS[base.type];
    const isZeroLoad = base.load === 0;
    const bonusInputs = isZeroLoad ? '' : ATTRIBUTES.filter(a => a.key !== 'durability').map(a =>
      `<div class="cyber-bonus-field">
        <div class="cyber-bonus-label">${a.name.slice(0,3).toUpperCase()}</div>
        <input class="cyber-bonus-input" type="number" min="-30" max="30" value="${entry.bonuses[a.key]||0}"
          onchange="setCyberBonus('${entry.id}','${a.key}',this.value)">
      </div>`
    ).join('');
    return `
      <div class="equipped-cyber-item">
        <div class="equipped-cyber-header">
          <div class="equipped-cyber-name" style="color:${color}">${base.name}</div>
          <div class="equipped-cyber-type" style="color:${color}">${base.type}</div>
          <div class="equipped-cyber-remove" onclick="toggleCybernetic('${entry.id}')">✕</div>
        </div>
        <div class="equipped-cyber-load-row">
          <span class="cyber-load-label">Load</span>
          <input class="cyber-load-input" type="number" min="0" value="${entry.load}"
            onchange="setCyberLoad('${entry.id}',this.value)"
            oninput="setCyberLoad('${entry.id}',this.value)">
        </div>
        <div class="cyber-bonus-grid">${bonusInputs}</div>
      </div>`;
  }).join('');
}

function refreshCyberDependents() {
  buildEquippedCybernetics();
  updateCyberLoadDisplay();
  buildAttrList();
  buildRadarChart();
}

// ============================================================
// PLAYER GRADE
// ============================================================
function updateGrade() {
  state.playerGrade = document.getElementById('gradeSelect').value;
  updateCyberLoadDisplay();
  buildAttrList();
  buildRadarChart();
}

function updateCyberLoadDisplay() {
  const g = getPlayerGradeData();
  const preview = document.getElementById('gradePreview');
  if (!g) { preview.style.display = 'none'; return; }
  preview.style.display = '';
  document.getElementById('gradeBuffLabel').textContent = g.buff > 0 ? '+' + g.buff + '% to all stats (shown in brackets)' : 'No stat buff';
  const cap = getCyberneticLoadCap();
  const used = getCyberneticLoadUsed();
  const overload = used > cap;
  const loadVal = document.getElementById('cyberLoadVal');
  loadVal.textContent = used + ' / ' + cap + (overload ? '  ⚠ OVERLOAD' : '');
  loadVal.style.color = overload ? 'var(--accent-red)' : '';
  const fill = document.getElementById('cyberLoadFill');
  fill.style.width = cap > 0 ? Math.min(used / cap * 100, 100) + '%' : '0%';
  fill.style.background = overload ? 'var(--accent-red)' : '';
}

// ============================================================
// GEAR GRID
// ============================================================
function buildGearGrid() {
  const container = document.getElementById('gearGrid');
  container.innerHTML = '';
  GEARS.forEach(g => {
    const sel = state.gear === g.name ? 'selected' : '';
    const tagsHtml = g.tags.map(t => `<span class="gear-tag">${t}</span>`).join('');
    container.innerHTML += `
      <div class="gear-card ${sel}" onclick="selectGear('${g.name}')">
        <div class="gear-card-top">
          <div class="gear-name">${g.name}</div>
          ${trelloBtn(GEAR_URLS[g.name])}
        </div>
        ${g.desc ? `<div class="gear-tagline">${g.desc}</div>` : ''}
        <div class="gear-tags">${tagsHtml}</div>
      </div>`;
  });
}

function selectGear(name) {
  state.gear = name;
  document.getElementById('gearSelect').value = name;
  buildGearGrid();
}

function updateGearPreview() {
  state.gear = document.getElementById('gearSelect').value;
  buildGearGrid();
}

// ============================================================
// CLAN
// ============================================================
function updateClanPreview() {
  const val = document.getElementById('clanSelect').value;
  state.clan = val;
  const data = CLAN_DATA[val];
  const dot = document.getElementById('clanDot');
  const desc = document.getElementById('clanDesc');
  if (data) {
    dot.style.background = TIER_COLORS[data.tier];
    desc.textContent = data.desc;
    desc.style.color = 'var(--text)';
  } else {
    dot.style.background = 'var(--text-muted)';
    desc.textContent = 'Select a clan to see its passive ability.';
    desc.style.color = 'var(--text-dim)';
    state.royalAttrBuff = '';
  }
  // Royal buff picker
  const existing = document.getElementById('royalAttrRow');
  if (existing) existing.remove();
  if (data && data.tier === 'royal') {
    const row = document.createElement('div');
    row.id = 'royalAttrRow';
    row.className = 'royal-attr-row';
    row.innerHTML = `
      <div class="field-label" style="margin-top:8px"><span style="color:var(--royal)">◆</span> Royal Attribute Buff <span style="color:var(--text-muted);font-size:9px">+10%</span></div>
      <select id="royalAttrSelect" onchange="setRoyalAttrBuff(this.value)">
        <option value="">— Choose attribute —</option>
        ${ATTRIBUTES.map(a => `<option value="${a.key}" ${state.royalAttrBuff === a.key ? 'selected' : ''}>${a.name}</option>`).join('')}
      </select>`;
    document.getElementById('clanPreview').appendChild(row);
  } else {
    state.royalAttrBuff = '';
  }
  updateCyberLoadDisplay();
  buildAttrList();
  buildRadarChart();
}

function setRoyalAttrBuff(key) {
  state.royalAttrBuff = key;
  buildAttrList();
  buildRadarChart();
}

// ============================================================
// TECHNIQUES
// ============================================================
function buildTechGrid() {
  const container = document.getElementById('techGrid');
  container.innerHTML = '';
  const filtered = state.techFilter === 'all' ? TECHNIQUES : TECHNIQUES.filter(t => t.tier === state.techFilter);
  filtered.forEach(t => {
    const sel = state.technique === t.name ? 'selected' : '';
    const color = TIER_COLORS[t.tier];
    container.innerHTML += `
      <div class="tech-card ${sel}" onclick="selectTech('${t.name.replace(/'/g,"\\'")}')">
        <div class="tier-stripe" style="background:${color}"></div>
        <div class="tech-name" style="color:${color}">${t.name}</div>
        <div class="tech-meta">
          <span class="tech-tier-label" style="color:${color}">${t.tier.toUpperCase()}</span>
          <span class="tech-roll">${t.roll}%</span>
          ${trelloBtn(TECHNIQUE_URLS[t.name])}
        </div>
      </div>`;
  });
}

function selectTech(name) {
  if (state.technique === name) {
    state.technique = null;
  } else {
    state.technique = name;
    // Reset CT upgrades when switching technique
    state.ctLevels = { efficiency:0, potency:0, haste:0, evo:0 };
    state.memoryDrives = 0;
    if (name === 'Divine Cultivation') {
      showToast('Divine Cultivation currently does not have rebirth scaling, im working on it for 1.2', 6000);
    }
  }
  buildTechGrid();
  buildCtUpgradePanel();
}

function filterTech(tier, btn) {
  state.techFilter = tier;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildTechGrid();
}

// ============================================================
// CT UPGRADE PANEL
// ============================================================
function getCtPointsSpent() {
  return Object.values(state.ctLevels).reduce((sum, lv) => sum + ctTotalCost(lv), 0);
}

function getCtPointsAvailable() {
  return getCtPointsTotal() - getCtPointsSpent();
}

function buildCtUpgradePanel() {
  const panel = document.getElementById('ctUpgradePanel');
  if (!state.technique) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = '';

  const tech = TECHNIQUES.find(t => t.name === state.technique);
  const color = tech ? TIER_COLORS[tech.tier] : '#aaa';
  const maxEvo = tech ? (tech.evo || 0) : 0;
  document.getElementById('ctSelectedName').innerHTML = `<span style="color:${color}">${state.technique}</span>`;

  // Drive pips (up to 5)
  const pipsEl = document.getElementById('drivePips');
  let pipsHtml = '';
  for (let i = 1; i <= MAX_DRIVES; i++) {
    const active = i <= state.memoryDrives ? 'active' : '';
    pipsHtml += `<div class="drive-pip ${active}" onclick="toggleDrive(${i})">${i <= state.memoryDrives ? '◈' : i}</div>`;
  }
  pipsEl.innerHTML = pipsHtml;
  document.getElementById('driveInfo').textContent = `${state.memoryDrives} / ${MAX_DRIVES} drives equipped  ·  +${state.memoryDrives * DRIVE_BONUS} pts`;

  // Points label
  const avail = getCtPointsAvailable();
  const total = getCtPointsTotal();
  document.getElementById('ctPointsLabel').textContent = avail + ' / ' + total + ' PTS';
  document.getElementById('ctPointsLabel').style.color = avail === 0 ? '#e05555' : '';

  // Upgrade cards
  const upgradesEl = document.getElementById('ctUpgrades');
  let html = '';

  // Trio: Efficiency, Potency, Haste
  ['efficiency','potency','haste'].forEach(key => {
    const s = CT_STATS.find(x => x.key === key);
    const lv = state.ctLevels[key] || 0;
    const nextCost = ctLevelCost(lv + 1);
    const canUp = lv < CT_STAT_MAX && avail >= nextCost;
    const canDown = lv > 0;
    const col = trioColor(lv);
    const glow = trioGlow(lv);
    html += `
      <div class="ct-upgrade-card trio" style="border-color:${col};box-shadow:${glow}">
        <div class="ct-upgrade-bar" style="background:${col};opacity:${0.15 + lv*0.17}"></div>
        <div class="ct-upgrade-label" style="color:${col}">${s.name}</div>
        <div class="ct-upgrade-controls">
          <div class="ct-upgrade-btn ${canDown?'':'disabled'}" onclick="${canDown?`ctAdjust('${key}',-1)`:''}">&minus;</div>
          <div class="ct-upgrade-level" style="color:${col}">${lv}</div>
          <div class="ct-upgrade-btn ${canUp?'':'disabled'}" onclick="${canUp?`ctAdjust('${key}',1)`:''}">&plus;</div>
        </div>
        <div class="ct-upgrade-cost" style="color:${col}">${lv < CT_STAT_MAX ? `${lv} / ${CT_STAT_MAX} · next: ${nextCost}pt` : 'MAX'}</div>
      </div>`;
  });

  // EVO (only if technique has evos)
  if (maxEvo > 0) {
    const lv = Math.min(state.ctLevels.evo || 0, maxEvo);
    const nextCost = ctLevelCost(lv + 1);
    const canUp = lv < maxEvo && avail >= nextCost;
    const canDown = lv > 0;
    html += `
      <div class="ct-upgrade-card evo">
        <div class="ct-upgrade-label">EVO</div>
        <div class="ct-upgrade-controls">
          <div class="ct-upgrade-btn ${canDown?'':'disabled'}" onclick="${canDown?`ctAdjust('evo',-1)`:''}">&minus;</div>
          <div class="ct-upgrade-level">${lv}</div>
          <div class="ct-upgrade-btn ${canUp?'':'disabled'}" onclick="${canUp?`ctAdjust('evo',1)`:''}">&plus;</div>
        </div>
        <div class="ct-upgrade-cost">${lv < maxEvo ? `${lv} / ${maxEvo} · next: ${nextCost}pt` : 'MAX'}</div>
      </div>`;
  }

  upgradesEl.innerHTML = html;
}

function toggleDrive(n) {
  state.memoryDrives = state.memoryDrives === n ? n - 1 : n;
  clampCtLevels();
  buildCtUpgradePanel();
}

function ctAdjust(key, dir) {
  const maxLv = key === 'evo'
    ? (TECHNIQUES.find(t => t.name === state.technique)?.evo || 0)
    : CT_STAT_MAX;
  const curLv = state.ctLevels[key] || 0;
  const newLv = curLv + dir;
  if (newLv < 0 || newLv > maxLv) return;
  if (dir > 0 && getCtPointsAvailable() < ctLevelCost(newLv)) return;
  state.ctLevels[key] = newLv;
  buildCtUpgradePanel();
}

function clampCtLevels() {
  const total = getCtPointsTotal();
  const keys = ['evo','haste','potency','efficiency'];
  let spent = getCtPointsSpent();
  while (spent > total) {
    for (const k of keys) {
      if (state.ctLevels[k] > 0 && spent > total) {
        const cost = ctLevelCost(state.ctLevels[k]);
        state.ctLevels[k]--;
        spent -= cost;
      }
    }
  }
}

// ============================================================
// TABS
// ============================================================
function switchTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  el.classList.add('active');
  if (id === 'summary') buildSummary();
  if (id === 'cybernetics') buildCyberneticsTab();
}

// ============================================================
// SUMMARY
// ============================================================
function buildSummary() {
  const clanData = CLAN_DATA[state.clan];
  const gradeData = getPlayerGradeData();
  const lvl = getPlayerLevel();
  const tech = state.technique ? TECHNIQUES.find(t=>t.name===state.technique) : null;

  let ctHtml = '';
  if (tech) {
    const totalPts = getCtPointsTotal();
    const usedPts  = getCtPointsSpent();
    const maxEvo   = tech.evo || 0;
    const allStats = [...CT_STATS, ...(maxEvo > 0 ? [{ key:'evo', name:'EVO' }] : [])];
    ctHtml = `
      <div class="summary-block" style="grid-column:1/-1">
        <div class="summary-block-title">Technique Upgrades</div>
        <div class="summary-row"><span class="summary-key">Drives</span><span class="summary-val">${state.memoryDrives} / ${MAX_DRIVES}  (+${state.memoryDrives * DRIVE_BONUS} pts)</span></div>
        <div class="summary-row"><span class="summary-key">Points Used</span><span class="summary-val">${usedPts} / ${totalPts}</span></div>
        ${allStats.map(s => {
          const lv = state.ctLevels[s.key] || 0;
          const cap = s.key === 'evo' ? maxEvo : CT_STAT_MAX;
          return `<div class="summary-row"><span class="summary-key">${s.name}</span><span class="summary-val">${lv} / ${cap}</span></div>`;
        }).join('')}
      </div>`;
  }

  document.getElementById('summaryGrid').innerHTML = `
    <div class="summary-block">
      <div class="summary-block-title">Character</div>
      <div class="summary-row"><span class="summary-key">Build</span><span class="summary-val">${document.getElementById('buildName').value || '—'}</span></div>
      <div class="summary-row"><span class="summary-key">Gear</span><span class="summary-val">${state.gear || '—'}</span></div>
      <div class="summary-row"><span class="summary-key">Clan</span>
        <span class="summary-val" style="color:${clanData ? TIER_COLORS[clanData.tier] : ''}">
          ${state.clan ? state.clan.split('|')[0] : '—'}${clanData ? ' ('+clanData.tier.toUpperCase()+')' : ''}
        </span>
      </div>
      <div class="summary-row"><span class="summary-key">Technique</span>
        <span class="summary-val" style="color:${tech ? TIER_COLORS[tech.tier] : ''}">
          ${tech ? tech.name + ' ('+tech.roll+'%)' : '—'}
        </span>
      </div>
      <div class="summary-row"><span class="summary-key">Player Grade</span>
        <span class="summary-val" style="color:${gradeData ? 'var(--accent)' : ''}">
          ${gradeData ? gradeData.name + ' (+'+gradeData.buff+'%)' : '—'}
        </span>
      </div>
      ${gradeData ? `<div class="summary-row"><span class="summary-key">Cyber Load Cap</span><span class="summary-val">${getCyberneticLoadUsed()} / ${getCyberneticLoadCap()}</span></div>` : ''}
    </div>
    <div class="summary-block">
      <div class="summary-block-title">Attributes</div>
      <div class="summary-row"><span class="summary-key">Player Level</span><span class="summary-val" style="color:var(--accent)">${lvl} / ${MAX_LEVEL}</span></div>
      <div class="summary-row"><span class="summary-key">Milestone Bonus</span><span class="summary-val">+${getMilestoneBonus()} to all</span></div>
      <div class="summary-row"><span class="summary-key">AP Earned</span><span class="summary-val">${getAPEarned()} (${getPacksUsed()} SP + ${state.apCyberUpgrades||0} CU)</span></div>
      ${getDreamPointsUsed() > 0 ? `<div class="summary-row"><span class="summary-key">Dream Points</span><span class="summary-val" style="color:#b060e0">${getDreamPointsUsed()} / ${MAX_DREAM_POINTS}</span></div>` : ''}
      <div style="margin-top:6px; border-top:1px solid var(--border); padding-top:6px"></div>
      ${ATTRIBUTES.map(a => {
        const total = getEffectiveStat(a.key);
        const graded = getGradedStat(a.key);
        const grade = getGrade(total);
        const gc = gradeClass(grade);
        const gradedGrade = graded !== null ? getGrade(graded) : null;
        const gradedGc    = gradedGrade ? gradeClass(gradedGrade) : '';
        return `<div class="summary-row">
          <span class="summary-key">${a.name}</span>
          <span class="summary-val"><span class="${gc}">${grade}</span>${gradedGrade ? ` <span class="${gradedGc}" style="font-size:11px">(${gradedGrade})</span>` : ''} <span style="color:var(--text-dim);font-size:11px">${total}</span></span>
        </div>`;
      }).join('')}
    </div>
    <div class="summary-block" style="grid-column:1/-1">
      <div class="summary-block-title">Clan Passive</div>
      <div style="font-size:13px;color:var(--text-dim);line-height:1.6">
        ${clanData ? clanData.desc : 'No clan selected.'}
      </div>
    </div>
    ${ctHtml}
    ${state.cybernetics.length > 0 ? `
      <div class="summary-block" style="grid-column:1/-1">
        <div class="summary-block-title">Cybernetics</div>
        <div class="summary-row"><span class="summary-key">Load Used</span><span class="summary-val">${getCyberneticLoadUsed()} / ${getCyberneticLoadCap() ?? '—'}${getCyberneticLoadCap() && getCyberneticLoadUsed() > getCyberneticLoadCap() ? ' <span style="color:var(--accent-red)">⚠ OVERLOAD (-20% max HP)</span>' : ''}</span></div>
        ${state.cybernetics.map(entry => {
          const base = CYBERNETICS.find(c => c.id === entry.id);
          if (!base) return '';
          const color = CYBER_TYPE_COLORS[base.type];
          const bonusText = ATTRIBUTES.filter(a => entry.bonuses[a.key]).map(a => `${a.name.slice(0,3)} ${entry.bonuses[a.key]>0?'+':''}${entry.bonuses[a.key]}`).join(', ');
          return `<div class="summary-row"><span class="summary-key" style="color:${color}">${base.name}</span><span class="summary-val" style="color:var(--text-dim)">Load ${entry.load}${bonusText ? ' · '+bonusText : ''}</span></div>`;
        }).join('')}
      </div>` : ''}
  `;
}

// ============================================================
// ACTIONS
// ============================================================
function resetBuild() {
  if (!confirm('Reset this build?')) return;
  state = {
    buildName:'', gear:null, clan:'', technique:null,
    attrs:{physicality:1,durability:1,output:1,efficiency:1,awareness:1,dexterity:1},
    packs:{physicality:0,durability:0,output:0,efficiency:0,awareness:0,dexterity:0},
    dreams:{physicality:0,durability:0,output:0,efficiency:0,awareness:0,dexterity:0},
    apCyberUpgrades:0,
    royalAttrBuff:'', techFilter:'all', memoryDrives:0,
    ctLevels:{efficiency:0,potency:0,haste:0,evo:0},
    playerGrade:'', cybernetics:[], cyberFilter:'all',
    relics:{ fingerOfShiva:0 },
  };
  document.getElementById('buildName').value = '';
  document.getElementById('gearSelect').value = '';
  document.getElementById('clanSelect').value = '';
  document.getElementById('gradeSelect').value = '';
  updateClanPreview();
  updateCyberLoadDisplay();
  buildEquippedCybernetics();
  buildGearGrid();
  buildAttrList();
  buildRadarChart();
  buildTechGrid();
  buildCtUpgradePanel();
  updateBudget();
}

function buildPayload() {
  return {
    n: document.getElementById('buildName').value,
    g: state.gear,
    c: state.clan,
    t: state.technique,
    a: state.attrs,
    sp: state.packs,
    dr: state.dreams,
    cu: state.apCyberUpgrades,
    ra: state.royalAttrBuff,
    md: state.memoryDrives,
    ct: state.ctLevels,
    pg: state.playerGrade,
    cy: state.cybernetics,
    rl: state.relics,
  };
}

function exportBuild() {
  const code = btoa(JSON.stringify(buildPayload()));
  prompt('Copy your build code:', code);
}

function importBuild() {
  const code = prompt('Paste your build code:');
  if (!code) return;
  try {
    const d = JSON.parse(atob(code.trim()));
    if (d.n) document.getElementById('buildName').value = d.n;
    if (d.g) { state.gear = d.g; document.getElementById('gearSelect').value = d.g; }
    if (d.c) { state.clan = d.c; document.getElementById('clanSelect').value = d.c; updateClanPreview(); }
    if (d.t) state.technique = d.t;
    if (d.a) Object.keys(d.a).forEach(k => { if (state.attrs[k] !== undefined) state.attrs[k] = d.a[k]||0; });
    if (d.sp) Object.keys(d.sp).forEach(k => { if (state.packs[k] !== undefined) state.packs[k] = d.sp[k]||0; });
    if (d.dr) Object.keys(d.dr).forEach(k => { if (state.dreams[k] !== undefined) state.dreams[k] = d.dr[k]||0; });
    if (d.cu !== undefined) state.apCyberUpgrades = d.cu || 0;
    if (d.ra !== undefined) state.royalAttrBuff = d.ra;
    if (d.md !== undefined) state.memoryDrives = d.md;
    if (d.ct) Object.keys(d.ct).forEach(k => { if (state.ctLevels[k] !== undefined) state.ctLevels[k] = d.ct[k]||0; });
    if (d.pg) { state.playerGrade = d.pg; document.getElementById('gradeSelect').value = d.pg; }
    if (d.cy) state.cybernetics = d.cy;
    if (d.rl) state.relics = d.rl;
    buildGearGrid();
    buildAttrList();
    buildRadarChart();
    buildTechGrid();
    buildCtUpgradePanel();
    updateBudget();
    updateCyberLoadDisplay();
    showToast('Build Imported!', 2500);
  } catch(e) {
    alert('Invalid build code.');
  }
}

function showToast(msg, duration) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); toast.textContent = 'Link Copied!'; }, duration || 2500);
}

function shareBuild() {
  const code = btoa(JSON.stringify(buildPayload()));
  const url = location.href.split('#')[0] + '#' + code;
  navigator.clipboard.writeText(url).catch(()=>{});
  showToast('Link Copied!', 2500);
}

function loadFromHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    const d = JSON.parse(atob(hash));
    if (d.n) document.getElementById('buildName').value = d.n;
    if (d.g) { state.gear = d.g; document.getElementById('gearSelect').value = d.g; }
    if (d.c) { state.clan = d.c; document.getElementById('clanSelect').value = d.c; updateClanPreview(); }
    if (d.t) state.technique = d.t;
    if (d.a) Object.keys(d.a).forEach(k => { state.attrs[k] = d.a[k]||0; });
    if (d.sp) Object.keys(d.sp).forEach(k => { state.packs[k] = d.sp[k]||0; });
    if (d.dr) Object.keys(d.dr).forEach(k => { if (state.dreams[k] !== undefined) state.dreams[k] = d.dr[k]||0; });
    if (d.cu !== undefined) state.apCyberUpgrades = d.cu || 0;
    if (d.ra !== undefined) state.royalAttrBuff = d.ra;
    if (d.md !== undefined) state.memoryDrives = d.md;
    if (d.ct) Object.keys(d.ct).forEach(k => { state.ctLevels[k] = d.ct[k]||0; });
    if (d.pg) { state.playerGrade = d.pg; document.getElementById('gradeSelect').value = d.pg; }
    if (d.cy) state.cybernetics = d.cy;
    if (d.rl) state.relics = d.rl;
    buildGearGrid();
    buildAttrList();
    buildRadarChart();
    buildTechGrid();
    buildCtUpgradePanel();
    updateBudget();
    updateCyberLoadDisplay();
  } catch(e) {}
}

function toggleLightMode() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('lightModeBtn');
  if (btn) btn.textContent = document.body.classList.contains('light-mode') ? '◐' : '◑';
  try { localStorage.setItem('cgbuilder_light', document.body.classList.contains('light-mode') ? '1' : ''); } catch(e) {}
}

init();

// Restore light mode preference
try { if (localStorage.getItem('cgbuilder_light')) { document.body.classList.add('light-mode'); const btn = document.getElementById('lightModeBtn'); if (btn) btn.textContent = '◐'; } } catch(e) {}
