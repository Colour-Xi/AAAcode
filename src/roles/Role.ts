
/**
 * 纯抽象角色基类，仅定义接口规范
 */
export abstract class Role {
    protected creep: Creep;
    protected isTask = false;

    constructor(creep: Creep) {
        this.creep = creep;
        // 初始化内存状态
        if (this.creep.memory.working === undefined) {
            this.creep.memory.working = false;
        }
    }

    /**
     * 角色运行入口（模板方法模式）
     */
    public run(): void {
        this.updateWorkingStatus();
        
        if (this.creep.memory.working) {
            this.work();
        } else {
            this.getEnergy();
        }
    }

    /**
     * 更新工作状态（抽象方法）
     */
    protected abstract updateWorkingStatus(): void;

    /**
     * 获取能量（抽象方法）
     */
    protected abstract getEnergy(): void;

    /**
     * 执行工作（抽象方法）
     */
    protected abstract work(): void;

    /**
     * 移动到目标（抽象方法）
     */
    protected abstract moveToTarget(target: { pos: { x: number; y: number; roomName: string } }): boolean;
}