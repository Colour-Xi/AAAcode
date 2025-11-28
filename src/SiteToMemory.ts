// ------------------------------ 类型定义 ------------------------------

import { STRUCTURE_LAYOUT } from "./STRUCTURE_LAYOUT";

// 坐标接口定义
interface Coordinate {
    x: number;
    y: number;
}

// Site数据结构接口
interface SiteData {
    type: BuildableStructureConstant;
    pos: {
        x: number;
        y: number;
    };
}

/**
 * 基于预留核心区的建筑布局管理器（坐标存储版）
 */
export class SiteToMemory {
    private room: Room;
    private coreCenter: RoomPosition;
    private roomName: string;

    /**
     * 构造函数
     * @param room 目标房间
     * @param coreCenter 核心区中心点（已预留位置）
     */
    constructor(room: Room, coreCenter: RoomPosition) {
        this.room = room;
        this.coreCenter = coreCenter;
        this.roomName = room.name;
        
        // 初始化房间内存结构（如果需要）
        // if (!Memory.rooms) Memory.rooms = {};
        // if (!Memory.rooms[this.roomName]) Memory.rooms[this.roomName] = {};
    }

    /**
     * 执行建筑布局计算并保存到内存（主入口方法）
     */
    public calculateAllStructures(): void {
        // 创建临时数组存储所有建筑点位
        const allSites: SiteData[] = [];
        
        // 一次性计算所有建筑类型，收集到临时数组
        this.addSpawns(allSites);
        this.addContainers(allSites);
        this.addExtensions(allSites);
        this.addTowers(allSites);
        this.addStorage(allSites);
        this.addLinks(allSites);
        this.addLabs(allSites);
        this.addObserver(allSites);
        this.addPowerSpawn(allSites);
        this.addNuker(allSites);
        this.addRoadNetwork(allSites);
        
        // 去重处理
        const uniqueSites = this.removeDuplicates(allSites);
        
        // 一次性保存到内存
        Memory.rooms[this.roomName].site = uniqueSites;
    }

    /**
     * 移除重复的建筑点位
     */
    private removeDuplicates(sites: SiteData[]): SiteData[] {
        const uniqueMap = new Map<string, SiteData>();
        
        for (const site of sites) {
            // 创建唯一标识：类型+坐标
            const key = `${site.type}-${site.pos.x}-${site.pos.y}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, site);
            }
        }
        
        return Array.from(uniqueMap.values());
    }

    // ------------------------------ 各建筑类型添加逻辑 ------------------------------

    private addSpawns(allSites: SiteData[]): void {
        const coordinates = this.getSpawnCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_SPAWN, pos: coord });
        });
    }

    private addContainers(allSites: SiteData[]): void {
        const coordinates = this.getContainerCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_CONTAINER, pos: coord });
        });
    }

    private addExtensions(allSites: SiteData[]): void {
        const coordinates = this.getExtensionCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_EXTENSION, pos: coord });
        });
    }

    private addTowers(allSites: SiteData[]): void {
        const coordinates = this.getTowerCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_TOWER, pos: coord });
        });
    }

    private addStorage(allSites: SiteData[]): void {
        const coordinate = { x: this.coreCenter.x, y: this.coreCenter.y };
        allSites.push({ type: STRUCTURE_STORAGE, pos: coordinate });
    }

    private addLinks(allSites: SiteData[]): void {
        const coordinates = this.getLinkCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_LINK, pos: coord });
        });
    }

    private addLabs(allSites: SiteData[]): void {
        const coordinates = this.getLabCoordinates();
        coordinates.forEach(coord => {
            allSites.push({ type: STRUCTURE_LAB, pos: coord });
        });
    }

    private addObserver(allSites: SiteData[]): void {
        const coordinate = { x: this.coreCenter.x, y: this.coreCenter.y - 6 };
        allSites.push({ type: STRUCTURE_OBSERVER, pos: coordinate });
    }

    private addPowerSpawn(allSites: SiteData[]): void {
        const coordinate = { x: this.coreCenter.x + 3, y: this.coreCenter.y };
        allSites.push({ type: STRUCTURE_POWER_SPAWN, pos: coordinate });
    }

    private addNuker(allSites: SiteData[]): void {
        const coordinate = { x: this.coreCenter.x, y: this.coreCenter.y - 5 };
        allSites.push({ type: STRUCTURE_NUKER, pos: coordinate });
    }

    private addRoadNetwork(allSites: SiteData[]): void {
        const mainRoads = this.getMainRoadCoordinates();
        mainRoads.forEach(coord => {
            allSites.push({ type: STRUCTURE_ROAD, pos: coord });
        });
        
        const connectRoads = this.getConnectRoadCoordinates();
        connectRoads.forEach(coord => {
            allSites.push({ type: STRUCTURE_ROAD, pos: coord });
        });
        
        const sourceRoads = this.getSourceRoadCoordinates();
        sourceRoads.forEach(coord => {
            allSites.push({ type: STRUCTURE_ROAD, pos: coord });
        });
    }

    // ------------------------------ 坐标计算方法（保持原有逻辑） ------------------------------

    private getSpawnCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const cx = this.coreCenter.x;
        const cy = this.coreCenter.y;

        for (let i = 0; i < STRUCTURE_LAYOUT.length; i++) {
            const thisObj = STRUCTURE_LAYOUT[i];
            if (thisObj.type === STRUCTURE_SPAWN) {
                coordinates.push({
                    x: thisObj.dx + cx,
                    y: thisObj.dy + cy
                });
            }
        }
        return coordinates;
    }

    private getContainerCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const cx = this.coreCenter.x;
        const cy = this.coreCenter.y;

        // 能量矿位置
        const energyMinePos = this.getNearestEnergyMinePos();
        energyMinePos.forEach(pos => {
            coordinates.push({ 
                x: cx + pos.dx,  
                y: cy + pos.dy 
            });
        });
        
        // 特殊矿位置
        const specialMinePos = this.getSpecialMinePos();
        coordinates.push({ x: specialMinePos.x, y: specialMinePos.y });
        
        // 控制器位置
        const controllerPos = this.getControllerPos();
        coordinates.push({ x: controllerPos.x, y: controllerPos.y });

        // lab建筑群的中继container
        coordinates.push({ x: cx + 4, y: cy + 4 });

        return coordinates;
    }

    getControllerPos(): Coordinate {
        const controller = this.room.controller;

        if (!controller) {
            return { x: 999, y: 999 };
        }

        const path = this.coreCenter.findPathTo(controller.pos, {
                plainCost: 1,
                swampCost: 1,
                ignoreCreeps: true,
                ignoreRoads: true,
                maxRooms: 1,
        });
        
        const targetStep = path[path.length - 3];
        return targetStep ? {
            x: this.coreCenter.x + targetStep.dx,
            y: this.coreCenter.y + targetStep.dy
        } : { x: 999, y: 999 };
    }
    
    getSpecialMinePos(): Coordinate {
        const source = this.room.find(FIND_MINERALS)[0];

        if (!source) return { x: 999, y: 999 };

        const path = this.coreCenter.findPathTo(source.pos, {
                plainCost: 1,
                swampCost: 1,
                ignoreCreeps: true,
                ignoreRoads: true,
                maxRooms: 1
            });
            
        const targetStep = path[path.length - 2];
        return targetStep ? {
            x: this.coreCenter.x + targetStep.dx,
            y: this.coreCenter.y + targetStep.dy
        } : { x: 999, y: 999 };
    }

    getNearestEnergyMinePos(): PathStep[] {
        const sources = this.room.find(FIND_SOURCES);
        const result: PathStep[] = [];

        sources.forEach(source => {
            const path = this.coreCenter.findPathTo(source.pos, {
                plainCost: 1,
                swampCost: 1,
                ignoreCreeps: true,
                ignoreRoads: true,
                maxRooms: 1
            });
            
            if (path.length > 0) {
                result.push(path[path.length - 2]);
            }
        });

        return result;
    }

    private getExtensionCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const spawnX = this.coreCenter.x;
        const spawnY = this.coreCenter.y - 2;

        // 第一层：Spawn周围8格
        coordinates.push(
            { x: spawnX - 1, y: spawnY },
            { x: spawnX + 1, y: spawnY },
            { x: spawnX, y: spawnY - 1 },
            { x: spawnX - 1, y: spawnY - 1 },
            { x: spawnX + 1, y: spawnY - 1 },
            { x: spawnX, y: spawnY + 1 },
            { x: spawnX - 1, y: spawnY + 1 },
            { x: spawnX + 1, y: spawnY + 1 }
        );

        // 第二层：扩展圈（全部生成）
        coordinates.push(
            { x: spawnX - 2, y: spawnY - 1 },
            { x: spawnX - 2, y: spawnY },
            { x: spawnX - 2, y: spawnY + 1 },
            { x: spawnX + 2, y: spawnY - 1 },
            { x: spawnX + 2, y: spawnY },
            { x: spawnX + 2, y: spawnY + 1 },
            { x: spawnX - 1, y: spawnY - 2 },
            { x: spawnX, y: spawnY - 2 },
            { x: spawnX + 1, y: spawnY - 2 },
            { x: spawnX - 1, y: spawnY + 2 },
            { x: spawnX, y: spawnY + 2 },
            { x: spawnX + 1, y: spawnY + 2 }
        );

        return coordinates;
    }

    private getTowerCoordinates(): Coordinate[] {
        return [
            { x: this.coreCenter.x - 3, y: this.coreCenter.y - 3 },
            { x: this.coreCenter.x + 3, y: this.coreCenter.y - 3 },
            { x: this.coreCenter.x - 3, y: this.coreCenter.y + 3 },
            { x: this.coreCenter.x + 3, y: this.coreCenter.y + 3 },
            { x: this.coreCenter.x, y: this.coreCenter.y - 4 },
            { x: this.coreCenter.x, y: this.coreCenter.y + 4 }
        ];
    }

    private getLinkCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        
        // 核心区Link
        coordinates.push({ x: this.coreCenter.x, y: this.coreCenter.y + 2 });
        
        // 资源点附近Link
        const sources = this.room.find(FIND_SOURCES);
        sources.forEach(source => {
            coordinates.push({ x: source.pos.x, y: source.pos.y + 1 });
        });

        return coordinates;
    }

    private getLabCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const baseX = this.coreCenter.x + 3;
        const baseY = this.coreCenter.y - 2;

        // 3x3 Lab布局
        for (let y = baseY; y <= baseY + 2; y++) {
            for (let x = baseX; x <= baseX + 2; x++) {
                coordinates.push({ x, y });
            }
        }

        return coordinates;
    }

    private getMainRoadCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const cx = this.coreCenter.x;
        const cy = this.coreCenter.y;

        // 3x3口字形，旋转了45度
        for (let x = cx - 3; x <= cx + 3; x++) {
            for (let y = cy - 3; y <= cy + 3; y++) {
                const absDx = Math.abs(x - cx);
                const absDy = Math.abs(y - cy);
                if (absDx + absDy === 3 || (absDx === absDy && absDx === 1)) {
                    coordinates.push({ x, y });
                }
            }
        }
        return coordinates;
    }

    private getConnectRoadCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const cx = this.coreCenter.x;
        const cy = this.coreCenter.y;

        // Spawn到Storage的连接
        coordinates.push({ x: cx, y: cy - 1 });
        
        // Lab区连接主干道
        for (let x = cx; x <= cx + 3; x++) {
            coordinates.push({ x, y: cy - 2 });
        }

        // Tower到主干道的连接
        const towers = this.getTowerCoordinates();
        towers.forEach(tower => {
            const towerPos = new RoomPosition(tower.x, tower.y, this.room.name);
            const path = this.room.findPath(towerPos, this.coreCenter, {
                plainCost: 1,
                swampCost: 1,
                maxRooms: 1
            });
            path.forEach(step => {
                const x = tower.x + step.dx;
                const y = tower.y + step.dy;
                coordinates.push({ x, y });
            });
        });

        return coordinates;
    }

    private getSourceRoadCoordinates(): Coordinate[] {
        const coordinates: Coordinate[] = [];
        const sources = this.room.find(FIND_SOURCES);

        sources.forEach(source => {
            const path = this.room.findPath(source.pos, this.coreCenter, {
                plainCost: 1,
                swampCost: 1,
                maxRooms: 1,
                ignoreCreeps: true
            });

            path.forEach(step => {
                const x = source.pos.x + step.dx;
                const y = source.pos.y + step.dy;
                if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                    coordinates.push({ x, y });
                }
            });
        });

        return coordinates;
    }
}