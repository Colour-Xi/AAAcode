import { Harvester } from "./roles/Harvester";
import { Upgrader } from "./roles/Upgrader";
import { Builder } from "./roles/Builder";
import { RoleBornner } from "./roles/RoleBornner";

// // 类型扩展
// declare global {
//     interface CreepMemory {
//         role: 'harvester' | 'upgrader' | 'builder'; // 新增builder角色类型
//         working: boolean;
//     }
//     interface RoomMemory {
//         site: {
//             type: BuildableStructureConstant;
//             pos: {
//                 x: number;
//                 y: number;
//             };
//         }[];
//     }
// }

/**
 * 生成Creep
 */
// function spawnCreeps(spawn: StructureSpawn) {
//     const creeps = Object.values(Game.creeps);

//     // 生成采集者
//     const harvesters = creeps.filter(c => c.memory.role === 'harvester').length;
//     if (harvesters < 2) {
//         const name = `Harvester${Game.time}`;
//         spawn.spawnCreep([WORK, CARRY, MOVE], name, {
//             memory: {
//                 role: 'harvester', working: false,
//                 workMode: undefined,
//                 roomName: spawn.room.name,
//             }
//         });
//     }

//     // 生成升级者
//     const upgraders = creeps.filter(c => c.memory.role === 'upgrader').length;
//     if (upgraders < 2) {
//         const name = `Upgrader${Game.time}`;
//         spawn.spawnCreep([WORK, CARRY, MOVE], name, {
//             memory: {
//                 role: 'upgrader', working: false,
//                 workMode: undefined,
//                 roomName: spawn.room.name,
//             }
//         });
//     }

//     // 生成建造者（新增）
//     const builders = creeps.filter(c => c.memory.role === 'builder').length;
//     if (builders < 1) {
//         const name = `Builder${Game.time}`;
//         spawn.spawnCreep([WORK, CARRY, MOVE], name, {
//             memory: {
//                 role: 'builder', working: false,
//                 workMode: undefined,
//                 roomName: spawn.room.name,
//             }
//         });
//     }
// }

/**
 * 主循环
 */
export function loop() {
    // 生成Creep
    // const spawns = Object.values(Game.spawns);
    // if (spawns.length > 0) {
    //     spawnCreeps(spawns[0]);
    // }
    Object.values(Game.rooms).forEach(room => {
        const born = new RoleBornner(room);
        born.run();
    });

    // 运行所有Creep
    for (const creep of Object.values(Game.creeps)) {
        switch (creep.memory.role) {
            case 'harvester':
                new Harvester(creep).run();
                break;
            case 'upgrader':
                new Upgrader(creep).run();
                break;
            case 'builder': // 新增builder角色运行逻辑
                new Builder(creep).run();
                break;
        }
    }
}