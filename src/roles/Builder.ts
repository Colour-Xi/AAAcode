import { Role } from "./Role";
import { CreepUtils } from "../CreepUtils";

export class Builder extends Role {
    constructor(creep: Creep) {
        super(creep);
    }

    /**
     * 更新工作状态（能量满/空切换）
     */
    protected updateWorkingStatus(): void {
        if (this.creep.memory.working && CreepUtils.isEnergyEmpty(this.creep)) {
            this.creep.memory.working = false;
        } else if (!this.creep.memory.working && CreepUtils.isEnergyFull(this.creep)) {
            this.creep.memory.working = true;
        }
    }

    /**
     * 获取能量（优先从Storage取，无则采集能量源）
     */
    protected getEnergy(): void {
        // 优先从Storage获取能量
        const storage = this.creep.room.find<StructureStorage>(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE && 
                           s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });

        if (storage.length > 0) {
            if (this.moveToTarget(storage[0])) {
                this.creep.withdraw(storage[0], RESOURCE_ENERGY);
            }
        } else {
            // 无Storage时采集能量源
            const sources = this.creep.room.find(FIND_SOURCES);
            if (sources.length > 0) {
                if (this.moveToTarget(sources[0])) {
                    this.creep.harvest(sources[0]);
                }
            }
        }
    }

    /**
     * 执行工作（优先建造，无建造任务则修复建筑）
     */
    protected work(): void {
        // 优先处理建造工地
        const constructionSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        
        if (constructionSites.length > 0) {
            if (this.moveToTarget(constructionSites[0])) {
                this.creep.build(constructionSites[0]);
            }
        } else {
            // 无建造任务时修复受损建筑（优先非墙/壁垒结构）
            const damagedStructures = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => 
                    structure.hits < structure.hitsMax && 
                    structure.structureType !== STRUCTURE_WALL &&
                    structure.structureType !== STRUCTURE_RAMPART
            });

            if (damagedStructures.length > 0) {
                // 按受损程度排序（优先修复损坏严重的）
                damagedStructures.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);
                
                if (this.moveToTarget(damagedStructures[0])) {
                    this.creep.repair(damagedStructures[0]);
                }
            }
        }
    }

    /**
     * 移动到目标位置（复用工具类方法）
     */
    protected moveToTarget(target: { pos: { x: number; y: number; roomName: string } }): boolean {
        return CreepUtils.moveToTarget(this.creep, target as any);
    }
}