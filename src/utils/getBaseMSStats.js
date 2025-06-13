// src/utils/getBaseMSStats.js

/**
 * MSの基本ステータス値を取得します。
 * @param {object} ms - 選択されたMSデータ。
 * @returns {object} 計算された基本ステータス値のオブジェクト。
 */
export const getBaseMSStats = (ms) => {
    if (!ms) {
        return {
            hp: 0, armorRange: 0, armorBeam: 0, armorMelee: 0,
            shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0,
            turnPerformanceGround: 0, turnPerformanceSpace: 0,
        };
    }

    return {
        hp: Number(ms.HP || 0),
        armorRange: Number(ms.耐実弾補正 || 0),
        armorBeam: Number(ms.耐ビーム補正 || 0),
        armorMelee: Number(ms.耐格闘補正 || 0),
        shoot: Number(ms.射撃補正 || 0),
        meleeCorrection: Number(ms.格闘補正 || 0),
        speed: Number(ms.スピード || 0),
        highSpeedMovement: Number(ms.高速移動 || 0),
        thruster: Number(ms.スラスター || 0),
        turnPerformanceGround: Number(ms["旋回_地上_通常時"] || 0),
        turnPerformanceSpace: Number(ms["旋回_宇宙_通常時"] || 0),
    };
};