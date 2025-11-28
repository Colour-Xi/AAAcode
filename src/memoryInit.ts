import { SourceICL } from "./types";


/**
 * 全局内存初始化管理器
 * 负责初始化房间、Creep等各类内存数据
 */
export class MemoryInitializer {
    /**
     * 初始化全局内存（主入口）
     */
    public static initGlobalMemory(): void {
        // 初始化所有房间内存
        this.initAllRoomsMemory();

        // 清理无效Creep内存
        this.cleanupInvalidCreepMemory();

        // 初始化全局配置（如不存在）
        this.initGlobalConfig();
    }

    /**
     * 初始化所有已发现房间的内存
     */
    private static initAllRoomsMemory(): void {
        Object.values(Game.rooms).forEach(room => {
            this.initRoomMemory(room);
        });
    }

    /**
     * 初始化单个房间的内存
     * @param room 目标房间
     */
    public static initRoomMemory(room: Room): void {
        // 初始化基础房间数据
        if (!room.memory) room.memory = {} as RoomMemory;

        // 初始化能量源数据
        if (!room.memory.sources) {
            room.memory.sources = [];

            room.find(FIND_SOURCES).forEach(source => {
                room.memory.sources.push({
                    sourceId: source.id,
                    containerId: "",
                    linkId: ""
                });
            });
        }

        // 初始化source负载统计
        // if (!room.memory.sourceLoad) {
        //     room.memory.sourceLoad = {};
        //     room.memory.sources.forEach(source => {
        //         room.memory.sourceLoad[source.id] = 0;
        //     });
        // }
        // 初始化source负载统计
        if (!room.memory.sourceLoad) {
            room.memory.sourceLoad = {};
            room.memory.sources.forEach(source => {
                room.memory.sourceLoad![source.sourceId] = 0; // 使用 ! 断言非空
            });
        }

        // 初始化建造任务缓存
        if (!room.memory.sites) {
            room.memory.sites = [] ;
        }

        // 初始化房间配置
        if (!room.memory.config) {
            room.memory.config = {
                maxHarvesters: 2 * (room.memory.sources?.length || 1),
                maxBuilders: 3,
                maxUpgraders: 5,
                sourceLoadLimit: 2
            };
        }

        // 初始化Spawn配置
        // if (!room.memory.spawnConfig) {
        //     room.memory.spawnConfig = {
        //         spawnQueue: [],
        //         lastSpawnTime: 0,
        //         energyThreshold: 300
        //     };
        // }
    }

    /**
     * 初始化单个Creep的内存（按理来说，不需要单独初始化creep的memory）
     * @param creep 目标Creep
     * @param role Creep角色
     * @param roomName 所属房间名
     */
    public static initCreepMemory(creep: Creep, role: string, roomName: string): void {
        creep.memory = {
            role: role,
            roomName: roomName,
            working: false,
            sourceId: '',
            targetId: '',
            workMode: role,
            spawnTime: Game.time,
            bornTime: Game.time + creep.body.length * 3,
            // state: 'idle'
        };
    }

    /**
     * 清理无效Creep内存（已死亡的Creep）
     */
    private static cleanupInvalidCreepMemory(): void {
        for (const creepName in Memory.creeps) {
            if (!Game.creeps[creepName]) {
                delete Memory.creeps[creepName];
            }
        }
    }

    /**
     * 初始化全局配置
     */
    private static initGlobalConfig(): void {
        if (!Memory.globalConfig) {
            Memory.globalConfig = {
                version: '1.0.0',
                lastCleanup: Game.time,
                cleanupInterval: 1000,
                debugMode: false,
                autoSpawn: true
            };
        }

        // 定期清理内存（每1000tick）
        if (Game.time % Memory.globalConfig.cleanupInterval === 0) {
            this.cleanupOldMemory();
            Memory.globalConfig.lastCleanup = Game.time;
        }
    }

    /**
     * 清理过期内存数据
     */
    private static cleanupOldMemory(): void {
        // 清理房间过期缓存
        // Object.values(Game.rooms).forEach(room => {
        //     // 清理超过500tick的建造缓存
        //     if (room.memory.constructionCache &&
        //         Game.time - room.memory.constructionCache.lastUpdate > 500) {
        //         room.memory.constructionCache.sites = [];
        //     }

        //     // 清理过期的source负载缓存
        //     Object.keys(room.memory.sourceLoad || {}).forEach(key => {
        //         if (!room.memory.sources?.some(s => s.id === key)) {
        //             delete room.memory.sourceLoad[key];
        //         }
        //     });
        // });
    }

    /**
     * 获取房间配置（不存在则初始化）
     * @param roomName 房间名
     */
    public static getRoomConfig(roomName: string): any {
        const room = Game.rooms[roomName];
        if (!room) return null;

        if (!room.memory.config) {
            this.initRoomMemory(room);
        }

        return room.memory.config;
    }
}