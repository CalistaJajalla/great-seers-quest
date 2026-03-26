// =====================================================
// SEER SQL GAME - Client Side Quest Generator
// =====================================================

class QuestGenerator {
    constructor() {
        this.rd = {
            femaleNames: ['Calixta', 'Felicity', 'Mikaella', 'Sydnie', 'Lyra', 'Seraphina', 'Morwen', 'Aelindra', 'Vespera', 'Nyx', 'Isolde', 'Thessaly', 'Brynn', 'Caelia', 'Thalindra'],
            maleNames: ['Julian', 'Aldric', 'Caelan', 'Dorian', 'Fenwick', 'Gideon', 'Hadrian', 'Idris', 'Joren', 'Kael', 'Lysander', 'Malachar', 'Navar', 'Oryn', 'Percival'],
            races: ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc'],
            jobs: ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Bard', 'Monk', 'Druid', 'Warlock', 'Sorcerer', 'Barbarian'],
            hairColors: ['Black', 'Brown', 'Blonde', 'Red', 'White', 'Silver', 'Auburn', 'Chestnut'],
            skinTones: ['Fair', 'Tan', 'Dark', 'Olive', 'Pale', 'Bronze', 'Ebony'],
            eyeColors: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Gold'],
            bodyTypes: ['Slender', 'Athletic', 'Muscular', 'Stocky', 'Heavyset', 'Lean', 'Petite'],
            backgrounds: ['Noble', 'Commoner', 'Sage', 'Criminal', 'Soldier', 'Acolyte', 'Outlander', 'Folk Hero', 'Merchant', 'Artisan'],
            alignments: ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'],
            genders: ['Male', 'Female'],

            armorTypes: ['Plate', 'Chain', 'Scale', 'Leather', 'Studded Leather', 'Cloth', 'Mage Robes', 'Hide'],
            armorMaterials: ['Iron', 'Steel', 'Mithril', 'Dragonscale', 'Hardened Leather', 'Chainmail', 'Adamantine', 'Crystal'],
            enchantments: ['None', 'Fire Resistance', 'Ice Resistance', 'Lightning Resistance', 'Holy Ward', 'Shadow Shroud', 'Speed', 'Fortification'],
            blessings: ['None', 'Divine', 'Nature', 'Arcane', 'Shadow', 'Elemental', 'Ancient'],
            weightClasses: ['Light', 'Medium', 'Heavy'],
            artifactLevels: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'],

            weaponTypes: ['Sword', 'Axe', 'Mace', 'Spear', 'Bow', 'Crossbow', 'Dagger', 'Staff', 'Warhammer', 'Greatsword', 'Rapier', 'Scimitar', 'Wand'],
            weaponMaterials: ['Steel', 'Silver', 'Moonstone', 'Dragonbone', 'Starmetal', 'Obsidian', 'Crystal', 'Runestone'],
            elements: ['Fire', 'Ice', 'Lightning', 'Holy', 'Shadow', 'Poison', 'Radiant', 'Necrotic', 'Force', 'Psychic'],
            damageTypes: ['Slashing', 'Piercing', 'Bludgeoning', 'Magic'],
            rangeTypes: ['Melee', 'Ranged (Close)', 'Ranged (Medium)', 'Ranged (Long)'],
            handedness: ['One-handed', 'Two-handed', 'Versatile'],

            calamityTypes: ['Dragon', 'Demon Lord', 'Ancient Evil', 'Corrupted God', 'Lich King', 'Undead Horde', 'Void Entity', 'Elemental Titan', 'Fallen Angel', 'Chaos Beast', 'Shadow Wraith'],
            bodyParts: ['Head', 'Heart', 'Back', 'Wings', 'Core', 'Chest', 'Eyes'],
            statusEffects: ['Fear', 'Madness', 'Despair', 'Rage', 'Hopelessness', 'Paranoia'],

            classWeapons: {
                'Warrior': ['Sword', 'Greatsword', 'Axe', 'Mace'],
                'Mage': ['Staff', 'Wand'],
                'Rogue': ['Dagger', 'Rapier', 'Crossbow'],
                'Cleric': ['Mace', 'Staff'],
                'Ranger': ['Bow', 'Crossbow', 'Spear'],
                'Paladin': ['Sword', 'Mace', 'Greatsword'],
                'Bard': ['Rapier', 'Dagger'],
                'Monk': ['Staff', 'Dagger'],
                'Druid': ['Staff', 'Scimitar'],
                'Warlock': ['Staff', 'Wand'],
                'Sorcerer': ['Staff', 'Wand'],
                'Barbarian': ['Axe', 'Greatsword', 'Warhammer']
            }
        };
    }

    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    _int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    _esc(s) { return String(s).replace(/'/g, "''"); }

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    _randomId(min, max) {
        const ids = Array.from({length: max - min + 1}, (_, i) => i + min);
        return this._shuffle(ids)[0];
    }

    _pickLocation(locations) {
        return this._shuffle(locations)[0];
    }

    // ===== GENERATORS =====

    generateHero(heroId, locations) {
        const rd = this.rd;
        const gender = this._pick(rd.genders);
        const name = this._pick(gender === 'Female' ? rd.femaleNames : rd.maleNames);
        const loc = this._pickLocation(locations);
        const birthLoc = this._pickLocation(locations);
        return {
            person_id: heroId,
            name,
            gender,
            race: this._pick(rd.races),
            hair_color: this._pick(rd.hairColors),
            skin_tone: this._pick(rd.skinTones),
            eye_color: this._pick(rd.eyeColors),
            height: this._int(150, 210),
            body_type: this._pick(rd.bodyTypes),
            job: this._pick(rd.jobs),
            background: this._pick(rd.backgrounds),
            alignment: this._pick(rd.alignments),
            birthplace_id: birthLoc.location_id,
            current_location_id: loc.location_id,
            armor_id: null,
            weapon_id: null,
            destiny_score: this._int(1, 49)
        };
    }

    generateArmor(armorId, locations) {
        const rd = this.rd;
        const loc = this._pickLocation(locations);
        const armorType = this._pick(rd.armorTypes);
        const typeToWeight = {
            'Plate': 'Heavy', 'Chain': 'Heavy', 'Scale': 'Medium', 'Hide': 'Medium',
            'Studded Leather': 'Medium', 'Leather': 'Light', 'Cloth': 'Light', 'Mage Robes': 'Light'
        };
        return {
            armor_id: armorId,
            armor_name: `${this._pick(rd.enchantments).replace('None','Sturdy')} ${armorType}`,
            armor_type: armorType,
            material: this._pick(rd.armorMaterials),
            primary_enchantment: this._pick(rd.enchantments),
            secondary_enchantment: this._pick(rd.enchantments),
            blessing: this._pick(rd.blessings),
            defense_rating: this._int(10, 100),
            magic_resistance: this._int(0, 100),
            weight_class: typeToWeight[armorType] || 'Medium',
            artifact_level: this._pick(rd.artifactLevels),
            found_location_id: loc.location_id,
            required_strength: this._int(8, 20),
            special_property: this._pick(['None', 'Glowing', 'Regenerating', 'Phase Shift', 'Spell Absorb']),
            crafted_by: this._pick(['Unknown Smith', 'Dwarven Master', 'Elven Artisan', 'Arcane Forge', 'Dragon Fire'])
        };
    }

    generateWeapon(weaponId, heroJob, locations) {
        const rd = this.rd;
        const loc = this._pickLocation(locations);
        const forgeLoc = this._pickLocation(locations);
        const compatTypes = rd.classWeapons[heroJob] || rd.weaponTypes;
        const weaponType = this._pick(compatTypes);
        const typeToHandedness = {
            'Greatsword': 'Two-handed', 'Warhammer': 'Two-handed', 'Bow': 'Two-handed',
            'Crossbow': 'Two-handed', 'Staff': 'Two-handed', 'Spear': 'Versatile',
            'Axe': 'Versatile', 'Sword': 'Versatile'
        };
        return {
            weapon_id: weaponId,
            weapon_name: `${this._pick(['Ancient','Blessed','Cursed','Radiant','Shadow'])} ${weaponType}`,
            weapon_type: weaponType,
            material: this._pick(rd.weaponMaterials),
            primary_enchantment: this._pick(rd.enchantments),
            secondary_enchantment: this._pick(rd.enchantments),
            tertiary_enchantment: 'None',
            blessing: this._pick(rd.blessings),
            elemental_property: this._pick(rd.elements),
            damage_type: this._pick(rd.damageTypes),
            range_type: ['Bow','Crossbow'].includes(weaponType) ? 'Ranged (Medium)' : 'Melee',
            handedness: typeToHandedness[weaponType] || 'One-handed',
            attack_rating: this._int(10, 100),
            critical_modifier: parseFloat((this._int(10, 30) / 10).toFixed(1)),
            legendary_property: this._pick(['None', 'Soul Drain', 'Vorpal Edge', 'Spell Strike', 'Bane of Darkness']),
            bound_to_bloodline: 'None',
            crafted_by: this._pick(['Unknown', 'Master Forgewright', 'Elven Bladesmith', 'Dwarven Runesmith']),
            forged_location_id: forgeLoc.location_id,
            stored_location_id: loc.location_id,
            calamity_weakness_match: 0,
            required_level: this._int(1, 20)
        };
    }

    generateCalamity(calamityId, locations) {
        const rd = this.rd;
        const loc = this._pickLocation(locations);
        const prefix = this._pick(['Lord', 'King', 'Queen', 'Master', 'Ancient', 'Eternal', 'Dread', 'Supreme']);
        const suffix = this._pick(['Darkness', 'Flame', 'Frost', 'Shadow', 'Chaos', 'Doom', 'Ruin', 'Devourer', 'Destroyer', 'Corruptor']);
        const primaryPower = this._pick(rd.elements);
        let vulnElem = this._pick(rd.elements);
        while (vulnElem === primaryPower) vulnElem = this._pick(rd.elements);
        return {
            calamity_id: calamityId,
            entity_name: `${prefix} ${suffix}`,
            calamity_type: this._pick(rd.calamityTypes),
            true_form: this._pick(['Dragon', 'Humanoid', 'Monstrous', 'Shapeless', 'Ethereal']),
            current_form: this._pick(['Shadowy Giant', 'Dark Colossus', 'Corrupted Beast', 'Void Wraith']),
            origin_realm: this._pick(['Abyss', 'Nine Hells', 'Void', 'Elemental Plane', 'Corrupted Realm', 'Shadow Dimension']),
            primary_power: primaryPower,
            secondary_power: this._pick(rd.elements),
            tertiary_power: this._pick(rd.elements),
            environmental_effect: this._pick(['Eternal Night', 'Withering Plague', 'Soul Drain', 'Mana Void', 'Corruption Aura']),
            psychological_effect: this._pick(rd.statusEffects),
            corruption_radius: this._int(10, 500),
            primary_weakness: vulnElem,
            secondary_weakness: this._pick(rd.elements),
            weak_body_part: this._pick(rd.bodyParts),
            vulnerable_time: this._pick(['Midnight', 'Noon', 'Eclipse', 'Full Moon', 'Blood Moon', 'Dawn']),
            vulnerable_element: vulnElem,
            minion_types: this._pick(['Demons', 'Undead', 'Elementals', 'Corrupted Beasts', 'Shadow Creatures', 'Void Spawn']),
            stronghold_location_id: loc.location_id,
            awakening_date: this._pick(['Ancient times', '100 years ago', 'Blood Moon Rising', 'Crimson Convergence']),
            prophecy_identifier: `${this._pick(['The','Of the','Known as the'])} ${prefix} ${suffix}`,
            defeat_condition: this._pick(['Strike the weak point', 'Destroy the core', 'Banish to origin realm', 'Defeat through prophecy']),
            threat_level: this._int(7, 10)
        };
    }

    // ===== CLUE GENERATION (progressive difficulty) =====
    // diff 1 = easy (few filters), diff 4 = expert (many filters, more columns)

    generateHeroClue(hero, location, diff) {
        const locName = location ? location.location_name : 'the realm';
        if (diff <= 1) {
            return {
                text: `Your vision clears. A ${hero.race} ${hero.job} walks among the living, their ${hero.hair_color} hair catching the light. Seek them.`,
                hint1: `Use WHERE to filter: SELECT * FROM person WHERE race = '...' AND job = '...' -- fill in the values from the vision.`,
                solution: `SELECT * FROM person\nWHERE race = '${hero.race}'\nAND job = '${hero.job}';`
            };
        } else if (diff <= 2) {
            return {
                text: `A ${hero.gender} ${hero.race} of ${hero.alignment} alignment. They serve as a ${hero.job} with ${hero.skin_tone} skin. Seek them in the records.`,
                hint1: `Filter by gender, race, alignment, and job. Try: SELECT * FROM person WHERE gender = '...' AND race = '...' AND alignment = '...' AND job = '...'`,
                solution: `SELECT * FROM person\nWHERE gender = '${hero.gender}'\nAND race = '${hero.race}'\nAND alignment = '${hero.alignment}'\nAND job = '${hero.job}';`
            };
        } else if (diff <= 3) {
            return {
                text: `The hero is a ${hero.job} of ${hero.background} background, a ${hero.race} standing ${hero.height}cm tall with ${hero.eye_color} eyes and a ${hero.body_type} build. Find them.`,
                hint1: `Filter by job, race, background, height, eye_color, and body_type. All these columns are on the person table.`,
                solution: `SELECT * FROM person\nWHERE job = '${hero.job}'\nAND race = '${hero.race}'\nAND background = '${hero.background}'\nAND height = ${hero.height}\nAND eye_color = '${hero.eye_color}';`
            };
        } else {
            return {
                text: `A ${hero.race} ${hero.job} of ${hero.background} blood, ${hero.height}cm tall. ${hero.hair_color} hair, ${hero.skin_tone} skin, ${hero.eye_color} eyes and a ${hero.body_type} frame. They currently dwell in ${locName}. Find them alongside their current location details.`,
                hint1: `JOIN person with location on current_location_id = location_id. Filter by race, job, background, height, hair_color, and skin_tone. Include l.location_name and l.region in your SELECT.`,
                solution: `SELECT p.*, l.location_name, l.region FROM person p\nJOIN location l ON p.current_location_id = l.location_id\nWHERE p.job = '${hero.job}'\nAND p.race = '${hero.race}'\nAND p.background = '${hero.background}'\nAND p.height = ${hero.height}\nAND p.hair_color = '${hero.hair_color}'\nAND p.skin_tone = '${hero.skin_tone}';`
            };
        }
    }

    generateArmorClue(armor, location, diff) {
        const locName = location ? location.location_name : 'a distant place';
        if (diff <= 2) {
            return {
                text: `The armor is made of ${armor.material}, forged as ${armor.armor_type}. It sits in ${locName}. Find the armor and the name of where it is kept.`,
                hint1: `JOIN armor with location: SELECT a.*, l.location_name FROM armor a JOIN location l ON a.found_location_id = l.location_id WHERE a.material = '...' AND a.armor_type = '...'`,
                solution: `SELECT a.*, l.location_name FROM armor a\nJOIN location l ON a.found_location_id = l.location_id\nWHERE a.material = '${armor.material}'\nAND a.armor_type = '${armor.armor_type}';`
            };
        } else if (diff <= 3) {
            return {
                text: `A ${armor.weight_class} ${armor.armor_type} of ${armor.material}, blessed with ${armor.blessing} power. Defense rating: ${armor.defense_rating}. It rests in ${locName}. Locate it together with its resting place.`,
                hint1: `JOIN armor with location on found_location_id = location_id. Filter by armor_type, material, blessing, and weight_class.`,
                solution: `SELECT a.*, l.location_name, l.region FROM armor a\nJOIN location l ON a.found_location_id = l.location_id\nWHERE a.armor_type = '${armor.armor_type}'\nAND a.material = '${armor.material}'\nAND a.blessing = '${armor.blessing}'\nAND a.weight_class = '${armor.weight_class}';`
            };
        } else {
            return {
                text: `A ${armor.artifact_level} ${armor.armor_type} of ${armor.material}, enchanted with ${armor.primary_enchantment}. Defense rating: ${armor.defense_rating}. Magic resistance: ${armor.magic_resistance}. Crafted by ${armor.crafted_by}, found in ${locName}. Return it alongside the location region and danger level.`,
                hint1: `JOIN armor with location on found_location_id = location_id. Filter by artifact_level, armor_type, material, primary_enchantment, and defense_rating. Include l.region and l.danger_level in your SELECT.`,
                solution: `SELECT a.*, l.location_name, l.region, l.danger_level FROM armor a\nJOIN location l ON a.found_location_id = l.location_id\nWHERE a.artifact_level = '${armor.artifact_level}'\nAND a.armor_type = '${armor.armor_type}'\nAND a.material = '${armor.material}'\nAND a.primary_enchantment = '${armor.primary_enchantment}'\nAND a.defense_rating = ${armor.defense_rating};`
            };
        }
    }

    generateWeaponClue(weapon, hero, location, diff) {
        const locName = location ? location.location_name : 'a forge';
        if (diff <= 2) {
            return {
                text: `A ${weapon.weapon_type} forged from ${weapon.material}, imbued with ${weapon.elemental_property} power. It rests in ${locName}. Find the weapon and where it is stored.`,
                hint1: `JOIN weapon with location using stored_location_id = location_id. Filter by weapon_type, material, and elemental_property.`,
                solution: `SELECT w.*, l.location_name FROM weapon w\nJOIN location l ON w.stored_location_id = l.location_id\nWHERE w.weapon_type = '${weapon.weapon_type}'\nAND w.material = '${weapon.material}'\nAND w.elemental_property = '${weapon.elemental_property}';`
            };
        } else if (diff <= 3) {
            return {
                text: `A ${weapon.handedness} ${weapon.weapon_type} forged from ${weapon.material}, dealing ${weapon.damage_type} damage with ${weapon.elemental_property} power. It waits in ${locName}. Find it alongside its storage location.`,
                hint1: `JOIN weapon with location on stored_location_id = location_id. Filter by weapon_type, material, handedness, damage_type, and elemental_property.`,
                solution: `SELECT w.*, l.location_name, l.region FROM weapon w\nJOIN location l ON w.stored_location_id = l.location_id\nWHERE w.weapon_type = '${weapon.weapon_type}'\nAND w.material = '${weapon.material}'\nAND w.handedness = '${weapon.handedness}'\nAND w.elemental_property = '${weapon.elemental_property}';`
            };
        } else {
            return {
                text: `The destined weapon is a ${weapon.artifact_level} ${weapon.weapon_type} of ${weapon.material}, ${weapon.handedness}, blessed with ${weapon.blessing}. Its ${weapon.elemental_property} power matches the weakness of the Calamity (calamity_weakness_match = 1). Attack rating: ${weapon.attack_rating}. Stored in ${locName} by ${weapon.crafted_by}. Return all weapon details alongside the storage location region and danger level.`,
                hint1: `JOIN weapon with location on stored_location_id = location_id. Filter by weapon_type, material, elemental_property, calamity_weakness_match = 1, and artifact_level. Include l.region and l.danger_level.`,
                solution: `SELECT w.*, l.location_name, l.region, l.danger_level FROM weapon w\nJOIN location l ON w.stored_location_id = l.location_id\nWHERE w.weapon_type = '${weapon.weapon_type}'\nAND w.material = '${weapon.material}'\nAND w.elemental_property = '${weapon.elemental_property}'\nAND w.calamity_weakness_match = 1\nAND w.artifact_level = '${weapon.artifact_level}';`
            };
        }
    }

    generateCalamityClue(calamity, hero, armor, weapon, diff) {
        if (diff <= 3) {
            return {
                text: `The final vision is dark and shifting. A ${calamity.calamity_type} stirs, its power drawn from ${calamity.primary_power}. Its weakness is hidden in ${calamity.vulnerable_element}. It lurks within ${calamity.origin_realm}. Find the darkness and what can end it.`,
                hint1: `JOIN calamity with location on stronghold_location_id = location_id. Filter by calamity_type and origin_realm. Return entity_name, calamity_type, vulnerable_element, weak_body_part, and defeat_condition.`,
                solution: `SELECT c.entity_name, c.calamity_type, c.origin_realm, c.vulnerable_element, c.weak_body_part, c.defeat_condition, c.threat_level, l.location_name AS stronghold FROM calamity c\nJOIN location l ON c.stronghold_location_id = l.location_id\nWHERE c.calamity_type = '${calamity.calamity_type}'\nAND c.origin_realm = '${calamity.origin_realm}';`
            };
        } else {
            return {
                text: `The final vision tears open. A ${calamity.calamity_type} has awakened from ${calamity.origin_realm}. Its primary power is ${calamity.primary_power}, its weakness is ${calamity.vulnerable_element}. Its true form is ${calamity.true_form}. The ${calamity.environmental_effect} spreads from its stronghold, and it inflicts ${calamity.psychological_effect} on all who face it. The weak body part is ${calamity.weak_body_part}. Find the Calamity and retrieve all details needed to destroy it, including the stronghold region and danger level.`,
                hint1: `JOIN calamity with location on stronghold_location_id = location_id. Filter by calamity_type, origin_realm, primary_power, and true_form. Include l.danger_level and l.region in your SELECT.`,
                solution: `SELECT c.entity_name, c.calamity_type, c.true_form, c.origin_realm, c.primary_power, c.vulnerable_element, c.weak_body_part, c.defeat_condition, c.environmental_effect, c.psychological_effect, c.threat_level, c.minion_types, l.location_name AS stronghold, l.region, l.danger_level FROM calamity c\nJOIN location l ON c.stronghold_location_id = l.location_id\nWHERE c.calamity_type = '${calamity.calamity_type}'\nAND c.origin_realm = '${calamity.origin_realm}'\nAND c.primary_power = '${calamity.primary_power}'\nAND c.true_form = '${calamity.true_form}';`
            };
        }
    }

    // ===== FULL QUEST =====
    generateFullQuest(locations, difficulty) {
        // difficulty 1=easy ... 4=expert; defaults to 2 (medium)
        // Chapters scale progressively: each chapter is one step harder than the previous
        const baseDiff = difficulty || 2;

        const heroId   = this._randomId(1, 100);
        const armorId  = this._randomId(1, 50);
        const weaponId = this._randomId(1, 50);
        const calId    = this._randomId(1, 20);

        const hero     = this.generateHero(heroId, locations);
        hero.destiny_score = 100;
        const armor    = this.generateArmor(armorId, locations);
        const weapon   = this.generateWeapon(weaponId, hero.job, locations);
        weapon.calamity_weakness_match = 1;
        const calamity = this.generateCalamity(calId, locations);

        // Progressive: Ch I = baseDiff, Ch II = baseDiff+1, Ch III = baseDiff+1, Ch IV = 4
        const heroDiff     = Math.min(baseDiff, 4);
        const armorDiff    = Math.min(baseDiff + 1, 4);
        const weaponDiff   = Math.min(baseDiff + 1, 4);
        const calamityDiff = 4;

        const heroLoc   = locations.find(l => l.location_id === hero.current_location_id) || locations[0];
        const armorLoc  = locations.find(l => l.location_id === armor.found_location_id)  || locations[0];
        const weaponLoc = locations.find(l => l.location_id === weapon.stored_location_id) || locations[0];

        return {
            hero, armor, weapon, calamity,
            heroClue:     this.generateHeroClue(hero, heroLoc, heroDiff),
            armorClue:    this.generateArmorClue(armor, armorLoc, armorDiff),
            weaponClue:   this.generateWeaponClue(weapon, hero, weaponLoc, weaponDiff),
            calamityClue: this.generateCalamityClue(calamity, hero, armor, weapon, calamityDiff)
        };
    }

    // ===== DECOY GENERATORS =====
    generateDecoyPersons(count, heroId, heroJob, locations) {
        const persons = [];
        for (let i = 1; i <= count; i++) {
            if (i === heroId) continue;
            const p = this.generateHero(i, locations);
            p.destiny_score = this._int(1, 49);
            persons.push(p);
        }
        return persons;
    }

    generateDecoyArmors(count, armorId, locations) {
        const armors = [];
        for (let i = 1; i <= count; i++) {
            if (i === armorId) continue;
            armors.push(this.generateArmor(i, locations));
        }
        return armors;
    }

    generateDecoyWeapons(count, weaponId, heroJob, locations) {
        const weapons = [];
        for (let i = 1; i <= count; i++) {
            if (i === weaponId) continue;
            const w = this.generateWeapon(i, heroJob, locations);
            w.calamity_weakness_match = 0;
            weapons.push(w);
        }
        return weapons;
    }

    generateDecoyCalamities(count, calId, locations) {
        const cals = [];
        for (let i = 1; i <= count; i++) {
            if (i === calId) continue;
            cals.push(this.generateCalamity(i, locations));
        }
        return cals;
    }

    // ===== SQL INSERT GENERATION =====

    insertPersonSQL(p) {
        return `INSERT INTO person (person_id,name,gender,race,hair_color,skin_tone,eye_color,height,body_type,job,background,alignment,birthplace_id,current_location_id,armor_id,weapon_id,destiny_score) VALUES (${p.person_id},'${this._esc(p.name)}','${p.gender}','${p.race}','${p.hair_color}','${p.skin_tone}','${p.eye_color}',${p.height},'${p.body_type}','${p.job}','${p.background}','${p.alignment}',${p.birthplace_id},${p.current_location_id},${p.armor_id === null ? 'NULL' : p.armor_id},${p.weapon_id === null ? 'NULL' : p.weapon_id},${p.destiny_score});`;
    }

    insertArmorSQL(a) {
        return `INSERT INTO armor (armor_id,armor_name,armor_type,material,primary_enchantment,secondary_enchantment,blessing,defense_rating,magic_resistance,weight_class,artifact_level,found_location_id,required_strength,special_property,crafted_by) VALUES (${a.armor_id},'${this._esc(a.armor_name)}','${a.armor_type}','${a.material}','${a.primary_enchantment}','${a.secondary_enchantment}','${a.blessing}',${a.defense_rating},${a.magic_resistance},'${a.weight_class}','${a.artifact_level}',${a.found_location_id},${a.required_strength},'${this._esc(a.special_property)}','${this._esc(a.crafted_by)}');`;
    }

    insertWeaponSQL(w) {
        return `INSERT INTO weapon (weapon_id,weapon_name,weapon_type,material,primary_enchantment,secondary_enchantment,tertiary_enchantment,blessing,elemental_property,damage_type,range_type,handedness,attack_rating,critical_modifier,legendary_property,bound_to_bloodline,crafted_by,forged_location_id,stored_location_id,calamity_weakness_match,required_level) VALUES (${w.weapon_id},'${this._esc(w.weapon_name)}','${w.weapon_type}','${w.material}','${w.primary_enchantment}','${w.secondary_enchantment}','${w.tertiary_enchantment}','${w.blessing}','${w.elemental_property}','${w.damage_type}','${w.range_type}','${w.handedness}',${w.attack_rating},${w.critical_modifier},'${this._esc(w.legendary_property)}','${w.bound_to_bloodline}','${this._esc(w.crafted_by)}',${w.forged_location_id},${w.stored_location_id},${w.calamity_weakness_match},${w.required_level});`;
    }

    insertCalamitySQL(c) {
        return `INSERT INTO calamity (calamity_id,entity_name,calamity_type,true_form,current_form,origin_realm,primary_power,secondary_power,tertiary_power,environmental_effect,psychological_effect,corruption_radius,primary_weakness,secondary_weakness,weak_body_part,vulnerable_time,vulnerable_element,minion_types,stronghold_location_id,awakening_date,prophecy_identifier,defeat_condition,threat_level) VALUES (${c.calamity_id},'${this._esc(c.entity_name)}','${this._esc(c.calamity_type)}','${c.true_form}','${c.current_form}','${c.origin_realm}','${c.primary_power}','${c.secondary_power}','${c.tertiary_power}','${this._esc(c.environmental_effect)}','${c.psychological_effect}',${c.corruption_radius},'${c.primary_weakness}','${c.secondary_weakness}','${c.weak_body_part}','${c.vulnerable_time}','${c.vulnerable_element}','${this._esc(c.minion_types)}',${c.stronghold_location_id},'${this._esc(c.awakening_date)}','${this._esc(c.prophecy_identifier)}','${this._esc(c.defeat_condition)}',${c.threat_level});`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestGenerator;
} else {
    window.QuestGenerator = QuestGenerator;
}