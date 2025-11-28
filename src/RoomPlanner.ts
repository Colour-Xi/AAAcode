//基于Screeps官方API的房间建筑布局生成器
/**
 * 获取房间的信息绘制并安放最外层的防御墙和资源保护
 * 文档参考：https://docs.screeps.com/api/
 */
export class RoomPlanner {
    // 配置参数
    private readonly CORE_SIZE = 13; // 核心建筑群尺寸
    private readonly DEFENSE_LAYER = 3; // 防御层位置（核心区外3格）
    private readonly MAP_SIZE = 50; // Screeps房间尺寸固定为50x50

    // 房间引用
    private room: Room;
    private terrain: RoomTerrain;

    // 核心区数据
    private coreCenter: RoomPosition | null = null;
    private coreBounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    } | null = null;

    /**
     * 构造函数
     * @param room 房间对象
     */
    constructor(room: Room) {
        this.room = room;
        this.terrain = room.getTerrain();
        
        // 自动执行完整布局流程
        this.run();
    }

    /**
     * 执行完整布局流程
     */
    private run(): void {
        // 1. 分析房间关键位置
        const controller = this.room.controller;
        const sources = this.room.find(FIND_SOURCES);
        
        // 2. 确定核心区中心点
        if (controller && sources.length > 0) {
            const nearestSource = this.findNearestSource(controller.pos, sources);
            const path = this.calculatePath(controller.pos, nearestSource.pos);
            const midPoint = this.getPathMidpoint(path);
            this.coreCenter = this.findValidCorePosition(midPoint);
        } else {
            // 备用中心点（房间中心）
            this.coreCenter = new RoomPosition(25, 25, this.room.name);
        }

        // 3. 计算核心区边界
        if (this.coreCenter) {
            this.calculateCoreBounds();
        }

        // 4. 创建建筑布局
        if (this.coreBounds) {
            this.createDefenseStructures();
            this.markCoreArea();
            this.protectSources(); // 启用资源点保护
        }
    }

    /**
     * 找到离控制器最近的资源点
     * @param controllerPos 控制器位置
     * @param sources 资源点数组
     */
    private findNearestSource(controllerPos: RoomPosition, sources: Source[]): Source {
        return sources.reduce((nearest, source) => {
            const nearestDist = controllerPos.getRangeTo(nearest);
            const currentDist = controllerPos.getRangeTo(source);
            return currentDist < nearestDist ? source : nearest;
        }, sources[0]);
    }

    /**
     * 计算两点间的路径（使用Screeps原生寻路）
     * @param start 起点
     * @param end 终点
     */
    private calculatePath(start: RoomPosition, end: RoomPosition): RoomPosition[] {
        const path = this.room.findPath(start, end, {
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            swampCost: 1,
            plainCost: 1
        });
        
        // 转换为完整路径点数组（包含起点和终点）
        const fullPath = [start];
        let currentPos = start;
        
        for (const step of path) {
            currentPos = new RoomPosition(
                currentPos.x + step.dx,
                currentPos.y + step.dy,
                this.room.name
            );
            fullPath.push(currentPos);
        }
        
        return fullPath;
    }

    /**
     * 获取路径中点
     * @param path 路径数组
     */
    private getPathMidpoint(path: RoomPosition[]): RoomPosition {
        const midIndex = Math.floor(path.length / 2);
        return new RoomPosition(path[midIndex].x, path[midIndex].y, this.room.name);
    }

    /**
     * 寻找有效的核心区位置（13x13无墙区域）
     * @param target 目标中心点
     */
    private findValidCorePosition(target: RoomPosition): RoomPosition | null {
    const searchRange = 10;
    const halfCore = Math.floor(this.CORE_SIZE / 2);
    const validPositions: RoomPosition[] = []; // 存储所有有效位置

    // 1. 遍历搜索范围，收集所有有效核心区中心点
    for (let dy = -searchRange; dy <= searchRange; dy++) {
        for (let dx = -searchRange; dx <= searchRange; dx++) {
            const centerX = target.x + dx;
            const centerY = target.y + dy;

            // 检查核心区整体是否在地图内
            const minX = centerX - halfCore;
            const maxX = centerX + halfCore;
            const minY = centerY - halfCore;
            const maxY = centerY + halfCore;

            if (minX < 0 || maxX >= this.MAP_SIZE || minY < 0 || maxY >= this.MAP_SIZE) {
                continue;
            }

            // 检查核心区内是否有墙
            let isValid = true;
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    if (this.terrain.get(x, y) === TERRAIN_MASK_WALL) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }

            if (isValid) {
                validPositions.push(new RoomPosition(centerX, centerY, this.room.name));
            }
        }
    }

    // 2. 若无有效位置，返回null
    if (validPositions.length === 0) return null;

    // 3. 按与目标点的距离排序，返回最近的（最优）位置
    validPositions.sort((a, b) => {
        const distA = a.getRangeTo(target);
        const distB = b.getRangeTo(target);
        return distA - distB;
    });

    return validPositions[0]; // 返回距离目标点最近的有效核心区中心点
}

    /**
     * 计算核心区边界
     */
    private calculateCoreBounds(): void {
        if (!this.coreCenter) return;
        const halfCore = Math.floor(this.CORE_SIZE / 2);
        
        this.coreBounds = {
            minX: Math.max(0, this.coreCenter.x - halfCore),
            maxX: Math.min(this.MAP_SIZE - 1, this.coreCenter.x + halfCore),
            minY: Math.max(0, this.coreCenter.y - halfCore),
            maxY: Math.min(this.MAP_SIZE - 1, this.coreCenter.y + halfCore)
        };
    }

    /**
     * 创建防御结构（第三层：两墙一门）
     */
    private createDefenseStructures(): void {
        if (!this.coreBounds) return;
        // 第三层防御边界
        const defenseMinX = this.coreBounds.minX - this.DEFENSE_LAYER;
        const defenseMaxX = this.coreBounds.maxX + this.DEFENSE_LAYER;
        const defenseMinY = this.coreBounds.minY - this.DEFENSE_LAYER;
        const defenseMaxY = this.coreBounds.maxY + this.DEFENSE_LAYER;
        
        // 生成环形防御结构
        this.createRingStructure(defenseMinX, defenseMaxX, defenseMinY, defenseMaxY);
    }

    /**
     * 创建环形防御结构（检测外侧地形，保持2墙1门）
     * @param minX 防御圈最小X坐标
     * @param maxX 防御圈最大X坐标
     * @param minY 防御圈最小Y坐标
     * @param maxY 防御圈最大Y坐标
     */
    private createRingStructure(minX: number, maxX: number, minY: number, maxY: number): void {
        // 顶部边缘（y=minY）
        for (let x = minX; x <= maxX; x++) {
            this.placeDefenseStructure(x, minY, 'top', minX, minY);
        }

        // 底部边缘（y=maxY）
        for (let x = minX; x <= maxX; x++) {
            this.placeDefenseStructure(x, maxY, 'bottom', minX, minY);
        }

        // 左侧边缘（x=minX，排除角落）
        for (let y = minY + 1; y < maxY; y++) {
            this.placeDefenseStructure(minX, y, 'left', minX, minY);
        }

        // 右侧边缘（x=maxX，排除角落）
        for (let y = minY + 1; y < maxY; y++) {
            this.placeDefenseStructure(maxX, y, 'right', minX, minY);
        }
    }

    /**
     * 放置防御结构（核心逻辑：外侧有墙建墙，无墙则2墙1门）
     * @param x 放置X坐标
     * @param y 放置Y坐标
     * @param direction 边缘方向（用于检测外侧地形）
     * @param ringMinX 防御圈最小X（计算索引用）
     * @param ringMinY 防御圈最小Y（计算索引用）
     */
    private placeDefenseStructure(
        x: number,y: number,
        direction: 'top' | 'bottom' | 'left' | 'right',
        ringMinX: number,ringMinY: number
    ): void {
        // 1. 基础有效性检查
        if (x < 0 || x >= this.MAP_SIZE || y < 0 || y >= this.MAP_SIZE) return;
        if (this.terrain.get(x, y) === TERRAIN_MASK_WALL) return; // 跳过自然墙位置

        // 2. 检测外侧是否有自然墙（防御圈外部一格）
        let hasOuterWall = false;
        switch (direction) {
            case 'top':
                hasOuterWall = y > 0 && this.terrain.get(x, y - 1) === TERRAIN_MASK_WALL;
                break;
            case 'bottom':
                hasOuterWall = y < this.MAP_SIZE - 1 && this.terrain.get(x, y + 1) === TERRAIN_MASK_WALL;
                break;
            case 'left':
                hasOuterWall = x > 0 && this.terrain.get(x - 1, y) === TERRAIN_MASK_WALL;
                break;
            case 'right':
                hasOuterWall = x < this.MAP_SIZE - 1 && this.terrain.get(x + 1, y) === TERRAIN_MASK_WALL;
                break;
        }

        // 3. 确定结构类型
        let structureType: BuildableStructureConstant;
        if (hasOuterWall) {
            // 外侧有自然墙 → 直接建墙（无需留门）
            structureType = STRUCTURE_WALL;
        } else {
            // 外侧无墙 → 按2墙1门规则（索引%3=2时为门）
            const index = direction === 'top' || direction === 'bottom'
                ? x - ringMinX // 水平边缘：X轴相对偏移（从0开始）
                : y - ringMinY - 1; // 垂直边缘：Y轴相对偏移（排除角落，从0开始）
            
            structureType = index % 3 === 2 ? STRUCTURE_RAMPART : STRUCTURE_WALL;
        }

        // 4. 执行放置（避免重复创建）
        const pos = new RoomPosition(x, y, this.room.name);
        const existingSite = pos.lookFor(LOOK_CONSTRUCTION_SITES).find(site => site.structureType === structureType);
        const existingStructure = pos.lookFor(LOOK_STRUCTURES).find(struct => struct.structureType === structureType);

        // 已存在则不重复创建
        if (!existingSite && !existingStructure) {
            // 移除壁垒等级不足时自动转为墙的逻辑
            pos.createConstructionSite(structureType);
            console.log(`[${this.room.name}] 创建${structureType}成功`);
        }
    }

    /**
     * 标记核心区（用于可视化）
     */
    private markCoreArea(): void {
        if (!this.coreBounds || !this.coreCenter) return;
        
        // 存储可视化数据到Memory
        if (Memory.rooms[this.room.name].roomVisuals === undefined) 
            Memory.rooms[this.room.name].roomVisuals = {};
        Memory.rooms[this.room.name].roomVisuals = {
            coreCenter: { x: this.coreCenter.x, y: this.coreCenter.y },
            coreBounds: this.coreBounds
        };

        // 使用RoomVisual绘制核心区边界（调试用）
        const visual = new RoomVisual(this.room.name);
        visual.rect(
            this.coreBounds.minX - 0.5,
            this.coreBounds.minY - 0.5,
            this.coreBounds.maxX - this.coreBounds.minX + 1,
            this.coreBounds.maxY - this.coreBounds.minY + 1,
            { fill: 'transparent', stroke: 'blue', strokeWidth: 0.1 }
        );
        visual.text('CORE', this.coreCenter.x, this.coreCenter.y, { align: 'center', color: 'blue'});
    }

    /**
     * 保护资源点：为资源点周围的container和link修建rampart
     */
    private protectSources(): void {
        const sources = this.room.find(FIND_SOURCES);
        
        sources.forEach(source => {
            // 查找资源点周围的container和link???
            const adjacentStructures = source.pos.lookFor(LOOK_STRUCTURES);
            
            // 筛选出container和link
            const targetStructures = adjacentStructures.filter(struct => 
                struct.structureType === STRUCTURE_CONTAINER || 
                struct.structureType === STRUCTURE_LINK
            );

            // 为每个目标结构修建rampart
            targetStructures.forEach(struct => {
                const pos = struct.pos;
                
                // 检查位置有效性
                if (pos.x < 0 || pos.x >= this.MAP_SIZE || pos.y < 0 || pos.y >= this.MAP_SIZE) return;
                if (this.terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) return;
                
                // 检查是否已有rampart或建造站点
                const hasRampart = pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType === STRUCTURE_RAMPART);
                const hasRampartSite = pos.lookFor(LOOK_CONSTRUCTION_SITES).some(s => s.structureType === STRUCTURE_RAMPART);
                
                if (!hasRampart && !hasRampartSite) {
                    pos.createConstructionSite(STRUCTURE_RAMPART);
                    console.log(`[${this.room.name}] 在资源点(${source.pos.x},${source.pos.y})附近的${struct.structureType}上创建RAMPART`);
                }
            });
        });
    }

    /**
     * 获取布局结果
     */
    public getResult(): {
        coreCenter: RoomPosition | null;
        coreBounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
        roomName: string;
    } {
        return {
            coreCenter: this.coreCenter,
            coreBounds: this.coreBounds,
            roomName: this.room.name
        };
    }
}

// ==================== 使用示例 ====================
// 在main循环中调用
// export function loop() {
//     // 为每个已拥有的房间生成布局
//     for (const roomName in Game.rooms) {
//         const room = Game.rooms[roomName];
        
//         // 只处理自己拥有的房间（有控制器且属于自己）
//         if (room.controller && room.controller.my) {
//             const planner = new RoomPlanner(room);
            
//             // 可选：打印核心区信息
//             const result = planner.getResult();
//             console.log(`[${roomName}] 核心区位置: (${result.coreCenter?.x}, ${result.coreCenter?.y})`);
//         }
//     }
// }