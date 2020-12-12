


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 1000,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
    }
};

const game = new Phaser.Game(config);

function preload () {
    this.load.image('block','assets/red/red.png')
    this.load.image('wblock','assets/red/redwhite.png')
}

function create ()
{
    //camera
    this.cameras.main.setBounds(0, 0, 800, 1000);
    this.cameras.main.setZoom(.9);
    this.cameras.main.centerOn(0, 0);

    var g1 = this.add.grid(240, 32, 320, 640, 32, 32, 0xDDDDDD).setOrigin(0);

    this.add.image(240,32,'block').setOrigin(0);

}


