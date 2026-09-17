const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const chatMessages = document.querySelector('#chatMessages');
const quickQuestions = document.querySelectorAll('[data-question]');
const trailLayer = document.querySelector('#trailLayer');

const knowledge = [
  {
    keywords: ['明星', '偶像', '刘雨昕', '追星', '演唱会'],
    answer: '我喜欢追星，也喜欢去演唱会感受现场。我最喜欢的明星是刘雨昕。'
  },
  {
    keywords: ['哪里人', '家乡', '天津'],
    answer: '我是天津人！现在是天津大学—香港理工大学深圳未来技术学院的大一新生。'
  },
  {
    keywords: ['深圳', '什么时候来', '来到深圳'],
    answer: '我在 2026 年 8 月第一次来到深圳，从天津来到这里开启大学生活。此前我从未来过深圳，所以一切都很新鲜。'
  },
  {
    keywords: ['熬夜', '早睡'],
    answer: '喜欢熬夜，不过作为正在适应大学生活的新生，也要努力调整作息。'
  },
  {
    keywords: ['志愿', '志愿服务', '组织能力', '集体'],
    answer: '我现在在年级志愿服务组，还处于熟悉团队和工作方式的阶段。我喜欢做志愿，是因为帮助别人会让我觉得很有意义，也希望在参与中锻炼组织能力、更加融入集体。'
  },
  {
    keywords: ['滑雪', '单板', '双板', '夜场'],
    answer: '单板和双板我都会，不过更喜欢单板。之前滑过夜场，氛围和体验都特别有意思！'
  },
  {
    keywords: ['钢琴', '几级'],
    answer: '我从 5 岁开始学钢琴，现在是钢琴九级。'
  },
  {
    keywords: ['游戏', '王者', '蛋仔'],
    answer: '我喜欢玩王者荣耀和蛋仔派对。'
  },
  {
    keywords: ['看剧', '悬疑', '泰剧'],
    answer: '我很喜欢看悬疑剧，最近也对泰剧很感兴趣。'
  },
  {
    keywords: ['目标', '四级', '本学期'],
    answer: '我本学期最明确的目标是通过大学英语四级，同时希望更好地融入大学集体、培养组织能力，并继续探索智能医学工程和脑机接口方向。'
  },
  {
    keywords: ['专业', '学习', '脑机', '医学', '方向'],
    answer: '我现在主要学习智能医学工程，并关注脑机接口方向。这是我正在探索的新领域。'
  },
  {
    keywords: ['最近', '大学', '生活', '英文', '适应'],
    answer: '我最近在适应中外合办项目的英文教学模式，也很关心自己多久能适应大学生活。'
  },
  {
    keywords: ['兴趣', '喜欢什么', '爱好'],
    answer: '我的兴趣有滑雪、打游戏、追星、看剧和弹钢琴。单板滑雪、悬疑剧和演唱会现场都是我很喜欢的体验。'
  },
  {
    keywords: ['性格', '内向', '慢热', '好奇'],
    answer: '我是一个内向慢热、但对新鲜事物保持好奇的人。我会按自己的节奏了解新环境，也希望通过实际行动慢慢融入集体。'
  },
  {
    keywords: ['年龄', '出生', '几岁'],
    answer: '我出生于 2007 年，现在正处在刚刚开启大学生活的阶段。'
  },
  {
    keywords: ['你好', '嗨', 'hello', 'hi'],
    answer: '你好呀，很高兴认识你！你可以问问我的志愿服务、兴趣、本学期目标、家乡、专业或大学生活。'
  }
];

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

function findAnswer(question) {
  const normalized = question.trim().toLowerCase();
  const match = knowledge.find(item => item.keywords.some(keyword => normalized.includes(keyword.toLowerCase())));
  return match?.answer || '这个问题还不在我的本地资料库里。你可以问我关于家乡、偶像、兴趣、专业或大学生活的问题。';
}

function ask(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addMessage(cleanQuestion, 'user');
  chatInput.value = '';
  window.setTimeout(() => addMessage(findAnswer(cleanQuestion), 'bot'), 260);
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