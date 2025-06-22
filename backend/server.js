// server.js

// 必要なモジュールを読み込み
const express = require('express');               // WebサーバーのためのExpressフレームワーク
const bodyParser = require('body-parser');        // JSONボディをパースするミドルウェア
require('dotenv').config();                       // .envファイルから環境変数を読み込み（開発時用）

// fetch() をCommonJSで使うための定義（Node.js v18+）
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Expressアプリケーションを初期化
const app = express();

// JSONデータを受け取るための設定
app.use(bodyParser.json());

// .envまたはHeroku環境変数に設定されたDiscord Webhook URL
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Herokuの指定ポートまたはローカル開発用に3000
const PORT = process.env.PORT || 3000;

// POSTエンドポイント '/notify' を定義
app.post('/notify', async (req, res) => {
  const message = req.body.message;

  // messageが未定義の場合は400エラー
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // Discord Webhookに通知を送信
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    // Discord側のレスポンスが正常でない場合
    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status}`);
    }

    // 成功レスポンスを返す
    res.json({ success: true });
  } catch (err) {
    // エラー発生時の処理
    console.error('エラー:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// サーバー起動
app.listen( PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
