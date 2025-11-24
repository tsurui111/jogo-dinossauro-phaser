import Phaser from 'phaser';

const HS_KEY = 'dino_highscores';

type ScoreItem = { score: number; when: number };

export class ScoreScene extends Phaser.Scene {
  constructor() { super('Scores'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#fafafa');
    this.add.text(width/2, 80, 'Pontuações', { fontFamily: 'Arial', fontSize: '42px', color: '#222' }).setOrigin(0.5);

    const hs = this.getScores();
    if (hs.length === 0) {
      this.add.text(width/2, height/2, 'Sem pontuações ainda', { fontFamily: 'Arial', fontSize: '24px', color: '#666' }).setOrigin(0.5);
    } else {
      hs.slice(0, 5).forEach((s, i) => {
        const date = new Date(s.when).toLocaleString();
        this.add.text(width/2, 150 + i*40, `${i+1}. ${s.score}  —  ${date}`, { fontFamily: 'Arial', fontSize: '22px', color: '#333' }).setOrigin(0.5, 0);
      });
    }

    const back = this.add.rectangle(width/2, height - 80, 200, 50, 0x333333).setInteractive({ useHandCursor: true });
    this.add.text(width/2, height - 80, 'Voltar', { fontFamily: 'Arial', fontSize: '22px', color: '#fff' }).setOrigin(0.5);
    back.on('pointerdown', () => this.scene.start('Menu'));
  }

  private getScores(): ScoreItem[] {
    try {
      const raw = localStorage.getItem(HS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as ScoreItem[];
      return arr.sort((a,b) => b.score - a.score);
    } catch {
      return [];
    }
  }
}

export function addHighScore(score: number) {
  const HS_KEY = 'dino_highscores';
  try {
    const raw = localStorage.getItem(HS_KEY);
    const arr = raw ? (JSON.parse(raw) as ScoreItem[]) : [];
    arr.push({ score, when: Date.now() });
    localStorage.setItem(HS_KEY, JSON.stringify(arr));
  } catch {}
}
