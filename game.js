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
        [-1,0],
        [0,0],
        [0,1],
        [1,0]
    ],
    L : [
        [0,0],
        [0,-1],
        [0,1],
        [1,1]
    ],
    J : [
        [0,0],
        [0,-1],
        [0,1],
        [-1,1]
    ],
    Z : [
        [0,0],
        [0,-1],
        [-1,-1],
        [1,0]
    ],
    S : [
        [0,0 ],
        [-1,0],
        [0,1],
        [1,1]
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
for(var i=0;i<20;i++){
    board[i] = new Array(10);
    sprites[i] = new Array(10);
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


function create ()
{
    //camera
    this.cameras.main.setBounds(0, 0, 800, 1000);
    this.cameras.main.setZoom(.9);
    this.cameras.main.centerOn(0, 0);

    this.add.grid(240, 32, 320, 640, 32, 32, 0xDDDDDD).setOrigin(0);

    for(let i=0;i<10;i++){
        for(let j=0;j<20;j++){
            sprites[j][i] = this.add.image(LEFT+i*GRID_SIZE,TOP+j*GRID_SIZE,'block').setOrigin(0).setAlpha(0);
        }
    }
}

const states = {
    INTRO: "intro",
    FALLING: "falling",
}

let state = states.FALLING;


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

function solidify_board() {
    for(let i=0;i<4;i++){
        let sqr = controlled.piece[i];
        let x = sqr[0]+controlled.x;
        let y = sqr[1]+controlled.y;
        if(y>=0) {//Not Game Over
            board[y][x] = Math.abs(board[y][x]);
        }
    }
}

function ready_next() {
    controlled.x = 5;
    controlled.y = 0;
    controlled.piece = JSON.parse(JSON.stringify(next));
    let r = Math.floor(Math.random() * 8);
    let temp_next = RAND_ARRAY[r];
    if(r==7 || next == temp_next){
        r = Math.floor(Math.random() * 7);
        temp_next = RAND_ARRAY[r];
    }
    next = temp_next;
}

function update(){
    //game loop
    if(fallTick<=0) {
        if(state == states.INTRO) {
            state = states.FALLING;
        }else if (state == states.FALLING) {
            if(collided(0,1)){
                state = states.INTRO;
                fallTick = 45;
                solidify_board();
                ready_next();
            }
            else{
                clearPiece();
                controlled.y++;
            }
        }
        updateBoard();
        fallTick = 10;
    }
    fallTick--;
}

function updateBoard() {
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


function clearPiece(){
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