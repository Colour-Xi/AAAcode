// import { StructureSpawn, Creep, BodyPartConstant } from "game/prototypes";
// import { RESOURCE_ENERGY } from "game/constants";

/**
 * Creep 生成器类
 * 负责根据房间需求生成不同角色的 Creep
 */
export class RoleBornner {
    private spawn: StructureSpawn;
    private roomName: string;

    constructor(spawn: StructureSpawn) {
        this.spawn = spawn;
        this.roomName = spawn.room.name;
    }

    /**
     * 检查并生成所需的 Creep
     */
    public spawnCreeps(): void {
        // 获取房间内现有 Creep 数量
        const creepCounts = this.getCreepCounts();
        
        // 根据角色优先级生成 Creep
        if (creepCounts.harvester < this.getRequiredHarvesters()) {
            this.spawnHarvester();
        } else if (creepCounts.builder < this.getRequiredBuilders()) {
            this.spawnBuilder();
        } else if (creepCounts.upgrader < this.getRequiredUpgraders()) {
            this.spawnUpgrader();
        }
    }

    /**
     * 获取房间内各角色 Creep 数量统计
     */
    private getCreepCounts(): Record<string, number> {
        const creeps = Object.values(Game.creeps).filter(c => c.room.name === this.roomName);
        
        return {
            harvester: creeps.filter(c => c.memory.role === 'harvester').length,
            builder: creeps.filter(c => c.memory.role === 'builder').length,
            upgrader: creeps.filter(c => c.memory.role === 'upgrader').length,
            total: creeps.length
        };
    }

    /**
     * 获取采集者需求数量
     */
    private getRequiredHarvesters(): number {
        // 根据房间等级动态调整需求数量
        const controllerLevel = this.spawn.room.controller?.level || 1;
        return Math.max(2, controllerLevel);
    }

    /**
     * 获取建造者需求数量
     */
    private getRequiredBuilders(): number {
        // 有建造任务时增加建造者数量
        const constructionSites = this.spawn.room.find(FIND_CONSTRUCTION_SITES);
        return constructionSites.length > 0 ? 2 : 1;
    }

    /**
     * 获取升级者需求数量
     */
    private getRequiredUpgraders(): number {
        const controllerLevel = this.spawn.room.controller?.level || 1;
        return Math.max(1, Math.floor(controllerLevel / 2));
    }

    /**
     * 生成采集者 Creep
     */
    private spawnHarvester(): void {
        const body = this.getOptimalBody('harvester');
        const name = `Harvester_${Game.time}`;
        
        this.spawnCreep(name, body, 'harvester');
    }

    /**
     * 生成建造者 Creep
     */
    private spawnBuilder(): void {
        const body = this.getOptimalBody('builder');
        const name = `Builder_${Game.time}`;
        
        this.spawnCreep(name, body, 'builder');
    }

    /**
     * 生成升级者 Creep
     */
    private spawnUpgrader(): void {
        const body = this.getOptimalBody('upgrader');
        const name = `Upgrader_${Game.time}`;
        
        this.spawnCreep(name, body, 'upgrader');
    }

    /**
     * 根据角色获取最优身体部件配置
     */
    private getOptimalBody(role: string): BodyPartConstant[] {
        const energyCapacity = this.spawn.room.energyCapacityAvailable;
        const body: BodyPartConstant[] = [];
        
        // 基础部件配置（根据角色调整比例）
        let workParts = 1;
        let carryParts = 1;
        let moveParts = 1;

        // 根据能量容量扩展身体部件
        if (energyCapacity >= 300) {
            workParts = role === 'harvester' ? 2 : 3;
            carryParts = role === 'builder' ? 2 : 1;
            moveParts = Math.max(workParts, carryParts);
        }
        
        if (energyCapacity >= 550) {
            workParts = role === 'harvester' ? 3 : 4;
            carryParts = role === 'upgrader' ? 3 : 2;
            moveParts = Math.max(workParts, carryParts);
        }

        // 构建身体数组
        for (let i = 0; i < workParts; i++) body.push(WORK);
        for (let i = 0; i < carryParts; i++) body.push(CARRY);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);

        return body;
    }

    /**
     * 执行 Creep 生成逻辑
     */
    private spawnCreep(name: string, body: BodyPartConstant[], role: string): void {
        // 检查生成条件
        if (this.spawn.spawning) return;
        
        const result = this.spawn.spawnCreep(body, name, {
            memory: {
                role: role,
                roomName: this.roomName,
                working: false,
                sourceId: '',
                workMode: undefined
            }
        });

        if (result === OK) {
            console.log(`[${this.roomName}] 开始生成 ${role}: ${name}`);
        }
    }

    /**
     * 自动补充阵亡的 Creep
     */
    public replaceDeadCreeps(): void {
        // 检查是否有 Creep 死亡
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                const creepMemory = Memory.creeps[name];
                const role = creepMemory.role;
                
                // 根据阵亡角色重新生成
                switch (role) {
                    case 'harvester':
                        this.spawnHarvester();
                        break;
                    case 'builder':
                        this.spawnBuilder();
                        break;
                    case 'upgrader':
                        this.spawnUpgrader();
                        break;
                }
                
                // 清理内存
                delete Memory.creeps[name];
            }
        }
    }
}