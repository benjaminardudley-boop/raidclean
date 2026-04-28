import { useState, useEffect, useRef, useCallback } from "react";

// ── Aesthetic: Terminal-Noir Crypto War Room ──────────────────────────────────
// Monospace glitch culture, scanlines, acid-green on deep black, military grid

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --acid:   #00ff88;
    --acid2:  #00e5ff;
    --warn:   #ff4d6d;
    --gold:   #ffd60a;
    --bg0:    #030507;
    --bg1:    #080d12;
    --bg2:    #0d1520;
    --bg3:    #112030;
    --border: #1a3a52;
    --dim:    #2a4a62;
    --text:   #c8e0f0;
    --mono:   'Share Tech Mono', monospace;
    --sans:   'Rajdhani', sans-serif;
  }

  html, body, #root { height: 100%; background: var(--bg0); color: var(--text); font-family: var(--mono); overflow: hidden; }

  /* scanline overlay */
  body::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.08) 2px, rgba(0,0,0,.08) 4px);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--dim); border-radius: 2px; }

  /* ── layout ──────────────────────────────────── */
  .app { display: flex; height: 100vh; width: 100vw; flex-direction: column; }

  .topbar {
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px; height: 52px;
    background: var(--bg1);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .logo {
    font-family: var(--sans); font-weight: 700; font-size: 20px;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--acid);
    text-shadow: 0 0 18px var(--acid), 0 0 40px rgba(0,255,136,.3);
  }
  .logo span { color: var(--acid2); }
  .topbar-tag {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--dim); border: 1px solid var(--dim); padding: 2px 7px; border-radius: 2px;
  }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
  .user-chip {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg2); border: 1px solid var(--border);
    padding: 4px 12px; border-radius: 3px; font-size: 12px;
  }
  .user-chip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 6px var(--acid); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  .btn {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px;
    padding: 6px 16px; border-radius: 3px; cursor: pointer;
    border: 1px solid; transition: all .15s;
  }
  .btn-ghost { border-color: var(--dim); background: transparent; color: var(--text); }
  .btn-ghost:hover { border-color: var(--acid); color: var(--acid); }
  .btn-primary { border-color: var(--acid); background: rgba(0,255,136,.1); color: var(--acid); }
  .btn-primary:hover { background: rgba(0,255,136,.2); box-shadow: 0 0 14px rgba(0,255,136,.25); }
  .btn-warn { border-color: var(--warn); background: rgba(255,77,109,.1); color: var(--warn); }
  .btn-warn:hover { background: rgba(255,77,109,.2); }

  /* ── main area ───────────────────────────────── */
  .main { display: flex; flex: 1; overflow: hidden; }

  /* ── sidebar ─────────────────────────────────── */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--bg1);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sidebar-section { padding: 14px 16px 8px; }
  .section-label {
    font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--dim); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .room-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
  .room-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 4px; cursor: pointer;
    transition: all .12s; margin-bottom: 2px;
    border: 1px solid transparent; font-size: 13px;
  }
  .room-item:hover { background: var(--bg2); border-color: var(--border); }
  .room-item.active { background: var(--bg3); border-color: var(--dim); color: var(--acid); }
  .room-icon { font-size: 16px; flex-shrink: 0; }
  .room-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .room-badge {
    min-width: 18px; height: 18px; border-radius: 9px;
    background: var(--warn); color: #fff; font-size: 10px;
    display: flex; align-items: center; justify-content: center; padding: 0 5px;
  }
  .room-online { font-size: 10px; color: var(--dim); }

  .sidebar-bottom {
    padding: 12px; border-top: 1px solid var(--border);
  }

  /* ── chat area ───────────────────────────────── */
  .chat-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

  .chat-header {
    padding: 12px 20px; border-bottom: 1px solid var(--border);
    background: var(--bg1); display: flex; align-items: center; gap: 14px;
    flex-shrink: 0;
  }
  .chat-room-name { font-family: var(--sans); font-weight: 700; font-size: 18px; letter-spacing: 2px; color: var(--acid2); }
  .chat-room-desc { font-size: 11px; color: var(--dim); margin-top: 2px; }
  .chat-header-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .verified-badge {
    display: flex; align-items: center; gap: 5px;
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    color: var(--acid); border: 1px solid rgba(0,255,136,.3); padding: 3px 8px; border-radius: 2px;
    background: rgba(0,255,136,.05);
  }
  .member-count { font-size: 11px; color: var(--dim); }

  /* ── messages ────────────────────────────────── */
  .messages {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 2px;
  }

  .msg { display: flex; gap: 10px; padding: 5px 8px; border-radius: 4px; transition: background .1s; }
  .msg:hover { background: rgba(255,255,255,.02); }

  .msg-avatar {
    width: 30px; height: 30px; border-radius: 3px;
    font-family: var(--sans); font-weight: 700; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
    border: 1px solid;
  }

  .msg-body { flex: 1; min-width: 0; }
  .msg-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
  .msg-user { font-family: var(--sans); font-weight: 700; font-size: 14px; }
  .msg-time { font-size: 10px; color: var(--dim); }
  .msg-rank { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 1px 5px; border-radius: 2px; }
  .rank-legend { background: rgba(255,214,10,.15); color: var(--gold); border: 1px solid rgba(255,214,10,.3); }
  .rank-raider  { background: rgba(0,229,255,.1);  color: var(--acid2); border: 1px solid rgba(0,229,255,.3); }
  .rank-member  { background: rgba(42,74,98,.4);   color: var(--dim);   border: 1px solid var(--border); }
  .msg-text { font-size: 13px; line-height: 1.6; color: var(--text); word-break: break-word; }

  /* system messages */
  .msg-system {
    text-align: center; font-size: 11px; color: var(--dim);
    padding: 8px; letter-spacing: 1px;
    display: flex; align-items: center; gap: 8px; justify-content: center;
  }
  .msg-system::before, .msg-system::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── input bar ───────────────────────────────── */
  .input-bar {
    padding: 12px 20px; border-top: 1px solid var(--border);
    background: var(--bg1); display: flex; gap: 10px; align-items: flex-end;
    flex-shrink: 0;
  }
  .input-wrap { flex: 1; position: relative; }
  .chat-input {
    width: 100%; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); font-family: var(--mono); font-size: 13px;
    padding: 10px 14px; border-radius: 4px; resize: none; outline: none;
    transition: border-color .15s; line-height: 1.5; min-height: 42px; max-height: 120px;
  }
  .chat-input:focus { border-color: var(--dim); }
  .chat-input::placeholder { color: var(--dim); }
  .send-btn {
    width: 42px; height: 42px; border-radius: 4px;
    border: 1px solid var(--acid); background: rgba(0,255,136,.1);
    color: var(--acid); cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 18px; transition: all .15s; flex-shrink: 0;
  }
  .send-btn:hover { background: rgba(0,255,136,.2); box-shadow: 0 0 14px rgba(0,255,136,.25); }

  /* ── right panel ─────────────────────────────── */
  .right-panel {
    width: 220px; flex-shrink: 0;
    background: var(--bg1); border-left: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .panel-tabs {
    display: flex; border-bottom: 1px solid var(--border);
  }
  .panel-tab {
    flex: 1; padding: 10px 4px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    text-align: center; cursor: pointer; color: var(--dim); border-bottom: 2px solid transparent;
    transition: all .12s;
  }
  .panel-tab.active { color: var(--acid2); border-color: var(--acid2); background: rgba(0,229,255,.04); }
  .panel-content { flex: 1; overflow-y: auto; padding: 12px; }

  .member-row {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px; border-radius: 4px; margin-bottom: 2px;
    cursor: default; transition: background .1s; font-size: 12px;
  }
  .member-row:hover { background: var(--bg2); }
  .member-avatar {
    width: 26px; height: 26px; border-radius: 3px;
    font-family: var(--sans); font-weight: 700; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid; flex-shrink: 0;
  }
  .member-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .member-status { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .status-online { background: var(--acid); box-shadow: 0 0 4px var(--acid); }
  .status-idle   { background: var(--gold); }
  .status-offline{ background: var(--dim); }

  /* leaderboard */
  .lb-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 8px; border-radius: 4px; margin-bottom: 4px;
    background: var(--bg2); border: 1px solid var(--border); font-size: 12px;
  }
  .lb-rank { width: 18px; text-align: center; font-size: 11px; color: var(--dim); flex-shrink: 0; }
  .lb-rank.top1 { color: var(--gold); font-weight: bold; }
  .lb-rank.top2 { color: #c0c0c0; }
  .lb-rank.top3 { color: #cd7f32; }
  .lb-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-score { font-size: 11px; color: var(--acid); font-family: var(--mono); }

  /* ── login screen ────────────────────────────── */
  .login-screen {
    height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--bg0); position: relative; overflow: hidden;
  }
  .login-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,255,136,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .login-glow {
    position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,136,.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .login-card {
    position: relative; z-index: 1;
    background: var(--bg1); border: 1px solid var(--border);
    border-radius: 8px; padding: 48px 40px; width: 420px;
    box-shadow: 0 0 60px rgba(0,0,0,.8), 0 0 0 1px rgba(0,255,136,.05);
  }
  .login-logo {
    font-family: var(--sans); font-weight: 700; font-size: 32px;
    letter-spacing: 5px; text-transform: uppercase;
    color: var(--acid); text-shadow: 0 0 24px var(--acid), 0 0 60px rgba(0,255,136,.3);
    margin-bottom: 4px; text-align: center;
  }
  .login-logo span { color: var(--acid2); }
  .login-tagline { text-align: center; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 36px; }
  .login-features { margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
  .login-feature {
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; color: var(--text);
    padding: 8px 12px; border-radius: 4px; background: var(--bg2); border: 1px solid var(--border);
  }
  .feature-icon { font-size: 16px; flex-shrink: 0; }
  .login-x-btn {
    width: 100%; padding: 14px; border-radius: 5px;
    background: var(--bg0); border: 1px solid var(--acid);
    color: var(--acid); font-family: var(--mono); font-size: 13px;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all .2s;
    box-shadow: 0 0 0 rgba(0,255,136,0);
  }
  .login-x-btn:hover {
    background: rgba(0,255,136,.08);
    box-shadow: 0 0 20px rgba(0,255,136,.2);
  }
  .login-note { margin-top: 16px; text-align: center; font-size: 10px; color: var(--dim); line-height: 1.6; letter-spacing: .5px; }

  /* ── verify modal ────────────────────────────── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 100;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--bg1); border: 1px solid var(--border);
    border-radius: 8px; padding: 32px; width: 420px;
    box-shadow: 0 0 40px rgba(0,0,0,.9);
  }
  .modal-title { font-family: var(--sans); font-weight: 700; font-size: 18px; letter-spacing: 2px; color: var(--acid2); margin-bottom: 6px; }
  .modal-sub { font-size: 12px; color: var(--dim); margin-bottom: 24px; letter-spacing: .5px; }
  .verify-step {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 4px; margin-bottom: 8px;
    background: var(--bg2); border: 1px solid var(--border); font-size: 12px;
    transition: all .3s;
  }
  .verify-step.done   { border-color: rgba(0,255,136,.4); background: rgba(0,255,136,.05); }
  .verify-step.active { border-color: rgba(0,229,255,.4); animation: borderPulse 1s infinite; }
  .verify-step.fail   { border-color: rgba(255,77,109,.4); background: rgba(255,77,109,.05); }
  @keyframes borderPulse { 0%,100%{border-color:rgba(0,229,255,.4)} 50%{border-color:rgba(0,229,255,.8)} }
  .step-icon { font-size: 16px; flex-shrink: 0; }
  .step-text { flex: 1; }
  .step-status { font-size: 11px; }
  .status-ok   { color: var(--acid); }
  .status-spin { color: var(--acid2); animation: spin .8s linear infinite; display: inline-block; }
  .status-fail { color: var(--warn); }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .modal-actions { margin-top: 24px; display: flex; gap: 10px; }

  /* ── spam alert ──────────────────────────────── */
  .spam-alert {
    position: fixed; top: 64px; right: 16px; z-index: 50;
    background: var(--bg1); border: 1px solid var(--warn);
    border-radius: 6px; padding: 12px 16px; width: 280px;
    box-shadow: 0 0 20px rgba(255,77,109,.2);
    animation: slideIn .2s ease-out;
  }
  @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
  .spam-title { font-size: 12px; color: var(--warn); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .spam-text  { font-size: 11px; color: var(--dim); line-height: 1.5; }

  /* ── ticker ──────────────────────────────────── */
  .ticker {
    height: 26px; background: var(--bg2); border-top: 1px solid var(--border);
    overflow: hidden; flex-shrink: 0; display: flex; align-items: center;
  }
  .ticker-inner {
    display: flex; gap: 60px; white-space: nowrap;
    animation: ticker 30s linear infinite;
    font-size: 10px; letter-spacing: 1px; color: var(--dim);
  }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .ticker-item { display: flex; align-items: center; gap: 8px; }
  .ticker-green { color: var(--acid); }
  .ticker-red   { color: var(--warn); }
`;

// ── Data ───────────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: "pepe-raid",  name: "$PEPE",  icon: "🐸", desc: "PEPE Raid Room",      online: 142, unread: 3  },
  { id: "wojak-ops",  name: "$WOJAK", icon: "😔", desc: "Wojak Operations",    online: 87,  unread: 0  },
  { id: "moon-dao",   name: "MoonDAO",icon: "🌕", desc: "MoonDAO Community",   online: 203, unread: 11 },
  { id: "doge-army",  name: "$DOGE",  icon: "🐶", desc: "Doge Army Raids",     online: 89,  unread: 0  },
  { id: "chad-coin",  name: "$CHAD",  icon: "💪", desc: "ChadCoin Holders",    online: 56,  unread: 2  },
];

const AVATARS = [
  { bg: "rgba(0,255,136,.2)",  border: "rgba(0,255,136,.5)",  color: "#00ff88" },
  { bg: "rgba(0,229,255,.2)",  border: "rgba(0,229,255,.5)",  color: "#00e5ff" },
  { bg: "rgba(255,214,10,.2)", border: "rgba(255,214,10,.5)", color: "#ffd60a" },
  { bg: "rgba(255,77,109,.2)", border: "rgba(255,77,109,.5)", color: "#ff4d6d" },
  { bg: "rgba(180,100,255,.2)",border: "rgba(180,100,255,.5)",color: "#b464ff" },
];

const RANKS = ["member", "raider", "raider", "legend", "member", "raider", "member", "legend"];

const SEED_MSGS = [
  { id: 1, user: "CryptoWarlord",  text: "RAID STARTING NOW — drop the link below 🔥",          rank: "legend", time: "14:31", av: 2 },
  { id: 2, user: "MoonMissile",    text: "Let's gooo! Already liked and RT'd. Who's next?",      rank: "raider", time: "14:31", av: 0 },
  { id: 3, user: "Ape_Protocol",   text: "Engagement wave 1 done. 47 likes sent.",               rank: "raider", time: "14:32", av: 1 },
  { id: 4, user: "SatoshiGhost",   text: "Coordinating wave 2 in 3 min. All hands.",             rank: "legend", time: "14:32", av: 3 },
  { id: 5, user: "DegenFarmer",    text: "What's the target tweet? Need the link",               rank: "member", time: "14:33", av: 4 },
  { id: 6, user: "CryptoWarlord",  text: "https://x.com/projecthandle/status/12345 — GO",       rank: "legend", time: "14:33", av: 2 },
  { id: 7, user: "NFA_Trader",     text: "On it. Spam filter clean, no bot triggers today",      rank: "raider", time: "14:34", av: 0 },
  { id: 8, user: "Ape_Protocol",   text: "Wave 2 done. Engagement up 340% from yesterday 📈",   rank: "raider", time: "14:35", av: 1 },
];

const MEMBERS = [
  { name: "CryptoWarlord", rank: "legend", status: "online", av: 2 },
  { name: "SatoshiGhost",  rank: "legend", status: "online", av: 3 },
  { name: "Ape_Protocol",  rank: "raider", status: "online", av: 1 },
  { name: "MoonMissile",   rank: "raider", status: "online", av: 0 },
  { name: "NFA_Trader",    rank: "raider", status: "idle",   av: 0 },
  { name: "DegenFarmer",   rank: "member", status: "online", av: 4 },
  { name: "WhaleWatcher",  rank: "member", status: "idle",   av: 1 },
  { name: "PaperHands99",  rank: "member", status: "offline",av: 2 },
  { name: "DiamondPaws",   rank: "member", status: "online", av: 3 },
  { name: "RektMaster",    rank: "member", status: "offline",av: 4 },
];

const LEADERBOARD = [
  { name: "CryptoWarlord", score: "4,820", rank: 1 },
  { name: "Ape_Protocol",  score: "3,210", rank: 2 },
  { name: "SatoshiGhost",  score: "2,990", rank: 3 },
  { name: "MoonMissile",   score: "1,740", rank: 4 },
  { name: "NFA_Trader",    score: "1,390", rank: 5 },
  { name: "DiamondPaws",   score: "870",   rank: 6 },
  { name: "DegenFarmer",   score: "530",   rank: 7 },
];

const TICKER_ITEMS = [
  "🟢 $PEPE +18.4%", "🔴 $WOJAK -3.2%", "🟢 MOONDAO +7.1%", "⚡ RAID ACTIVE: $PEPE",
  "🟢 $DOGE +2.9%", "👥 342 RAIDERS ONLINE", "🟢 $CHAD +11.8%", "🔴 $FLOKI -1.4%",
  "⚡ WAVE 3 IN 2 MIN", "🟢 $BRETT +44.0%",
];

const VERIFY_STEPS = [
  { label: "Checking X account age",            ok: "Account 14 months old"      },
  { label: "Scanning recent tweet activity",    ok: "87 tweets in 30 days"        },
  { label: "Verifying project engagement",      ok: "Found 23 interactions"       },
  { label: "Running AI spam score",             ok: "Score 0.04 — clean"          },
  { label: "Checking follower authenticity",    ok: "94% real followers"          },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Avatar({ name, avIdx, size = 30 }) {
  const s = AVATARS[avIdx % AVATARS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 3, flexShrink: 0,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
      fontSize: size * 0.43, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-grid" />
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-logo">Raid<span>Clean</span></div>
        <div className="login-tagline">Verified Crypto Raid Coordination</div>
        <div className="login-features">
          {[
            ["⚡","AI-powered membership verification"],
            ["🔒","Only real, active community members"],
            ["🎯","Coordinated raids. Zero spam. No bots."],
          ].map(([icon, txt]) => (
            <div className="login-feature" key={txt}>
              <span className="feature-icon">{icon}</span>
              <span>{txt}</span>
            </div>
          ))}
        </div>
        <button className="login-x-btn" onClick={() => window.location.href = 'http://localhost:3000/auth/x'}>
          <span style={{fontWeight:"bold",fontSize:16}}>𝕏</span>
          Login with X (Twitter)
        </button>
        <div className="login-note">
          Your X account will be verified for genuine project engagement.<br />
          No fake followers. No bots. Raiders only.
        </div>
      </div>
    </div>
  );
}

// ── Verify Modal ──────────────────────────────────────────────────────────────
function VerifyModal({ onDone, onFail }) {
  const [steps, setSteps] = useState(VERIFY_STEPS.map(() => "pending"));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= VERIFY_STEPS.length) {
        setTimeout(onDone, 600);
        return;
      }
      setSteps(s => { const n=[...s]; n[i]="active"; return n; });
      setCurrent(i);
      setTimeout(() => {
        setSteps(s => { const n=[...s]; n[i]="done"; return n; });
        i++; setTimeout(tick, 300);
      }, 900 + Math.random() * 400);
    };
    setTimeout(tick, 400);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">AI Verification</div>
        <div className="modal-sub">Checking your X account for project membership…</div>
        {VERIFY_STEPS.map((step, i) => (
          <div key={i} className={`verify-step ${steps[i]}`}>
            <span className="step-icon">
              {steps[i]==="pending" ? "○" : steps[i]==="active" ? "◎" : steps[i]==="done" ? "●" : "✕"}
            </span>
            <span className="step-text">{step.label}</span>
            <span className="step-status">
              {steps[i]==="active" && <span className="status-spin">↻</span>}
              {steps[i]==="done"   && <span className="status-ok">✓ {step.ok}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Spam Alert ────────────────────────────────────────────────────────────────
function SpamAlert({ text, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="spam-alert" onClick={onDismiss}>
      <div className="spam-title">⚠ Spam Detected & Blocked</div>
      <div className="spam-text">{text}</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]   = useState("login"); // login | verify | app
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const [messages, setMessages]     = useState(SEED_MSGS);
  const [input, setInput]           = useState("");
  const [tab, setTab]               = useState("members");
  const [spamAlert, setSpamAlert]   = useState(null);
  const [rooms, setRooms]           = useState(ROOMS);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Simulate incoming msgs
  useEffect(() => {
    if (screen !== "app") return;
    const bots = [
      { user: "CryptoWarlord", text: "Wave 3 launching in 60s — stay ready ⚡", rank: "legend", av: 2 },
      { user: "Ape_Protocol",  text: "Retweeted 12 posts. Engagement tracking live.", rank: "raider", av: 1 },
      { user: "DiamondPaws",   text: "Just joined. Ready to raid!", rank: "member", av: 3 },
      { user: "SatoshiGhost",  text: "Leaderboard updated. Top raider: CryptoWarlord 🏆", rank: "legend", av: 3 },
    ];
    let idx = 0;
    const int = setInterval(() => {
      if (idx >= bots.length) { clearInterval(int); return; }
      const b = bots[idx++];
      setMessages(m => [...m, { id: Date.now(), ...b, time: formatTime(Date.now()) }]);
    }, 8000 + idx * 2000);
    return () => clearInterval(int);
  }, [screen]);

  const SPAM_PATTERNS = [/(buy now|click here|free money|dm me|guaranteed)/i, /https?:\/\//];

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const isSpam = SPAM_PATTERNS.some(p => p.test(input));
    if (isSpam) {
      setSpamAlert(`"${input.slice(0,50)}…" flagged as spam and blocked.`);
      setInput(""); return;
    }
    setMessages(m => [...m, {
      id: Date.now(), user: "You", text: input.trim(),
      rank: "raider", time: formatTime(Date.now()), av: 0,
    }]);
    setInput("");
    // Clear unread
    setRooms(r => r.map(rm => rm.id === activeRoom.id ? {...rm, unread: 0} : rm));
  }, [input, activeRoom]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (screen === "login") return (
    <>
      <style>{STYLE}</style>
      <LoginScreen onLogin={() => setScreen("verify")} />
    </>
  );

  if (screen === "verify") return (
    <>
      <style>{STYLE}</style>
      <div style={{height:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div className="login-logo" style={{marginBottom:8}}>Raid<span>Clean</span></div>
          <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:"var(--dim)",marginBottom:32}}>Welcome back, @CryptoRaider99</div>
        </div>
      </div>
      <VerifyModal onDone={() => setScreen("app")} onFail={() => setScreen("login")} />
    </>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        {/* Topbar */}
        <div className="topbar">
          <div className="logo">Raid<span>Clean</span></div>
          <div className="topbar-tag">BETA</div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="dot" />
              <span>@CryptoRaider99</span>
              <span style={{color:"var(--dim)"}}>·</span>
              <span style={{color:"var(--gold)",fontSize:11}}>RAIDER</span>
            </div>
            <button className="btn btn-ghost" onClick={() => setScreen("login")}>Logout</button>
          </div>
        </div>

        <div className="main">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="section-label">Raid Rooms</div>
            </div>
            <div className="room-list">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`room-item ${activeRoom.id === room.id ? "active" : ""}`}
                  onClick={() => { setActiveRoom(room); setRooms(r => r.map(rm => rm.id === room.id ? {...rm, unread: 0} : rm)); }}
                >
                  <span className="room-icon">{room.icon}</span>
                  <span className="room-name">{room.name}</span>
                  {room.unread > 0
                    ? <span className="room-badge">{room.unread}</span>
                    : <span className="room-online">{room.online}</span>
                  }
                </div>
              ))}
            </div>
            <div className="sidebar-bottom">
              <button className="btn btn-primary" style={{width:"100%"}}>+ New Room</button>
            </div>
          </div>

          {/* Chat */}
          <div className="chat-area">
            <div className="chat-header">
              <span style={{fontSize:22}}>{activeRoom.icon}</span>
              <div>
                <div className="chat-room-name">{activeRoom.name} RAID ROOM</div>
                <div className="chat-room-desc">{activeRoom.desc} · {activeRoom.online} online</div>
              </div>
              <div className="chat-header-right">
                <div className="verified-badge">✓ Verified</div>
                <div className="member-count">{activeRoom.online} raiders</div>
                <button className="btn btn-warn" style={{fontSize:11}}>⚡ Start Raid</button>
              </div>
            </div>

            <div className="messages">
              <div className="msg-system">raid room opened · {new Date().toLocaleDateString()}</div>
              {messages.map(msg => (
                <div key={msg.id} className="msg">
                  <Avatar name={msg.user} avIdx={msg.av} />
                  <div className="msg-body">
                    <div className="msg-meta">
                      <span className="msg-user" style={{color: AVATARS[msg.av % AVATARS.length].color}}>{msg.user}</span>
                      <span className={`msg-rank rank-${msg.rank}`}>{msg.rank}</span>
                      <span className="msg-time">{msg.time}</span>
                    </div>
                    <div className="msg-text">{msg.text}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="input-bar">
              <div className="input-wrap">
                <textarea
                  className="chat-input"
                  placeholder={`Message #${activeRoom.name.toLowerCase().replace("$","")} …`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
              </div>
              <button className="send-btn" onClick={sendMessage}>↑</button>
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel">
            <div className="panel-tabs">
              <div className={`panel-tab ${tab==="members"?"active":""}`} onClick={() => setTab("members")}>Members</div>
              <div className={`panel-tab ${tab==="leaderboard"?"active":""}`} onClick={() => setTab("leaderboard")}>Board</div>
            </div>
            <div className="panel-content">
              {tab === "members" ? (
                <>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",marginBottom:10}}>Online — {MEMBERS.filter(m=>m.status==="online").length}</div>
                  {MEMBERS.map(m => (
                    <div className="member-row" key={m.name}>
                      <Avatar name={m.name} avIdx={m.av} size={26} />
                      <span className="member-name" style={{color: m.rank==="legend"?"var(--gold)": m.rank==="raider"?"var(--acid2)":"var(--text)"}}>{m.name}</span>
                      <div className={`member-status status-${m.status}`} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",marginBottom:10}}>Top Raiders</div>
                  {LEADERBOARD.map(l => (
                    <div className="lb-row" key={l.name}>
                      <span className={`lb-rank ${l.rank<=3?"top"+l.rank:""}`}>{l.rank}</span>
                      <span className="lb-name">{l.name}</span>
                      <span className="lb-score">{l.score}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} className="ticker-item">
                <span className={t.includes("🟢") ? "ticker-green" : t.includes("🔴") ? "ticker-red" : ""}>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {spamAlert && <SpamAlert text={spamAlert} onDismiss={() => setSpamAlert(null)} />}
      </div>
    </>
  );
}