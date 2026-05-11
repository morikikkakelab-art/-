#!/usr/bin/env python3
"""
Notion データベース操作の例

Claude Code から実行可能な Notion 操作のサンプルコード
Notion MCP を使用した自動化の実装例を示します。
"""

# 使用予定の Notion データベース ID マップ
NOTION_DATABASES = {
    # 00_全体共通・管理
    "財務管理": "collection://75523e47-dc42-4f94-a067-4f2e18be325c",
    "技術・商品企画": "collection://a1a342a3-61b7-4b39-a717-86a017e7c903",
    "事業改善": "collection://fed8b7e2-d179-4756-b1fe-9e55d4975348",
    "指示事項": "collection://166acbc8-ff9d-4785-b310-5601c1b74d5a",

    # 01_きっかけMedia / SNSマーケティング事業
    "SNS_営業管理": "collection://2c9dd487-430c-4f61-b7b8-0c66f6836fbf",
    "HPコラム制作": "collection://5a196a82-85e5-46f9-9b67-cd2f0f2b14d9",
    "SNS運用_社外": "collection://c0e92f46-78f4-437b-81db-fe9363d2e054",
    "SNS運用_社内": "collection://fe13f3ab-b399-4514-9dd2-440fd4dea55a",

    # 01_きっかけMedia / クリエイティブ事業
    "CC_営業管理": "collection://c1f38609-0048-4809-ba6e-c0e4e69e5c1e",
    "note制作": "collection://17f909cc-1c4a-4530-9725-758147e54175",
    "CC_SNS運用_社外": "collection://f5e9abea-d4bd-4f2d-8533-e3a551709a95",

    # 99_社内・組織
    "社員リスト": "collection://d83d3ada-b8ee-4636-887c-c12064d8637b",
    "日報・日記": "collection://3796bc18-ff5a-493e-9f6b-dc532a97b3f6",
    "ナレッジ共有": "collection://8e79c446-0e85-4919-8ff1-6137bc634a5d",
}


# ===== 営業管理への追加例 =====
def add_sales_opportunity(
    client_name: str,
    project_name: str,
    amount: float,
    status: str = "見込",
    assigned_to: str = None,
    deadline: str = None,
) -> dict:
    """
    営業案件を追加

    Args:
        client_name: クライアント名
        project_name: 案件名
        amount: 契約金額
        status: ステータス（見込/提案中/受注/進行中/完了）
        assigned_to: 営業担当者
        deadline: 期限（YYYY-MM-DD形式）

    Returns:
        作成されたページ情報

    使用例:
        add_sales_opportunity(
            client_name="ABC株式会社",
            project_name="SNS運用代行",
            amount=500000,
            status="提案中",
            assigned_to="太郎",
            deadline="2026-06-30"
        )
    """
    properties = {
        "案件名": project_name,
        "クライアント": client_name,
        "ステータス": status,
        "契約金額": amount,
    }

    if assigned_to:
        properties["営業担当"] = assigned_to

    if deadline:
        properties["date:期限:start"] = deadline

    # 実装時: notion_create_pages() を呼び出し
    # return create_notion_page(
    #     database_id=NOTION_DATABASES["SNS_営業管理"],
    #     properties=properties,
    # )


# ===== コンテンツ制作管理への追加例 =====
def add_article_task(
    title: str,
    category: str,
    author: str = None,
    publish_date: str = None,
    status: str = "企画中",
) -> dict:
    """
    記事制作タスクを追加

    Args:
        title: 記事タイトル
        category: カテゴリ（HPコラム/note等）
        author: 執筆者
        publish_date: 公開予定日（YYYY-MM-DD形式）
        status: ステータス（企画中/執筆中/編集中/公開済）

    Returns:
        作成されたページ情報

    使用例:
        add_article_task(
            title="SNS運用のコツ",
            category="HPコラム制作",
            author="田中花子",
            publish_date="2026-06-15",
            status="執筆中"
        )
    """
    db_key = category if category in NOTION_DATABASES else "HPコラム制作"

    properties = {
        "記事タイトル": title,
        "ステータス": status,
    }

    if author:
        properties["執筆者"] = author

    if publish_date:
        properties["date:公開予定日:start"] = publish_date

    # 実装時: notion_create_pages() を呼び出し


# ===== SNS投稿スケジュールへの追加例 =====
def schedule_sns_post(
    content: str,
    platform: str,
    scheduled_date: str,
    target_audience: str = "社外",
    status: str = "スケジュール済",
    reach: int = None,
) -> dict:
    """
    SNS投稿をスケジュール

    Args:
        content: 投稿内容
        platform: プラットフォーム（Twitter/Instagram/Facebook等）
        scheduled_date: 投稿予定日（YYYY-MM-DD形式）
        target_audience: 対象（社外/社内）
        status: ステータス（下書き/スケジュール済/公開済）
        reach: リーチ数（公開後に更新用）

    Returns:
        作成されたページ情報

    使用例:
        schedule_sns_post(
            content="今月のキャンペーン情報をお知らせします...",
            platform="Twitter",
            scheduled_date="2026-05-15",
            target_audience="社外",
            status="スケジュール済"
        )
    """
    db_key = "SNS運用_社外" if target_audience == "社外" else "SNS運用_社内"

    properties = {
        "投稿内容": content,
        "プラットフォーム": platform,
        "ステータス": status,
    }

    if scheduled_date:
        properties["date:投稿予定日:start"] = scheduled_date

    if reach:
        properties["リーチ数"] = reach

    # 実装時: notion_create_pages() を呼び出し


# ===== KPI・財務情報の更新例 =====
def update_kpi_metrics(
    kpi_name: str,
    current_value: float,
    target_value: float,
    progress_rate: float,
    measurement_date: str,
) -> dict:
    """
    KPI指標を更新

    Args:
        kpi_name: KPI項目名
        current_value: 現在値
        target_value: 目標値
        progress_rate: 進捗率（0-100）
        measurement_date: 計測日（YYYY-MM-DD形式）

    Returns:
        更新結果
    """
    properties = {
        "KPI項目": kpi_name,
        "現在値": str(current_value),
        "目標値": str(target_value),
        "進捗率": progress_rate,
    }

    if measurement_date:
        properties["date:計測日:start"] = measurement_date

    # 実装時: notion_create_pages() を呼び出し


# ===== 指示事項の追加例 =====
def add_instruction(
    instruction: str,
    priority: str = "中",
    assigned_to: str = None,
    deadline: str = None,
    details: str = None,
) -> dict:
    """
    指示事項を追加

    Args:
        instruction: 指示内容
        priority: 優先度（高/中/低）
        assigned_to: 担当者
        deadline: 期限（YYYY-MM-DD形式）
        details: 詳細

    Returns:
        作成されたページ情報

    使用例:
        add_instruction(
            instruction="月次報告書の作成",
            priority="高",
            assigned_to="太郎",
            deadline="2026-05-31",
            details="5月分の営業実績をまとめてください"
        )
    """
    properties = {
        "指示内容": instruction,
        "ステータス": "新規",
        "優先度": priority,
    }

    if assigned_to:
        properties["担当者"] = assigned_to

    if deadline:
        properties["date:期限:start"] = deadline

    if details:
        properties["詳細"] = details

    # 実装時: notion_create_pages() を呼び出し


# ===== ナレッジ共有への追加例 =====
def add_knowledge(
    title: str,
    content: str,
    category: str,
    author: str = None,
    tags: str = None,
    creation_date: str = None,
) -> dict:
    """
    ナレッジを共有

    Args:
        title: タイトル
        content: 内容
        category: カテゴリ（技術/マーケティング/セールス/運用/その他）
        author: 作成者
        tags: タグ（カンマ区切り）
        creation_date: 作成日（YYYY-MM-DD形式）

    Returns:
        作成されたページ情報

    使用例:
        add_knowledge(
            title="SNS運用における効果測定の方法",
            content="SNS運用の成果を測定するために...",
            category="マーケティング",
            author="田中花子",
            tags="SNS,マーケティング,効果測定",
            creation_date="2026-05-11"
        )
    """
    properties = {
        "タイトル": title,
        "内容": content,
        "カテゴリ": category,
    }

    if author:
        properties["作成者"] = author

    if tags:
        properties["タグ"] = tags

    if creation_date:
        properties["date:作成日:start"] = creation_date

    # 実装時: notion_create_pages() を呼び出し


# ===== 実装時の注意事項 =====
"""
実装時には以下の対応が必要です：

1. Notion MCP の設定確認
   - claude_code/settings.json で Notion が有効化されているか確認
   - Notion トークンが正しく設定されているか確認

2. エラーハンドリング
   - ネットワークエラーの処理
   - バリデーション（日付形式、ステータス値等）
   - API レート制限への対応

3. ロギング
   - 各操作を記録して、監査ログを保持

4. トランザクション
   - 複数の操作が必要な場合は、一貫性を保つ

使用例:
    from notion_integration_examples import add_sales_opportunity

    add_sales_opportunity(
        client_name="ABC株式会社",
        project_name="新規SNS運用",
        amount=300000,
        status="提案中",
        assigned_to="営業部",
        deadline="2026-06-15"
    )
"""
