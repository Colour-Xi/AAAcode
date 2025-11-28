// import { Creep, RoomPosition } from "game/prototypes";

/**
 * Creep 通用工具类
 */
export class CreepUtils {
    /**
     * 移动到目标位置
     */
    public static moveToTarget(creep: Creep, target: { pos: RoomPosition }): boolean {
        // if (creep.pos.inRangeTo(target.pos, range)) {
        //     return true;
        // }
        
        if(creep.moveTo(target.pos, { visualizePathStyle: { stroke: '#ffffff' } }) === OK) {
            return true;
        }
        return false;
    }

    /**
     * 检查能量是否已满
     */
    public static isEnergyFull(creep: Creep): boolean {
        return creep.store.getFreeCapacity() === 0;
    }

    /**
     * 检查能量是否耗尽
     */
    public static isEnergyEmpty(creep: Creep): boolean {
        return creep.store.getUsedCapacity() === 0;
    }
}