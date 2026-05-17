# 🐒了个🐏 — Tile Match Puzzle

> Claude Code 出品的现代消除小游戏

一个类似「羊了个羊」玩法的网页消除游戏，使用 React + Vite + Tailwind CSS 构建。

## 🎮 玩法

1. **点击方块** → 方块飞入底部槽位
2. **收集 3 个相同方块** → 自动消除，播放粒子特效
3. **槽位最多 7 个** → 超出则游戏失败
4. **清空全部方块** → 胜利！🎉

### 特殊功能

| 功能 | 说明 |
|------|------|
| ↩ **撤回** | 每局最多 3 次，需验证「Herry Hou最帅」 |
| 🔀 **洗牌** | 重新排列剩余方块位置，需验证 |
| 🎵 **BGM** | 背景音乐循环播放，可独立开关 |
| 🔊 **音效** | 7 种 Web Audio API 合成音效 |
| ✨ **粒子特效** | 消除爆发、胜利 confetti、失败震动 |

## 🛠 技术栈

- **框架**: React 18 + Vite 6
- **样式**: Tailwind CSS 3（玻璃拟态 UI）
- **音效**: Web Audio API（程序化合成，零外部依赖）
- **BGM**: HTMLAudioElement 循环播放 AAC
- **图片**: `import.meta.glob` 自动发现
- **动画**: CSS Keyframes + Tailwind 自定义动画
- **部署**: Vercel

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 准备素材

1. 将 20 张 JPG 图片放入 `public/assets/`
2. 将背景音乐 `.aac` 文件放入 `public/sounds/`
3. 游戏会自动检测并加载

## 📁 项目结构

```
src/
├── App.jsx                    # 主入口
├── main.jsx                   # React 挂载
├── index.css                  # Tailwind + 自定义动画
├── hooks/
│   └── useGameLogic.js        # 核心状态机
├── utils/
│   ├── tileGenerator.js       # 方块生成 & 层叠布局
│   └── soundManager.js        # 音效 & BGM 管理
└── components/
    ├── Header.jsx             # 标题 + 按钮栏
    ├── GameBoard.jsx          # 游戏棋盘
    ├── Tile.jsx               # 单个方块
    ├── TileSlot.jsx           # 底部槽位
    ├── GameModal.jsx          # 胜利/失败弹窗
    ├── ValidationModal.jsx    # 验证弹窗（撤回/洗牌）
    └── ParticleEffect.jsx     # 粒子特效
```

## 🌐 在线地址

🔗 **[https://games-eta-kohl.vercel.app](https://games-eta-kohl.vercel.app)**

## 📄 License

MIT
