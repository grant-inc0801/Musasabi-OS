以下は、指定されたタスクに基づいて作成された技術指示書です。Markdown形式で記述されています。

```markdown
# 技術指示書: AIパイプライン `unhashable type: 'dict'` エラーの修正

## 概要

この技術指示書では、AIパイプラインにおいて発生した `TypeError: unhashable type: 'dict'` エラーを解決するための手順を詳細に記載します。このエラーは、Pythonのコード内で辞書型を集合（`set`）に含めた場合などに発生します。過去の修正にもかかわらず再発しているため、全箇所特定と修正を行います。

## 実施内容

### 1. 該当箇所の全検索

以下のパターンをリポジトリ全体で検索し、辞書型を集合に含めている箇所を特定します。

- `{{`
- `set(`
- `labels = {`
- `assignees = {`
- `issue = {`
- `tasks = {`
- `headers = {`
- `payload = {`

### 2. `dict` を `set` に入れている箇所の修正

Pythonコード内で辞書型を集合に含めている箇所をすべて以下のように修正します。

#### NG例
```python
labels = {
  {"name": "task"}
}
```

#### OK例
```python
labels = [
  {"name": "task"}
]
```

### 3. GitHub Issue作成処理の `payload` を確認

GitHub APIのIssue作成部分での`payload`を以下のように修正・確認します。

#### NG例
```python
payload = {
  {"title": title, "body": body}
}
```

#### OK例
```python
payload = {
  "title": title,
  "body": body
}
```

### 4. エラー発生箇所が分かるようにログを追加

以下の情報をログに出力することで、エラー箇所を特定しやすくします。

- 生成された `title`
- `body` の先頭200文字
- `labels` の型
- `payload` の型
- GitHub APIへ送信する直前の `payload`

### 5. 修正後のAIパイプラインの再実行と成功確認

修正が完了した後、AIパイプラインを再実行し、以下の成功条件が満たされていることを確認します。

## 完了条件

- `TypeError: unhashable type: 'dict'` が発生しないこと
- 「ChatGPT - 次のタスクを生成してループする」が正常に機能すること
- 次のIssueが正常に作成されていること
- 修正内容を `CHANGELOG.md` に記録すること

---

以上の指示に従って作業を行い、問題の解決およびリファクタリングをしてください。
```

これが今後の修正のための技術指示書になります。この指示書に従って、全ての箇所を特定および修正を行ってください。