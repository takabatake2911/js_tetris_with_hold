const $root = document.getElementById("root");
const $field = document.getElementById("field");
const $hold_mino = document.getElementById("hold-mino");

const FIELD_WIDTH = 12; //壁のブロックも入れた幅
const FIELD_HEIGHT = 21; //床のブロックも入れた高さ

// ミノが生成される位置
const DEFAULT_MINO_POSITION = { Y: 4, X: 4 };

// ミノの大きさ
const MINO_HEIGHT = 4;
const MINO_WIDTH = 4;
// フィールドの状態
const STATE = {
    EMPTY: 0,
    FILLED: 1,
};

class Game {
    constructor() {
        this.intervalID = null;
        this.mino = MINO.S;
        this.mino_type = "S";
        this.hold_mino = null;
        this.rot_state = 0;
        this.mino_y = DEFAULT_MINO_POSITION.Y;
        this.mino_x = DEFAULT_MINO_POSITION.X;
        this.cell_states = new Array(FIELD_HEIGHT);
        this.cell_doms = new Array(FIELD_HEIGHT);
        this.hold_cell_doms = new Array(MINO_HEIGHT);
    }
    main() {
        this.initGame();
        this.drawAll();
    }
    initGame() {
        this.initProps();
        this.initField();
        this.connectEvents();
        this.startAutoDown();
    }

    connectEvents() {
        addEventListener("keydown", (ev) => {
            if (ev.key == "ArrowUp" || ev.key === "w" || ev.key === " ") {
                this.rotateMino();
            }
            if (ev.key == "ArrowLeft" || ev.key === "a") {
                this.moveLeft();
            }
            if (ev.key == "ArrowDown" || ev.key == "s") {
                this.moveDown();
            }
            if (ev.key == "ArrowRight" || ev.key === "d") {
                this.moveRight();
                console.log(this.hold_mino);
                console.log(this.mino);
            }
            if (ev.key === "h" || ev.key === "0") {
                this.holdMino();
            }
        });
    }
    holdMino() {
        this.swapHoldMino();
        this.re_createMino();
        this.drawAll();
    }
    swapHoldMino() {
        if (this.hold_mino === null) {
            this.hold_mino = this.mino;
        } else {
            [this.hold_mino, this.mino] = [this.mino, this.hold_mino];
        }
    }
    initProps() {
        for (let yi = 0; yi < FIELD_HEIGHT; yi++) {
            this.cell_states[yi] = new Array(FIELD_WIDTH).fill(STATE.EMPTY);
            this.cell_doms[yi] = new Array(FIELD_WIDTH).fill(null);
        }
    }
    initField() {
        this.createEmptyField();
        this.createWall();
        this.createHoldMinoField();
    }
    createEmptyField() {
        for (let yi = 0; yi < FIELD_HEIGHT; yi++) {
            const $row = document.createElement("div");
            $row.classList.add("row");
            for (let xi = 0; xi < FIELD_WIDTH; xi++) {
                const $cell = document.createElement("div");
                $cell.classList.add("cell");
                this.cell_doms[yi][xi] = $cell;
                $row.appendChild($cell);
            }
            $field.appendChild($row);
        }
    }
    createHoldMinoField() {
        for (let yi = 0; yi < MINO_HEIGHT; yi++) {
            this.hold_cell_doms[yi] = new Array(MINO_WIDTH);
            const $hold_mino_row = document.createElement("div");
            $hold_mino_row.classList.add("row");
            for (let xi = 0; xi < MINO_WIDTH; xi++) {
                const $cell = document.createElement("div");
                $cell.classList.add("cell");
                this.hold_cell_doms[yi][xi] = $cell;
                $hold_mino_row.appendChild($cell);
            }
            $hold_mino.appendChild($hold_mino_row);
        }
    }
    drawHoldMino() {
        for (let yi = 0; yi < MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < MINO_WIDTH; xi++) {
                this.hold_cell_doms[yi][xi].classList.remove("mino");
                if (this.hold_mino == null || this.hold_mino[0][yi][xi] == 0) {
                    continue;
                }
                this.hold_cell_doms[yi][xi].classList.add("mino");
            }
        }
    }
    createWall() {
        for (let yi = 0; yi < FIELD_HEIGHT; yi++) {
            this.cell_states[yi][0] = STATE.FILLED;
            this.cell_states[yi][FIELD_WIDTH - 1] = STATE.FILLED;
        }
        for (let xi = 0; xi < FIELD_WIDTH; xi++) {
            this.cell_states[FIELD_HEIGHT - 1][xi] = STATE.FILLED;
        }
    }
    drawAll() {
        this.drawField();
        this.drawMino();
        this.drawHoldMino();
    }
    drawField() {
        for (let yi = 0; yi < FIELD_HEIGHT; yi++) {
            for (let xi = 0; xi < FIELD_WIDTH; xi++) {
                this.cell_doms[yi][xi].classList.remove("filled");
                if (this.cell_states[yi][xi] == STATE.EMPTY) {
                    continue;
                }
                this.cell_doms[yi][xi].classList.add("filled");
            }
        }
    }
    drawMino() {
        this.clearFieldMino();
        for (let yi = 0; yi < MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] == 0) {
                    continue;
                }
                // ミノの各ブロックをフィールド上の座標に変換
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;
                this.cell_doms[y][x].classList.add("mino");
                this.cell_doms[y][x].classList.add(this.mino_type);
            }
        }
    }
    clearFieldMino() {
        for (let yi = 0; yi < FIELD_HEIGHT; yi++) {
            for (let xi = 0; xi < FIELD_WIDTH; xi++) {
                this.cell_doms[yi][xi].classList.remove("mino");
                for (let minotype of MINO_TYPES) {
                    this.cell_doms[yi][xi].classList.remove(minotype);
                }
            }
        }
    }
    clearFieldStates() {
        for (let yi = 0; yi < FIELD_HEIGHT - 1; yi++) {
            for (let xi = 1; xi < FIELD_WIDTH - 1; xi++) {
                this.cell_states[yi][xi] = STATE.EMPTY;
                // this.cell_doms[yi][xi].classList.remove("filled");
            }
        }
    }
    startAutoDown() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
        }
        this.intervalID = setInterval(() => {
            this.moveDown();
        }, 1000);
    }
    moveDown() {
        ++this.mino_y;
        if (this.hitCheck()) {
            --this.mino_y;
            this.setMinoToField();
            this.respawn();
        }
        this.drawAll();
    }
    moveLeft() {
        --this.mino_x;
        if (this.hitCheck()) {
            ++this.mino_x;
        }
        this.drawAll();
    }
    moveRight() {
        ++this.mino_x;
        if (this.hitCheck()) {
            --this.mino_x;
        }
        this.drawAll();
    }
    rotateMino() {
        this.rot_state = (this.rot_state + 1) % 4;
        if (this.hitCheck()) {
            this.rot_state = (this.rot_state + 3) % 4;
        }
        this.drawAll();
    }

    hitCheck() {
        for (let yi = 0; yi < MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] == 0) {
                    continue;
                }
                // ミノの各ブロックをフィールド上の座標に変換
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;
                if (this.cell_states[y][x] === STATE.FILLED) {
                    return true;
                }
            }
        }
        return false;
    }
    gameOver() {
        this.hold_mino = null;
        this.clearFieldStates();
        alert("GAME OVER!!");
    }
    respawn() {
        this.respawnMino();
        this.drawAll();
        if (this.hitCheck()) {
            this.gameOver();
            return;
        }
    }
    respawnMino() {
        this.changeMinoType();
        this.re_createMino();
    }
    setMinoToField() {
        for (let yi = 0; yi < MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] == 0) {
                    continue;
                }
                // ミノの各ブロックをフィールド上の座標に変換
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;
                this.cell_states[y][x] = STATE.FILLED;
            }
        }
        this.deleteFilledLines();
    }
    deleteFilledLines() {
        // 床のブロックはチェックしない
        for (let yi = 0; yi < FIELD_HEIGHT - 1; yi++) {
            let isFilled = true;
            // 壁のブロックはチェックしない
            for (let xi = 1; xi < FIELD_WIDTH - 1; xi++) {
                if (this.cell_states[yi][xi] == STATE.EMPTY) {
                    isFilled = false;
                }
            }
            if (isFilled) {
                this.deleteSingleLine(yi);
            }
        }
    }
    deleteSingleLine(n) {
        for (let yi = n; yi > 0; yi--) {
            // 壁のブロックは含まない
            for (let xi = 1; xi < FIELD_WIDTH - 1; xi++) {
                this.cell_states[yi][xi] = this.cell_states[yi - 1][xi];
            }
        }
    }
    re_createMino() {
        // this.changeMinoType();
        this.mino_y = DEFAULT_MINO_POSITION.Y;
        this.mino_x = DEFAULT_MINO_POSITION.X;
    }
    changeMinoType() {
        const random_index = Math.floor(Math.random() * MINO_TYPES_LENGTH);
        const mino_type = MINO_TYPES[random_index];
        this.mino_type = mino_type;
        this.mino = MINO[mino_type];
    }
}

const MINO = {
    S: [
        // 0 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
        ],
        // 180 deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 270 deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
        ],
    ],
    O: [
        // 0 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 180 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 270 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
    ],
    Z: [
        // 0 deg
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
        ],
        // 180 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 0],
        ],
        // 270 deg
        [
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    I: [
        // 0 deg
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ],
        // 180 deg
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        // 270 deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    T: [
        // 0 deg
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 180 deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 270 deg
        [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    L: [
        // 0 deg
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90 deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 180 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        // 270 deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    F: [
        // 0 deg
        [
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
        ],
        // 90 deg
        [
            [1, 0, 1, 0],
            [1, 0, 1, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ],
        // 180 deg
        [
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
        ],
        // 270 deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 1, 0, 1],
            [0, 1, 0, 1],
        ],
    ],
    // N: [
    //     // 0 deg
    //     [
    //         [1, 0, 0, 1],
    //         [1, 1, 0, 1],
    //         [1, 0, 1, 1],
    //         [1, 0, 0, 1],
    //     ],
    //     // 90 deg
    //     [
    //         [1, 1, 1, 1],
    //         [0, 0, 1, 0],
    //         [0, 1, 0, 0],
    //         [1, 1, 1, 1],
    //     ],
    //     // 180 deg
    //     [
    //         [1, 0, 0, 1],
    //         [1, 1, 0, 1],
    //         [1, 0, 1, 1],
    //         [1, 0, 0, 1],
    //     ],
    //     // 270 deg
    //     [
    //         [1, 1, 1, 1],
    //         [0, 0, 1, 0],
    //         [0, 1, 0, 0],
    //         [1, 1, 1, 1],
    //     ],
    // ],
};
MINO_TYPES = Object.keys(MINO);
const MINO_TYPES_LENGTH = MINO_TYPES.length;
game = new Game();
game.main();
