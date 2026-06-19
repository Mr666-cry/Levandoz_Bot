const { Telegraf } = require('telegraf');
const axios = require('axios');

// ╔══════════════════════════════════════════════════════════════╗
// ║              🤖 BOT MASTER CONFIG (HARDCODED)                ║
// ╚══════════════════════════════════════════════════════════════╝
const BOT_TOKEN = '8006726753:AAE0_rkzKZl8qyyp_LEdosJDT8soOqK_lxY';
const OWNER_ID = '7625804862';

// ─── GitHub Config ───
const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'Mr666-cry';
const GITHUB_REPO = 'Samuveloz';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/index.html';

// ─── Firebase Config ───
const FIREBASE_DB_URL = 'https://chat-samudev-default-rtdb.firebaseio.com';

// ╔══════════════════════════════════════════════════════════════╗
// ║                     INIT TELEGRAF BOT                        ║
// ╚══════════════════════════════════════════════════════════════╝
const bot = new Telegraf(BOT_TOKEN);

// Axios instance GitHub
const githubAPI = axios.create({
  baseURL: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TelegramBot'
  }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                     HELPER FUNCTIONS                         ║
// ╚══════════════════════════════════════════════════════════════╝

function log(msg) {
  const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  console.log(`[${time}] ${msg}`);
}

function isOwner(ctx) {
  const uid = ctx.from?.id?.toString();
  return uid === OWNER_ID;
}

function ownerOnly(ctx) {
  if (!isOwner(ctx)) {
    ctx.reply(
      '\u26D4 <b>Akses Ditolak!</b>\n\n' +
      'Command ini hanya bisa digunakan oleh <b>Owner</b>.\n' +
      'ID kamu: <code>' + ctx.from?.id + '</code>',
      { parse_mode: 'HTML' }
    );
    return false;
  }
  return true;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Firebase: Bot Status ───
async function getCurrentMode() {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/bot/status.json`);
    const data = await res.json();
    return data || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

async function setCurrentMode(mode) {
  try {
    await fetch(`${FIREBASE_DB_URL}/bot/status.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode)
    });
  } catch (e) {
    log('Gagal menyimpan status: ' + e.message);
  }
}

// ─── GitHub: Read File from Repo ───
async function readGithubFile(filePath) {
  try {
    const res = await githubAPI.get(`/contents/${filePath}?ref=${GITHUB_BRANCH}`);
    return Buffer.from(res.data.content, 'base64').toString('utf8');
  } catch (err) {
    throw new Error(`Gagal membaca ${filePath}: ${err.response?.data?.message || err.message}`);
  }
}

async function readLocalModeFile(folderName) {
  // Baca dari folder normal/ atau maintenance/ di repo ini via GitHub API
  return await readGithubFile(`${folderName}/index.html`);
}

// ─── GitHub: Update File ───
async function getGithubFileSha() {
  try {
    const res = await githubAPI.get(`/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`);
    return res.data.sha;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

async function updateGithubFile(content, message) {
  const sha = await getGithubFileSha();
  const payload = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: GITHUB_BRANCH
  };
  if (sha) payload.sha = sha;
  const res = await githubAPI.put(`/contents/${FILE_PATH}`, payload);
  return res.data;
}

// ─── Firebase: Notification Helpers ───
async function getNotification() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/notifications/active.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting notification:', error);
    return null;
  }
}

async function saveNotification(judul, teks, updatedBy) {
  try {
    const data = {
      judul,
      teks,
      createdAt: new Date().toISOString(),
      updatedBy
    };
    const response = await fetch(`${FIREBASE_DB_URL}/notifications/active.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving notification:', error);
    return false;
  }
}

async function removeNotification() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/notifications/active.json`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Error removing notification:', error);
    return false;
  }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                      BOT COMMANDS                            ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── /start ───
bot.command('start', (ctx) => {
  const nama = ctx.from?.first_name || 'User';
  const isAdmin = isOwner(ctx);

  const menuText = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551     \uD83E\uDD16 <b>SAMUBOT MASTER CONTROL</b>      \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                        \u2551
\u2551  Halo, <b>${escapeHtml(nama)}</b>! \uD83D\uDC4B          \u2551
\u2551                                        \u2551
\u2551  Bot manajemen all-in-one untuk       \u2551
\u2551  kontrol website & notifikasi.        \u2551
\u2551                                        \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  <b>\u26A1 MODE WEBSITE (/on &amp; /maintenance)</b> \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  \uD83D\uDCC1 Repo : <code>${GITHUB_OWNER}/${GITHUB_REPO}</code>    \u2551
\u2551  \uD83C\uDF40 Branch: <code>${GITHUB_BRANCH}</code>                    \u2551
\u2551  \uD83D\uDCC2 File  : <code>${FILE_PATH}</code>       \u2551
\u2551                                        \u2551
\u2551  <code>/on</code>          \u2500 Aktifkan mode Normal  \u2551
\u2551  <code>/maintenance</code> \u2500 Aktifkan Maintenance  \u2551
\u2551  <code>/status</code>      \u2500 Cek mode website       \u2551
\u2551                                        \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  <b>\uD83D\uDCE2 NOTIFIKASI WEBSITE (/notif)</b>       \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                        \u2551
\u2551  <code>/notif judul|teks</code>              \u2551
\u2551      Kirim notifikasi ke website       \u2551
\u2551                                        \u2551
\u2551  <code>/offnotif</code>     \u2500 Matikan notifikasi   \u2551
\u2551  <code>/statusnotif</code>  \u2500 Cek notif aktif       \u2551
\u2551                                        \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  <b>\uD83C\uDF9B SYSTEM</b>                            \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                        \u2551
\u2551  <code>/id</code>          \u2500 Cek ID Telegram kamu   \u2551
\u2551  <code>/ping</code>        \u2500 Cek bot online         \u2551
\u2551                                        \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  <i>\u26A0\uFE0F Command admin hanya untuk Owner.</i>  \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
  `.trim();

  if (isAdmin) {
    ctx.reply(menuText, { parse_mode: 'HTML' });
  } else {
    ctx.reply(
      `\uD83D\uDC4B Halo <b>${escapeHtml(nama)}</b>!\n\n` +
      `\uD83E\uDD16 Saya adalah <b>SamuBot Master Control</b>.\n\n` +
      `\u26D4 Maaf, bot ini hanya untuk <b>Owner</b>.\n` +
      `\uD83C\uDD94 ID kamu: <code>${ctx.from?.id}</code>`,
      { parse_mode: 'HTML' }
    );
  }
});

// ─── /id ───
bot.command('id', (ctx) => {
  ctx.reply(
    '\uD83C\uDD94 <b>Info Telegram Kamu</b>\n\n' +
    `<b>ID:</b> <code>${ctx.from?.id}</code>\n` +
    `<b>Nama:</b> ${escapeHtml(ctx.from?.first_name || 'N/A')}\n` +
    `<b>Username:</b> ${ctx.from?.username ? '@' + escapeHtml(ctx.from.username) : 'N/A'}`
    ,
    { parse_mode: 'HTML' }
  );
});

// ─── /ping ───
bot.command('ping', (ctx) => {
  const start = Date.now();
  ctx.reply('\uD83C\uDFD3 <b>Pong!</b>').then((sent) => {
    const latency = Date.now() - start;
    ctx.telegram.editMessageText(
      sent.chat.id,
      sent.message_id,
      undefined,
      `\uD83C\uDFD3 <b>Pong!</b>\n\n` +
      `\u26A1 Latency: <code>${latency}ms</code>\n` +
      `\uD83D\uDFE2 Bot aktif dan berjalan normal.`,
      { parse_mode: 'HTML' }
    );
  });
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                 GITHUB MODE COMMANDS                         ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── /on ───
bot.command('on', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const processingMsg = await ctx.reply(
    '\u23F3 <b>Processing...</b>\nMengganti ke mode <b>NORMAL</b>...',
    { parse_mode: 'HTML' }
  );

  try {
    const content = await readLocalModeFile('normal');
    await updateGithubFile(content, 'Switch to normal mode via SamuBot (Vercel)');
    await setCurrentMode('normal');

    await ctx.telegram.editMessageText(
      processingMsg.chat.id,
      processingMsg.message_id,
      undefined,
      '\u2705 <b>Mode NORMAL Aktif!</b>\n\n' +
      '\uD83D\uDFE2 Website sekarang dalam mode <b>NORMAL</b>.\n' +
      '\uD83D\uDCC1 File diganti dari folder <code>normal/</code>\n' +
      `\uD83D\uDCC2 <code>${FILE_PATH}</code> berhasil di-update ke GitHub.`,
      { parse_mode: 'HTML' }
    );
    log(`\u2705 Owner ${ctx.from.id} mengaktifkan mode NORMAL`);
  } catch (err) {
    await ctx.telegram.editMessageText(
      processingMsg.chat.id,
      processingMsg.message_id,
      undefined,
      `\u274C <b>Gagal!</b>\n\n<code>${escapeHtml(err.message)}</code>`,
      { parse_mode: 'HTML' }
    );
    log(`\u274C Error mode NORMAL: ${err.message}`);
  }
});

// ─── /maintenance ───
bot.command('maintenance', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const processingMsg = await ctx.reply(
    '\u23F3 <b>Processing...</b>\nMengganti ke mode <b>MAINTENANCE</b>...',
    { parse_mode: 'HTML' }
  );

  try {
    const content = await readLocalModeFile('maintenance');
    await updateGithubFile(content, 'Switch to maintenance mode via SamuBot (Vercel)');
    await setCurrentMode('maintenance');

    await ctx.telegram.editMessageText(
      processingMsg.chat.id,
      processingMsg.message_id,
      undefined,
      '\uD83D\uDD27 <b>Mode MAINTENANCE Aktif!</b>\n\n' +
      '\uD83D\uDFE1 Website sekarang dalam mode <b>MAINTENANCE</b>.\n' +
      '\uD83D\uDCC1 File diganti dari folder <code>maintenance/</code>\n' +
      `\uD83D\uDCC2 <code>${FILE_PATH}</code> berhasil di-update ke GitHub.`,
      { parse_mode: 'HTML' }
    );
    log(`\u2705 Owner ${ctx.from.id} mengaktifkan mode MAINTENANCE`);
  } catch (err) {
    await ctx.telegram.editMessageText(
      processingMsg.chat.id,
      processingMsg.message_id,
      undefined,
      `\u274C <b>Gagal!</b>\n\n<code>${escapeHtml(err.message)}</code>`,
      { parse_mode: 'HTML' }
    );
    log(`\u274C Error mode MAINTENANCE: ${err.message}`);
  }
});

// ─── /status ───
bot.command('status', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const mode = await getCurrentMode();
  const emoji = mode === 'normal' ? '\uD83D\uDFE2' : mode === 'maintenance' ? '\uD83D\uDFE1' : '\u2753';
  const modeName = mode === 'normal' ? 'NORMAL' : mode === 'maintenance' ? 'MAINTENANCE' : 'UNKNOWN';
  const notifData = await getNotification();

  let text =
    '\uD83D\uDCCA <b>Status Sistem</b>\n\n' +
    `\uD83D\uDCC1 Repo   : <code>${GITHUB_OWNER}/${GITHUB_REPO}</code>\n` +
    `\uD83C\uDF40 Branch : <code>${GITHUB_BRANCH}</code>\n` +
    `\uD83D\uDCC2 File   : <code>${FILE_PATH}</code>\n\n` +
    `\uD83C\uDF10 Website Mode : ${emoji} <b>${modeName}</b>\n\n`;

  if (notifData) {
    text +=
      '\uD83D\uDCE2 Notifikasi   : \uD83D\uDFE2 <b>AKTIF</b>\n' +
      `\uD83D\uDCCC Judul        : ${escapeHtml(notifData.judul)}\n` +
      `\uD83D\uDCDD Teks         : ${escapeHtml(notifData.teks)}\n` +
      `\uD83D\uDC64 Dibuat oleh  : ${escapeHtml(notifData.updatedBy || 'Unknown')}`;
  } else {
    text += '\uD83D\uDCE2 Notifikasi   : \u26AA <b>TIDAK AKTIF</b>';
  }

  ctx.reply(text, { parse_mode: 'HTML' });
});

// ╔══════════════════════════════════════════════════════════════╗
// ║              FIREBASE NOTIFICATION COMMANDS                  ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── /notif judul|teks ───
bot.command('notif', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const text = ctx.message.text;
  const commandParts = text.split(' ');

  if (commandParts.length < 2) {
    return ctx.reply(
      '\uD83D\uDCE2 <b>Kirim Notifikasi ke Website</b>\n\n' +
      '<b>Cara pakai:</b>\n' +
      '<code>/notif judul|teks notifikasi</code>\n\n' +
      '<b>Contoh:</b>\n' +
      '<code>/notif Update|Sistem akan update dalam 10 menit!</code>\n' +
      '<code>/notif Penting|Server maintenance mulai jam 12 malam.</code>',
      { parse_mode: 'HTML' }
    );
  }

  const notificationText = text.replace('/notif', '').trim();
  const firstPipeIndex = notificationText.indexOf('|');

  if (firstPipeIndex === -1) {
    return ctx.reply(
      '\u274C <b>Format salah!</b>\n\n' +
      'Gunakan tanda <code>|</code> (pipe) untuk memisahkan judul dan teks.\n\n' +
      '<b>Contoh:</b>\n' +
      '<code>/notif Judul|Teks notifikasinya di sini</code>',
      { parse_mode: 'HTML' }
    );
  }

  const judul = notificationText.substring(0, firstPipeIndex).trim();
  const teks = notificationText.substring(firstPipeIndex + 1).trim();

  if (!judul || !teks) {
    return ctx.reply('\u274C Judul dan teks tidak boleh kosong!', { parse_mode: 'HTML' });
  }

  const success = await saveNotification(
    judul,
    teks,
    ctx.from?.username || ctx.from?.first_name || 'Owner'
  );

  if (success) {
    ctx.reply(
      '\u2705 <b>Notifikasi Berhasil Dikirim!</b>\n\n' +
      `\uD83D\uDCCC <b>Judul:</b> ${escapeHtml(judul)}\n` +
      `\uD83D\uDCDD <b>Teks:</b> ${escapeHtml(teks)}\n\n` +
      '\uD83D\uDCA1 Notifikasi akan muncul otomatis di website saat dibuka atau di-refresh.',
      { parse_mode: 'HTML' }
    );
    log(`\u2705 Notifikasi dikirim oleh ${ctx.from.id}: ${judul}`);
  } else {
    ctx.reply('\u274C Gagal menyimpan notifikasi ke Firebase!', { parse_mode: 'HTML' });
  }
});

// ─── /offnotif ───
bot.command('offnotif', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const currentNotif = await getNotification();
  if (!currentNotif) {
    return ctx.reply(
      '\u2139\uFE0F <b>Tidak ada notifikasi aktif</b>\n\n' +
      'Saat ini tidak ada notifikasi yang ditampilkan di website.',
      { parse_mode: 'HTML' }
    );
  }

  const success = await removeNotification();
  if (success) {
    ctx.reply(
      '\u2705 <b>Notifikasi Dimatikan!</b>\n\n' +
      `\uD83D\uDCCC Judul: <s>${escapeHtml(currentNotif.judul)}</s>\n\n` +
      '\uD83D\uDCA1 Website tidak akan menampilkan notifikasi lagi.',
      { parse_mode: 'HTML' }
    );
    log(`\u2705 Notifikasi dimatikan oleh ${ctx.from.id}`);
  } else {
    ctx.reply('\u274C Gagal mematikan notifikasi!', { parse_mode: 'HTML' });
  }
});

// ─── /statusnotif ───
bot.command('statusnotif', async (ctx) => {
  if (!ownerOnly(ctx)) return;

  const currentNotif = await getNotification();
  if (!currentNotif) {
    return ctx.reply(
      '\u2139\uFE0F <b>Status Notifikasi</b>\n\n' +
      '\u26AA Status: <b>TIDAK AKTIF</b>\n' +
      'Tidak ada notifikasi yang sedang ditampilkan di website.',
      { parse_mode: 'HTML' }
    );
  }

  ctx.reply(
    '\u2139\uFE0F <b>Status Notifikasi</b>\n\n' +
    '\uD83D\uDFE2 Status: <b>AKTIF</b>\n\n' +
    `\uD83D\uDCCC <b>Judul:</b> ${escapeHtml(currentNotif.judul)}\n` +
    `\uD83D\uDCDD <b>Teks:</b> ${escapeHtml(currentNotif.teks)}\n` +
    `\uD83D\uDCC5 <b>Dibuat:</b> <code>${currentNotif.createdAt}</code>\n` +
    `\uD83D\uDC64 <b>Oleh:</b> ${escapeHtml(currentNotif.updatedBy || 'Unknown')}`,
    { parse_mode: 'HTML' }
  );
});

// ╔══════════════════════════════════════════════════════════════╗
// ║               UNKNOWN COMMAND HANDLER                        ║
// ╚══════════════════════════════════════════════════════════════╝

bot.on('text', (ctx) => {
  if (isOwner(ctx) && ctx.message.text?.startsWith('/')) {
    ctx.reply(
      '\u2753 <b>Command tidak dikenal!</b>\n\n' +
      'Gunakan <code>/start</code> untuk melihat daftar semua command.',
      { parse_mode: 'HTML' }
    );
  }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║               ERROR HANDLER                                  ║
// ╚══════════════════════════════════════════════════════════════╝

bot.catch((err, ctx) => {
  log(`\u274C Error for ${ctx.updateType}: ${err.message}`);
});

// ╔══════════════════════════════════════════════════════════════╗
// ║              VERCEL SERVERLESS HANDLER                       ║
// ╚══════════════════════════════════════════════════════════════╝

// Flag untuk track apakah webhook sudah di-set
let webhookInitialized = false;

module.exports = async (req, res) => {
  // ─── Health check / info ───
  if (req.method === 'GET') {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const webhookUrl = `${proto}://${host}/api/webhook`;

    // Auto-set webhook kalau belum (saat pertama kali diakses)
    if (!webhookInitialized) {
      try {
        await bot.telegram.setWebhook(webhookUrl);
        webhookInitialized = true;
        log(`\u2705 Webhook auto-set ke: ${webhookUrl}`);
      } catch (e) {
        log(`\u26A0\uFE0F Gagal auto-set webhook: ${e.message}`);
      }
    }

    return res.status(200).json({
      ok: true,
      bot: 'SamuBot Master Control (Vercel)',
      webhook: webhookUrl,
      webhookSet: webhookInitialized,
      timestamp: new Date().toISOString()
    });
  }

  // ─── Handle Telegram webhook ───
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
      // Telegraf handleUpdate sudah handle response,
      // tapi kita pastikan response terkirim
      if (!res.headersSent) {
        res.status(200).json({ ok: true });
      }
    } catch (err) {
      log(`\u274C Webhook error: ${err.message}`);
      if (!res.headersSent) {
        res.status(200).json({ ok: true }); // tetap 200 biar Telegram gak retry terus
      }
    }
    return;
  }

  // Method lain
  res.status(405).json({ ok: false, error: 'Method not allowed' });
};

log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
log('\u2551     \uD83E\uDD16 SAMUBOT MASTER CONTROL v3.0 (VERCEL)    \u2551');
log('\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
log(`\u2551  \uD83D\uDCC1 Repo   : ${GITHUB_OWNER}/${GITHUB_REPO}`);
log(`\u2551  \uD83C\uDF40 Branch : ${GITHUB_BRANCH}`);
log(`\u2551  \uD83D\uDCC2 File   : ${FILE_PATH}`);
log(`\u2551  \uD83D\uDD25 Firebase: ${FIREBASE_DB_URL}`);
log(`\u2551  \uD83D\uDC64 Owner  : ${OWNER_ID}`);
log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
log('\uD83D\uDE80 Handler loaded dan siap menerima webhook...');
