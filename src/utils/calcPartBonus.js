import { extractLevelFromName } from './msLevelUtil';

const byLevelKeys = {
  hp: "hpByLevel",
  shoot: "shootByLevel",
  meleeCorrection: "meleeCorrectionByLevel",
  armorRange: "armorRangeByLevel",
  armorBeam: "armorBeamByLevel",
  armorMelee: "armorMeleeByLevel",
  thruster: "thrusterByLevel",
  speed: "speedByLevel",
  highSpeedMovement: "highSpeedMovementByLevel"
};

export function calcPartBonus(parts, ms, isFullStrengthened, bonusInitialState) {
  const msLevel = extractLevelFromName(ms["MS名"]);
  const partBonus = { ...bonusInitialState };

  parts.forEach(part => {
    // レベル依存加算
    Object.entries(byLevelKeys).forEach(([statKey, byLevelProp]) => {
      if (Array.isArray(part[byLevelProp])) {
        const idx = Math.min(msLevel, part[byLevelProp].length) - 1;
        const bonus = part[byLevelProp][idx];
        if (typeof bonus === "number") {
          partBonus[statKey] += bonus;
        }
      }
    });

    // 通常加算（ByLevelがなければ従来通り）
    if (!Array.isArray(part.hpByLevel)) {
      if (isFullStrengthened && typeof part.hp_full === 'number') {
        partBonus.hp += part.hp_full;
      } else if (typeof part.hp === 'number') {
        partBonus.hp += part.hp;
      }
    }
    if (!Array.isArray(part.shootByLevel)) {
      if (isFullStrengthened && typeof part.shoot_full === 'number') {
        partBonus.shoot += part.shoot_full;
      } else if (typeof part.shoot === 'number') {
        partBonus.shoot += part.shoot;
      }
    }
    if (!Array.isArray(part.meleeCorrectionByLevel)) {
      if (isFullStrengthened && typeof part.melee_full === 'number') {
        partBonus.meleeCorrection += part.melee_full;
      } else if (typeof part.melee === 'number') {
        partBonus.meleeCorrection += part.melee;
      }
    }
    if (!Array.isArray(part.armorRangeByLevel)) {
      if (isFullStrengthened && typeof part.armor_range_full === 'number') {
        partBonus.armorRange += part.armor_range_full;
      } else if (typeof part.armor_range === 'number') {
        partBonus.armorRange += part.armor_range;
      } else if (typeof part.shootDefense === 'number') {
        partBonus.armorRange += part.shootDefense;
      }
    }
    if (!Array.isArray(part.armorBeamByLevel)) {
      if (isFullStrengthened && typeof part.armor_beam_full === 'number') {
        partBonus.armorBeam += part.armor_beam_full;
      } else if (typeof part.armor_beam === 'number') {
        partBonus.armorBeam += part.armor_beam;
      } else if (typeof part.beamDefense === 'number') {
        partBonus.armorBeam += part.beamDefense;
      }
    }
    if (!Array.isArray(part.armorMeleeByLevel)) {
      if (isFullStrengthened && typeof part.armor_melee_full === 'number') {
        partBonus.armorMelee += part.armor_melee_full;
      } else if (typeof part.armor_melee === 'number') {
        partBonus.armorMelee += part.armor_melee;
      } else if (typeof part.meleeDefense === 'number') {
        partBonus.armorMelee += part.meleeDefense;
      }
    }
    if (!Array.isArray(part.thrusterByLevel)) {
      if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
    }
    if (!Array.isArray(part.speedByLevel)) {
      if (typeof part.speed === 'number') partBonus.speed += part.speed;
    }
    if (!Array.isArray(part.highSpeedMovementByLevel)) {
      if (typeof part.highSpeedMovement === 'number') partBonus.highSpeedMovement += part.highSpeedMovement;
    }
    if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
    if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;
  });

  return partBonus;
}