const clock = [
    [0,1],
    [-1,0]
]

const c_clock = [
    [0,-1],
    [1,0]
]

const piece_id = {
    T : "T",
    L : "L",
    J : "J",
    Z : "Z",
    S : "S",
    O : "O",
    I : "I"
}

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
const ID_ARRAY = [
    piece_id.J,
    piece_id.I,
    piece_id.L,
    piece_id.O,
    piece_id.S,
    piece_id.Z,
    piece_id.T];
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
let next_id = ID_ARRAY[n_rand];


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
    y: r === 5 ? 1 : 0,
    piece : JSON.parse(JSON.stringify(PIECE_ARRAY[r])),
    type : TYPE_ARRAY[r],
    id : ID_ARRAY[r],
    rotated : false
};


function preload () {
    this.load.image('jay','assets/red/red.png')
    this.load.image('symmetric','assets/red/redwhite.png')
    this.load.image('zee','assets/red/gray.png')
}
const GRID_SIZE = 32;
const LEFT = 240;
const TOP = 80;

let cursors;
let rotators = {};

let level_text;
let lines_text;
let score_text;


function create () {
    cursors = this.input.keyboard.createCursorKeys();

    rotators.clock = this.input.keyboard.addKey('X');
    rotators.counter_clock = this.input.keyboard.addKey('Z');
    //camera
    this.cameras.main.setBounds(0, 0, 800, 1000);
    this.cameras.main.setZoom(.9);
    this.cameras.main.centerOn(0, 0);

    this.add.grid(LEFT, TOP, 10 * GRID_SIZE, 20 * GRID_SIZE, GRID_SIZE, GRID_SIZE, 0xDDDDDD)
        .setOrigin(0);

    score_text = this.add.text(LEFT+GRID_SIZE*3,20 ,"0000000",
        { fontFamily: 'Courier',fontSize: '35px', fill: '#FFF',fontStyle : 'bold'});


    this.add.text(LEFT-160, TOP ,"Level",
        { fontFamily: 'Arial',fontSize: '38px', fill: '#FFF'});
    level_text = this.add.text(LEFT-130, TOP+40 ,"00",
        { fontFamily: 'Courier',fontSize: '30px', fill: '#FFF',fontStyle: 'bold'});

    this.add.text(LEFT-160, TOP+80 ,"Lines",
        { fontFamily: 'Arial',fontSize: '38px', fill: '#FFF'});
    lines_text = this.add.text(LEFT-135, TOP+120 ,"000",
        { fontFamily: 'Courier',fontSize: '30px', fill: '#FFF',fontStyle: 'bold'});


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
    refresh_board();
    draw_next();
}

const states = {
    INTRO: "intro",
    FALLING: "falling",
    ENDING : "ending",
    CLEARING : "clearing"
}

let state = states.FALLING;


function collided(mov_x, mov_y) {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x+mov_x;
        let y = sqr[1]+controlled.y+mov_y;
        if(y>=20 || x>=10 || x<0){//hit edge
            return true;
        }
        else if(y>=0 && board[y][x]>0){//hit block
            return true;
        }
    }
    return false;
}

let fall_tick = 96;

function clear_line() {
    for(let i=0;i<lines_just_cleared;i++) {
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
                    let sprite = sprites[i][j];
                    switch (block) {
                        case 1:
                            set_texture_by_level(sprite,types.zee);
                            break;
                        case 2:
                            set_texture_by_level(sprite,types.jay);
                            break;
                        case 3:
                            set_texture_by_level(sprite,types.symmetric);
                            break;
                    }
                }
            }
        }
    }
    lines_just_cleared =0;
}

let line_cleared = Array(4);
let lines_just_cleared = 0;
let next_level_lines  = 10;
let score = 0;


function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}


function solidify_board() {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {//Not Game Over
            board[y][x] = Math.abs(board[y][x]);
        }
    }
    for(let i=0;i<20;i++){
        for(let j=0;j<10;j++){
            if(board[i][j]===0){
                j=10;
            }
            else if(j>=9){
                line_cleared[lines_just_cleared]=i;
                lines_just_cleared++;
            }
        }
    }
    if (lines_just_cleared > 0) {
        total_lines += lines_just_cleared;
        next_level_lines -= lines_just_cleared;
        let points = SCORE_ARRAY[lines_just_cleared - 1] * (level + 1);
        score += points
        score_text.setText(pad(score,7));
        if (next_level_lines <= 0) {
            next_level_lines += 10;
            level++;
        }
        level_text.setText(pad(level,2));
        lines_text.setText(pad(total_lines,3));
        fall_tick = 10;
        state = states.CLEARING;
        clear_animate();
        console.log(line_cleared);
    } else {
        state = states.FALLING;
        ready_next();
        refresh_board();
    }
}

function set_texture_by_level(sprite, type) {
    sprite.setTexture(type);
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
        set_texture_by_level(next_sprites[y][x],next_type);
    }
}

function full_collided(mov_x, mov_y) {
    for(let i=0;i<4;i++) {
        let sqr = controlled.piece[i];
        let x = sqr[0] + controlled.x + mov_x;
        let y = sqr[1] + controlled.y + mov_y;
        if(board[y][x]===0){
            return false;
        }
    }
    return true;
}

function ready_next() {
    controlled.id = next_id;
    controlled.x = 5;
    controlled.y = next_id===piece_id.Z ? 1 : 0;
    controlled.rotated = false;
    controlled.piece = JSON.parse(JSON.stringify(next));
    controlled.type = next_type;

    if(collided(0,0)){//game over
        state = states.ENDING;
        fall_tick = 100;
    }
    let r = Math.floor(Math.random() * 8);
    let temp_next = PIECE_ARRAY[r];
    if(r===7 || next === temp_next){
        r = Math.floor(Math.random() * 7);
        temp_next = PIECE_ARRAY[r];
    }
    next = temp_next;
    next_type = TYPE_ARRAY[r]
    next_id = ID_ARRAY[r];
    draw_next();
}

let frame_time = 0;


let r_das = false;

let das = 0;
let das_charged = false;

let d_das_reset = true;
let d_das = 0;
let d_das_charged = false;

const SCORE_ARRAY = [
    40,100,300,1200
]

const SPEED_ARRAY = [
    48,43,38,33,28,23,18,13,8,6,5,4,3,2,1
]
function speed_from_level(){
    if(level<10){
        return SPEED_ARRAY[level]+1;
    }else if (level<13){
        return SPEED_ARRAY[10]+1;
    }else if (level<16){
        return SPEED_ARRAY[11]+1;
    }else if (level<19){
        return SPEED_ARRAY[12]+1;
    }else if (level<29){
        return SPEED_ARRAY[13]+1;
    }
}


let level = 0;
let total_lines = 0;


function rotate_by_piece(trans){
    if(controlled.id === piece_id.I || controlled.id === piece_id.Z || controlled.id === piece_id.S
    ){
        rotate(controlled.rotated ? clock : c_clock);
    }
    else if(controlled.id !== piece_id.O){
        rotate(trans);
    }
}

function rotate(trans) {
    controlled.rotated = !controlled.rotated;
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
    const INPUT_GRID = [
        [cursors.left.isDown, -1, 0],
        [cursors.right.isDown, 1, 0],
    ]
    if(d_das <= 0 && cursors.down.isDown && d_das_reset) {
        d_das = d_das_charged ? 2 : 4;
        d_das_charged = true;
        if(!collided(0,1)) {
            clear_piece()
            controlled.y += 1;
            refresh_board();
            if(fall_tick>48){
                fall_tick = speed_from_level();
            }
        }else{ //lock in piece
            fall_tick =0;
        }
    }else if(!cursors.down.isDown){
        d_das_charged = false;
        d_das_reset = true;
    }
    let shifted = false;
    for (let i = 0; i < 2; i++) {
        if (INPUT_GRID[i][0]) {
            shifted = true;
            if (das <= 0) {
                das = das_charged ? 6 : 16;
                das_charged = true;
                if (!collided(INPUT_GRID[i][1],0 )) {
                    clear_piece();
                    controlled.x += INPUT_GRID[i][1];
                    refresh_board();
                }
            }
        }
    }
    if (!shifted) {
        das = 0;
        das_charged = false;
    }

    if (!r_das) {
        if (rotators.clock.isDown) {
            rotate_by_piece(clock);
            r_das = true;
        } else if (rotators.counter_clock.isDown) {
            rotate_by_piece(c_clock);
            r_das = true;
        }
    }
    if (!rotators.clock.isDown && !rotators.counter_clock.isDown) {
        r_das = false;
    }
}

function clear_animate() {
    for(let j=0 ;j<lines_just_cleared;j++) {
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
        d_das--;
        if(state===states.FALLING) {
            game_input();
        }
        //game loop
        if (fall_tick <= 0) {
            if (state === states.FALLING) {
                fall_tick = speed_from_level();
                if (collided(0, 1)) {
                    d_das_reset = false;
                    solidify_board();
                }
                else {
                    clear_piece();
                    controlled.y++;
                    refresh_board();
                }
            }
            else if(state === states.CLEARING){
                clear_line();
                state = states.FALLING;
                ready_next();
            }
            else if (state === states.ENDING){
                state = states.FALLING;
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
            set_texture_by_level(sprites[y][x],controlled.type);
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