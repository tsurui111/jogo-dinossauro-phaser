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
  private bgA!: Phaser.GameObjects.Image;
  private bgB!: Phaser.GameObjects.Image;
  private nextBgIs1 = false;

  constructor() { super('Game'); }

  create() {
    const { width, height } = this.scale;
    this.isGameOver = false;
    this.score = 0;
    this.speed = 450;

    this.cameras.main.setBackgroundColor('#87ceeb');
    // Background alternando entre bg1 e bg2
    this.createAlternatingBackgrounds();

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

    const runAnim = assetManager.getAnimationKeyFor('player_run');
    if (runAnim) {
      const spr = this.physics.add.sprite(120, height - 80, undefined as any);
      spr.play(runAnim);
      spr.setSize(44, 60).setOffset(0, 0);
      this.player = spr as any;
    } else if (this.textures.exists('player_dead')) {
      const img = this.physics.add.image(120, height - 80, 'player_dead');
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

    this.time.addEvent({ delay: 1100, loop: true, callback: () => this.spawnEnemy() });
    this.time.addEvent({ delay: 2200, loop: true, callback: () => this.spawnCollectible() });

    this.physics.add.collider(this.player as any, this.groundBody);
    this.physics.add.collider(this.player as any, this.obstacles, () => this.onGameOver());
    this.physics.add.overlap(this.player as any, this.collectibles, (_p, c) => this.onCollect(c as any));
  }

  update(time: number, dt: number) {
    if (this.isGameOver) return;
    const { height } = this.scale;

    // Ground scroll
    this.ground.tilePositionX += (this.speed * dt) / 1000;
    this.scrollBackgrounds(dt);

    // Player controls
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && onGround) {
      body.setVelocityY(-860);
      const jumpAnim = assetManager.getAnimationKeyFor('player_jump');
      if (jumpAnim && (this.player as any).anims) (this.player as Phaser.GameObjects.Sprite).anims.play(jumpAnim, true);
    }
    if (this.duckKey.isDown && onGround) {
      body.setSize(body.width, 36, true);
    } else {
      body.setSize(body.width, 60, true);
    }
    // Volta animação de corrida ao tocar o chão
    if (onGround && (this.player as any).anims) {
      const current = (this.player as Phaser.GameObjects.Sprite).anims.currentAnim?.key;
      const run = assetManager.getAnimationKeyFor('player_run');
      if (run && current !== run) (this.player as Phaser.GameObjects.Sprite).anims.play(run, true);
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

  private spawnEnemy() {
    const { height, width } = this.scale;
    // Probabilidades: 40% larva, 40% percevejo (terrestres), 20% mosca (aéreo)
    const r = Math.random();
    let key: string;
    if (r < 0.4) key = 'enemy_larva';
    else if (r < 0.8) key = 'enemy_percevejo';
    else key = 'enemy_mosca';

    const animKey = assetManager.getAnimationKeyFor(key);
    const y = key === 'enemy_mosca' ? Phaser.Math.Between(160, height - 260) : height - 80;
    let obj: any;
    if (animKey) {
      obj = this.physics.add.sprite(width + 40, y, undefined as any);
      obj.play(animKey);
    } else {
      obj = this.physics.add.image(width + 40, y, key);
    }
    obj.body.setImmovable(true);
    obj.body.setAllowGravity(false);
    this.obstacles.add(obj);
  }

  private spawnCollectible() {
    const y = Phaser.Math.Between(150, this.scale.height - 200);
    // 70% certificado (poucos pontos), 30% soja_supreme (raros, mais pontos)
    const rare = Math.random() < 0.3;
    const key = rare ? 'col_soja' : 'col_certificado';
    const animKey = assetManager.getAnimationKeyFor(key);
    let col: any;
    if (animKey) {
      col = this.physics.add.sprite(this.scale.width + 40, y, undefined as any);
      col.play(animKey);
    } else if (this.textures.exists(key)) {
      col = this.physics.add.image(this.scale.width + 40, y, key);
    } else {
      const rect = this.add.rectangle(this.scale.width + 40, y, 20, 20, rare ? 0x00ff66 : 0xffcc00) as any;
      this.physics.add.existing(rect);
      col = rect;
    }
    col.setData('points', rare ? 25 : 5);
    (col.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (col.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.collectibles.add(col as any);
  }

  private onCollect(c: Phaser.GameObjects.GameObject & { destroy: () => void; getData?: (k: string)=>any }) {
    const points = (c as any).getData ? (c as any).getData('points') ?? 10 : 10;
    c.destroy();
    this.score += points;
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
    // Troca sprite do player para "morte" se disponível
    if ((this.player as any).anims) (this.player as Phaser.GameObjects.Sprite).anims.stop();
    if (this.textures.exists('player_dead')) {
      (this.player as Phaser.GameObjects.Sprite).setTexture('player_dead');
    }
  }

  private createAlternatingBackgrounds() {
    const { width, height } = this.scale;
    const makeBg = (key: 'bg1'|'bg2') => {
      if (!this.textures.exists(key)) return this.add.rectangle(width/2, height/2, width, height, 0x87ceeb) as any;
      const img = this.add.image(0, 0, key).setOrigin(0, 0);
      const sx = width / img.width;
      const sy = height / img.height;
      img.setScale(Math.max(sx, sy));
      return img;
    };
    this.bgA = makeBg('bg1') as any;
    this.bgB = makeBg('bg2') as any;
    // Posiciona lado a lado para scroll infinito
    (this.bgA as any).x = 0; (this.bgB as any).x = (this.bgA as any).displayWidth;
    this.nextBgIs1 = false; // próximo que entra à direita começa alternando
  }

  private scrollBackgrounds(dt: number) {
    const speed = (this.speed * dt) / 1000;
    const move = (obj: Phaser.GameObjects.Image) => { obj.x -= speed * 0.3; };
    if (this.bgA && this.bgB) {
      move(this.bgA); move(this.bgB);
      const left = (img: Phaser.GameObjects.Image) => img.x + img.displayWidth <= 0;
      const rightmostX = Math.max(this.bgA.x + this.bgA.displayWidth, this.bgB.x + this.bgB.displayWidth);
      if (left(this.bgA)) {
        this.bgA.x = rightmostX;
        const key = this.nextBgIs1 ? 'bg1' : 'bg2';
        if (this.textures.exists(key)) this.bgA.setTexture(key);
        this.nextBgIs1 = !this.nextBgIs1;
      }
      if (left(this.bgB)) {
        this.bgB.x = Math.max(this.bgA.x + this.bgA.displayWidth, this.bgB.x + this.bgB.displayWidth);
        const key = this.nextBgIs1 ? 'bg1' : 'bg2';
        if (this.textures.exists(key)) this.bgB.setTexture(key);
        this.nextBgIs1 = !this.nextBgIs1;
      }
    }
  }
}
