


/**
 * Creep 身体配置表
 * 按角色和能量等级定义身体部件组合
 */
export const bodyConfigs = {
    harvester: [// 高能力
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, WORK, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 1200, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    carrier : [// 高容量
        { energy: 200, body: [CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [CARRY, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 400, body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 500, body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 600, body: [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 700, body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] },
    ],
    builder: [//与repairer合并 // 需求：高续航
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, WORK, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    upgrader: [// 需求：高能力
        { energy: 200, body: [WORK, CARRY, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [WORK, CARRY, CARRY, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 550, body: [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 800, body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    defender: [// 需求：高威力
        { energy: 200, body: [TOUGH, ATTACK, MOVE] as BodyPartConstant[] },
        { energy: 300, body: [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE] as BodyPartConstant[] },
        { energy: 500, body: [TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE] as BodyPartConstant[] }
    ],
    healer: [// 需求：高效果
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

// 身体部件成本
export const BODY_PART_COST: { [key: string]: number } = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10,
};