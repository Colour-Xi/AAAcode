# 工程日志

## 2025.11.24

1.固定式紧凑型布局框架完工。具体位置暂未编写。

从spawn开始编写

ps：道路建设。从当前单位位置到所有边界门，再从边界门到目标点。选取最近的。然后铺路。

### 11.25

布局硬编码格式；软编码为区块项目内的内容；或者折中方案内可以采用；

本项目较为赶时间，所以非必要项目可以暂时采用硬编码。后期再优化

今日编写：STRUCTURE_LAYOUT

### 11.26（上午）

getposition的优化；与优化其健壮性。如果房间不存在此对象会怎么样。

下午计划：

把placer优化完成。

### 11.26 （下午）

优化了RoomPlaner的核心中点的寻找逻辑

RoomPlacer按理来说只需要执行一次，但是不排除有特殊情况需要再次执行，为了系统的健壮性，需要引入“对象绑定”的概念，把id数据绑定到对方的Memory里；

！！！建筑工地的id和建成的建筑id不一样，需要监听器再次辅助绑定

方案一：//耗费memory，省cpu

    直接绑定id

方案二：//费cpu，省memory，也暂时不要编写绑定和监听器代码

    直接findrange

### 11.27

继续写structurePlacer

placer 改名 SiteToMemory，只负责将工地坐标保存在Memory中

RoomPlanner负责将核心中心点保存到Memory中，并建造围墙和资源点Rampart

加了一点数据类型，声明在typedts


harvest的id绑定相关的逻辑有待优化。跟Memory有关，可以引入Manager去干预

引入了RoleBornner去计划性的生产角色

也可以引入TaskBornner。

### 11.28（计划）

将role相关的内容完善
















1
