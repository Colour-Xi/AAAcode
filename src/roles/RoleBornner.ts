

import { bodyConfigs, getMinEnergyByRole, getOptimalBody } from "../bodyConfigs";

/**
 * Creep 生成管理器
 * 负责全房间 Creep 生成、角色分配和资源管理
 */
export class RoleBornner {
    private room: Room;
    private spawns: StructureSpawn[];
    private roomName: string;

    /**
     * 初始化生成管理器
     * @param room 目标房间
     */
    constructor(room: Room) {
        this.room = room;
        this.roomName = room.name;
        this.spawns = room.find(FIND_MY_SPAWNS);

        // // 初始化房间 source 数据（首次运行）
        // if (!room.memory.sources) {

        //     room.memory.sources = room.find(FIND_SOURCES).map(s => ({ id: s.id }));
        // }
    }

    /**
     * 执行主逻辑（生成 + 补充）
     */
    public run(): void {
        // 无 spawn 时直接返回
        if (this.spawns.length === 0) return;

        // 补充阵亡 Creep
        this.replaceDeadCreeps();

        // 生成新 Creep
        this.spawnCreepsByNeed();
    }

    /**
     * 根据房间需求生成 Creep
     */
    private spawnCreepsByNeed(): void {
        // 获取可用的 spawn（未在生成且能量充足）
        const availableSpawn = this.getAvailableSpawn();
        if (!availableSpawn) return;

        // 获取当前 Creep 数量统计
        const creepCounts = this.getCreepCounts();

        // 按优先级生成 Creep
        if (creepCounts.harvester < this.getRequiredCount('harvester')) {
            this.createCreep(availableSpawn, 'harvester');
        } else if (creepCounts.builder < this.getRequiredCount('builder')) {
            this.createCreep(availableSpawn, 'builder');
        } else if (creepCounts.upgrader < this.getRequiredCount('upgrader')) {
            this.createCreep(availableSpawn, 'upgrader');
        } else if (creepCounts.defender < this.getRequiredCount('defender')) {
            this.createCreep(availableSpawn, 'defender');
        }
    }

    /**
     * 获取可用的 spawn
     */
    private getAvailableSpawn(): StructureSpawn | null {
        return this.spawns.find(spawn =>
            !spawn.spawning &&
            this.getRoomEnergy() >= getMinEnergyByRole('harvester')
        ) || null;
    }

    /**
     * 获取房间总能量（spawn + extension）
     */
    private getRoomEnergy(): number {
        return this.room.energyAvailable;
    }

    /**
     * 统计当前 Creep 数量
     */
    private getCreepCounts(): Record<string, number> {
        const creeps = Object.values(Game.creeps).filter(c => c.memory.roomName === this.roomName);

        return {
            harvester: creeps.filter(c => c.memory.role === 'harvester').length,
            builder: creeps.filter(c => c.memory.role === 'builder').length,
            upgrader: creeps.filter(c => c.memory.role === 'upgrader').length,
            defender: creeps.filter(c => c.memory.role === 'defender').length,
            total: creeps.length
        };
    }

    /**
     * 获取各角色需求数量
     */
    private getRequiredCount(role: string): number {
        const controllerLevel = this.room.controller?.level || 1;
        const sourceCount = this.room.memory.sources?.length || 1;

        switch (role) {
            case 'harvester':
                return Math.max(2, sourceCount * 2);
            case 'builder':
                return this.room.find(FIND_CONSTRUCTION_SITES).length > 0 ? 2 : 1;
            case 'upgrader':
                return Math.max(1, Math.floor(controllerLevel / 2));
            case 'defender':
                return this.room.find(FIND_HOSTILE_CREEPS).length > 0 ? 2 : 0;
            default:
                return 1;
        }
    }

    /**
     * 计算 Creep 孵化完成时间
     * @param body Creep 身体部件配置
     */
    private bornTime(body: BodyPartConstant[]): number {
        // 每个身体部件孵化时间为 3 tick
        return body.length * 3;
    }

    /**
     * 创建指定角色的 Creep
     */
    private createCreep(spawn: StructureSpawn, role: string): void {
        const energy = this.getRoomEnergy();
        const body = getOptimalBody(role, energy);
        const name = `${role}_${Game.time}`;

        const result = spawn.spawnCreep(body, name, {
            memory: {
                role: role,
                roomName: this.roomName,
                working: false,
                sourceId: '',
                spawnTime: Game.time,
                // bornTime: Game.time + this.bornTime(body), // 孵化完成时间
                bornTime: Game.time + body.length * 3,
                workMode: role // 工作模式初始化为角色名
            }
        });

        if (result === OK) {
            console.log(`[${this.roomName}] 生成 ${role}: ${name} (能量: ${energy}, 身体: ${body.join(',')}, 孵化完成时间: ${Game.time + this.bornTime(body)})`);
        }
    }

    /**
     * 补充阵亡 Creep
     */
    private replaceDeadCreeps(): void {
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                const mem = Memory.creeps[name];
                if (mem.roomName === this.roomName) {
                    // 检查是否已过孵化完成时间（避免重复生成）
                    if (Game.time > (mem.spawnTime || 0) + 100) {
                        const availableSpawn = this.getAvailableSpawn();
                        if (availableSpawn) {
                            this.createCreep(availableSpawn, mem.role);
                        }
                    }
                    delete Memory.creeps[name];
                }
            }
        }
    }
}