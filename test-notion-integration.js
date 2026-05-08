#!/usr/bin/env node

/**
 * Notion API 連携テストスクリプト
 * - API接続テスト
 * - ユーザー情報取得テスト
 * - データベース作成テスト
 * - ページ作成テスト
 */

const https = require('https');

const ACCESS_TOKEN = process.env.NOTION_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error('❌ エラー: NOTION_ACCESS_TOKEN 環境変数を設定してください');
  console.error('例: export NOTION_ACCESS_TOKEN="your_token_here"');
  process.exit(1);
}

const NOTION_API_VERSION = '2024-06-15';

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
            reject(new Error(`API Error (${res.statusCode}): ${json.message || data}`));
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

async function testAPIConnection() {
  console.log('\n📡 テスト 1: Notion API 接続テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await makeRequest('GET', '/users/me');
    console.log('✅ API接続成功');
    console.log(`   ボット名: ${response.name || 'N/A'}`);
    console.log(`   ボットID: ${response.id}`);
    return response;
  } catch (error) {
    console.error('❌ API接続失敗:', error.message);
    throw error;
  }
}

async function testDatabaseCreation(parentPageId) {
  console.log('\n📊 テスト 2: データベース作成テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testDbName = `テストDB_${new Date().getTime()}`;

  const dbBody = {
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: testDbName } }],
    properties: {
      'タイトル': { title: {} },
      'ステータス': {
        select: {
          options: [
            { name: '新規', color: 'blue' },
            { name: '進行中', color: 'yellow' },
            { name: '完了', color: 'green' }
          ]
        }
      },
      '日付': { date: {} },
      '数値': { number: { format: 'number' } }
    }
  };

  try {
    const response = await makeRequest('POST', '/databases', dbBody);
    console.log('✅ データベース作成成功');
    console.log(`   DB名: ${testDbName}`);
    console.log(`   DBID: ${response.id}`);
    return response;
  } catch (error) {
    console.error('❌ データベース作成失敗:', error.message);
    throw error;
  }
}

async function testPageCreation(databaseId) {
  console.log('\n📄 テスト 3: ページ（エントリ）作成テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const pageBody = {
    parent: { database_id: databaseId },
    properties: {
      'タイトル': {
        title: [
          { text: { content: 'テストエントリ' } }
        ]
      },
      'ステータス': {
        select: { name: '新規' }
      },
      '日付': {
        date: { start: new Date().toISOString().split('T')[0] }
      },
      '数値': {
        number: 42
      }
    }
  };

  try {
    const response = await makeRequest('POST', '/pages', pageBody);
    console.log('✅ ページ作成成功');
    console.log(`   ページID: ${response.id}`);
    console.log(`   URL: ${response.url}`);
    return response;
  } catch (error) {
    console.error('❌ ページ作成失敗:', error.message);
    throw error;
  }
}

async function testDatabaseQuery(databaseId) {
  console.log('\n🔍 テスト 4: データベースクエリテスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await makeRequest('POST', `/databases/${databaseId}/query`, {});
    console.log('✅ クエリ実行成功');
    console.log(`   取得件数: ${response.results.length}`);
    if (response.results.length > 0) {
      console.log(`   最初のエントリID: ${response.results[0].id}`);
    }
    return response;
  } catch (error) {
    console.error('❌ クエリ実行失敗:', error.message);
    throw error;
  }
}

async function runAllTests(parentPageId) {
  console.log('\n🚀 Notion API 連携テストを開始します');
  console.log('═══════════════════════════════════════');

  const results = {
    connection: null,
    databaseCreation: null,
    pageCreation: null,
    query: null
  };

  try {
    // テスト 1: API接続
    results.connection = await testAPIConnection();

    // テスト 2: データベース作成
    const db = await testDatabaseCreation(parentPageId);
    results.databaseCreation = db;

    // テスト 3: ページ作成
    const page = await testPageCreation(db.id);
    results.pageCreation = page;

    // テスト 4: クエリ実行
    const query = await testDatabaseQuery(db.id);
    results.query = query;

    console.log('\n\n📋 テスト結果サマリー');
    console.log('═══════════════════════════════════════');
    console.log('✅ すべてのテストが成功しました！\n');
    console.log('テスト内容:');
    console.log('  ✓ Notion API接続');
    console.log('  ✓ データベース作成');
    console.log('  ✓ ページ作成');
    console.log('  ✓ データベースクエリ');
    console.log('\n作成されたテスト用リソース:');
    console.log(`  - データベースID: ${db.id}`);
    console.log(`  - ページID: ${page.id}`);

    return results;

  } catch (error) {
    console.log('\n\n❌ テスト失敗');
    console.log('═══════════════════════════════════════');
    console.log(`エラー: ${error.message}\n`);
    console.log('トラブルシューティング:');
    console.log('1. NOTION_ACCESS_TOKEN が正しく設定されているか確認');
    console.log('2. トークンの有効期限を確認');
    console.log('3. Notion インテグレーションに必要な権限があるか確認');
    process.exit(1);
  }
}

// 親ページIDを環境変数から取得、または使用可能なワークスペースを探す
async function getOrCreateTestPage() {
  if (process.env.NOTION_PARENT_PAGE_ID) {
    return process.env.NOTION_PARENT_PAGE_ID;
  }

  console.log('⚠️  NOTION_PARENT_PAGE_ID が設定されていません');
  console.log('テストを実行するには、以下の環境変数を設定してください:');
  console.log('  export NOTION_PARENT_PAGE_ID="your_page_id"');
  console.log('\nNotion ページIDの取得方法:');
  console.log('1. Notion でページを開く');
  console.log('2. URL から32文字のID部分をコピー');
  console.log('   例: https://notion.so/[32文字のID]?v=...');
  process.exit(1);
}

async function main() {
  const parentPageId = await getOrCreateTestPage();
  await runAllTests(parentPageId);
}

main().catch(console.error);
