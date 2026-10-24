param(
  [int]$IntervalMinutes = 30
)

Set-Location -LiteralPath $PSScriptRoot
node ".\update-cache.js" --watch "--interval-minutes=$IntervalMinutes"
