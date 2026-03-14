export interface Weapon {
  name: string;
  icon: string;
  type: string;
  damage: number; // 0-100
}

export interface PlaystyleLoadout {
  weapons: Weapon[];
  aiTip: string;
  metaRank: number;
  matchPercent: number;
  proUsage: string;
  tags: string[];
}

export interface GameLoadouts {
  playstyles: string[];
  patchLabel: string;
  loadouts: Record<string, PlaystyleLoadout>;
}

export const LOADOUT_DATA: Record<string, GameLoadouts> = {
  fortnite: {
    playstyles: ['Aggressive', 'Sniper', 'Builder', 'Support'],
    patchLabel: 'Updated for Chapter 6 Season 2',
    loadouts: {
      Aggressive: {
        weapons: [
          { name: 'Harbinger SMG', icon: '🔫', type: 'SMG', damage: 82 },
          { name: 'Striker AR', icon: '💥', type: 'Assault Rifle', damage: 76 },
          { name: 'Combat Shotgun', icon: '🎯', type: 'Shotgun', damage: 88 },
          { name: 'Shockwave Grenade', icon: '💣', type: 'Utility', damage: 40 },
        ],
        aiTip: 'The Harbinger SMG shreds at close range and pairs perfectly with the Combat Shotgun for quick swaps. Push fights aggressively after weakening with AR shots from mid-range.',
        metaRank: 2,
        matchPercent: 94,
        proUsage: '7/10 pros',
        tags: ['Close Range', 'Solo', 'W-Key'],
      },
      Sniper: {
        weapons: [
          { name: 'Bolt-Action Sniper', icon: '🎯', type: 'Sniper', damage: 95 },
          { name: 'Ranger AR', icon: '💥', type: 'Assault Rifle', damage: 72 },
          { name: 'Shield Potion', icon: '🛡️', type: 'Consumable', damage: 0 },
          { name: 'Smoke Grenade', icon: '💨', type: 'Utility', damage: 10 },
        ],
        aiTip: 'The Bolt-Action one-shots at 250+ damage on headshot. Pair with the Ranger AR for consistent mid-range poke while repositioning between snipe attempts.',
        metaRank: 5,
        matchPercent: 88,
        proUsage: '3/10 pros',
        tags: ['Long Range', 'Duo', 'Late Game'],
      },
      Builder: {
        weapons: [
          { name: 'Striker AR', icon: '💥', type: 'Assault Rifle', damage: 76 },
          { name: 'Combat Shotgun', icon: '🎯', type: 'Shotgun', damage: 88 },
          { name: 'Shield Keg', icon: '🛡️', type: 'Healing', damage: 0 },
          { name: 'Port-a-Fort', icon: '🏗️', type: 'Utility', damage: 0 },
        ],
        aiTip: 'High ground control is king for builders. The Striker AR gives you consistent damage while building up, and the Combat Shotgun punishes anyone who tries to take your walls.',
        metaRank: 1,
        matchPercent: 96,
        proUsage: '8/10 pros',
        tags: ['Build Fights', 'Competitive', 'High Ground'],
      },
      Support: {
        weapons: [
          { name: 'Med-Mist', icon: '💚', type: 'Healing', damage: 0 },
          { name: 'Chug Splash', icon: '🧪', type: 'Healing', damage: 0 },
          { name: 'Ranger AR', icon: '💥', type: 'Assault Rifle', damage: 72 },
          { name: 'Firefly Jar', icon: '🔥', type: 'Utility', damage: 35 },
        ],
        aiTip: 'Med-Mist heals through builds and Chug Splash can heal your entire squad instantly. Focus on keeping teammates alive while using the Ranger AR for suppressive fire.',
        metaRank: 4,
        matchPercent: 85,
        proUsage: '5/10 pros',
        tags: ['Squad', 'Healer', 'Zone Play'],
      },
    },
  },

  cod: {
    playstyles: ['Rusher', 'Marksman', 'Tactical', 'Support'],
    patchLabel: 'Updated for Warzone Season 3',
    loadouts: {
      Rusher: {
        weapons: [
          { name: 'HRM-9', icon: '🔫', type: 'SMG', damage: 84 },
          { name: 'Renetti', icon: '🔫', type: 'Pistol', damage: 70 },
          { name: 'Stun Grenade', icon: '💥', type: 'Tactical', damage: 15 },
          { name: 'Semtex', icon: '💣', type: 'Lethal', damage: 65 },
        ],
        aiTip: 'The HRM-9 has the fastest TTK in close quarters this season. Run it with Double Time and lightweight stock to outpace every gunfight within 15m.',
        metaRank: 1,
        matchPercent: 95,
        proUsage: '8/10 pros',
        tags: ['CQB', 'Ranked', 'Aggressive'],
      },
      Marksman: {
        weapons: [
          { name: 'MORS', icon: '🎯', type: 'Sniper', damage: 97 },
          { name: 'MCW', icon: '💥', type: 'Assault Rifle', damage: 75 },
          { name: 'Smoke Grenade', icon: '💨', type: 'Tactical', damage: 0 },
          { name: 'Throwing Knife', icon: '🗡️', type: 'Lethal', damage: 80 },
        ],
        aiTip: 'The MORS is a guaranteed one-shot to upper chest at any range. Pair with the MCW for versatile mid-range coverage when you need to relocate between angles.',
        metaRank: 3,
        matchPercent: 89,
        proUsage: '4/10 pros',
        tags: ['Long Range', 'Warzone', 'Picks'],
      },
      Tactical: {
        weapons: [
          { name: 'MCW', icon: '💥', type: 'Assault Rifle', damage: 75 },
          { name: 'Rival-9', icon: '🔫', type: 'SMG', damage: 78 },
          { name: 'Flash Grenade', icon: '💥', type: 'Tactical', damage: 10 },
          { name: 'C4', icon: '💣', type: 'Lethal', damage: 72 },
        ],
        aiTip: 'The MCW and Rival-9 combo covers all ranges effectively. Use flashes to clear rooms before entering and C4 for area denial on objectives.',
        metaRank: 2,
        matchPercent: 92,
        proUsage: '6/10 pros',
        tags: ['Versatile', 'Objective', 'Search & Destroy'],
      },
      Support: {
        weapons: [
          { name: 'Holger 556', icon: '💥', type: 'LMG', damage: 73 },
          { name: 'Renetti', icon: '🔫', type: 'Pistol', damage: 70 },
          { name: 'Trophy System', icon: '🛡️', type: 'Field Upgrade', damage: 0 },
          { name: 'Smoke Grenade', icon: '💨', type: 'Tactical', damage: 0 },
        ],
        aiTip: 'The Holger 556 provides sustained suppressive fire with its massive magazine. Deploy Trophy Systems on objectives and use smokes to cover teammate pushes.',
        metaRank: 6,
        matchPercent: 82,
        proUsage: '3/10 pros',
        tags: ['Hardpoint', 'Suppression', 'Team Play'],
      },
    },
  },

  valorant: {
    playstyles: ['Duelist', 'Operator', 'Controller', 'Sentinel'],
    patchLabel: 'Updated for Episode 10 Act 1',
    loadouts: {
      Duelist: {
        weapons: [
          { name: 'Vandal', icon: '🔫', type: 'Rifle', damage: 90 },
          { name: 'Ghost', icon: '🔫', type: 'Pistol', damage: 55 },
          { name: 'Frenzy', icon: '🔫', type: 'Pistol', damage: 45 },
          { name: 'Shorty', icon: '💥', type: 'Sidearm', damage: 60 },
        ],
        aiTip: 'The Vandal one-taps at any range making it the ideal duelist weapon. Full buy rounds should always prioritize the Vandal over the Phantom for entry fraggers.',
        metaRank: 1,
        matchPercent: 96,
        proUsage: '9/10 pros',
        tags: ['Entry Frag', 'Ranked', 'Aggro'],
      },
      Operator: {
        weapons: [
          { name: 'Operator', icon: '🎯', type: 'Sniper', damage: 98 },
          { name: 'Sheriff', icon: '🔫', type: 'Pistol', damage: 65 },
          { name: 'Phantom', icon: '🔫', type: 'Rifle', damage: 85 },
          { name: 'Marshal', icon: '🎯', type: 'Sniper', damage: 70 },
        ],
        aiTip: 'The Operator is a guaranteed one-shot to the body. Hold long angles on defense and use the Sheriff as your eco-round backup for consistent one-tap potential.',
        metaRank: 3,
        matchPercent: 87,
        proUsage: '5/10 pros',
        tags: ['Angle Holder', 'Defense', 'High Risk'],
      },
      Controller: {
        weapons: [
          { name: 'Phantom', icon: '🔫', type: 'Rifle', damage: 85 },
          { name: 'Spectre', icon: '🔫', type: 'SMG', damage: 62 },
          { name: 'Ghost', icon: '🔫', type: 'Pistol', damage: 55 },
          { name: 'Judge', icon: '💥', type: 'Shotgun', damage: 72 },
        ],
        aiTip: 'Controllers should prioritize the Phantom for its spray accuracy through smokes. The silenced shots prevent tracers, making it impossible for enemies to pinpoint your position in smoke plays.',
        metaRank: 2,
        matchPercent: 93,
        proUsage: '7/10 pros',
        tags: ['Smoke Play', 'Site Anchor', 'Ranked'],
      },
      Sentinel: {
        weapons: [
          { name: 'Vandal', icon: '🔫', type: 'Rifle', damage: 90 },
          { name: 'Bulldog', icon: '🔫', type: 'Rifle', damage: 60 },
          { name: 'Classic', icon: '🔫', type: 'Pistol', damage: 40 },
          { name: 'Stinger', icon: '🔫', type: 'SMG', damage: 50 },
        ],
        aiTip: 'Sentinels need the Vandal for retake potential — one-taps win 1vX clutches. Save economy on half-buys with the Bulldog burst-fire which is deadly accurate at mid-range.',
        metaRank: 4,
        matchPercent: 88,
        proUsage: '6/10 pros',
        tags: ['Retake', 'Clutch', 'Economy'],
      },
    },
  },

  apex: {
    playstyles: ['Aggro', 'Sniper', 'Recon', 'Support'],
    patchLabel: 'Updated for Season 24',
    loadouts: {
      Aggro: {
        weapons: [
          { name: 'R-99', icon: '🔫', type: 'SMG', damage: 86 },
          { name: 'Peacekeeper', icon: '💥', type: 'Shotgun', damage: 90 },
          { name: 'Arc Star', icon: '⚡', type: 'Ordnance', damage: 55 },
          { name: 'Thermite', icon: '🔥', type: 'Ordnance', damage: 48 },
        ],
        aiTip: 'The R-99 has the highest DPS in close quarters and the Peacekeeper chunks for 100+ on a good shot. Push teams after cracking a shield with arc stars for quick squad wipes.',
        metaRank: 1,
        matchPercent: 94,
        proUsage: '8/10 pros',
        tags: ['Hot Drop', 'Ranked', 'Push'],
      },
      Sniper: {
        weapons: [
          { name: 'Kraber', icon: '🎯', type: 'Sniper', damage: 99 },
          { name: 'R-301', icon: '💥', type: 'Assault Rifle', damage: 78 },
          { name: 'Frag Grenade', icon: '💣', type: 'Ordnance', damage: 60 },
          { name: 'Sentinel', icon: '🎯', type: 'Sniper', damage: 82 },
        ],
        aiTip: 'The Kraber is a care package one-shot king. Run the R-301 as your primary for mid-range fights and swap to the Sentinel early game until you find a Kraber.',
        metaRank: 4,
        matchPercent: 85,
        proUsage: '3/10 pros',
        tags: ['Long Range', 'Poke', 'Late Game'],
      },
      Recon: {
        weapons: [
          { name: 'R-301', icon: '💥', type: 'Assault Rifle', damage: 78 },
          { name: 'Volt SMG', icon: '🔫', type: 'SMG', damage: 74 },
          { name: 'Arc Star', icon: '⚡', type: 'Ordnance', damage: 55 },
          { name: 'Frag Grenade', icon: '💣', type: 'Ordnance', damage: 60 },
        ],
        aiTip: 'Recon legends like Bloodhound and Seer should run the R-301 for versatile range coverage. Scan before pushing and use the Volt as a cleanup weapon after getting info.',
        metaRank: 2,
        matchPercent: 91,
        proUsage: '6/10 pros',
        tags: ['Info Plays', 'Ranked', 'Versatile'],
      },
      Support: {
        weapons: [
          { name: 'Flatline', icon: '💥', type: 'Assault Rifle', damage: 76 },
          { name: 'Alternator', icon: '🔫', type: 'SMG', damage: 65 },
          { name: 'Frag Grenade', icon: '💣', type: 'Ordnance', damage: 60 },
          { name: 'Thermite', icon: '🔥', type: 'Ordnance', damage: 48 },
        ],
        aiTip: 'Support legends like Lifeline and Newcastle need reliable weapons — the Flatline has incredible hipfire and the Alternator has virtually zero recoil for consistent damage while reviving teammates.',
        metaRank: 5,
        matchPercent: 83,
        proUsage: '4/10 pros',
        tags: ['Team Play', 'Healer', 'Zone Control'],
      },
    },
  },

  gta: {
    playstyles: ['Run & Gun', 'Sniper', 'Heist', 'Racer'],
    patchLabel: 'Updated for GTA Online 2025',
    loadouts: {
      'Run & Gun': {
        weapons: [
          { name: 'Special Carbine', icon: '🔫', type: 'Assault Rifle', damage: 82 },
          { name: 'AP Pistol', icon: '🔫', type: 'Pistol', damage: 68 },
          { name: 'Combat MG Mk II', icon: '💥', type: 'LMG', damage: 85 },
          { name: 'Sticky Bomb', icon: '💣', type: 'Explosive', damage: 90 },
        ],
        aiTip: 'The Special Carbine is the most versatile weapon in freemode. The AP Pistol is essential for drive-by shooting — it has the highest DPS of any weapon usable in vehicles.',
        metaRank: 1,
        matchPercent: 93,
        proUsage: '8/10 players',
        tags: ['Freemode', 'PvP', 'Drive-by'],
      },
      Sniper: {
        weapons: [
          { name: 'Heavy Sniper Mk II', icon: '🎯', type: 'Sniper', damage: 98 },
          { name: 'Marksman Rifle', icon: '🎯', type: 'DMR', damage: 78 },
          { name: 'Up-n-Atomizer', icon: '⚡', type: 'Special', damage: 45 },
          { name: 'Proximity Mine', icon: '💣', type: 'Explosive', damage: 85 },
        ],
        aiTip: 'The Heavy Sniper Mk II with explosive rounds is the most powerful weapon in GTA Online — it destroys most vehicles in 2-3 hits. Use thermal scope for easy target acquisition.',
        metaRank: 2,
        matchPercent: 90,
        proUsage: '7/10 players',
        tags: ['Anti-Vehicle', 'Long Range', 'Griefing Counter'],
      },
      Heist: {
        weapons: [
          { name: 'Assault Shotgun', icon: '💥', type: 'Shotgun', damage: 88 },
          { name: 'Micro SMG', icon: '🔫', type: 'SMG', damage: 60 },
          { name: 'Homing Launcher', icon: '🚀', type: 'Heavy', damage: 95 },
          { name: 'Armor', icon: '🛡️', type: 'Protection', damage: 0 },
        ],
        aiTip: 'For heists, the Assault Shotgun dominates indoor sections and the Homing Launcher handles vehicle chases. Always buy max armor before starting — it is the difference between success and failure.',
        metaRank: 3,
        matchPercent: 87,
        proUsage: '6/10 players',
        tags: ['Heist', 'Co-op', 'Indoor'],
      },
      Racer: {
        weapons: [
          { name: 'AP Pistol', icon: '🔫', type: 'Pistol', damage: 68 },
          { name: 'Sticky Bomb', icon: '💣', type: 'Explosive', damage: 90 },
          { name: 'Grenade', icon: '💣', type: 'Thrown', damage: 75 },
          { name: 'Jerry Can', icon: '🔥', type: 'Utility', damage: 40 },
        ],
        aiTip: 'In vehicle combat the AP Pistol is king — no other weapon matches its fire rate from a car. Sticky bombs are perfect for disabling pursuers during chases and races.',
        metaRank: 4,
        matchPercent: 80,
        proUsage: '5/10 players',
        tags: ['Vehicle Combat', 'Racing', 'Chase'],
      },
    },
  },

  minecraft: {
    playstyles: ['Warrior', 'Archer', 'Miner', 'Explorer'],
    patchLabel: 'Updated for 1.21 Tricky Trials',
    loadouts: {
      Warrior: {
        weapons: [
          { name: 'Netherite Sword', icon: '⚔️', type: 'Melee', damage: 92 },
          { name: 'Shield', icon: '🛡️', type: 'Defense', damage: 0 },
          { name: 'Totem of Undying', icon: '✨', type: 'Utility', damage: 0 },
          { name: 'Golden Apple', icon: '🍎', type: 'Consumable', damage: 0 },
        ],
        aiTip: 'Netherite Sword with Sharpness V deals 11 damage per hit — enough to three-shot most mobs. Always carry a shield for Creeper encounters and a Totem for emergencies.',
        metaRank: 1,
        matchPercent: 95,
        proUsage: '9/10 players',
        tags: ['PvE', 'Combat', 'Boss Fight'],
      },
      Archer: {
        weapons: [
          { name: 'Bow (Power V)', icon: '🏹', type: 'Ranged', damage: 88 },
          { name: 'Crossbow', icon: '🏹', type: 'Ranged', damage: 82 },
          { name: 'Tipped Arrows', icon: '🧪', type: 'Ammo', damage: 60 },
          { name: 'Firework Rocket', icon: '🎆', type: 'Ammo', damage: 75 },
        ],
        aiTip: 'Power V bows deal massive damage at range and are perfect for the Ender Dragon fight. Crossbows with Multishot and Firework Rockets are devastating for crowd control.',
        metaRank: 3,
        matchPercent: 86,
        proUsage: '5/10 players',
        tags: ['Ranged', 'Dragon Fight', 'PvP'],
      },
      Miner: {
        weapons: [
          { name: 'Netherite Pickaxe', icon: '⛏️', type: 'Tool', damage: 45 },
          { name: 'Fortune III Pick', icon: '💎', type: 'Tool', damage: 40 },
          { name: 'TNT', icon: '💣', type: 'Explosive', damage: 80 },
          { name: 'Water Bucket', icon: '💧', type: 'Utility', damage: 0 },
        ],
        aiTip: 'Efficiency V Netherite Pickaxe mines instantly with a Haste II beacon. Fortune III on a separate pick maximizes diamond drops — never combine Fortune and Silk Touch on the same tool.',
        metaRank: 2,
        matchPercent: 90,
        proUsage: '7/10 players',
        tags: ['Mining', 'Resource', 'Diamonds'],
      },
      Explorer: {
        weapons: [
          { name: 'Elytra', icon: '🪽', type: 'Transport', damage: 0 },
          { name: 'Ender Pearls', icon: '🔮', type: 'Utility', damage: 25 },
          { name: 'Firework Rockets', icon: '🎆', type: 'Fuel', damage: 0 },
          { name: 'Spyglass', icon: '🔭', type: 'Tool', damage: 0 },
        ],
        aiTip: 'Elytra with Firework Rockets is the fastest travel method in the game. Carry Ender Pearls as emergency teleports when your Elytra durability gets low mid-flight.',
        metaRank: 5,
        matchPercent: 78,
        proUsage: '4/10 players',
        tags: ['Travel', 'End Game', 'Exploration'],
      },
    },
  },

  'elden-ring': {
    playstyles: ['Strength', 'Dex/Bleed', 'Sorcery', 'Faith'],
    patchLabel: 'Updated for Shadow of the Erdtree DLC',
    loadouts: {
      Strength: {
        weapons: [
          { name: 'Giant-Crusher', icon: '🔨', type: 'Colossal Weapon', damage: 95 },
          { name: 'Greatsword', icon: '⚔️', type: 'Colossal Sword', damage: 90 },
          { name: 'Greatshield', icon: '🛡️', type: 'Shield', damage: 0 },
          { name: 'Fire Grease', icon: '🔥', type: 'Consumable', damage: 30 },
        ],
        aiTip: 'The Giant-Crusher has the highest physical AR in the game with Heavy infusion. Jump attacks with this weapon stagger every boss in 2-3 hits — abuse the poise damage.',
        metaRank: 2,
        matchPercent: 91,
        proUsage: '6/10 players',
        tags: ['PvE', 'Stagger', 'Boss Killer'],
      },
      'Dex/Bleed': {
        weapons: [
          { name: 'Rivers of Blood', icon: '🗡️', type: 'Katana', damage: 88 },
          { name: 'Uchigatana', icon: '🗡️', type: 'Katana', damage: 75 },
          { name: 'Bloodhound Step', icon: '💨', type: 'Ash of War', damage: 0 },
          { name: 'Lord of Blood Exultation', icon: '💎', type: 'Talisman', damage: 20 },
        ],
        aiTip: 'Rivers of Blood Corpse Piler skill melts bosses in seconds with bleed procs. Dual-wield with an Occult Uchigatana for maximum bleed buildup per combo.',
        metaRank: 1,
        matchPercent: 96,
        proUsage: '8/10 players',
        tags: ['Bleed', 'DPS', 'PvP Meta'],
      },
      Sorcery: {
        weapons: [
          { name: 'Lusat Staff', icon: '🪄', type: 'Glintstone Staff', damage: 85 },
          { name: 'Comet Azur', icon: '☄️', type: 'Sorcery', damage: 98 },
          { name: 'Moonveil', icon: '🗡️', type: 'Katana', damage: 80 },
          { name: 'Cerulean Hidden Tear', icon: '🧪', type: 'Flask', damage: 0 },
        ],
        aiTip: 'Comet Azur with Cerulean Hidden Tear gives you 10 seconds of unlimited FP — enough to delete any boss. Moonveil is your backup for when bosses close the distance.',
        metaRank: 3,
        matchPercent: 89,
        proUsage: '5/10 players',
        tags: ['Magic', 'Burst Damage', 'Cheese'],
      },
      Faith: {
        weapons: [
          { name: 'Blasphemous Blade', icon: '🔥', type: 'Greatsword', damage: 87 },
          { name: 'Erdtree Seal', icon: '✨', type: 'Sacred Seal', damage: 70 },
          { name: 'Black Flame Tornado', icon: '🌀', type: 'Incantation', damage: 82 },
          { name: 'Lord\'s Divine Fortification', icon: '🛡️', type: 'Buff', damage: 0 },
        ],
        aiTip: 'Blasphemous Blade Taker\'s Flame heals you per hit and per kill — you become nearly unkillable. Stack fire damage talismans and watch bosses melt while you sustain through everything.',
        metaRank: 4,
        matchPercent: 86,
        proUsage: '4/10 players',
        tags: ['Sustain', 'Fire Damage', 'Solo'],
      },
    },
  },

  lol: {
    playstyles: ['Assassin', 'ADC', 'Tank', 'Support'],
    patchLabel: 'Updated for Patch 16.5',
    loadouts: {
      Assassin: {
        weapons: [
          { name: 'Youmuu\'s Ghostblade', icon: '🗡️', type: 'Lethality', damage: 82 },
          { name: 'Hubris', icon: '💀', type: 'Lethality', damage: 78 },
          { name: 'Edge of Night', icon: '🌙', type: 'Lethality', damage: 70 },
          { name: 'Serylda\'s Grudge', icon: '❄️', type: 'Armor Pen', damage: 75 },
        ],
        aiTip: 'Youmuu\'s rush gives you roaming speed and burst to snowball early. Hubris second item lets you stack AD from kills — the faster you get fed, the harder you scale.',
        metaRank: 2,
        matchPercent: 90,
        proUsage: '6/10 pros',
        tags: ['Mid Lane', 'Roaming', 'Snowball'],
      },
      ADC: {
        weapons: [
          { name: 'Infinity Edge', icon: '⚔️', type: 'Crit', damage: 95 },
          { name: 'Kraken Slayer', icon: '🐙', type: 'Attack Speed', damage: 88 },
          { name: 'Phantom Dancer', icon: '💨', type: 'Zeal', damage: 65 },
          { name: 'Bloodthirster', icon: '❤️', type: 'Lifesteal', damage: 72 },
        ],
        aiTip: 'IE third item with 60% crit chance is the biggest power spike for any ADC. Kraken Slayer first gives you tank-shredding true damage that scales into late game teamfights.',
        metaRank: 1,
        matchPercent: 94,
        proUsage: '9/10 pros',
        tags: ['Bot Lane', 'Late Game', 'Team Fight'],
      },
      Tank: {
        weapons: [
          { name: 'Heartsteel', icon: '💚', type: 'Health', damage: 55 },
          { name: 'Sunfire Aegis', icon: '🔥', type: 'Immolate', damage: 60 },
          { name: 'Thornmail', icon: '🛡️', type: 'Armor', damage: 45 },
          { name: 'Spirit Visage', icon: '💜', type: 'Magic Resist', damage: 30 },
        ],
        aiTip: 'Heartsteel infinite scaling makes you an unstoppable frontline by 25 minutes. Sunfire gives you consistent damage in extended fights — just stand in the enemy team and zone their carries.',
        metaRank: 3,
        matchPercent: 87,
        proUsage: '5/10 pros',
        tags: ['Top Lane', 'Frontline', 'Scaling'],
      },
      Support: {
        weapons: [
          { name: 'Imperial Mandate', icon: '👑', type: 'Ability Haste', damage: 50 },
          { name: 'Staff of Flowing Water', icon: '🌊', type: 'Enchanter', damage: 30 },
          { name: 'Redemption', icon: '✨', type: 'Heal', damage: 20 },
          { name: 'Wardstone', icon: '👁️', type: 'Vision', damage: 0 },
        ],
        aiTip: 'Imperial Mandate procs off any CC ability for free damage and a speed boost for your ADC. Wardstone late game gives you extra ward slots that single-handedly win vision wars around objectives.',
        metaRank: 5,
        matchPercent: 82,
        proUsage: '4/10 pros',
        tags: ['Bot Lane', 'Vision', 'Utility'],
      },
    },
  },

  zelda: {
    playstyles: ['Melee', 'Ranged', 'Stealth', 'Exploration'],
    patchLabel: 'Updated for TotK v2.1',
    loadouts: {
      Melee: {
        weapons: [
          { name: 'Master Sword', icon: '⚔️', type: 'Sword', damage: 95 },
          { name: 'Hylian Shield', icon: '🛡️', type: 'Shield', damage: 0 },
          { name: 'Silver Lynel Saber', icon: '🗡️', type: 'Sword', damage: 88 },
          { name: 'Mighty Banana', icon: '🍌', type: 'Attack Food', damage: 25 },
        ],
        aiTip: 'The Master Sword deals double damage to Ganondorf and never breaks permanently. Fuse it with a Silver Lynel Horn for the highest melee damage possible in the game.',
        metaRank: 1,
        matchPercent: 96,
        proUsage: '9/10 players',
        tags: ['Boss Fight', 'Ganondorf', 'Main Quest'],
      },
      Ranged: {
        weapons: [
          { name: 'Great Eagle Bow', icon: '🏹', type: 'Bow (x3)', damage: 85 },
          { name: 'Savage Lynel Bow', icon: '🏹', type: 'Bow (x5)', damage: 92 },
          { name: 'Bomb Arrows', icon: '💣', type: 'Ammo', damage: 78 },
          { name: 'Keese Eye Arrows', icon: '👁️', type: 'Homing Ammo', damage: 60 },
        ],
        aiTip: 'The Savage Lynel Bow fires 5 arrows per shot — fuse each with a Gibdo Bone for 90+ damage per volley. Use bullet time from paraglider for guaranteed headshots.',
        metaRank: 2,
        matchPercent: 90,
        proUsage: '7/10 players',
        tags: ['Lynel Farming', 'Gleeok', 'Burst'],
      },
      Stealth: {
        weapons: [
          { name: 'Sheikah Armor Set', icon: '🥷', type: 'Armor', damage: 0 },
          { name: 'Sneaky Elixir', icon: '🧪', type: 'Stealth Buff', damage: 0 },
          { name: 'Dagger', icon: '🗡️', type: 'Short Blade', damage: 55 },
          { name: 'Puffshroom', icon: '🍄', type: 'Utility', damage: 0 },
        ],
        aiTip: 'Full Sheikah armor maxes stealth — you can sneak-strike enemies for 8x damage. Puffshrooms create smoke cover for re-entering stealth mid-combat for repeated sneak strikes.',
        metaRank: 4,
        matchPercent: 82,
        proUsage: '3/10 players',
        tags: ['Sneak Strike', 'Night', 'Yiga Clan'],
      },
      Exploration: {
        weapons: [
          { name: 'Paraglider', icon: '🪂', type: 'Traversal', damage: 0 },
          { name: 'Zonai Wing', icon: '🪽', type: 'Vehicle', damage: 0 },
          { name: 'Battery', icon: '🔋', type: 'Energy', damage: 0 },
          { name: 'Stamina Food', icon: '🍖', type: 'Consumable', damage: 0 },
        ],
        aiTip: 'Zonai Wings with fans are the fastest way to cross Hyrule. Max your stamina wheel before hearts — stamina is more useful for climbing, swimming, and paragliding exploration.',
        metaRank: 3,
        matchPercent: 88,
        proUsage: '6/10 players',
        tags: ['Shrines', 'Sky Islands', 'Completionist'],
      },
    },
  },

  rdr2: {
    playstyles: ['Gunslinger', 'Sniper', 'Brawler', 'Hunter'],
    patchLabel: 'Updated for RDR2 Online 2025',
    loadouts: {
      Gunslinger: {
        weapons: [
          { name: 'Schofield Revolver', icon: '🔫', type: 'Revolver', damage: 85 },
          { name: 'Cattleman Revolver', icon: '🔫', type: 'Revolver', damage: 72 },
          { name: 'Sawed-Off Shotgun', icon: '💥', type: 'Shotgun', damage: 90 },
          { name: 'Volatile Dynamite', icon: '💣', type: 'Throwable', damage: 88 },
        ],
        aiTip: 'Dual Schofield Revolvers with express ammo are devastating in Dead Eye. Fan the hammer for rapid fire at close range and use the Sawed-Off as a last-resort hip fire weapon.',
        metaRank: 1,
        matchPercent: 94,
        proUsage: '8/10 players',
        tags: ['Dead Eye', 'Dual Wield', 'Close Range'],
      },
      Sniper: {
        weapons: [
          { name: 'Carcano Rifle', icon: '🎯', type: 'Sniper', damage: 96 },
          { name: 'Rolling Block Rifle', icon: '🎯', type: 'Sniper', damage: 92 },
          { name: 'Lancaster Repeater', icon: '🔫', type: 'Repeater', damage: 75 },
          { name: 'Binoculars', icon: '🔭', type: 'Utility', damage: 0 },
        ],
        aiTip: 'The Carcano Rifle has the highest damage per shot in the game with express ammo. Use Dead Eye to paint targets at extreme range and the Lancaster for mid-range backup.',
        metaRank: 2,
        matchPercent: 89,
        proUsage: '6/10 players',
        tags: ['Long Range', 'Dead Eye', 'Hunting'],
      },
      Brawler: {
        weapons: [
          { name: 'Pump-Action Shotgun', icon: '💥', type: 'Shotgun', damage: 92 },
          { name: 'Machete', icon: '🗡️', type: 'Melee', damage: 70 },
          { name: 'Tomahawk', icon: '🪓', type: 'Thrown', damage: 78 },
          { name: 'Fire Bottle', icon: '🔥', type: 'Throwable', damage: 82 },
        ],
        aiTip: 'The Pump-Action Shotgun with slugs is a one-shot kill at surprising range. Use fire bottles to flush enemies from cover and the tomahawk for silent one-hit kills.',
        metaRank: 3,
        matchPercent: 85,
        proUsage: '5/10 players',
        tags: ['CQB', 'Melee', 'Aggressive'],
      },
      Hunter: {
        weapons: [
          { name: 'Springfield Rifle', icon: '🎯', type: 'Rifle', damage: 88 },
          { name: 'Varmint Rifle', icon: '🔫', type: 'Rifle', damage: 45 },
          { name: 'Bow', icon: '🏹', type: 'Ranged', damage: 65 },
          { name: 'Lasso', icon: '🤠', type: 'Utility', damage: 0 },
        ],
        aiTip: 'Use the Springfield with high velocity ammo for perfect large animal pelts. The Varmint Rifle is essential for small game — it is the only way to get perfect small pelts without ruining them.',
        metaRank: 4,
        matchPercent: 80,
        proUsage: '4/10 players',
        tags: ['Hunting', 'Pelts', 'Trader Role'],
      },
    },
  },

  'elder-scrolls': {
    playstyles: ['Warrior', 'Mage', 'Stealth Archer', 'Paladin'],
    patchLabel: 'Updated for Skyrim Anniversary Edition',
    loadouts: {
      Warrior: {
        weapons: [
          { name: 'Daedric Greatsword', icon: '⚔️', type: 'Two-Handed', damage: 94 },
          { name: 'Daedric Shield', icon: '🛡️', type: 'Heavy Armor', damage: 0 },
          { name: 'Dragonbone Warhammer', icon: '🔨', type: 'Two-Handed', damage: 92 },
          { name: 'Vegetable Soup', icon: '🍲', type: 'Consumable', damage: 0 },
        ],
        aiTip: 'The Daedric Greatsword with the Chaos Enchantment deals fire, frost, and shock damage simultaneously. Vegetable Soup grants unlimited power attacks — spam them for maximum DPS.',
        metaRank: 2,
        matchPercent: 90,
        proUsage: '6/10 players',
        tags: ['Melee', 'Tank', 'Power Attack'],
      },
      Mage: {
        weapons: [
          { name: 'Staff of Magnus', icon: '🪄', type: 'Staff', damage: 85 },
          { name: 'Destruction Spells', icon: '🔥', type: 'Magic', damage: 90 },
          { name: 'Conjuration Spells', icon: '👻', type: 'Magic', damage: 75 },
          { name: 'Archmage Robes', icon: '🧙', type: 'Apparel', damage: 0 },
        ],
        aiTip: 'Impact perk in Destruction staggers any enemy with dual-cast spells — even dragons. Conjure two Dremora Lords as tanks while you blast from range with Lightning Storm.',
        metaRank: 1,
        matchPercent: 93,
        proUsage: '7/10 players',
        tags: ['Destruction', 'Conjuration', 'Crowd Control'],
      },
      'Stealth Archer': {
        weapons: [
          { name: 'Dragonbone Bow', icon: '🏹', type: 'Bow', damage: 92 },
          { name: 'Daedric Arrows', icon: '🏹', type: 'Ammo', damage: 80 },
          { name: 'Nightingale Armor', icon: '🥷', type: 'Light Armor', damage: 0 },
          { name: 'Invisibility Potion', icon: '🧪', type: 'Potion', damage: 0 },
        ],
        aiTip: 'Stealth Archer is the most overpowered build in Skyrim. With maxed Sneak and Archery, you deal 3x sneak attack damage with bows — most enemies die before they detect you.',
        metaRank: 1,
        matchPercent: 97,
        proUsage: '9/10 players',
        tags: ['Sneak', 'One-Shot', 'Cheese'],
      },
      Paladin: {
        weapons: [
          { name: 'Dawnbreaker', icon: '☀️', type: 'One-Handed', damage: 82 },
          { name: 'Spellbreaker Shield', icon: '🛡️', type: 'Shield', damage: 0 },
          { name: 'Restoration Spells', icon: '✨', type: 'Magic', damage: 40 },
          { name: 'Amulet of Stendarr', icon: '📿', type: 'Amulet', damage: 0 },
        ],
        aiTip: 'Dawnbreaker causes a fiery explosion when killing undead, chain-killing groups of Draugr instantly. Spellbreaker creates a ward that blocks dragon breath and mage spells.',
        metaRank: 3,
        matchPercent: 86,
        proUsage: '5/10 players',
        tags: ['Anti-Undead', 'Sustain', 'Dungeons'],
      },
    },
  },
};
