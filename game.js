const clock = [
    [0,1],
    [-1,0]
]

const c_clock = [
    [0,-1],
    [1,0]
]

const pieces = {
    T : [
        [0,0],
        [-1,0],
        [0,1],
        [1,0]
    ],
    L : [
        [0,0],
        [-1,0],
        [-1,1],
        [1,0]
    ],
    J : [
        [0,0],
        [1,0],
        [-1,0],
        [1,1]
    ],
    Z : [
        [0,0],
        [0,-1],
        [-1,-1],
        [1,0]
    ],
    S : [
        [0,0 ],
        [1,0],
        [0,1],
        [-1,1]
    ],
    O : [
        [0,0],
        [-1,0],
        [-1,1],
        [0,1]
    ],
    I : [
        [0,0],
        [-1,0],
        [-2,0],
        [1,0]
    ]
}

const types = {
    symmetric : "symmetric",
    zee : "zee",
    jay : "jay"
}

const PIECE_ARRAY = [
    pieces.J,
    pieces.I,
    pieces.L,
    pieces.O,
    pieces.S,
    pieces.Z,
    pieces.T];
const TYPE_ARRAY =  [
    types.jay,
    types.symmetric,
    types.zee,
    types.symmetric,
    types.jay,
    types.zee,
    types.symmetric];
let n_rand = Math.floor(Math.random()*7);
let next = PIECE_ARRAY[n_rand];
let next_type = TYPE_ARRAY[n_rand];


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 1000,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);


board = new Array(20);
sprites = new Array(20);
next_sprites = new Array(3);
for(let i=0;i<20;i++){
    board[i] = new Array(10);
    sprites[i] = new Array(10);
    if(i<3) {
        next_sprites[i] = new Array(4);
    }
    board[i].fill(0)
}


let r =  Math.floor(Math.random()*7);

controlled = {
    x: 5,
    y: 0,
    piece : JSON.parse(JSON.stringify(PIECE_ARRAY[r])),
    type : TYPE_ARRAY[r]
};


function preload () {
    this.load.image('jay','assets/red/red.png')
    this.load.image('symmetric','assets/red/redwhite.png')
    this.load.image('zee','assets/red/gray.png')
}
const GRID_SIZE = 32;
const LEFT = 240;
const TOP = 32;

let cursors;
let rotators = {};

let INPUT_GRID = new Array(3);

function create () {
    cursors = this.input.keyboard.createCursorKeys();

    rotators.clock = this.input.keyboard.addKey('X');
    rotators.counter_clock = this.input.keyboard.addKey('Z');
    //camera
    this.cameras.main.setBounds(0, 0, 800, 1000);
    this.cameras.main.setZoom(.9);
    this.cameras.main.centerOn(0, 0);

    this.add.grid(240, 32, 320, 640, 32, 32, 0xDDDDDD).setOrigin(0);

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            sprites[j][i] = this.add.image(LEFT + i * GRID_SIZE, TOP + j * GRID_SIZE, 'jay').setOrigin(0).setAlpha(0);
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            next_sprites[i][j] = this.add.image(LEFT + 420 + j * GRID_SIZE, TOP + 80 + i * GRID_SIZE, 'zee').setOrigin(0)
                .setAlpha(0);
        }
    }
    draw_next();
}

const states = {
    INTRO: "intro",
    FALLING: "falling",
    ENDING : "ending",
    CLEARING : "clearing"
}

let state = states.INTRO;


function collided(movx, movy) {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x+movx;
        let y = sqr[1]+controlled.y+movy;
        if(y>=20 || x>=10 || x<0 || y<0){//hit edge
            return true;
        }
        else if(board[y][x]>0){//hit block
            return true;
        }
    }
    return false;
}

let fall_tick = 45;

function clear_line() {
    for(let i=0;i<lines;i++) {
        let line = line_cleared[i];
        for (let i = line; i >= 0; i--) {
            if (i > 0) {
                board[i] = JSON.parse(JSON.stringify(board[i - 1]));
            } else {
                board[0].fill(0);
            }
            for (let j = 0; j < 10; j++) {
                let block = board[i][j];
                let alpha = block === 0 ? 0 : 1;
                sprites[i][j].setAlpha(alpha);
                if (block > 0) {
                    switch (block) {
                        case 1:
                            sprites[i][j].setTexture(types.zee);
                            break;
                        case 2:
                            sprites[i][j].setTexture(types.jay);
                            break;
                        case 3:
                            sprites[i][j].setTexture(types.symmetric);
                            break;
                    }
                }
            }
        }
    }
    lines =0;
}

let line_cleared = Array(4);
let lines = 0;

function solidify_board() {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {//Not Game Over
            board[y][x] = Math.abs(board[y][x]);
        }
        else{//Game Over
            state = states.ENDING;
            fall_tick = 130;
        }
    }
    for(let i=0;i<20;i++){
        for(let j=0;j<10;j++){
            if(board[i][j]===0){
                j=10;
            }
            else if(j>=9){
                line_cleared[lines]=i;
                lines++;
                fall_tick+=3;
            }
        }
    }
    if(lines>0){
        fall_tick+=4;
        state = states.CLEARING;
        clear_animate();
        console.log(line_cleared);
    }
    else{
        ready_next();
        refresh_board();
    }
}

function draw_next() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            next_sprites[i][j].setAlpha(0);
        }
    }
    for (let i = 0; i < 4; i++) {
        let x = next[i][0] + 2;
        let y = next[i][1] + 1;
        next_sprites[y][x].setAlpha(1);
        next_sprites[y][x].setTexture(next_type);
    }
}

function ready_next() {
    controlled.x = 5;
    controlled.y = 0;
    controlled.piece = JSON.parse(JSON.stringify(next));
    controlled.type = next_type;
    let r = Math.floor(Math.random() * 8);
    let temp_next = PIECE_ARRAY[r];
    if(r===7 || next === temp_next){
        r = Math.floor(Math.random() * 7);
        temp_next = PIECE_ARRAY[r];
    }
    next = temp_next;
    next_type = TYPE_ARRAY[r]
    draw_next();
}

let frame_time = 0;


let rdas = 0;

let das = 0;
let das_charged = false;



function rotate(trans) {
    let new_piece = Array(4);
    for(let i=0;i<4;i++) {
        new_piece[i] = Array(2);
    }
    new_piece[0].fill(0);
    for(let i=1;i<4;i++) {
        let square = controlled.piece[i];
        new_piece[i][0] = square[0]*trans[0][0]+square[1]*trans[1][0];
        new_piece[i][1] = square[0]*trans[0][1]+square[1]*trans[1][1];
    }
    let old_piece = JSON.parse(JSON.stringify(controlled.piece));
    clear_piece();
    controlled.piece = JSON.parse(JSON.stringify(new_piece));
    if(collided(0,0)){
        controlled.piece = JSON.parse(JSON.stringify(old_piece));
    }
    refresh_board();
}

function game_input() {
    let shifted = false;
    INPUT_GRID = [
        [cursors.left.isDown, -1, 0],
        [cursors.right.isDown, 1, 0],
        [cursors.down.isDown, 0, 1]
    ]
    for (let i = 0; i < 3; i++) {
        if (INPUT_GRID[i][0]) {
            shifted = true;
            if (das <= 0) {
                das = das_charged ? 6 : 16;
                das_charged = true;
                if (!collided(INPUT_GRID[i][1], INPUT_GRID[i][2])) {
                    clear_piece();
                    controlled.x += INPUT_GRID[i][1];
                    controlled.y += INPUT_GRID[i][2];
                    refresh_board();
                }
            }
        }
    }
    if (!shifted) {
        das = 0;
        das_charged = false;
    }
    rdas--;
    if (rdas <= 0 && JSON.stringify(controlled.piece) !== JSON.stringify(pieces.O)) {
        if (rotators.clock.isDown) {
            rdas = 16;
            rotate(clock);
        } else if (rotators.counter_clock.isDown) {
            rdas = 16;
            rotate(c_clock);
        }
    }
    if (!rotators.clock.isDown && !rotators.counter_clock.isDown) {
        rdas = 0;
    }
}

function clear_animate() {
    for(let j=0 ;j<lines;j++) {
        for (let i = 0; i < 10; i++) {
            sprites[line_cleared[j]][i].setAlpha(0);
        }
    }
}

function update(time,delta){
    frame_time += delta;
    if(frame_time > 16.5) {//limit to 60
        frame_time = 0;
        //game input
        das--;
        if(state===states.FALLING) {
            game_input();
        }
        //game loop
        if (fall_tick <= 0) {
            if (state === states.INTRO) {
                state = states.FALLING;
            }
            else if (state === states.FALLING) {
                if (collided(0, 1)) {
                    state = states.INTRO;
                    fall_tick = 10;
                    solidify_board();
                } else {
                    clear_piece();
                    controlled.y++;
                    refresh_board();
                    fall_tick = 6;
                }
            }
            else if(state === states.CLEARING){
                clear_line();
                state = states.INTRO;
                ready_next();
            }
            else if (state === states.ENDING){
                state = states.INTRO;
                ready_next();
                ready_next();
                for(let i=0;i<20;i++){
                    board[i].fill(0);
                    for(let j=0;j<10;j++){
                        sprites[i][j].setAlpha(0);
                    }
                }
            }
        }
        fall_tick--;

    }
}

function num_from_type(type) {
    if(type === types.zee){
        return 1;
    }
    else if(type === types.jay){
        return 2;
    }
    else if(type === types.symmetric){
        return 3;
    }
}

function refresh_board() {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {
            board[y][x] = -num_from_type(controlled.type);
            sprites[y][x].setAlpha(1);
            sprites[y][x].setTexture(controlled.type);
        }
    }
}


function clear_piece(){
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {
            board[y][x] = 0;
            sprites[y][x].setAlpha(0);
        }
    }
}