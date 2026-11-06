const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const chatMessages = document.querySelector('#chatMessages');
const chatSubmit = document.querySelector('#chatSubmit');
const quickQuestions = document.querySelectorAll('[data-question]');
const trailLayer = document.querySelector('#trailLayer');

// 数字分身配置
// 云函数 URL 已填入，聊天请求会转发给 DeepSeek（Key 保存在云函数环境变量里，不外泄）。
const CHAT_API_URL = 'https://1526747307-2ny6simneh.ap-guangzhou.tencentscf.com';

// 多轮对话上下文（最多保留最近 10 条，用于让分身记住上文）
let chatHistory = [];

function addMessage(text, type) {
  const message = document.createElement('div');
  message.className = `message ${type}`;

  if (type === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'bot-avatar';
    avatar.textContent = 'L';
    message.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  message.appendChild(bubble);
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setChatBusy(busy) {
  if (!chatSubmit) return;
  chatSubmit.disabled = busy;
  chatSubmit.textContent = busy ? '思考中…' : '发送 ↗';
}

async function ask(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addMessage(cleanQuestion, 'user');
  chatInput.value = '';

  if (!CHAT_API_URL) {
    addMessage('数字分身还没有连接 AI 服务。等云函数部署后，在 script.js 里填入 CHAT_API_URL 就能用了。', 'bot');
    return;
  }

  setChatBusy(true);
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanQuestion,
        history: chatHistory.slice(-10)
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('empty reply');
    }

    chatHistory.push({ role: 'user', content: cleanQuestion });
    chatHistory.push({ role: 'assistant', content: data.reply });
    addMessage(data.reply, 'bot');
  } catch (error) {
    console.error('Chat failed:', error);
    addMessage('分身暂时联系不上模型服务，请稍后再试。', 'bot');
  } finally {
    setChatBusy(false);
  }
}

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  ask(chatInput.value);
});

quickQuestions.forEach(button => {
  button.addEventListener('click', () => ask(button.dataset.question));
});

// Supabase feedback configuration.
// Only use the public anon/publishable key here. Never use a service_role key.
const SUPABASE_URL = 'https://avagyuyytqkplkxxcajf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_b9Bu55ZxfAL203JWCEGKPw_58P7Sdck';
const FEEDBACK_TABLE = 'feedback';

const feedbackForm = document.querySelector('#feedbackForm');
const feedbackMessage = document.querySelector('#feedbackMessage');
const feedbackCount = document.querySelector('#feedbackCount');
const feedbackStatus = document.querySelector('#feedbackStatus');
const feedbackSubmit = document.querySelector('#feedbackSubmit');
const feedbackConnection = document.querySelector('#feedbackConnection');

function isSupabaseConfigured() {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)
    && SUPABASE_ANON_KEY.length > 20;
}

function setFeedbackStatus(message, type = '') {
  if (!feedbackStatus) return;
  feedbackStatus.textContent = message;
  feedbackStatus.classList.remove('is-success', 'is-error');
  if (type) feedbackStatus.classList.add(`is-${type}`);
}

function updateConnectionBadge() {
  if (!feedbackConnection) return;
  const ready = isSupabaseConfigured();
  feedbackConnection.textContent = ready ? '数据库已连接' : '等待配置';
  feedbackConnection.classList.toggle('is-ready', ready);
  feedbackConnection.classList.toggle('is-error', !ready);
}

function validateFeedback(formData) {
  const relation = String(formData.get('relation') || '');
  const device = String(formData.get('device') || '');
  const message = String(formData.get('message') || '').trim();

  if (!relation) return '请选择你与主页主人的关系。';
  if (!device) return '请选择本条反馈针对的设备。';
  if (message.length < 5) return '反馈内容至少需要 5 个字。';
  if (!document.querySelector('#feedbackConsent')?.checked) return '请先确认隐私说明。';
  return '';
}

async function submitFeedback(event) {
  event.preventDefault();
  if (!feedbackForm || !feedbackSubmit) return;

  const formData = new FormData(feedbackForm);
  const validationError = validateFeedback(formData);
  if (validationError) {
    setFeedbackStatus(validationError, 'error');
    return;
  }

  if (!isSupabaseConfigured()) {
    setFeedbackStatus('反馈系统尚未连接 Supabase，请先在 script.js 中填写 Project URL 和公开匿名密钥。', 'error');
    return;
  }

  const payload = {
    name: String(formData.get('name') || '').trim() || null,
    relation: String(formData.get('relation')),
    device: String(formData.get('device')),
    message: String(formData.get('message')).trim()
  };

  feedbackSubmit.disabled = true;
  feedbackSubmit.textContent = '发送中…';
  setFeedbackStatus('正在把反馈安全写入数据库……');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${FEEDBACK_TABLE}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `HTTP ${response.status}`);
    }

    feedbackForm.reset();
    if (feedbackCount) feedbackCount.textContent = '0';
    setFeedbackStatus('发送成功，谢谢你的认真反馈！', 'success');
  } catch (error) {
    console.error('Feedback submission failed:', error);
    setFeedbackStatus('发送失败，请检查网络、数据表名称和 Supabase RLS 策略后重试。', 'error');
  } finally {
    feedbackSubmit.disabled = false;
    feedbackSubmit.textContent = '发送反馈 ↗';
  }
}

if (feedbackMessage && feedbackCount) {
  feedbackMessage.addEventListener('input', () => {
    feedbackCount.textContent = String(feedbackMessage.value.length);
  });
}

if (feedbackForm) feedbackForm.addEventListener('submit', submitFeedback);
updateConnectionBadge();

const trailSymbols = ['✦', '＋', '×', '◫', '01', '⌁'];
const trailColors = ['#63ebe9', '#63ebe9', '#fff36e', '#ffffff', '#8ffcff'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lastTrailAt = 0;
let lastScrollY = window.scrollY;

function spawnTrail(x, y, intensity = 1) {
  if (reducedMotion.matches || !trailLayer) return;

  const piece = document.createElement('span');
  const symbol = trailSymbols[Math.floor(Math.random() * trailSymbols.length)];
  const color = trailColors[Math.floor(Math.random() * trailColors.length)];
  const driftX = `${Math.round((Math.random() - .5) * 80 * intensity)}px`;
  const driftY = `${Math.round((-25 - Math.random() * 55) * intensity)}px`;

  piece.className = 'trail-piece';
  piece.textContent = symbol;
  piece.style.setProperty('--x', `${x}px`);
  piece.style.setProperty('--y', `${y}px`);
  piece.style.setProperty('--dx', driftX);
  piece.style.setProperty('--dy', driftY);
  piece.style.setProperty('--rot', `${Math.round((Math.random() - .5) * 130)}deg`);
  piece.style.setProperty('--trail-color', color);
  piece.style.setProperty('--trail-size', `${Math.round(12 + Math.random() * 13)}px`);
  trailLayer.appendChild(piece);
  piece.addEventListener('animationend', () => piece.remove(), { once: true });
}

window.addEventListener('pointermove', event => {
  const now = performance.now();
  if (event.pointerType === 'touch' || now - lastTrailAt < 42) return;
  lastTrailAt = now;
  spawnTrail(event.clientX + (Math.random() - .5) * 8, event.clientY + (Math.random() - .5) * 8, .72);
}, { passive: true });

window.addEventListener('scroll', () => {
  const now = performance.now();
  const delta = Math.abs(window.scrollY - lastScrollY);
  if (now - lastTrailAt > 70 && delta > 3) {
    lastTrailAt = now;
    const side = Math.random() > .5 ? .16 : .84;
    for (let index = 0; index < Math.min(3, 1 + Math.floor(delta / 45)); index += 1) {
      spawnTrail(window.innerWidth * side + (Math.random() - .5) * 34, window.innerHeight * (.35 + Math.random() * .42), 1.15);
    }
  }
  lastScrollY = window.scrollY;
}, { passive: true });

window.addEventListener('touchmove', event => {
  const now = performance.now();
  const touch = event.touches[0];
  if (!touch || now - lastTrailAt < 85) return;
  lastTrailAt = now;
  spawnTrail(touch.clientX, touch.clientY, .9);
}, { passive: true });

const revealSections = document.querySelectorAll('.hero-bento, main > .section');

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealSections.forEach(section => section.classList.add('is-visible'));
} else {
  revealSections.forEach(section => section.classList.add('reveal-section'));
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
  revealSections.forEach(section => revealObserver.observe(section));
}
