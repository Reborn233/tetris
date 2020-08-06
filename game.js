const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
canvas.width = 2 * W;
canvas.height = 2 * H;
canvas.style.width = `${W}px`;
canvas.style.height = `${H}px`;
ctx.translate(40, 40);
ctx.lineWidth = 2;
ctx.lineCap = "square";
ctx.fillStyle = "#ccc";
ctx.strokeStyle = "#999";
ctx.font = "bold 40px arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
// 图形类型集合
const blocks = [
  [4, 0, 4, 1, 5, 1, 6, 1],
  [4, 1, 5, 1, 6, 1, 6, 0],
  [4, 0, 5, 0, 5, 1, 6, 1],
  [4, 1, 5, 0, 5, 1, 6, 0],
  [5, 0, 4, 1, 5, 1, 6, 1],
  [4, 0, 5, 0, 6, 0, 7, 0],
  [5, 0, 6, 0, 5, 1, 6, 1]
];

const KEY_CODE = {
  ENTER: 13,
  PAUSE: 80,
  LEFT: 65,
  RIGHT: 68,
  DOWN: 83,
  UP: 87
}

const genRandomBlock = () => {
  return blocks[Math.floor(Math.random() * blocks.length)];
}
// 12行20列 尺寸40
const space = 40;
const row = 12;
const col = 20;


class Shape {
  constructor (m) {
    this.m = Object.assign([], m);
  }
  transform () {
    let m = this.m,
      l = m.length,
      c = 4,
      x = m[c],
      y = m[c + 1],
      min = 0,
      max = 0;
    if (Math.abs(m[2] - m[4]) == 1 && Math.abs(m[3] - m[5]) == 1) {
      return
    };
    for (let i = 0; i < l; i = i + 2) {
      if (i == c) continue;
      let mx = m[i] - x,
        my = m[i + 1] - y,
        nx = -my,
        ny = mx;
      m[i] = x + nx;
      m[i + 1] = y + ny;
      max = Math.max(m[i] - 11, max);
      min = Math.min(m[i], min);
    }

    for (let i = 0; i < l; i = i + 2) {
      m[i] -= min;
      m[i] -= max;
    }
    return this;
  }
  canMoveLeft (maps) {
    let over = true
    const m = this.m;
    for (let i = 0, l = m.length; i < l; i = i + 2) {
      if (m[i] <= 0 || maps[m[i + 1]][m[i] - 1] === 1) {
        over = false;
        break;
      }
    }
    return over;
  }
  canMoveRight (maps) {
    let over = true
    const m = this.m;
    for (let i = 0, l = m.length; i < l; i = i + 2) {
      if (m[i] >= 11 || maps[m[i + 1]][m[i] + 1] === 1) {
        over = false;
        break;
      }
    }
    return over;
  }
  move (x, y) {
    let m = this.m,
      l = m.length;
    y = y || 0;

    for (let i = 0; i < l; i = i + 2) {
      m[i] += x;
      m[i + 1] += y;
    }
    return this;
  }
  draw (m) {
    ctx.lineWidth = 4;
    ctx.fillStyle = "#ABD3FC";
    ctx.strokeStyle = "#6AB3FD";
    for (let i = 0, l = m.length; i < l; i = i + 2) {
      ctx.fillRect(m[i] * space, m[i + 1] * space, space, space);
      ctx.strokeRect(m[i] * space + 2, m[i + 1] * space + 2, space - 2, space - 2);
    }
  }
  drawCurr () {
    ctx.save();
    this.draw(this.m);
    ctx.restore();
    return this;
  }

  drawNext (m) {
    ctx.save();
    ctx.transform(0.7, 0, 0, 0.7, 400, 130);
    this.draw(m);
    ctx.restore();
    return this;
  }
}

class Game {
  constructor () {
    this.maps = [];
    this.shape = null;
    this.next = null;
    this.timer = null;
  }

  init () {
    this.isOver = false;
    this.score = 0;
    this.pause = false;
    this.fps = 2;
    for (let i = 0; i < col; i++) {
      this.maps[i] = []
      for (let j = 0; j < row; j++) {
        this.maps[i][j] = 0;
      }
    }

    this.next = [...genRandomBlock()];
    this.shape = new Shape(genRandomBlock());

    this.drawUI().drawMaps();
    return this;
  }

  drawUI () {
    ctx.save();
    //格子
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        ctx.fillRect(i * space, j * space, space, space);
        ctx.strokeRect(i * space, j * space, space, space);
      }
    }

    //边框
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";
    ctx.moveTo(0, 0);
    ctx.lineTo(0, col * space);
    ctx.lineTo(row * space, col * space);
    ctx.lineTo(row * space, 0);
    ctx.stroke();
    ctx.restore();

    //分数
    ctx.save();
    ctx.fillStyle = "#333";
    ctx.fillText("score", 560, 20);
    ctx.fillText("next", 560, 100);
    ctx.font = "bold 30px arial";
    ctx.fillStyle = "#E6A23C";
    ctx.fillText(this.score, 560, 60);
    ctx.restore();
    return this;
  }

  drawMaps () {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.fillStyle = "#ABD3FC";
    ctx.strokeStyle = "#6AB3FD";

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        if (this.maps[j][i] == 1) {
          ctx.fillRect(i * space, j * space, space, space);
          ctx.strokeRect(i * space + 2, j * space + 2, space - 2, space - 2);
        }
      }
    }
    ctx.restore();
    return this;
  }

  checkPoint () {
    const maps = this.maps;
    for (let i = 0, l = maps.length; i < l; i++) {
      if (Math.min.apply(null, maps[i]) === 1) {
        this.maps.splice(i, 1);
        this.score += 10;
        this.maps.unshift(new Array(10).fill(0));
      }
    }
    return this;
  }

  update () {
    // if (this.isOver) return;
    if (this.pause) return;

    let isEnd;

    for (let i = 0; i < this.shape.m.length; i += 2) {
      const x = this.shape.m[i];
      const y = this.shape.m[i + 1];
      if (y >= 19) {
        isEnd = true;
        break;
      }
      if (this.maps[y + 1][x] === 1) {
        isEnd = true;
        if (y <= 1) {
          this.isOver = true;
        }
        break;
      }
    }

    if (this.isOver) {
      return;
    }

    if (isEnd) {
      this.goNext();
    }
    else {
      this.shape.move(0, 1);
    }
  }
  clear () {
    ctx.clearRect(-space, -space, W * 2, H * 2);
  }

  draw () {
    this.drawUI().drawMaps();
    this.shape.drawCurr().drawNext(this.next);

    if (this.isOver) {
      this.gameOver();
    }
  }

  goNext () {
    //方块到底
    for (let i = 0; i < this.shape.m.length; i = i + 2) {
      const x = this.shape.m[i];
      const y = this.shape.m[i + 1];
      this.maps[y][x] = 1;
    }
    this.checkPoint();
    this.shape = new Shape(this.next);
    this.next = [...genRandomBlock()];
  }

  gameOver () {
    //游戏结束
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, row * space, col * space);
    ctx.font = "bold 60px arial";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#E6A23C";
    ctx.fillText("Game Over", 6 * space, 10 * space);
    ctx.restore();
  }
  bindEvent () {
    let over = false;
    document.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        case KEY_CODE.ENTER: // enter 回车
          clearTimeout(this.timer);
          this.init().run();
          break;
        case KEY_CODE.PAUSE: // p 暂停
          this.pause = !this.pause;
          break;
        case KEY_CODE.DOWN: // s 下落
          this.fps = 20;
          break;
        case KEY_CODE.LEFT: // a 左移
          if (this.shape.canMoveLeft(this.maps)) {
            this.shape.move(-1, 0);
          }
          break;
        case KEY_CODE.RIGHT: // d 右移
          if (this.shape.canMoveRight(this.maps)) {
            this.shape.move(1, 0);
          }
          break;
        case KEY_CODE.UP: // w 变形
          this.shape.transform();
          break;
      }
    }, false)

    document.addEventListener("keyup", (e) => {
      if (e.keyCode === KEY_CODE.DOWN) {
        this.fps = 2;
      }
    }, false);

    return this;
  }

  run () {
    this.update();
    this.clear();
    this.draw();
    this.timer = setTimeout(() => {
      this.run();
    }, 1000 / this.fps)
  }
}

const game = new Game();

game.init().bindEvent();
