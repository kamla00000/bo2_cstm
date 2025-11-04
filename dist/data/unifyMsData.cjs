const fs = require('fs');
const src = JSON.parse(fs.readFileSync('msData_unified.json', 'utf8'));

// スピード・高速移動キー統一
const unified = src.map(ms => {
  // スピード
  const speed = ms["スピード"] ?? ms["スピード_通常時"] ?? ms["speed"];
  if (speed !== undefined) ms["スピード"] = speed;
  // 高速移動
  const highSpeed = ms["高速移動"] ?? ms["高速移動_通常時"] ?? ms["highSpeedMovement"];
  if (highSpeed !== undefined) ms["高速移動"] = highSpeed;

  // 不要なバリエーションキー削除
  delete ms["スピード_通常時"];
  delete ms["speed"];
  delete ms["高速移動_通常時"];
  delete ms["highSpeedMovement"];

  return ms;
});

fs.writeFileSync('msData_unified.json', JSON.stringify(unified, null, 2));
console.log('スピード・高速移動キー統一完了: msData_unified.json を出力しました');