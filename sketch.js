let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let char2StopSprite; // 儲存角色二的待機精靈圖 2/stop/stop.png
let char2ActionSprite; // 儲存角色二的動作精靈圖 2/action/action.png
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 角色二精靈圖參數
const char2StopFrameCount = 6; // 2/stop/stop.png 共 6 張
const char2StopTotalWidth = 811; // 2/stop/stop.png 全寬 811
const char2StopFrameHeight = 171; // 高 171
const char2ActionFrameCount = 8; // 2/action/action.png 共 8 張
const char2ActionTotalWidth = 1019; // 2/action/action.png 全寬 1019
const char2ActionFrameHeight = 195; // 高 195

function preload() { // 在畫布建立前載入圖片資源
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖
  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的六格待機精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的八格動作精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格的中心點
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色避免圖片載入前空白

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍（允許捲動到最左邊 i = -1 與最右邊 i = 1 的背景圖）
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = 1; // 設定角色朝向右方
    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep; // 讓角色向右移動
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = -1; // 設定角色朝向左方
    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep; // 讓角色向左移動
    }
  }

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左：i = -1，中：i = 0，右：i = 1）
  if (bgImage) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // 計算角色二位置（位於最左邊背景圖 i = -1 的水平中心，自然位於角色一左方）
  const leftBgX = bgOffsetX - singleBgWidth;
  const char2X = leftBgX + singleBgWidth / 2;

  // 依角色高度比例縮放角色二，並判斷角色一是否接近
  const char2Scale = characterHeight / char2StopFrameHeight;
  const char2StopFw = char2StopTotalWidth / char2StopFrameCount;
  const char2BaseWidth = char2StopFw * char2Scale;
  const proximityThreshold = max(220, (characterWidth + char2BaseWidth) * 0.9);
  const isChar1NearChar2 = abs(characterX - char2X) <= proximityThreshold;

  // 繪製角色二：接近時改播 action，遠離時恢復 stop；角色一在角色二左邊時水平翻轉
  if (char2StopSprite && char2ActionSprite) {
    const useAction = isChar1NearChar2;
    const c2Sprite = useAction ? char2ActionSprite : char2StopSprite;
    const c2Count = useAction ? char2ActionFrameCount : char2StopFrameCount;
    const c2TotalW = useAction ? char2ActionTotalWidth : char2StopTotalWidth;
    const c2Fh = useAction ? char2ActionFrameHeight : char2StopFrameHeight;

    const c2FrameIndex = floor(frameCount / framesPerStep) % c2Count;
    const c2SourceX = Math.round((c2FrameIndex * c2TotalW) / c2Count);
    const c2NextSourceX = Math.round(((c2FrameIndex + 1) * c2TotalW) / c2Count);
    const c2SourceW = c2NextSourceX - c2SourceX;

    const c2DrawWidth = c2SourceW * char2Scale;
    const c2DrawHeight = c2Fh * char2Scale;
    const char2Y = height - c2DrawHeight / 2;
    const char2Facing = characterX < char2X ? -1 : 1; // 角色一在角色二左邊時轉向

    push();
    translate(char2X, char2Y);
    scale(char2Facing, 1);
    image(c2Sprite, 0, 0, c2DrawWidth, c2DrawHeight, c2SourceX, 0, c2SourceW, c2Fh);
    pop();
  }

  // 檢查施法動畫是否已完整播放一次
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) {
    isCasting = false; // 結束施法動畫並恢復一般角色動作
    activeEffects.push({
      x: characterX + (magicDirection * characterWidth) / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    }); // 在角色前方建立朝施法方向飛行的特效
  }

  // 繪製角色一
  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite;
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite;
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth;
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight;
  const elapsedMagicFrames = frameCount - magicStartFrame;
  const frameIndex = isCasting
    ? floor(elapsedMagicFrames / framesPerStep)
    : floor(frameCount / framesPerStep) % activeFrameCount;
  const sourceX = frameIndex * activeFrameWidth;
  const activeWidth = activeFrameWidth * characterScale;
  const activeHeight = activeFrameHeight * characterScale;
  const characterY = height - activeHeight / 2;

  push();
  translate(characterX, characterY);
  scale(isCasting ? magicDirection : facingDirection, 1);
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight);
  pop();

  // 更新並繪製飛行中的魔法特效
  const effectScale = characterScale;
  const effectSpeed = constrain(width * 0.008, 5, 14);
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    const eff = activeEffects[i];
    eff.x += eff.direction * effectSpeed;

    const effFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount;
    const effSourceX = effFrameIndex * effectFrameWidth;
    const effDrawWidth = effectFrameWidth * effectScale;
    const effDrawHeight = effectFrameHeight * effectScale;

    push();
    translate(eff.x, eff.y);
    scale(eff.direction, 1);
    image(magicEffectSprite, 0, 0, effDrawWidth, effDrawHeight, effSourceX, 0, effectFrameWidth, effectFrameHeight);
    pop();

    // 移除超出畫布範圍的特效
    if (eff.x < -effDrawWidth || eff.x > width + effDrawWidth) {
      activeEffects.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === " " && !spaceIsDown && !isCasting) {
    spaceIsDown = true;
    isCasting = true;
    magicStartFrame = frameCount;
    magicDirection = facingDirection;
  }
}

function keyReleased() {
  if (key === " ") {
    spaceIsDown = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}