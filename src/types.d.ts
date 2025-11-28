
// 类型扩展
declare global {
    // 扩展Memory接口
    interface Memory {
        creeps: {
            [name: string]: CreepMemory;
        };
        rooms: {
            [roomName: string]: RoomMemory;
        };


        globalConfig: { // 全局配置
            version: string; // 版本号
            lastCleanup: number; // 上次清理时间戳
            cleanupInterval: number; // 清理间隔时间(毫秒)
            debugMode: boolean; // 调试模式开关
            autoSpawn: boolean; // 自动孵化开关
        };


        uuid: number;
        log: boolean;
        roomPlans: any;
    }

    interface CreepMemory {
        role: 'harvester' | 'upgrader' | 'builder' | string; // 新增builder角色类型
        working: boolean;

        workMode: any;
        roomName: string;
        targetId?: string;
        sourceId?: string;//harvest绑定的资源点id

        spawnTime: number;// 孵化开始时间
        bornTime: number;// 孵化完成时间
    }
    interface RoomMemory {

        config: any;// 房间配置

        sources: SourceICL[];
        spawns: string[];
        controllers: string[];
        constructionSites: string[];
        towers: string[];
        storageId?: string;
        terminalId?: string;

        sourceLoad?: Record<string, number>; // 资源负载均衡
        // sourceLoad?: {
        //     sourceId: string;
        //     creepNum: number;
        // }[];
        roomVisuals?: { [roomName: string]: RoomVisualData };

        sites: { // 建筑站点
            type: BuildableStructureConstant;
            pos: {
                x: number;
                y: number;
            };
        }[];
    }
}

interface SourceICL {
    sourceId: string;
    containerId: string;
    linkId: string;
}








// 扩展CreepMemory接口
interface CreepMemory {
    role: string;
    working: boolean;


    workMode: any;
    room: string;
    targetId?: string;
    sourceId?: string;
}


// 扩展RoomMemory接口
interface RoomMemory {
    spawns: string[];
    controllers: string[];
    constructionSites: string[];
    towers: string[];
    storageId?: string;
    terminalId?: string;

    roomVisuals?: { [roomName: string]: RoomVisualData };

    site: {
        type: BuildableStructureConstant;
        pos: {
            x: number;
            y: number;
        };
    }[];
}




// 角色类型定义
type RoleType = 'harvester' | 'upgrader' | 'builder' |
    'repairer' | 'claimer' | 'soldier';

// 角色配置接口
interface RoleConfig {
    body: BodyPartConstant[];
    minCount: number;
    maxCount: number;
}

// 行为接口
interface IBehavior {
    run(creep: Creep): void;
}

// 全局常量定义
declare const COLORS: {
    [key: string]: ColorConstant;
};

// declare const PRIORITIES: {
//     [key: string]: number;
// };


// 任务类型定义 群task

// 任务需求类型
export enum TaskNeed {
    NEED_ENERGY = "需要能量",
    ENERGY_OVERFLOW = "能量溢出",
    NEED_REPAIR = "需要修理",
    OTHER = "乱七八糟"
}

// 任务状态
export enum TaskState {
    WAITING = "waiting",
    WORKING = "working",
    ENDING = "ending"
}

// 执行对象类型
export enum ExecutionObject {
    CREEP = "creep",
    STRUCTURE = "struture"
}

// 角色类型
export type CreepRole = "work" | "carry" | "move" | "zcb";

// 任务接口
export interface Task {
    id: string;
    name: StructureConstant;
    level: number; // 1-5 优先级
    tick: number; // 超时时间
    need: TaskNeed;
    need_role: CreepRole[];
    state: TaskState;
    execution_object: ExecutionObject;
}

// 房间内存结构
export interface RoomMemoryData {
    room_name: string;
    event: Task[];
    my_structure_id: {
        MY_STRUCTURE_SPAWN: { id: string }[];
        MY_STRUCTURE_CONTAINER: { id: string }[];
        MY_STRUCTURE_EXTENSION: { id: string }[];
        MY_STRUCTURE_RAMPART: { id: string }[];
        MY_STRUCTURE_TOWER: { id: string }[];
        MY_STRUCTURE_STORAGE: { id: string }[];
        MY_STRUCTURE_LINK: { id: string }[];
        MY_STRUCTURE_TERMINAL: { id: string }[];
        MY_STRUCTURE_LAB: { id: string }[];
        MY_STRUCTURE_EXTRACTOR: { id: string }[];
        MY_STRUCTURE_FACTORY: { id: string }[];
        MY_STRUCTURE_OBSERVER: { id: string }[];
        MY_STRUCTURE_POWER_SPAWN: { id: string }[];
        MY_STRUCTURE_NUKER: { id: string }[];
        MY_STRUCTURE_CONTROLLER: { id: string }[];
        STRUCTURE_SOURCE: { id: string }[];
    };
    my_creep_id?: { id: string }[];
}

// // Creep内存扩展
// export interface CreepMemoryExtension {
//     event: Task | "null";
//     event_door: boolean;
//     role: CreepRole;
// }


// interface Memory {
//     rooms_name: RoomMemoryData[];
//     rooms_i: number;
//     creep_name: string[];
//     creep_body: BodyPartConstant[];
// }

// interface CreepMemory extends CreepMemoryExtension { }


//················ task ······