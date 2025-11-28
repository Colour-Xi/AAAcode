import { Role } from "./Role";
// import { Creep, Source, StructureController } from "game/prototypes";
import { CreepUtils } from "../CreepUtils";

export class Upgrader extends Role {
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
     */
    protected getEnergy(): void {
        const sources = this.creep.room.find(FIND_SOURCES);
        if (sources.length > 0) {
            if (this.moveToTarget(sources[0])) {
                this.creep.harvest(sources[0]);
            }
        }
    }

    /**
     * 执行工作
     */
    protected work(): void {
        const controller = this.creep.room.controller;
        if (controller) {
            if (this.moveToTarget(controller)) {
                this.creep.upgradeController(controller);
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