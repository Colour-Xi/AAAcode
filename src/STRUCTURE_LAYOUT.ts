

// 结构偏移
interface StructureOffset {
    type: StructureConstant; // 建筑类型
    dx: number; // 相对中心点x偏移
    dy: number; // 相对中心点y偏移
}

// rampart部分可由placer代替
// 以中心点为核心的建筑布局硬编码（可根据需求调整偏移量）
export const STRUCTURE_LAYOUT: StructureOffset[] = [

    // ========== 核心区（中心点周围） ==========
    { type: STRUCTURE_STORAGE, dx: 0, dy: 0 }, // 中心点
    { type: STRUCTURE_TOWER, dx: 0, dy: -1 },   // 上
    { type: STRUCTURE_LINK, dx: 0, dy: 1 },    // 下
    { type: STRUCTURE_TOWER, dx: -1, dy: 0 },   // 左
    { type: STRUCTURE_TOWER, dx: +1, dy: 0 },   // 右

    { type: STRUCTURE_SPAWN, dx: 0, dy: -2 },   // 上方2格
    { type: STRUCTURE_POWER_SPAWN, dx: 0, dy: +2 }, // 下方2格
    { type: STRUCTURE_SPAWN, dx: -2, dy: 0 },   // 左方2格
    { type: STRUCTURE_SPAWN, dx: +2, dy: 0 },   // 右方2格

    // {dx: 0, dy: 3}, {dx: 1, dy: 2}, {dx: 2, dy: 1}, {dx: 3, dy: 0},
    { type: STRUCTURE_ROAD, dx: 0, dy: 3 },
    { type: STRUCTURE_ROAD, dx: 1, dy: 2 },
    { type: STRUCTURE_ROAD, dx: 2, dy: 1 },
    { type: STRUCTURE_ROAD, dx: 3, dy: 0 },

    // {dx: 2, dy: -1}, {dx: 1, dy: -2}, {dx: 0, dy: -3}, {dx: -1, dy: -2},

    { type: STRUCTURE_ROAD, dx: 2, dy: -1 },
    { type: STRUCTURE_ROAD, dx: 1, dy: -2 },
    { type: STRUCTURE_ROAD, dx: 0, dy: -3 },
    { type: STRUCTURE_ROAD, dx: -1, dy: -2},

    // {dx: -2, dy: -1}, {dx: -3, dy: 0}, {dx: -2, dy: 1}, {dx: -1, dy: 2},
    { type: STRUCTURE_ROAD, dx: -2, dy: -1 },
    { type: STRUCTURE_ROAD, dx: 3, dy: 0 },
    { type: STRUCTURE_ROAD, dx: -2, dy: 1 },
    { type: STRUCTURE_ROAD, dx: -1, dy: 2 },

    // {dx: 1, dy: 1}, {dx: 1, dy: -1}, {dx: -1, dy: -1}, {dx: -1, dy: 1}
    { type: STRUCTURE_ROAD, dx: 1, dy: 1 },
    { type: STRUCTURE_ROAD, dx: 1, dy: -1 },
    { type: STRUCTURE_ROAD, dx: -1, dy: -1 },
    { type: STRUCTURE_ROAD, dx: -1, dy: 1 },


    // ========== LAB区（含TERMINAL、FACTORY） ==========
    { type: STRUCTURE_TERMINAL, dx: 2, dy: 6 },
    { type: STRUCTURE_FACTORY, dx: 2, dy: 2 },

    //按行排列
    { type: STRUCTURE_LAB, dx: 2, dy: 4 },
    { type: STRUCTURE_LAB, dx: 2, dy: 5 },
    { type: STRUCTURE_LAB, dx: 3, dy: 2 },
    { type: STRUCTURE_LAB, dx: 3, dy: 4 },
    { type: STRUCTURE_LAB, dx: 3, dy: 5 },
    { type: STRUCTURE_LAB, dx: 4, dy: 2 },
    { type: STRUCTURE_LAB, dx: 4, dy: 3 },
    { type: STRUCTURE_LAB, dx: 4, dy: 5 },
    { type: STRUCTURE_LAB, dx: 5, dy: 3 },
    { type: STRUCTURE_LAB, dx: 5, dy: 4 },



    // ========== 核心区（中心点周围） ==========

    // ========== 防御区（外围） ==========


    // ========== Extension区（Spawn周围） ==========
];


