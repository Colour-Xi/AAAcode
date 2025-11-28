// // 颜色常量
// export const COLORS = {
//     HARVESTER: '#FFD700', // 金色
//     UPGRADER: '#4169E1',  // 皇家蓝
//     BUILDER: '#32CD32',   //  limegreen
//     REPAIRER: '#FF6347',  // 番茄色
//     CLAIMER: '#9370DB',   // 中紫色
//     SOLDIER: '#FF0000',   // 红色
// };

// // 优先级常量
// export const PRIORITIES = {
//     EMERGENCY: 100,
//     SPAWN: 50,
//     EXTENSION: 45,
//     TOWER: 40,
//     STORAGE: 35,
//     UPGRADE: 30,
//     CONSTRUCTION: 25,
//     REPAIR: 20,
//     HARVEST: 10,
// };

// // 角色配置
// export const ROLE_CONFIG: { [key: string]: { body: BodyPartConstant[], minCount: number, maxCount: number } } = {
//     harvester: {
//         body: [WORK, CARRY, MOVE],
//         minCount: 2,
//         maxCount: 5,
//     },
//     upgrader: {
//         body: [WORK, CARRY, MOVE],
//         minCount: 2,
//         maxCount: 5,
//     },
//     builder: {
//         body: [WORK, CARRY, MOVE],
//         minCount: 1,
//         maxCount: 3,
//     },
//     repairer: {
//         body: [WORK, CARRY, MOVE],
//         minCount: 1,
//         maxCount: 2,
//     },
//     claimer: {
//         body: [CLAIM, MOVE],
//         minCount: 0,
//         maxCount: 1,
//     },
//     soldier: {
//         body: [ATTACK, MOVE],
//         minCount: 0,
//         maxCount: 3,
//     },
// };

// // 身体部件成本
// export const BODY_PART_COST: { [key: string]: number } = {
//     [MOVE]: 50,
//     [WORK]: 100,
//     [CARRY]: 50,
//     [ATTACK]: 80,
//     [RANGED_ATTACK]: 150,
//     [HEAL]: 250,
//     [CLAIM]: 600,
//     [TOUGH]: 10,
// };

// // 计算身体成本
// export function calculateBodyCost(body: BodyPartConstant[]): number {
//     return body.reduce((cost, part) => cost + BODY_PART_COST[part], 0);
// }
