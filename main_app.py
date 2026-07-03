```javascript
class MusaAvatar {
  constructor() {
    this.name = "MUSA";
    this.currentMode = localStorage.getItem('musaMode') || 'サポートモード';
    this.currentEmotion = "中立";
    this.status = "オンライン";
    this.defaultMessage = "おはようございます。\nMUSAです。\n今日も営業活動を一緒に改善していきましょう。";
    this.salesCallMessage = "まだ本日の架電データはありません。";
    this.fileMakerMessage = "FileMakerリードがまだありません。";
    this.learningModeMessage = "Learning Modeで営業活動を学習中です。";
  }

  renderAvatar() {
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'musa-avatar-panel';
    
    avatarContainer.innerHTML = `
      <div class="avatar">
        <img src="musasabi_placeholder.png" alt="Musasabi Avatar" />
        <h2>${this.name}</h2>
        <p>モード: ${this.currentMode}</p>
        <p>感情: ${this.currentEmotion}</p>
        <p>ステータス: ${this.status}</p>
        <div class="speech-bubble">${this.defaultMessage}</div>
      </div>
      <button onclick="musa.toggleMode('学習モード')">学習</button>
      <button onclick="musa.toggleMode('サポートモード')">サポート</button>
      <button onclick="musa.toggleMode('分析モード')">分析</button>
      <button onclick="musa.toggleAutoCall(false)">AutoCall OFF</button>
    `;
    
    avatarContainer.addEventListener('click', this.openSalesWorkspace);

    document.body.appendChild(avatarContainer);
  }

  toggleMode(mode) {
    this.currentMode = mode;
    localStorage.setItem('musaMode', mode);
    this.updateSpeechBubble();
  }

  toggleAutoCall(enabled) {
    if(!enabled) {
      alert("AutoCallが無効です。");
    }
  }

  updateSpeechBubble() {
    const speechBubble = document.querySelector('.speech-bubble');
    switch (this.currentMode) {
      case '学習モード':
        speechBubble.textContent = this.learningModeMessage;
        break;
      case 'サポートモード':
      case '分析モード':
        speechBubble.textContent = this.defaultMessage;
        break;
    }
  }

  openSalesWorkspace() {
    alert("セールスダッシュボードを開きます。");
  }
}

const musa = new MusaAvatar();
musa.renderAvatar();
```
