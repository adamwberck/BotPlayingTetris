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
    piece_id.L,
    piece_id.I,
    piece_id.J,
    piece_id.O,
    piece_id.S,
    piece_id.Z,
    piece_id.T];
const PIECE_ARRAY = [
    pieces.L,
    pieces.I,
    pieces.J,
    pieces.O,
    pieces.S,
    pieces.Z,
    pieces.T];
const TYPE_ARRAY =  [
    types.zee,
    types.symmetric,
    types.jay,
    types.symmetric,
    types.jay,
    types.zee,
    types.symmetric];

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 1000,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    render:{
        antialias: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const TEXTURE_MATRIX = [
    ["blue","light_blue"],
    ["green","lime"],
    ["purple","pink"],
    ["blue","apple"],
    ["magenta","teal"],
    ["teal","melrose"],
    ["red","gray"],
    ["violet","cherry"],
    ["blue","red"],
    ["red","orange"]
]





const game = new Phaser.Game(config);

board = new Array(20);
sprites = new Array(20);
next_sprites = new Array(2);
for(let i=0;i<20;i++){
    board[i] = new Array(10);
    sprites[i] = new Array(10);
    if(i<2) {
        next_sprites[i] = new Array(4);
    }
    board[i].fill(0)
}

let controlled = {
    x: 5,
    y: 0,
    piece : JSON.parse(JSON.stringify(PIECE_ARRAY[0])),
    type : TYPE_ARRAY[0],
    id : ID_ARRAY[0],
    rotated : false
};

let next = {
    piece :  PIECE_ARRAY[0],
    type : TYPE_ARRAY[0],
    id :  ID_ARRAY[0]
}


function preload () {
    this.load.image('blue','assets/blocks/blue.png');
    this.load.image('blue_white','assets/blocks/blue_white.png');
    this.load.image('light_blue','assets/blocks/light_blue.png');

    this.load.image('green','assets/blocks/green.png');
    this.load.image('green_white','assets/blocks/green_white.png');
    this.load.image('lime','assets/blocks/lime.png');

    this.load.image('purple','assets/blocks/purple.png');
    this.load.image('purple_white','assets/blocks/purple_white.png');
    this.load.image('pink','assets/blocks/pink.png');

    //blue
    //blue white
    this.load.image('apple','assets/blocks/apple.png');

    this.load.image('magenta','assets/blocks/magenta.png');
    this.load.image('magenta_white','assets/blocks/magenta_white.png');
    this.load.image('teal','assets/blocks/teal.png');

    //teal
    this.load.image('teal_white','assets/blocks/teal_white.png');
    this.load.image('melrose','assets/blocks/melrose.png');

    this.load.image('red','assets/blocks/red.png');
    this.load.image('red_white','assets/blocks/red_white.png');
    this.load.image('gray','assets/blocks/gray.png');

    this.load.image('violet','assets/blocks/violet.png');
    this.load.image('violet_white','assets/blocks/violet_white.png');
    this.load.image('cherry','assets/blocks/cherry.png');

    //blue
    //blue white
    //red

    //red
    //red white
    this.load.image('orange','assets/blocks/orange.png');
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
    this.cameras.main.setZoom(.8);
    this.cameras.main.centerOn(0, 0);

    this.add.grid(LEFT, TOP, 10 * GRID_SIZE, 20 * GRID_SIZE, GRID_SIZE, GRID_SIZE, 0xDDDDDD)
        .setOrigin(0);

    score_text = this.add.text(LEFT+GRID_SIZE*3,20 ,"0000000",
        { fontFamily: 'Courier',fontSize: '35px', fill: '#FFF',fontStyle : 'bold'});


    this.add.text(LEFT-160, TOP ,"LEVEL",
        { fontFamily: 'monospace',fontSize: '38px', fill: '#FFF',fontStyle: 'bold'});
    level_text = this.add.text(LEFT-125, TOP+40 ,"00",
        { fontFamily: 'Courier',fontSize: '30px', fill: '#FFF',fontStyle: 'bold'});

    this.add.text(LEFT-160, TOP+80 ,"LINES",
        { fontFamily: 'monospace',fontSize: '38px', fill: '#FFF',fontStyle: 'bold'});
    lines_text = this.add.text(LEFT-135, TOP+120 ,"000",
        { fontFamily: 'Courier',fontSize: '30px', fill: '#FFF',fontStyle: 'bold'});


    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            sprites[j][i] = this.add.image(LEFT + i * GRID_SIZE, TOP + j * GRID_SIZE, 'jay').setOrigin(0).setAlpha(0);
        }
    }

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            next_sprites[i][j] = this.add.image(LEFT + 420 + j * GRID_SIZE, TOP + 10 + i * GRID_SIZE, 'zee').setOrigin(0)
                .setAlpha(0);
        }
    }
    randomize_next();
    ready_next();
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
                let block_num = board[i][j];
                let alpha = block_num === 0 ? 0 : 1;
                sprites[i][j].setAlpha(alpha);
                if (block_num > 0) {
                    let sprite = sprites[i][j];
                    set_texture_by_level(sprite,TYPE_ARRAY[block_num-1]);
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
        if(y>=0) {
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
        let points = SCORE_ARRAY[lines_just_cleared - 1] * (speed_level + 1);
        score += points;
        fall_tick = 10;
        state = states.CLEARING;
        clear_animate();
    } else {
        state = states.FALLING;
        ready_next();
        if(!collided(0,0)) {
            refresh_board();
        }
    }
}

function refresh_textures(){
    for(let i=0;i<20;i++){
        for(let j=0;j<10;j++){
            let num = Math.abs(board[i][j]);
            if(num>0) {
                let type = TYPE_ARRAY[num - 1];
                set_texture_by_level(sprites[i][j], type);
            }
        }
    }
}

function set_texture_by_level(sprite, type) {
    if(type===types.jay) {
        sprite.setTexture(TEXTURE_MATRIX[speed_level%10][0]);
    }
    else if(type===types.symmetric){
        sprite.setTexture(TEXTURE_MATRIX[speed_level%10][0].concat("_white"));
    }
    else{
        sprite.setTexture(TEXTURE_MATRIX[speed_level%10][1]);
    }
}

function draw_next() {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            next_sprites[i][j].setAlpha(0);
        }
    }
    for (let i = 0; i < 4; i++) {
        let x = next.piece[i][0] + 2;
        let y = next.piece[i][1] + (next.id===piece_id.Z? 1: 0);
        next_sprites[y][x].setAlpha(1);
        set_texture_by_level(next_sprites[y][x],next.type);
    }
}
function set_controlled_to_next() {
    controlled.id = next.id;
    controlled.x = 5;
    controlled.y = next.id === piece_id.Z ? 1 : 0;
    controlled.rotated = false;
    controlled.piece = JSON.parse(JSON.stringify(next.piece));
    controlled.type = next.type;
}

function refresh_UI() {
    score_text.setText(pad(score,7));
    level_text.setText(pad(speed_level,2));
    lines_text.setText(pad(total_lines,3));
}

function ready_next() {
    set_controlled_to_next();

    if(collided(0,0)){//game over
        state = states.ENDING;
        fall_tick = 100;
        score = 0;
        speed_level = 0;
        total_lines = 0;
        refresh_UI();
    }
    let r = Math.floor(Math.random() * 8);
    let temp_next = ID_ARRAY[r];
    if(r===7 || next.id === temp_next){
        r = Math.floor(Math.random() * 7);
        temp_next = ID_ARRAY[r];
    }
    next.id = temp_next;
    next.type = TYPE_ARRAY[r]
    next.piece = PIECE_ARRAY[r];
    draw_next();
}

let frame_time = 0;


let das = {
    shift : 0,
    shift_charged : false,
    rotate : false,
    down : 0,
    down_charged : false,
    down_reset : true
}



const SCORE_ARRAY = [
    40,100,300,1200];

const SPEED_ARRAY = [
    48,43,38,33,28,23,18,13,8,6,5,4,3,2,1];
function speed_from_level(){
    if(speed_level<10){
        return SPEED_ARRAY[speed_level]+1;
    }else if (speed_level<13){
        return SPEED_ARRAY[10]+1;
    }else if (speed_level<16){
        return SPEED_ARRAY[11]+1;
    }else if (speed_level<19){
        return SPEED_ARRAY[12]+1;
    }else if (speed_level<29){
        return SPEED_ARRAY[13]+1;
    }
}


let speed_level = 0;
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
    if(das.down <= 0 && cursors.down.isDown && das.down_reset) {
        das.down = das.down_charged ? 2 : 4;
        das.down_charged = true;
        if(!collided(0,1)) {
            clear_piece()
            controlled.y += 1;
            down_points++;
            refresh_board();
            if(fall_tick>49){
                fall_tick = speed_from_level();
            }
        }else{ //lock in piece
            fall_tick =0;
        }
    }else if(!cursors.down.isDown){
        das.down_charged = false;
        das.down_reset = true;
        down_points = 0;
    }
    let shifted = false;
    for (let i = 0; i < 2; i++) {
        if (INPUT_GRID[i][0]) {
            shifted = true;
            if (das.shift <= 0) {
                das.shift = das.shift_charged ? 6 : 16;
                das.shift_charged = true;
                if (!collided(INPUT_GRID[i][1],0 )) {
                    clear_piece();
                    controlled.x += INPUT_GRID[i][1];
                    refresh_board();
                }
            }
        }
    }
    if (!shifted) {
        das.shift = 0;
        das.shift_charged = false;
    }

    if (!das.rotate) {
        if (rotators.clock.isDown) {
            rotate_by_piece(clock);
            das.rotate = true;
        } else if (rotators.counter_clock.isDown) {
            rotate_by_piece(c_clock);
            das.rotate = true;
        }
    }
    if (!rotators.clock.isDown && !rotators.counter_clock.isDown) {
        das.rotate = false;
    }
}

function clear_animate() {
    for(let j=0 ;j<lines_just_cleared;j++) {
        for (let i = 0; i < 10; i++) {
            sprites[line_cleared[j]][i].setAlpha(0);
        }
    }
}
let down_points = 0;

function randomize_next() {
    let r = Math.floor(Math.random()*7);
    next.piece = PIECE_ARRAY[r];
    next.type = TYPE_ARRAY[r];
    next.id = ID_ARRAY[r];
}

function update(time,delta){
    frame_time += delta;
    if(frame_time > 16.5) {//limit to 60
        frame_time = 0;
        //game input
        das.shift--;
        das.down--;
        if(state===states.FALLING) {
            game_input();
        }
        //game loop
        if (fall_tick <= 0) {
            if (state === states.FALLING) {
                fall_tick = speed_from_level();
                if (collided(0, 1)) {
                    das.down_reset = false;
                    score += down_points;
                    score_text.setText(pad(score,7));
                    down_points = 0;
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
                if (next_level_lines <= 0) {
                    next_level_lines += 10;
                    speed_level++;
                    refresh_textures();
                    draw_next();
                }
                refresh_UI();
            }
            else if (state === states.ENDING){
                state = states.FALLING;
                fall_tick = speed_from_level();
                for(let i=0;i<20;i++){
                    board[i].fill(0);
                    for(let j=0;j<10;j++){
                        sprites[i][j].setAlpha(0);
                    }
                }
                randomize_next();
                ready_next();
                refresh_board();
            }
        }
        fall_tick--;

    }
}

function num_from_type(type) {
    if(type === types.zee){
        return 1;
    }
    else if(type === types.symmetric){
        return 2;
    }
    else if(type === types.jay){
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