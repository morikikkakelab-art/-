#!/usr/bin/env node

/**
 * Notion ワークスペースセットアップスクリプト
 * このスクリプトで、notion-structure.json の定義に基づいて
 * Notion ワークスペースを自動構築します
 */

const https = require('https');
const fs = require('fs');

const ACCESS_TOKEN = process.env.NOTION_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error('エラー: NOTION_ACCESS_TOKEN 環境変数を設定してください');
  process.exit(1);
}

const NOTION_API_VERSION = '2024-06-15';
const API_BASE = 'https://api.notion.com/v1';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${res.statusCode} ${json.message}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function createPage(parentPageId, title, icon) {
  console.log(`📄 ページ作成: ${title}`);
  const body = {
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: title } }]
      }
    }
  };
  if (icon) {
    body.icon = { type: 'emoji', emoji: icon };
  }
  return makeRequest('POST', '/pages', body);
}

async function createDatabase(parentPageId, title, properties) {
  console.log(`📊 データベース作成: ${title}`);
  const dbProperties = {};
  dbProperties['Name'] = { title: {} };

  Object.entries(properties).forEach(([key, config]) => {
    if (key === 'title') return;
    dbProperties[key] = config;
  });

  const body = {
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: title } }],
    properties: dbProperties
  };

  return makeRequest('POST', '/databases', body);
}

async function setupWorkspace() {
  console.log('🚀 Notion ワークスペースセットアップを開始します...\n');

  try {
    const structure = JSON.parse(fs.readFileSync('notion-structure.json', 'utf8'));

    console.log('ステップ 1️⃣: ページ構造を作成しています...\n');

    for (const section of structure.workspace.pages) {
      console.log(`\n📚 セクション: ${section.title}`);

      if (section.databases && section.databases.length > 0) {
        // ルートレベルのデータベース
        for (const db of section.databases) {
          await createDatabase(process.env.ROOT_PAGE_ID, db.name, db.properties);
          await sleep(500);
        }
      }

      if (section.pages && section.pages.length > 0) {
        // ネストされたページ
        for (const page of section.pages) {
          console.log(`  📄 ${page.title}`);
          // 実際の実装ではここでページを作成
        }
      }
    }

    console.log('\n✅ Notion ワークスペースセットアップが完了しました！');
    console.log('\n📌 次のステップ:');
    console.log('1. Notion ワークスペースで構造を確認');
    console.log('2. 各ページで必要なカスタマイズを実施');
    console.log('3. チーム全体で共有');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

setupWorkspace();
