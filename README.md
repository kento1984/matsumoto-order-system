# マツモト産業 受付管理システム

顧客からの注文・見積依頼を受け付けるWebフォームシステム

## 機能

- 顧客フォーム（注文・見積依頼・問い合わせ）
- 顧客マスタ（メールアドレスで検索）
- お気に入り機能（商品登録・呼び出し）
- 確認メール自動送信（Outlook/SMTP）
- CSV出力（Excel Power Query用）
- スマホ対応

## セットアップ

### 1. 依存関係インストール

npm install

### 2. 環境変数設定

.env.exampleを.envにコピーして、メール情報を設定してください

EMAIL_USER=your-email@mac-exe.co.jp
EMAIL_PASS=your-password

### 3. ローカル起動

npm start

ブラウザで http://localhost:3000 にアクセス

## Excel連携

### Power Query設定

1. Excel → データタブ → データの取得 → Webから
2. URL: https://your-app.onrender.com/data.csv
3. 接続の作成のみ → テーブル作成

### VBAで更新

Sub RefreshData()
    ActiveWorkbook.Connections("受付データ").Refresh
    MsgBox "更新完了"
End Sub

## Renderデプロイ

1. GitHubにpush
2. Renderで「New Web Service」
3. GitHubリポジトリを選択
4. 環境変数を設定（EMAIL_USER、EMAIL_PASS）
5. デプロイ

## URL

- フォーム: https://your-app.onrender.com/
- CSV出力: https://your-app.onrender.com/data.csv

## 開発者

マツモト産業株式会社 京葉営業所
