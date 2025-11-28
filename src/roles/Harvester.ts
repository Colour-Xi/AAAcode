

import { Role } from "./Role";
import { CreepUtils } from "../CreepUtils";

export class Harvester extends Role {
    constructor(creep: Creep) {
        super(creep);
    }

    /**
     * 更新工作状态（能量满则工作，空则采集）
     */
    protected updateWorkingStatus(): void {
        if (this.creep.memory.working && CreepUtils.isEnergyEmpty(this.creep)) {
            this.creep.memory.working = false;
        } else if (!this.creep.memory.working && CreepUtils.isEnergyFull(this.creep)) {
            this.creep.memory.working = true;
        }
    }

    /**
     * 能量采集主逻辑（区分高低级房间）
     */
    protected getEnergy(): void {
        // 高级房间采集逻辑（controller等级>=3）
        if (this.creep.room.controller && this.creep.room.controller.level >= 3) {
            this.getEnergyHighLevel();
            return;
            // 跳过低级采集
        }

        // 基础房间采集逻辑
        const room = Game.rooms[this.creep.memory.roomName];
        const sources = room?.memory.sources;
        if (!sources?.length) return;

        // 分配或验证能量源
        if (!this.creep.memory.sourceId) {
            // this.assignSource(sources);
             this.assignSource(sources.map(source => ({ id: source.sourceId })));
            return;
        }

        // 验证能量源有效性
        const source = Game.getObjectById<Source>(this.creep.memory.sourceId);
        if (!source || source.energy === 0) {
            this.creep.memory.sourceId = ""; // 无效则重置
            return;
        }

        // 执行采集
        if (this.moveToTarget(source)) {
            this.creep.harvest(source);
        }
    }

    /**
     * 能量源负载均衡分配
     */
    private assignSource(sources: { id: string }[]): void {
        const room = Game.rooms[this.creep.memory.roomName];
        if (!room) return;

        const MAX_LOAD_PER_SOURCE = 2; // 每个能量源最大负载
        // 初始化负载统计
        if (!room.memory.sourceLoad) {
            room.memory.sourceLoad = sources.reduce((obj, s) => {
                obj[s.id] = 0;
                return obj;
            }, {} as Record<string, number>);
        }

        // 刷新当前负载统计
        const sourceLoad = { ...room.memory.sourceLoad };
        Object.keys(sourceLoad).forEach(id => sourceLoad[id] = 0);

        // 统计当前所有采集者的能量源分配
        Object.values(Game.creeps)
            .filter(creep =>
                creep.memory.role === 'harvester' &&
                creep.memory.roomName === this.creep.memory.roomName &&
                creep.memory.sourceId
            )
            .forEach(creep => {
                const sid = creep.memory.sourceId!;
                if (sourceLoad[sid] !== undefined) sourceLoad[sid]++;
            });

        // 选择负载最小且未达上限的能量源
        let targetSourceId = sources[0].id;
        let minLoad = Infinity;
        sources.forEach(s => {
            if (sourceLoad[s.id] < MAX_LOAD_PER_SOURCE && sourceLoad[s.id] < minLoad) {
                minLoad = sourceLoad[s.id];
                targetSourceId = s.id;
            }
        });

        // 分配能量源并更新负载
        this.creep.memory.sourceId = targetSourceId;
        room.memory.sourceLoad[targetSourceId] = minLoad + 1;
    }

    /**
     * 高级能量采集（利用container）
     */
    private getEnergyHighLevel(): void {
        // const room = Game.rooms[this.creep.memory.roomName];
        // if (!room) return;

        // 查找能量源附近的container

        // 验证源有效性
        const sourceId = this.creep.memory.sourceId;
        if (!sourceId) return;

        // 获取资源对象
        const source = Game.getObjectById<Source>(sourceId);


        // 获取container对象（数组第一个）
        const container = this.creep.pos.lookFor(LOOK_STRUCTURES)
            .filter(con => {con.structureType == STRUCTURE_CONTAINER})[0];
        
        // const container = source? source.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, {
        //         filter: s => s.structureType === STRUCTURE_CONTAINER
        //     })[0]
        //     : null;

        // 证伪
        if (container) {
            // 移动到container并采集
            if (this.moveToTarget(container) && this.creep.pos.isEqualTo(container.pos)) {
                if (source) this.creep.harvest(source);
            }
        } else {
            // 无container时降级为基础采集
            // this.getEnergy();
            console.log("无container时降级为基础采集");
            
        }
    }

    /**
     * 工作主逻辑（能量转移）
     */
    protected work(): void {
        if (this.creep.room.controller && this.creep.room.controller?.level >= 3) {
            this.workHighLevel();
            return;
            // 跳过低级工作
        }

        // 基础工作：优先填充Spawn和Extension
        const targets = this.creep.room.find<StructureSpawn | StructureExtension>(FIND_STRUCTURES, {
            filter: s => (s instanceof StructureSpawn || s instanceof StructureExtension) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (targets.length) {
            if (this.moveToTarget(targets[0])) {
                this.creep.transfer(targets[0], RESOURCE_ENERGY);
            }
        } else {
            // 其次填充Storage
            const storage = this.creep.room.storage;
            if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (this.moveToTarget(storage)) {
                    this.creep.transfer(storage, RESOURCE_ENERGY);
                }
            }
        }
    }

    /**
     * 高级工作（利用link和维修）
     */
    private workHighLevel(): void {
        // 优先将自己身上和container中的能量转移至links

        const links = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: (s) => s.structureType === STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        // 有links则转移
        if (links.length) {
            // 有link了，那么寻找container
            const container = this.creep.pos.lookFor(LOOK_STRUCTURES)
                .find(s => s.structureType === STRUCTURE_CONTAINER);
            if (container) {
                // 获取container中的能量
                if (container instanceof StructureContainer) {// 类型修正
                    if (container.store.getUsedCapacity(RESOURCE_ENERGY) > 0) { // 如果有container中的能量，则转移
                        // 将container中的能量转移至link
                        this.creep.withdraw(container, RESOURCE_ENERGY);
                        this.creep.transfer(links[0], RESOURCE_ENERGY);
                    }
                }

            }
        } else {//查找附近九格的建筑
            // 查找周围1格范围内需要维修的己方建筑结构
            // 筛选条件：建筑当前耐久值小于最大耐久值（即需要维修的建筑）
            // 对建筑按照血量差值进行排序，第一个是血量差值最大的
            const structures = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s) => s.hits < s.hitsMax
            }).sort((a, b) => b.hits - a.hits);

            // 开始维修
            if (structures.length) {
                this.creep.repair(structures[0]);
            }
        }
    }

    /**
     * 移动到目标位置
     */
    protected moveToTarget(target: { pos: RoomPosition }): boolean {
        return CreepUtils.moveToTarget(this.creep, target);
    }
}