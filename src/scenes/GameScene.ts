import Phaser from 'phaser';
import { assetManager } from '../assets/AssetManager';
import { addHighScore } from './ScoreScene';

type Obstacle = Phaser.Types.Physics.Arcade.ImageWithDynamicBody | Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private ground!: Phaser.GameObjects.TileSprite;
  private groundBody!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private speed = 450;
  private isGameOver = false;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private duckKey!: Phaser.Input.Keyboard.Key;

  constructor() { super('Game'); }

  create() {
    const { width, height } = this.scale;
    this.isGameOver = false;
    this.score = 0;
    this.speed = 450;

    this.cameras.main.setBackgroundColor('#ffffff');
    // Create a small canvas texture for ground tiling
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 64; groundCanvas.height = 40;
    const gctx = groundCanvas.getContext('2d')!;
    gctx.fillStyle = '#111'; gctx.fillRect(0, 0, 64, 40);
    gctx.strokeStyle = '#222';
    for (let x = 0; x < 64; x += 8) { gctx.beginPath(); gctx.moveTo(x, 0); gctx.lineTo(x, 40); gctx.stroke(); }
    if (this.textures.exists('ground')) this.textures.remove('ground');
    this.textures.addCanvas('ground', groundCanvas);
    this.ground = this.add.tileSprite(0, height - 40, width * 2, 40, 'ground').setOrigin(0, 0);

    // Invisible physics ground
    const gr = this.add.rectangle(width/2, height - 20, width, 40, 0xffffff, 0) as any;
    this.physics.add.existing(gr, true);
    this.groundBody = gr as any;

    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();

    const playerAnim = assetManager.getAnimationKeyFor('player');
    if (playerAnim) {
      const spr = this.physics.add.sprite(120, height - 80, undefined as any);
      spr.play(playerAnim);
      spr.setSize(44, 60).setOffset(0, 0);
      this.player = spr as any;
    } else if (this.textures.exists('player')) {
      const img = this.physics.add.image(120, height - 80, 'player');
      img.setCircle(Math.min(img.width, img.height) / 2);
      this.player = img as any;
    } else {
      const rect = this.add.rectangle(120, height - 70, 44, 60, 0x222222) as any;
      this.physics.add.existing(rect);
      (rect.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      this.player = rect;
    }
    (this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocityY(2000);
    (this.player.body as Phaser.Physics.Arcade.Body).setBounce(0);

    this.physics.world.setBounds(0, 0, width, height);

    this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.duckKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.scoreText = this.add.text(width - 24, 24, '0', { fontFamily: 'Courier New', fontSize: '28px', color: '#333' }).setOrigin(1, 0);

    this.time.addEvent({ delay: 1100, loop: true, callback: () => this.spawnObstacle() });
    this.time.addEvent({ delay: 3300, loop: true, callback: () => this.spawnCollectible() });

    this.physics.add.collider(this.player as any, this.groundBody);
    this.physics.add.collider(this.player as any, this.obstacles, () => this.onGameOver());
    this.physics.add.overlap(this.player as any, this.collectibles, (_p, c) => this.onCollect(c as any));
  }

  update(time: number, dt: number) {
    if (this.isGameOver) return;
    const { height } = this.scale;

    // Ground scroll
    this.ground.tilePositionX += (this.speed * dt) / 1000;

    // Player controls
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && onGround) {
      body.setVelocityY(-860);
    }
    if (this.duckKey.isDown && onGround) {
      body.setSize(body.width, 36, true);
    } else {
      body.setSize(body.width, 60, true);
    }

    // Move obstacles/collectibles and clean up
    const moveLeft = (obj: Phaser.GameObjects.GameObject & { body?: Phaser.Physics.Arcade.Body }) => {
      const b = obj.body!;
      b.setVelocityX(-this.speed);
      if ((obj as any).x < -100) (obj as any).destroy();
    };
    this.obstacles.getChildren().forEach(o => moveLeft(o as any));
    this.collectibles.getChildren().forEach(c => moveLeft(c as any));

    // Score and speed ramp
    this.score += (dt / 1000) * 5;
    this.scoreText.setText(Math.floor(this.score).toString());
    this.speed = 450 + Math.floor(this.score / 30) * 30;
  }

  private spawnObstacle() {
    const { height } = this.scale;
    const useImg = this.textures.exists('enemy_cactus');
    let obs: Obstacle;
    if (useImg) {
      obs = this.physics.add.image(this.scale.width + 40, height - 70, 'enemy_cactus') as any;
    } else {
      const rect = this.add.rectangle(this.scale.width + 40, height - 70, 30, 60, 0x007700) as any;
      this.physics.add.existing(rect);
      obs = rect;
    }
    (obs.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (obs.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.obstacles.add(obs as any);
  }

  private spawnCollectible() {
    const y = Phaser.Math.Between(180, this.scale.height - 160);
    const useImg = this.textures.exists('collectible');
    let col: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    if (useImg) {
      col = this.physics.add.image(this.scale.width + 40, y, 'collectible') as any;
      col.setScale(0.7);
    } else {
      const rect = this.add.rectangle(this.scale.width + 40, y, 20, 20, 0xffcc00) as any;
      this.physics.add.existing(rect);
      col = rect;
    }
    (col.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (col.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.collectibles.add(col as any);
  }

  private onCollect(c: Phaser.GameObjects.GameObject & { destroy: () => void }) {
    c.destroy();
    this.score += 10;
  }

  private onGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    const final = Math.floor(this.score);
    addHighScore(final);
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.25);
    this.add.text(width/2, height/2 - 20, `Game Over`, { fontFamily: 'Arial', fontSize: '46px', color: '#222' }).setOrigin(0.5);
    this.add.text(width/2, height/2 + 24, `Pontuação: ${final}`, { fontFamily: 'Arial', fontSize: '26px', color: '#333' }).setOrigin(0.5);
    const btn = this.add.rectangle(width/2, height/2 + 80, 240, 52, 0x333333).setInteractive({ useHandCursor: true });
    this.add.text(width/2, height/2 + 80, 'Voltar ao Menu', { fontFamily: 'Arial', fontSize: '22px', color: '#fff' }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('Menu'));
    overlay.depth = 1000;
  }
}
