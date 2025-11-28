import { Role } from "./Role";
import { CreepUtils } from "../CreepUtils";
import { forEach } from "lodash";
import { MRecord } from "../types";

export class Harvester extends Role {
    constructor(creep: Creep) {
        super(creep);
    }

    /**
     * 更新工作状态
     */
    protected updateWorkingStatus(): void {
        if (this.creep.memory.working && CreepUtils.isEnergyEmpty(this.creep)) {
            this.creep.memory.working = false;
        } else if (!this.creep.memory.working && CreepUtils.isEnergyFull(this.creep)) {
            this.creep.memory.working = true;
        }
    }

    /**
     * 获取能量
     * 根据房间内置的资源点，获取能量
     */
    // protected getEnergy(): void {
    //     // 高等级采集
    //     if (this.creep.room.controller && this.creep.room.controller.level >= 3) {
    //         this.getEnergyHighLevel();
    //         return;
    //         // 跳过低级采集
    //     }

    //     // 获取sourceid群
    //     const sourcesid = Game.rooms[this.creep.memory.roomName].memory.sources;
    //     if (!sourcesid) {// 获取不到source
    //         //log
    //         return;
    //     }
    //     // 绑定sourceid
    //     if (this.creep.memory.sourceId == null || this.creep.memory.sourceId === "") {
    //         this.creep.memory.sourceId = sourcesid[0].id;
    //     } else {
    //         this.creep.memory.sourceId = sourcesid[1].id;
    //     }

    //     // 循环获取source
    //         // const source: Source | null = Game.getObjectById(sid.id);
    //         // if (source) {
    //         //     if (this.moveToTarget(source)) {
    //         //         this.creep.harvest(source);
    //         //     }
    //         // }
    // }
    /**
     * 获取能量
     * 根据房间内置的资源点，获取能量
     */
    protected getEnergy(): void {
        // 高等级采集
        if (this.creep.room.controller && this.creep.room.controller.level >= 3) {
            this.getEnergyHighLevel();
            return;
            // 跳过低级采集
        }

        // 获取sourceid群
        const sourcesid = Game.rooms[this.creep.memory.roomName].memory.sources;
        if (!sourcesid) {// 获取不到source
            //log
            return;
        }

        // 重复使用 
        // const _sourcesid = this.creep.memory.sourceId ;
        // 绑定sourceid
        if (this.creep.memory.sourceId == null || this.creep.memory.sourceId === "") {
            this.assignSource(sourcesid);
        }

        // 验证绑定的source有效性
        if (!this.creep.memory.sourceId) {
            this.creep.memory.sourceId = "";
            return;
        }

        // 验证source有效性
        const source = Game.getObjectById<Source>(this.creep.memory.sourceId);
        if (!source) {
            this.creep.memory.sourceId = "";
            return;
        }

        // 执行采集
        if (source.energy > 0) {
            if (this.moveToTarget(source)) {
                this.creep.harvest(source);
            }
        } else {
            // source枯竭时重新分配
            this.creep.memory.sourceId = "";
        }
    }

    /**
     * 为Creep分配source（负载均衡+负载上限控制）
     */
    private assignSource(sourcesid: { id: string }[]): void {
        const room = Game.rooms[this.creep.memory.roomName];
        const MAX_LOAD_PER_SOURCE = 2; // 每个source的负载上限

        // 初始化房间source负载统计
        if (!room.memory.sourceLoad) {
            room.memory.sourceLoad = sourcesid.reduce((obj, sid) => {
                obj[sid.id] = 0;
                return obj;
            }, {} as MRecord<string, string, string>);
        }

        // 统计当前各source的creep负载
        const sourceLoad = { ...room.memory.sourceLoad };
        Object.keys(sourceLoad).forEach(id => sourceLoad[id] = 0);

        // 遍历房间内采集者，更新负载
        const harvesters = Object.values(Game.creeps).filter(creep =>
            creep.memory.role === 'harvester' &&
            creep.memory.roomName === this.creep.memory.roomName &&
            creep.memory.sourceId
        );
        harvesters.forEach(creep => {
            const sid = creep.memory.sourceId;
            if(!sid) {return;}
            if (sourceLoad[sid] !== undefined) sourceLoad[sid]++;
        });

        // 选择负载最小且未达上限的source
        let minLoad = Infinity;
        let targetSourceId = sourcesid[0].id;
        sourcesid.forEach(sid => {
            // 仅选择负载小于上限的source
            if (sourceLoad[sid.id] < MAX_LOAD_PER_SOURCE && sourceLoad[sid.id] < minLoad) {
                minLoad = sourceLoad[sid.id];
                targetSourceId = sid.id;
            }
        });

        // 绑定source并更新全局负载
        this.creep.memory.sourceId = targetSourceId;
        room.memory.sourceLoad[targetSourceId] = minLoad + 1;
    }


    /**
     * 高级采集，找资源点旁边的container，并站在上面，获取能量。
     */
    getEnergyHighLevel(): void {
        // 获取container
        const containers = this.creep.pos.lookFor(LOOK_STRUCTURES);
        if (containers.length > 0) {
            // 获取container
            const container = containers[0];
            // 移动到container
            const isOk = this.moveToTarget(container)
            if (isOk === true && container.pos.isEqualTo(this.creep.pos)) {//说明移动成功且位置相等
                //采集能量
                const sourcesid = Game.rooms[this.creep.memory.roomName].memory.sources;
                this.creep.harvest();



            }

        }

        throw new Error("Method not implemented.");
    }

    /**
     * 执行工作
     */
    protected work(): void {
        // 高等级工作
        if (this.creep.room.controller && this.creep.room.controller.level >= 3) {
            this.workHighLevel();
            return;
            // 跳过低级工作
        }

        // 优先填充Spawn和Extension
        const spawns_extensions = this.creep.room.find<StructureSpawn | StructureExtension>(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure instanceof StructureSpawn || structure instanceof StructureExtension) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (spawns_extensions.length > 0) {
            if (this.moveToTarget(spawns_extensions[0])) {
                this.creep.transfer(spawns_extensions[0], RESOURCE_ENERGY);
            }
        } else {
            // 其次填充Storage
            const storage = this.creep.room.find<StructureStorage>(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_STORAGE
            });

            if (storage.length > 0) {
                if (this.moveToTarget(storage[0])) {
                    this.creep.transfer(storage[0], RESOURCE_ENERGY);
                }
            }
        }
    }
    /**
     * 高级工作，
     * 1、将能量转移至link
     * 2、填充container，顺便维修附近的建筑
     */
    workHighLevel(): void {
        // 优先将自己身上和container中的能量转移至links

        const links = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: (s) => s.structureType === STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        // 有links则转移
        if (links.length > 0) {
            // 有link了，那么寻找container
            const containers = this.creep.pos.lookFor(LOOK_STRUCTURES);
            if (containers.length > 0) {
                // 获取container
                const container = containers[0];
                // 获取container中的能量
                if (container instanceof StructureContainer) {// 类型修正
                    const energy = container.store.getUsedCapacity(RESOURCE_ENERGY);
                    if (energy > 0) { // 如果有container中的能量，则转移
                        // 将container中的能量转移至link
                        this.creep.withdraw(container, RESOURCE_ENERGY);
                        this.creep.transfer(links[0], RESOURCE_ENERGY);
                    }
                }

            }
        } else {
            //查找附近九格的建筑
            // 查找周围1格范围内需要维修的己方建筑结构
            // 筛选条件：建筑当前耐久值小于最大耐久值（即需要维修的建筑）
            const structures = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s) => s.hits < s.hitsMax
            });

            // 对建筑按照血量差值进行排序，第一个是血量差值最大的
            structures.sort((a, b) => b.hits - a.hits);

            // 开始维修
            if (structures.length > 0) {
                this.creep.repair(structures[0]);
            }
        }
    }

    /**
     * 移动到目标
     */
    protected moveToTarget(target: { pos: { x: number; y: number; roomName: string } }): boolean {
        return CreepUtils.moveToTarget(this.creep, target as any);
    }
}