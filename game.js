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
        [-1,0],
        [0,1],
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

const RAND_ARRAY = [pieces.J,pieces.I,pieces.L,pieces.O,pieces.S,pieces.Z,pieces.T];

let next = RAND_ARRAY[Math.floor(Math.random()*7)];

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

controlled = {
    x: 5,
    y: 0,
    piece : JSON.parse(JSON.stringify(RAND_ARRAY[Math.floor(Math.random()*7)]))
};


function preload () {
    this.load.image('block','assets/red/red.png')
    this.load.image('wblock','assets/red/redwhite.png')
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
            sprites[j][i] = this.add.image(LEFT + i * GRID_SIZE, TOP + j * GRID_SIZE, 'block').setOrigin(0).setAlpha(0);
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            next_sprites[i][j] = this.add.image(LEFT + 420 + j * GRID_SIZE, TOP + 80 + i * GRID_SIZE, 'block').setOrigin(0)
                .setAlpha(0);
        }
    }
    draw_next();
}

const states = {
    INTRO: "intro",
    FALLING: "falling",
    ENDING : "ending"
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

let fallTick = 45;

function clear_line(line) {
    for(let i=line;i>=0;i--){
        if(i>0) {
            board[i] = JSON.parse(JSON.stringify(board[i - 1]));
        }
        else{
            board[0].fill(0);
        }
        for(let j=0;j<10;j++){
            let alpha = board[i][j]===0 ? 0 : 1;
            sprites[i][j].setAlpha(alpha);
        }
    }
}

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
            fallTick = 130;
        }
    }
    let lines = 0;
    for(let i=0;i<20;i++){
        for(let j=0;j<10;j++){
            if(board[i][j]===0){
                j=10;
            }
            else if(j>=9){
                clear_line(i);
                lines++;
            }
        }
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
    }
}

function ready_next() {
    controlled.x = 5;
    controlled.y = 0;
    controlled.piece = JSON.parse(JSON.stringify(next));
    let r = Math.floor(Math.random() * 8);
    let temp_next = RAND_ARRAY[r];
    if(r==7 || next === temp_next){
        r = Math.floor(Math.random() * 7);
        temp_next = RAND_ARRAY[r];
    }
    next = temp_next;
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
    for(let i=0;i<4;i++) {
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
    update_board();
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
                    update_board();
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
        if (fallTick <= 0) {
            if (state === states.INTRO) {
                state = states.FALLING;
            }
            else if (state === states.FALLING) {
                if (collided(0, 1)) {
                    state = states.INTRO;
                    fallTick = 10;
                    solidify_board();
                    ready_next();
                } else {
                    clear_piece();
                    controlled.y++;
                    fallTick = 5;
                }
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
            update_board();
        }
        fallTick--;

    }
}

function update_board() {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {
            board[y][x] = -1;
            sprites[y][x].setAlpha(1);
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