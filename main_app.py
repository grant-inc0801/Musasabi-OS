```python
# 検索箇所の修正例

# 辞書型をリストに含める
labels = [
  {"name": "task"}
]

# GitHub Issue作成処理のpayloadを修正
payload = {
  "title": title,
  "body": body
}

# エラー発生箇所にログ出力を追加
print("Generated title:", title)
print("Body preview:", body[:200])
print("Type of labels:", type(labels))
print("Type of payload:", type(payload))
print("Payload before sending to GitHub API:", payload)
```