# API仕様

作成日: 2026-10-04

---

## 概要

ベースURL: `http://localhost:3000/api`

---

## エンドポイント一覧

### カラム（Columns）

| メソッド | エンドポイント | 処理内容 |
|---------|--------------|---------|
| GET | `/columns` | 全カラムをカード込みで取得 |
| POST | `/columns` | カラムを新規作成 |
| PUT | `/columns/:id` | カラムタイトルを更新 |
| PUT | `/columns/:id/position` | カラムの表示順を更新 |
| DELETE | `/columns/:id` | カラムを削除（カードも連鎖削除） |

### カード（Cards）

| メソッド | エンドポイント | 処理内容 |
|---------|--------------|---------|
| POST | `/columns/:id/cards` | 指定カラムにカードを新規作成 |
| PUT | `/cards/:id` | カードの詳細（タイトル・説明・期限・優先度）を更新 |
| PUT | `/cards/:id/move` | カードを別カラムに移動 |
| DELETE | `/cards/:id` | カードを削除 |

---

## リクエスト / レスポンス詳細

### GET /api/columns

全カラムを、配下のカードを含む形で取得する。

**レスポンス例**
```json
[
  {
    "id": 1,
    "title": "Todo",
    "position": 0,
    "cards": [
      {
        "id": 1,
        "column_id": 1,
        "title": "タスクタイトル",
        "description": "詳細説明",
        "due_date": "2026-10-10",
        "priority": "high",
        "position": 0
      }
    ]
  }
]
```

---

### POST /api/columns

カラムを新規作成する。

**リクエストボディ**
```json
{ "title": "新しいカラム" }
```

**レスポンス例**
```json
{ "id": 4, "title": "新しいカラム", "position": 3 }
```

---

### PUT /api/columns/:id

カラムのタイトルを更新する。

**リクエストボディ**
```json
{ "title": "更新後のタイトル" }
```

---

### DELETE /api/columns/:id

カラムと配下のカードを削除する（`ON DELETE CASCADE`）。

---

### POST /api/columns/:id/cards

指定カラムにカードを新規作成する。

**リクエストボディ**
```json
{ "title": "新しいカード" }
```

**レスポンス例**
```json
{ "id": 10, "column_id": 1, "title": "新しいカード", "position": 2 }
```

---

### PUT /api/cards/:id

カードの詳細情報を更新する。

**リクエストボディ**（変更するフィールドのみ送信可）
```json
{
  "title": "更新後タイトル",
  "description": "詳細説明",
  "due_date": "2026-11-01",
  "priority": "high"
}
```

---

### PUT /api/cards/:id/move

カードを別カラムに移動する。

**リクエストボディ**
```json
{ "column_id": 2, "position": 0 }
```

---

### DELETE /api/cards/:id

カードを削除する。
