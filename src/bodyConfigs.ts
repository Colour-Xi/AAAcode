


/**
 * Creep 身体配置表
 * 按角色和能量等级定义身体部件组合
 */
export const bodyConfigs = {
    harvester: [
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, WORK, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 1200, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    carrier : [
        { energy: 200, body: [CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [CARRY, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 400, body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 500, body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 600, body: [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 700, body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
    ],
    builder: [//与repairer合并
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, WORK, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    upgrader: [
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, CARRY, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    defender: [
        { energy: 200, body: [TOUGH, ATTACK, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 500, body: [TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    healer: [
        { energy: 300, body: [HEAL, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 500, body: [HEAL, HEAL, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ]
};

/**
 * 获取角色的最小能量需求
 */
export function getMinEnergyByRole(role: string): number {
    const roleConfigs = bodyConfigs[role as keyof typeof bodyConfigs];
    return roleConfigs ? roleConfigs[0].energy : 200;
}

/**
 * 获取当前能量支持的最优身体配置
 */
export function getOptimalBody(role: string, availableEnergy: number): BodyPartConstant[] {
    const roleConfigs = bodyConfigs[role as keyof typeof bodyConfigs];
    if (!roleConfigs) return [WORK, CARRY, MOVE];

    let bestConfig = roleConfigs[0];
    for (const config of roleConfigs) {
        if (availableEnergy >= config.energy && config.energy > bestConfig.energy) {
            bestConfig = config;
        }
    }

    return bestConfig.body;
}