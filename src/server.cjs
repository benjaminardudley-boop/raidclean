const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const users = new Map();
const rooms = new Map();

app.get('/auth/x', (req, res) => {
  const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.X_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=tweet.read%20users.read%20offline.access&state=state123&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.X_CLIENT_ID,
        client_secret: process.env.X_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code_verifier: 'challenge'
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const xUser = userRes.data.data;
    const token = jwt.sign({ xId: xUser.id, username: xUser.username }, process.env.JWT_SECRET);
    users.set(xUser.id, { username: xUser.username, accessToken });

    res.redirect(`http://localhost:5173/?token=${token}&xId=${xUser.id}`);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).send('Auth failed');
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) { next(new Error('Auth error')); }
});

io.on('connection', (socket) => {
  console.log('Connected:', socket.user.username);

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room).add(socket.user.xId);
    io.to(room).emit('userJoined', { username: socket.user.username });
  });

  socket.on('chatMessage', (msg) => {
    if (rooms.get(msg.room)?.has(socket.user.xId)) {
      io.to(msg.room).emit('chatMessage', {
        user: socket.user.username,
        text: msg.text,
        time: Date.now()
      });
    }
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(process.env.PORT || 3000, () => {
  console.log('RaidClean server running on port 3000');
});