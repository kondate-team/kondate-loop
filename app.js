const weekGrid = document.getElementById("weekGrid");
const landingSection = document.getElementById("landing");
const appSection = document.getElementById("app");
const recipesSection = document.getElementById("recipes");
const publicRecipesSection = document.getElementById("publicRecipes");
const weeklySetsSection = document.getElementById("weeklySets");
const enterAppButton = document.getElementById("enterApp");
const enterRecipesButton = document.getElementById("enterRecipes");
const backToLandingButton = document.getElementById("backToLanding");
const openRecipesFromAppButton = document.getElementById("openRecipesFromApp");
const backToLandingFromRecipesButton = document.getElementById(
  "backToLandingFromRecipes",
);
const openAppFromRecipesButton = document.getElementById("openAppFromRecipes");
const weekStartInput = document.getElementById("weekStart");
const weekRange = document.getElementById("weekRange");
const saveStatus = document.getElementById("saveStatus");
const prevWeekButton = document.getElementById("prevWeek");
const nextWeekButton = document.getElementById("nextWeek");
const thisWeekButton = document.getElementById("thisWeek");
const clearWeekButton = document.getElementById("clearWeek");
const shoppingList = document.getElementById("shoppingList");
const shoppingEmpty = document.getElementById("shoppingEmpty");

const recipeForm = document.getElementById("recipeForm");
const recipeFormTitle = document.getElementById("recipeFormTitle");
const recipeNameInput = document.getElementById("recipeName");
const recipeUrlInput = document.getElementById("recipeUrl");
const recipeServingsInput = document.getElementById("recipeServings");
const ingredientList = document.getElementById("ingredientList");
const ingredientAddButton = document.getElementById("ingredientAdd");
const recipeSaveButton = document.getElementById("recipeSave");
const recipeCancelButton = document.getElementById("recipeCancel");
const recipeSearchInput = document.getElementById("recipeSearch");
const recipeList = document.getElementById("recipeList");
const recipeEmpty = document.getElementById("recipeEmpty");
const recipeModal = document.getElementById("recipeModal");
const recipeModalBackdrop = document.getElementById("recipeModalBackdrop");
const recipeModalForm = document.getElementById("recipeModalForm");
const recipeModalNameInput = document.getElementById("recipeModalName");
const recipeModalUrlInput = document.getElementById("recipeModalUrl");
const recipeModalServingsInput = document.getElementById("recipeModalServings");
const recipeModalIngredientList = document.getElementById("recipeModalIngredientList");
const recipeModalIngredientAddButton = document.getElementById("recipeModalIngredientAdd");
const recipeModalCancelButton = document.getElementById("recipeModalCancel");
const recipeModalCloseButton = document.getElementById("recipeModalClose");
const recipeFetchButton = document.getElementById("recipeFetch");
const recipeFetchStatus = document.getElementById("recipeFetchStatus");
const recipeTextToggle = document.getElementById("recipeTextToggle");
const recipeTextArea = document.getElementById("recipeTextArea");
const recipeTextInput = document.getElementById("recipeTextInput");
const recipeTextParse = document.getElementById("recipeTextParse");

const recipeModalFetchButton = document.getElementById("recipeModalFetch");
const recipeModalFetchStatus = document.getElementById("recipeModalFetchStatus");
const recipeModalTextToggle = document.getElementById("recipeModalTextToggle");
const recipeModalTextArea = document.getElementById("recipeModalTextArea");
const recipeModalTextInput = document.getElementById("recipeModalTextInput");
const recipeModalTextParse = document.getElementById("recipeModalTextParse");
const recipeModalInstructionsInput = document.getElementById("recipeModalInstructions");

const recipeInstructionsInput = document.getElementById("recipeInstructions");

const recipeTagInput = document.getElementById("recipeTagInput");
const recipeTagList = document.getElementById("recipeTagList");
const recipeModalTagInput = document.getElementById("recipeModalTagInput");
const recipeModalTagList = document.getElementById("recipeModalTagList");
const tagFilter = document.getElementById("tagFilter");
const tagFilterList = document.getElementById("tagFilterList");

// Public recipes elements
const publicRecipeSearch = document.getElementById("publicRecipeSearch");
const publicRecipeList = document.getElementById("publicRecipeList");
const publicRecipeEmpty = document.getElementById("publicRecipeEmpty");
const publicRecipeCount = document.getElementById("publicRecipeCount");
const publicTagFilter = document.getElementById("publicTagFilter");
const publicTagFilterList = document.getElementById("publicTagFilterList");
const backToLandingFromPublicButton = document.getElementById("backToLandingFromPublic");
const openAppFromPublicButton = document.getElementById("openAppFromPublic");

// Public recipes data (embedded to avoid CORS issues with file:// protocol)
const EMBEDDED_PUBLIC_RECIPES = [
  { id: "pub-001", name: "豚の生姜焼き", servings: 2, tags: ["和食", "定番", "豚肉", "時短"], ingredients: [{ name: "豚ロース薄切り", amount: 200, unit: "g" }, { name: "玉ねぎ", amount: 0.5, unit: "個" }, { name: "生姜", amount: 1, unit: "かけ" }, { name: "醤油", amount: 2, unit: "大さじ" }, { name: "酒", amount: 2, unit: "大さじ" }, { name: "みりん", amount: 1, unit: "大さじ" }, { name: "サラダ油", amount: 1, unit: "大さじ" }], instructions: "1. 生姜をすりおろし、醤油・酒・みりんと合わせてタレを作る\n2. 玉ねぎは薄切りにする\n3. フライパンで豚肉を焼き、玉ねぎを加える\n4. 火が通ったらタレを加えて絡める" },
  { id: "pub-002", name: "鶏の唐揚げ", servings: 2, tags: ["和食", "定番", "鶏肉", "揚げ物"], ingredients: [{ name: "鶏もも肉", amount: 300, unit: "g" }, { name: "醤油", amount: 2, unit: "大さじ" }, { name: "酒", amount: 1, unit: "大さじ" }, { name: "生姜", amount: 1, unit: "かけ" }, { name: "にんにく", amount: 1, unit: "かけ" }, { name: "片栗粉", amount: 4, unit: "大さじ" }, { name: "揚げ油", amount: 500, unit: "ml" }], instructions: "1. 鶏肉を一口大に切る\n2. すりおろした生姜・にんにく、醤油、酒で下味をつける（15分）\n3. 片栗粉をまぶして170℃の油で揚げる\n4. 一度取り出し、180℃で二度揚げしてカリッと仕上げる" },
  { id: "pub-003", name: "肉じゃが", servings: 2, tags: ["和食", "定番", "煮物", "牛肉"], ingredients: [{ name: "牛こま肉", amount: 150, unit: "g" }, { name: "じゃがいも", amount: 2, unit: "個" }, { name: "玉ねぎ", amount: 1, unit: "個" }, { name: "にんじん", amount: 0.5, unit: "本" }, { name: "しらたき", amount: 100, unit: "g" }, { name: "醤油", amount: 3, unit: "大さじ" }, { name: "砂糖", amount: 2, unit: "大さじ" }, { name: "酒", amount: 2, unit: "大さじ" }, { name: "だし汁", amount: 300, unit: "ml" }], instructions: "1. じゃがいも・玉ねぎ・にんじんを大きめに切る\n2. 牛肉を炒めてから野菜を加える\n3. だし汁、調味料を加えて落し蓋をして煮る\n4. 汁気が少なくなるまで煮込む" },
  { id: "pub-004", name: "麻婆豆腐", servings: 2, tags: ["中華", "定番", "豚肉", "時短"], ingredients: [{ name: "絹豆腐", amount: 1, unit: "丁" }, { name: "豚ひき肉", amount: 100, unit: "g" }, { name: "長ねぎ", amount: 0.5, unit: "本" }, { name: "にんにく", amount: 1, unit: "かけ" }, { name: "生姜", amount: 1, unit: "かけ" }, { name: "豆板醤", amount: 1, unit: "大さじ" }, { name: "甜麺醤", amount: 1, unit: "大さじ" }, { name: "鶏がらスープ", amount: 150, unit: "ml" }, { name: "片栗粉", amount: 1, unit: "大さじ" }, { name: "ごま油", amount: 1, unit: "大さじ" }], instructions: "1. 豆腐を2cm角に切り、軽く下茹でする\n2. にんにく・生姜・ねぎをみじん切りにする\n3. 油で香りを出し、ひき肉を炒める\n4. 豆板醤・甜麺醤を加え、スープで煮る\n5. 豆腐を入れて水溶き片栗粉でとろみをつける" },
  { id: "pub-005", name: "鮭のムニエル", servings: 2, tags: ["洋食", "魚", "時短"], ingredients: [{ name: "生鮭", amount: 2, unit: "切れ" }, { name: "塩", amount: 0.5, unit: "小さじ" }, { name: "こしょう", amount: 0.5, unit: "小さじ" }, { name: "小麦粉", amount: 2, unit: "大さじ" }, { name: "バター", amount: 20, unit: "g" }, { name: "レモン", amount: 0.5, unit: "個" }], instructions: "1. 鮭に塩・こしょうをして5分置く\n2. 水気を拭いて小麦粉をまぶす\n3. フライパンでバターを溶かし、鮭を両面焼く\n4. レモンを添えて完成" },
  { id: "pub-006", name: "親子丼", servings: 2, tags: ["和食", "定番", "丼", "鶏肉"], ingredients: [{ name: "鶏もも肉", amount: 150, unit: "g" }, { name: "玉ねぎ", amount: 0.5, unit: "個" }, { name: "卵", amount: 3, unit: "個" }, { name: "ご飯", amount: 2, unit: "膳" }, { name: "醤油", amount: 2, unit: "大さじ" }, { name: "みりん", amount: 2, unit: "大さじ" }, { name: "だし汁", amount: 100, unit: "ml" }, { name: "三つ葉", amount: 1, unit: "束" }], instructions: "1. 鶏肉を一口大に、玉ねぎを薄切りにする\n2. 鍋にだし汁・醤油・みりんを入れて煮立てる\n3. 鶏肉・玉ねぎを入れて火を通す\n4. 溶き卵を回し入れ、半熟で火を止める\n5. ご飯にのせて三つ葉を散らす" },
  { id: "pub-007", name: "回鍋肉", servings: 2, tags: ["中華", "定番", "豚肉", "野菜"], ingredients: [{ name: "豚バラ肉", amount: 150, unit: "g" }, { name: "キャベツ", amount: 4, unit: "枚" }, { name: "ピーマン", amount: 2, unit: "個" }, { name: "長ねぎ", amount: 0.5, unit: "本" }, { name: "にんにく", amount: 1, unit: "かけ" }, { name: "甜麺醤", amount: 2, unit: "大さじ" }, { name: "豆板醤", amount: 0.5, unit: "大さじ" }, { name: "酒", amount: 1, unit: "大さじ" }, { name: "サラダ油", amount: 1, unit: "大さじ" }], instructions: "1. キャベツをざく切り、ピーマンを乱切りにする\n2. 豚肉は食べやすい大きさに切る\n3. 強火で野菜を炒めて取り出す\n4. 豚肉を炒め、調味料を加える\n5. 野菜を戻して全体を炒め合わせる" },
  { id: "pub-008", name: "ハンバーグ", servings: 2, tags: ["洋食", "定番", "ひき肉"], ingredients: [{ name: "合びき肉", amount: 250, unit: "g" }, { name: "玉ねぎ", amount: 0.5, unit: "個" }, { name: "パン粉", amount: 3, unit: "大さじ" }, { name: "牛乳", amount: 2, unit: "大さじ" }, { name: "卵", amount: 1, unit: "個" }, { name: "塩", amount: 0.5, unit: "小さじ" }, { name: "こしょう", amount: 0.5, unit: "小さじ" }, { name: "ケチャップ", amount: 3, unit: "大さじ" }, { name: "ウスターソース", amount: 2, unit: "大さじ" }], instructions: "1. 玉ねぎをみじん切りにして炒め、冷ます\n2. パン粉を牛乳でふやかす\n3. ひき肉に全ての材料を混ぜ、よくこねる\n4. 小判型に成形し、中央をくぼませる\n5. 両面を焼き、蒸し焼きにして火を通す\n6. ケチャップとソースでソースを作る" },
  { id: "pub-009", name: "カレーライス", servings: 4, tags: ["洋食", "定番", "カレー"], ingredients: [{ name: "豚こま肉", amount: 200, unit: "g" }, { name: "玉ねぎ", amount: 2, unit: "個" }, { name: "じゃがいも", amount: 2, unit: "個" }, { name: "にんじん", amount: 1, unit: "本" }, { name: "カレールー", amount: 0.5, unit: "箱" }, { name: "水", amount: 700, unit: "ml" }, { name: "サラダ油", amount: 1, unit: "大さじ" }, { name: "ご飯", amount: 4, unit: "膳" }], instructions: "1. 野菜を一口大に切る\n2. 鍋で肉と野菜を炒める\n3. 水を加えてアクを取りながら煮込む\n4. 野菜が柔らかくなったら火を止めてルーを溶かす\n5. 弱火で10分煮込んで完成" },
  { id: "pub-010", name: "豚キムチ", servings: 2, tags: ["韓国", "豚肉", "時短"], ingredients: [{ name: "豚バラ肉", amount: 150, unit: "g" }, { name: "白菜キムチ", amount: 150, unit: "g" }, { name: "玉ねぎ", amount: 0.5, unit: "個" }, { name: "ニラ", amount: 0.5, unit: "束" }, { name: "ごま油", amount: 1, unit: "大さじ" }, { name: "醤油", amount: 0.5, unit: "大さじ" }], instructions: "1. 豚肉を食べやすい大きさに切る\n2. 玉ねぎは薄切り、ニラは5cm長さに切る\n3. フライパンで豚肉を炒める\n4. 玉ねぎを加え、キムチを入れて炒める\n5. 最後にニラを加え、醤油で味を調える" },
  { id: "pub-011", name: "チンジャオロース", servings: 2, tags: ["中華", "定番", "牛肉", "野菜"], ingredients: [{ name: "牛こま肉", amount: 150, unit: "g" }, { name: "ピーマン", amount: 3, unit: "個" }, { name: "たけのこ水煮", amount: 100, unit: "g" }, { name: "醤油", amount: 2, unit: "大さじ" }, { name: "オイスターソース", amount: 1, unit: "大さじ" }, { name: "酒", amount: 1, unit: "大さじ" }, { name: "片栗粉", amount: 1, unit: "大さじ" }, { name: "サラダ油", amount: 2, unit: "大さじ" }], instructions: "1. 牛肉を細切りにし、酒と片栗粉をもみ込む\n2. ピーマン・たけのこを細切りにする\n3. 強火で牛肉を炒めて取り出す\n4. 野菜を炒め、肉を戻す\n5. 調味料を加えて手早く炒め合わせる" },
  { id: "pub-012", name: "豆腐チャンプルー", servings: 2, tags: ["沖縄", "豆腐", "野菜", "時短"], ingredients: [{ name: "木綿豆腐", amount: 1, unit: "丁" }, { name: "豚バラ肉", amount: 100, unit: "g" }, { name: "もやし", amount: 1, unit: "袋" }, { name: "ニラ", amount: 0.5, unit: "束" }, { name: "卵", amount: 2, unit: "個" }, { name: "醤油", amount: 1, unit: "大さじ" }, { name: "顆粒だし", amount: 0.5, unit: "小さじ" }, { name: "かつお節", amount: 1, unit: "袋" }], instructions: "1. 豆腐を水切りし、手でちぎる\n2. 豚肉を炒め、豆腐を加えて焼き色をつける\n3. もやし・ニラを加えて炒める\n4. 調味料で味付けし、溶き卵を回し入れる\n5. かつお節をかけて完成" },
  { id: "pub-013", name: "鯖の味噌煮", servings: 2, tags: ["和食", "魚", "定番"], ingredients: [{ name: "鯖", amount: 2, unit: "切れ" }, { name: "味噌", amount: 3, unit: "大さじ" }, { name: "砂糖", amount: 2, unit: "大さじ" }, { name: "酒", amount: 100, unit: "ml" }, { name: "水", amount: 100, unit: "ml" }, { name: "生姜", amount: 1, unit: "かけ" }], instructions: "1. 鯖に熱湯をかけて臭みを取る\n2. 鍋に酒・水・砂糖・生姜を入れて煮立てる\n3. 鯖を入れて落し蓋をして煮る\n4. 味噌を溶き入れ、煮汁を煮詰める" },
  { id: "pub-014", name: "オムライス", servings: 2, tags: ["洋食", "定番", "卵"], ingredients: [{ name: "ご飯", amount: 2, unit: "膳" }, { name: "鶏もも肉", amount: 100, unit: "g" }, { name: "玉ねぎ", amount: 0.5, unit: "個" }, { name: "ケチャップ", amount: 4, unit: "大さじ" }, { name: "卵", amount: 4, unit: "個" }, { name: "バター", amount: 20, unit: "g" }, { name: "塩", amount: 0.5, unit: "小さじ" }, { name: "こしょう", amount: 0.5, unit: "小さじ" }], instructions: "1. 鶏肉と玉ねぎをみじん切りにして炒める\n2. ご飯を加えてケチャップで味付け\n3. 卵を溶いて塩・こしょうを加える\n4. バターを溶かしたフライパンで薄焼き卵を作る\n5. チキンライスを包んで成形" },
  { id: "pub-015", name: "野菜炒め", servings: 2, tags: ["中華", "野菜", "時短"], ingredients: [{ name: "豚こま肉", amount: 100, unit: "g" }, { name: "キャベツ", amount: 3, unit: "枚" }, { name: "もやし", amount: 1, unit: "袋" }, { name: "にんじん", amount: 0.5, unit: "本" }, { name: "ピーマン", amount: 1, unit: "個" }, { name: "醤油", amount: 1, unit: "大さじ" }, { name: "鶏がらスープの素", amount: 0.5, unit: "小さじ" }, { name: "サラダ油", amount: 1, unit: "大さじ" }], instructions: "1. 野菜を食べやすい大きさに切る\n2. 強火で豚肉を炒める\n3. にんじん→キャベツ→もやし→ピーマンの順に炒める\n4. 調味料で味付けして完成" },
  { id: "pub-016", name: "鶏のトマト煮込み", servings: 2, tags: ["洋食", "鶏肉", "煮込み"], ingredients: [{ name: "鶏もも肉", amount: 250, unit: "g" }, { name: "玉ねぎ", amount: 1, unit: "個" }, { name: "にんじん", amount: 0.5, unit: "本" }, { name: "トマト缶", amount: 1, unit: "缶" }, { name: "にんにく", amount: 1, unit: "かけ" }, { name: "コンソメ", amount: 1, unit: "個" }, { name: "塩", amount: 0.5, unit: "小さじ" }, { name: "オリーブオイル", amount: 1, unit: "大さじ" }], instructions: "1. 鶏肉を一口大に切り、塩をふる\n2. 玉ねぎ・にんじんを角切りにする\n3. 鶏肉を焼いて取り出し、野菜を炒める\n4. トマト缶・コンソメを加えて煮込む\n5. 鶏肉を戻して20分煮込む" },
  { id: "pub-017", name: "きのこの炊き込みご飯", servings: 4, tags: ["和食", "ご飯もの", "きのこ"], ingredients: [{ name: "米", amount: 2, unit: "合" }, { name: "しめじ", amount: 1, unit: "パック" }, { name: "まいたけ", amount: 1, unit: "パック" }, { name: "油揚げ", amount: 1, unit: "枚" }, { name: "醤油", amount: 2, unit: "大さじ" }, { name: "酒", amount: 2, unit: "大さじ" }, { name: "だしの素", amount: 1, unit: "小さじ" }], instructions: "1. 米を研いで30分浸水させる\n2. きのこは石づきを取ってほぐす\n3. 油揚げは細切りにする\n4. 炊飯器に米・調味料・具材を入れる\n5. 通常モードで炊いて完成" },
  { id: "pub-018", name: "豚汁", servings: 4, tags: ["和食", "汁物", "豚肉", "野菜"], ingredients: [{ name: "豚バラ肉", amount: 100, unit: "g" }, { name: "大根", amount: 0.25, unit: "本" }, { name: "にんじん", amount: 0.5, unit: "本" }, { name: "ごぼう", amount: 0.5, unit: "本" }, { name: "こんにゃく", amount: 0.5, unit: "枚" }, { name: "豆腐", amount: 0.5, unit: "丁" }, { name: "味噌", amount: 4, unit: "大さじ" }, { name: "だし汁", amount: 800, unit: "ml" }, { name: "ごま油", amount: 1, unit: "大さじ" }], instructions: "1. 野菜を食べやすい大きさに切る\n2. ごま油で豚肉と野菜を炒める\n3. だし汁を加えて柔らかくなるまで煮る\n4. 豆腐を加え、味噌を溶き入れる" },
  { id: "pub-019", name: "エビチリ", servings: 2, tags: ["中華", "海鮮", "定番"], ingredients: [{ name: "むきえび", amount: 200, unit: "g" }, { name: "長ねぎ", amount: 0.5, unit: "本" }, { name: "にんにく", amount: 1, unit: "かけ" }, { name: "生姜", amount: 1, unit: "かけ" }, { name: "豆板醤", amount: 1, unit: "大さじ" }, { name: "ケチャップ", amount: 3, unit: "大さじ" }, { name: "鶏がらスープ", amount: 100, unit: "ml" }, { name: "片栗粉", amount: 1, unit: "大さじ" }, { name: "卵", amount: 1, unit: "個" }], instructions: "1. えびに塩と片栗粉をもみ込み、下処理する\n2. にんにく・生姜・ねぎをみじん切りにする\n3. 香味野菜を炒め、豆板醤を加える\n4. ケチャップ・スープを加えて煮立てる\n5. えびを入れ、とろみをつけて溶き卵を回し入れる" },
  { id: "pub-020", name: "照り焼きチキン", servings: 2, tags: ["和食", "定番", "鶏肉"], ingredients: [{ name: "鶏もも肉", amount: 2, unit: "枚" }, { name: "醤油", amount: 3, unit: "大さじ" }, { name: "みりん", amount: 3, unit: "大さじ" }, { name: "酒", amount: 2, unit: "大さじ" }, { name: "砂糖", amount: 1, unit: "大さじ" }, { name: "サラダ油", amount: 1, unit: "大さじ" }], instructions: "1. 鶏肉の厚い部分を開いて均一にする\n2. フライパンで皮目からじっくり焼く\n3. 裏返して蓋をして蒸し焼きにする\n4. 調味料を合わせて加え、煮絡める\n5. 食べやすく切って盛り付ける" }
];
let publicRecipesData = [...EMBEDDED_PUBLIC_RECIPES];
let publicSelectedTags = [];

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const OLLAMA_API = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "gemma2:2b";

function showLoading(message = "解析中...") {
  loadingText.textContent = message;
  loadingOverlay.hidden = false;
}

function hideLoading() {
  loadingOverlay.hidden = true;
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];
const RECIPE_DB_KEY = "recipe-db-v1";
const SERVING_OPTIONS = [1, 2, 3, 4];
const DEFAULT_BASE_SERVINGS = 2;
const DEFAULT_RECIPE_DB = [
  {
    id: "default-curry",
    name: "チキンとゴロゴロ野菜のカレーライス",
    url: "https://park.ajinomoto.co.jp/recipe/card/801044/",
    baseServings: 2,
    ingredients: [
      { name: "鶏むね肉", grams: 125 },
      { name: "じゃがいも", count: 1, grams: 100 },
      { name: "玉ねぎ", count: 0.5, grams: 100 },
      { name: "にんじん", count: 0.5, grams: 50 },
      { name: "ほうれん草", count: 0.5, grams: 100 },
      { name: "しめじ", count: 0.25, grams: 25 },
      { name: "水", grams: 300 },
      { name: "コンソメ（固形）", count: 0.5 },
      { name: "カレールウ", grams: 40 },
      { name: "ご飯", grams: 440 },
      { name: "オリーブオイル" },
    ],
  },
  {
    id: "default-stew",
    name: "野菜たっぷりクリームシチュー",
    url: "https://park.ajinomoto.co.jp/recipe/card/708853/",
    baseServings: 2,
    ingredients: [
      { name: "じゃがいも", count: 1, grams: 150 },
      { name: "玉ねぎ", count: 0.5, grams: 100 },
      { name: "にんじん", count: 0.5, grams: 80 },
      { name: "ベーコン", grams: 30 },
      { name: "薄力粉" },
      { name: "水", grams: 200 },
      { name: "コンソメ（顆粒）" },
      { name: "牛乳", grams: 200 },
      { name: "塩" },
      { name: "こしょう" },
      { name: "オリーブオイル" },
    ],
  },
  {
    id: "default-hamburg",
    name: "味付きチーズハンバーグ",
    url: "https://park.ajinomoto.co.jp/recipe/card/805060/",
    baseServings: 2,
    ingredients: [
      { name: "合いびき肉", grams: 250 },
      { name: "玉ねぎ", count: 0.5, grams: 100 },
      { name: "オニオンコンソメスープ", count: 1 },
      { name: "片栗粉" },
      { name: "塩" },
      { name: "こしょう" },
      { name: "水", grams: 50 },
      { name: "スライスチーズ", count: 1, grams: 20 },
      { name: "サラダ油" },
      { name: "ブロッコリー", count: 4, grams: 60 },
      { name: "トマト", count: 0.5, grams: 100 },
    ],
  },
  {
    id: "default-ginger-pork",
    name: "マヨうま！豚のしょうが焼き",
    url: "https://park.ajinomoto.co.jp/recipe/card/802666/",
    baseServings: 2,
    ingredients: [
      { name: "豚ロース薄切り肉", grams: 200 },
      { name: "玉ねぎ", count: 0.5 },
      { name: "しょうが" },
      { name: "しょうゆ" },
      { name: "みりん" },
      { name: "酒" },
      { name: "ほんだし" },
      { name: "マヨネーズ" },
      { name: "キャベツ" },
      { name: "ミニトマト", count: 4 },
    ],
  },
  {
    id: "default-roll-cabbage",
    name: "うま塩ロールキャベツ",
    url: "https://park.ajinomoto.co.jp/recipe/card/803698/",
    baseServings: 2,
    ingredients: [
      { name: "キャベツ", count: 4 },
      { name: "合いびき肉", grams: 100 },
      { name: "玉ねぎ", count: 0.5, grams: 100 },
      { name: "にんじん", count: 0.33 },
      { name: "味の素" },
      { name: "こしょう" },
      { name: "水", grams: 400 },
      { name: "鶏だしキューブ", count: 1 },
      { name: "ピザ用チーズ" },
      { name: "スパゲッティ" },
    ],
  },
  {
    id: "default-tofu-spring-roll",
    name: "豆腐とひき肉のふんわり春巻き",
    url: "https://www.kurashiru.com/recipes/e5cb0736-8293-4247-aada-aa3d6b5fcac6",
    baseServings: 2,
    ingredients: [
      { name: "春巻きの皮" },
      { name: "絹ごし豆腐" },
      { name: "豚ひき肉" },
      { name: "長ねぎ" },
      { name: "オイスターソース" },
      { name: "しょうゆ" },
      { name: "塩こしょう" },
      { name: "水溶き薄力粉" },
      { name: "揚げ油" },
      { name: "パセリ" },
    ],
  },
  {
    id: "default-miso-soup",
    name: "わかめの味噌汁",
    url: "https://park.ajinomoto.co.jp/recipe/card/709413/",
    baseServings: 2,
    ingredients: [
      { name: "乾燥カットわかめ", grams: 3 },
      { name: "大根", grams: 75 },
      { name: "水", grams: 300 },
      { name: "ほんだし" },
      { name: "みそ" },
    ],
  },
  {
    id: "default-dashimaki",
    name: "定番☆だし巻き卵",
    url: "https://park.ajinomoto.co.jp/recipe/card/801029/",
    baseServings: 2,
    ingredients: [
      { name: "卵", count: 3 },
      { name: "水" },
      { name: "みりん" },
      { name: "うす口しょうゆ" },
      { name: "ほんだし" },
      { name: "塩" },
      { name: "サラダ油" },
      { name: "大根おろし" },
      { name: "しょうゆ" },
    ],
  },
  {
    id: "default-omurice",
    name: "GOLD チキンオムライス",
    url: "https://park.ajinomoto.co.jp/recipe/card/801980/",
    baseServings: 2,
    ingredients: [
      { name: "ご飯", count: 2 },
      { name: "鶏もも肉", count: 0.5 },
      { name: "冷凍シーフードミックス", grams: 100 },
      { name: "にんじん", count: 0.5 },
      { name: "トマトケチャップ" },
      { name: "コンソメ（顆粒）" },
      { name: "ブロッコリー", count: 0.5 },
      { name: "ミニトマト", count: 0.5 },
      { name: "卵", count: 2 },
      { name: "サラダ油" },
    ],
  },
];

let currentWeekStart = startOfWeek(new Date());
let currentData = loadWeekData(currentWeekStart);
let recipeDb = loadRecipeDb();
let saveTimer = null;
let editingRecipeId = null;
let modalDayKey = null;
let modalDishId = null;

// タグ管理
let currentTags = [];
let modalTags = [];
let activeTagFilter = null;

function getAllTags() {
  const recipes = loadRecipeDb();
  const tagSet = new Set();
  recipes.forEach(recipe => {
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipe.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

function renderTagList(container, tags, onRemove) {
  container.innerHTML = "";
  tags.forEach(tag => {
    const tagEl = document.createElement("span");
    tagEl.className = "tag";
    tagEl.innerHTML = `${tag}<button type="button" class="tag__remove" aria-label="削除">&times;</button>`;
    tagEl.querySelector(".tag__remove").addEventListener("click", () => {
      onRemove(tag);
    });
    container.appendChild(tagEl);
  });
}

function setupTagInput(input, listEl, tagsArray, updateFn) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = input.value.trim().replace(/,/g, "");
      if (tag && !tagsArray.includes(tag)) {
        tagsArray.push(tag);
        updateFn();
        renderTagList(listEl, tagsArray, (removedTag) => {
          const index = tagsArray.indexOf(removedTag);
          if (index > -1) tagsArray.splice(index, 1);
          updateFn();
          renderTagList(listEl, tagsArray, arguments.callee);
        });
      }
      input.value = "";
    }
  });
}

function renderTagFilter() {
  const allTags = getAllTags();
  if (allTags.length === 0) {
    tagFilter.hidden = true;
    return;
  }
  tagFilter.hidden = false;
  tagFilterList.innerHTML = "";

  // 「すべて」ボタン
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = `tag-filter__btn ${activeTagFilter === null ? "tag-filter__btn--active" : ""}`;
  allBtn.textContent = "すべて";
  allBtn.addEventListener("click", () => {
    activeTagFilter = null;
    renderTagFilter();
    renderRecipeList();
  });
  tagFilterList.appendChild(allBtn);

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tag-filter__btn ${activeTagFilter === tag ? "tag-filter__btn--active" : ""}`;
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      activeTagFilter = tag;
      renderTagFilter();
      renderRecipeList();
    });
    tagFilterList.appendChild(btn);
  });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function startOfWeek(date) {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - weekday);
  return base;
}

function storageKey(weekStart) {
  return `recipe-week-${formatDate(weekStart)}`;
}

function loadWeekData(weekStart) {
  const key = storageKey(weekStart);
  const raw = localStorage.getItem(key);
  if (!raw) {
    return { days: {}, shoppingChecked: {}, updatedAt: null };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      days: parsed.days || {},
      shoppingChecked: parsed.shoppingChecked || {},
      updatedAt: parsed.updatedAt || null,
    };
  } catch (error) {
    return { days: {}, shoppingChecked: {}, updatedAt: null };
  }
}

function saveWeekData() {
  const key = storageKey(currentWeekStart);
  const payload = {
    days: currentData.days,
    shoppingChecked: currentData.shoppingChecked || {},
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    return false;
  }
}

function setSaveStatus(text) {
  saveStatus.textContent = text;
  saveStatus.classList.toggle('save-status--saving', text === '保存中...');
  saveStatus.classList.toggle('save-status--error', text === '保存に失敗');
}

function scheduleSave() {
  setSaveStatus("保存中...");
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    const ok = saveWeekData();
    setSaveStatus(ok ? "保存済み" : "保存に失敗");
  }, 300);
}

function commitSave() {
  setSaveStatus("保存中...");
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  const ok = saveWeekData();
  setSaveStatus(ok ? "保存済み" : "保存に失敗");
}

function getDayData(key) {
  if (!currentData.days[key]) {
    currentData.days[key] = {};
  }
  const day = currentData.days[key];
  if (typeof day.dinner === "string" && !day.dinnerId && !day.dinnerText) {
    day.dinnerText = day.dinner;
  }
  if (!Array.isArray(day.dishes)) {
    day.dishes = [];
  }
  if (day.dinnerId || day.dinnerText) {
    day.dishes.push(
      createDishEntry({
        recipeId: day.dinnerId || null,
        servings: day.servings,
        draftName: day.dinnerText || "",
      }),
    );
  }
  day.dishes = day.dishes.map(normalizeDishEntry).filter(Boolean);
  if (day.dishes.length === 0) {
    day.dishes.push(createDishEntry());
  }
  delete day.dinner;
  delete day.dinnerId;
  delete day.dinnerText;
  delete day.servings;
  return day;
}

function getShoppingState() {
  if (!currentData.shoppingChecked || typeof currentData.shoppingChecked !== "object") {
    currentData.shoppingChecked = {};
  }
  return currentData.shoppingChecked;
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function normalizeNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }
  return number;
}

function formatNumber(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function normalizeBaseServings(value) {
  const number = Number(value);
  if (SERVING_OPTIONS.includes(number)) {
    return number;
  }
  return DEFAULT_BASE_SERVINGS;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createDishEntry({ recipeId = null, servings = 0, draftName = "" } = {}) {
  const entry = {
    id: createId("dish"),
    recipeId: recipeId || null,
    draftName: String(draftName || "").trim(),
  };
  const servingsValue = normalizeNumber(servings);
  if (servingsValue > 0) {
    entry.servings = servingsValue;
  }
  return entry;
}

function normalizeDishEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const id = typeof entry.id === "string" ? entry.id : createId("dish");
  const recipeId = typeof entry.recipeId === "string" ? entry.recipeId : null;
  const draftName = String(entry.draftName || "").trim();
  const servingsValue = normalizeNumber(entry.servings);
  const normalized = { id, recipeId, draftName };
  if (servingsValue > 0) {
    normalized.servings = servingsValue;
  }
  return normalized;
}

function resolveDishServings(dish, recipe) {
  if (!recipe) {
    return 0;
  }
  const base = normalizeBaseServings(recipe.baseServings);
  const custom = normalizeNumber(dish.servings);
  return custom > 0 ? custom : base;
}

function normalizeIngredient(entry) {
  if (typeof entry === "string") {
    return { name: entry, amount: 0, unit: "" };
  }
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const name = String(entry.name || "").trim();
  if (!name) {
    return null;
  }
  // Support legacy format (count, grams) and new format (amount, unit)
  if (entry.amount !== undefined || entry.unit !== undefined) {
    return {
      name,
      amount: normalizeNumber(entry.amount),
      unit: String(entry.unit || "").trim(),
    };
  }
  // Convert legacy format
  const count = normalizeNumber(entry.count);
  const grams = normalizeNumber(entry.grams);
  if (grams > 0) {
    return { name, amount: grams, unit: "g" };
  }
  if (count > 0) {
    return { name, amount: count, unit: "個" };
  }
  return { name, amount: 0, unit: "" };
}

function normalizeIngredients(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(normalizeIngredient).filter(Boolean);
}

function formatIngredientDisplay(ingredient) {
  if (ingredient.amount > 0 && ingredient.unit) {
    return `${ingredient.name} ${formatNumber(ingredient.amount)}${ingredient.unit}`;
  }
  if (ingredient.amount > 0) {
    return `${ingredient.name} ${formatNumber(ingredient.amount)}`;
  }
  return ingredient.name;
}

function buildDefaultRecipeDb() {
  const now = new Date().toISOString();
  return DEFAULT_RECIPE_DB.map((recipe) => ({
    ...recipe,
    baseServings: normalizeBaseServings(recipe.baseServings),
    ingredients: normalizeIngredients(recipe.ingredients),
    createdAt: now,
    updatedAt: now,
  }));
}

function mergeDefaultRecipes(existingRecipes) {
  const normalized = existingRecipes.map((recipe) => ({
    ...recipe,
    baseServings: normalizeBaseServings(recipe.baseServings),
    ingredients: normalizeIngredients(recipe.ingredients),
  }));
  const idSet = new Set(normalized.map((recipe) => recipe.id).filter(Boolean));
  const nameSet = new Set(
    normalized.map((recipe) => normalizeText(recipe.name || "")).filter(Boolean),
  );
  const defaults = buildDefaultRecipeDb();
  const additions = defaults.filter((recipe) => {
    const nameKey = normalizeText(recipe.name || "");
    return !idSet.has(recipe.id) && !nameSet.has(nameKey);
  });
  if (additions.length === 0) {
    return normalized;
  }
  return normalized.concat(additions);
}

function loadRecipeDb() {
  const raw = localStorage.getItem(RECIPE_DB_KEY);
  if (!raw) {
    const seeded = buildDefaultRecipeDb();
    localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = buildDefaultRecipeDb();
      localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    if (parsed.length === 0) {
      const seeded = buildDefaultRecipeDb();
      localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const merged = mergeDefaultRecipes(parsed);
    if (merged.length !== parsed.length) {
      localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (error) {
    const seeded = buildDefaultRecipeDb();
    localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveRecipeDb() {
  try {
    localStorage.setItem(RECIPE_DB_KEY, JSON.stringify(recipeDb));
    return true;
  } catch (error) {
    return false;
  }
}

function searchRecipes(query) {
  const normalized = normalizeText(query);
  if (!normalized) {
    return [];
  }
  return recipeDb.filter((recipe) => {
    const ingredientsText = recipe.ingredients
      .map((ingredient) => ingredient.name)
      .join(" ");
    const tagsText = recipe.tags ? recipe.tags.join(" ") : "";
    const haystack = normalizeText(`${recipe.name} ${ingredientsText} ${tagsText}`);
    return haystack.includes(normalized);
  });
}

function getRecipeById(id) {
  return recipeDb.find((recipe) => recipe.id === id) || null;
}

function getRecipeByName(name) {
  const normalized = normalizeText(name);
  if (!normalized) {
    return null;
  }
  return recipeDb.find((recipe) => normalizeText(recipe.name) === normalized) || null;
}

function selectRecipeForDish(dayKey, dishId, recipe) {
  const entry = getDayData(dayKey);
  const dish = entry.dishes.find((item) => item.id === dishId);
  if (!dish) {
    return;
  }
  dish.recipeId = recipe.id;
  dish.draftName = "";
  dish.servings = normalizeBaseServings(recipe.baseServings);
  commitSave();
  renderWeek(currentWeekStart);
}

function removeDish(dayKey, dishId) {
  const entry = getDayData(dayKey);
  entry.dishes = entry.dishes.filter((dish) => dish.id !== dishId);
  if (entry.dishes.length === 0) {
    entry.dishes.push(createDishEntry());
  }
  commitSave();
  renderWeek(currentWeekStart);
}

function clearDishSelection(dayKey, dishId) {
  const entry = getDayData(dayKey);
  const dish = entry.dishes.find((item) => item.id === dishId);
  if (!dish) {
    return;
  }
  dish.recipeId = null;
  dish.draftName = "";
  delete dish.servings;
  commitSave();
  renderWeek(currentWeekStart);
}

function openRecipeModal({ dayKey, dishId, name }) {
  modalDayKey = dayKey;
  modalDishId = dishId;
  recipeModalForm.reset();
  recipeModalNameInput.value = name || "";
  recipeModalUrlInput.value = "";
  recipeModalServingsInput.value = String(DEFAULT_BASE_SERVINGS);
  recipeModalInstructionsInput.value = "";
  resetIngredientList(recipeModalIngredientList);
  // モーダルのタグをリセット
  modalTags = [];
  renderTagList(recipeModalTagList, modalTags, () => {});
  recipeModal.hidden = false;
  document.body.classList.add("modal-open");
  recipeModalNameInput.focus();
}

function closeRecipeModal() {
  recipeModal.hidden = true;
  document.body.classList.remove("modal-open");
  modalDayKey = null;
  modalDishId = null;
}

function createIngredientRow(listEl, { name = "", amount = "", unit = "" } = {}) {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "例：玉ねぎ";
  nameInput.value = name;
  nameInput.dataset.field = "name";

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.min = "0";
  amountInput.step = "any";
  amountInput.placeholder = "数量";
  // 数値として有効な値（0を含む）は表示、それ以外は空
  amountInput.value = (amount !== "" && amount !== null && amount !== undefined) ? String(amount) : "";
  amountInput.dataset.field = "amount";

  const unitInput = document.createElement("input");
  unitInput.type = "text";
  unitInput.placeholder = "単位";
  unitInput.value = unit || "";
  unitInput.dataset.field = "unit";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "削除";
  removeButton.addEventListener("click", () => {
    row.remove();
    if (listEl.children.length === 0) {
      createIngredientRow(listEl);
    }
  });

  row.appendChild(nameInput);
  row.appendChild(amountInput);
  row.appendChild(unitInput);
  row.appendChild(removeButton);
  listEl.appendChild(row);
}

function resetIngredientList(listEl, ingredients = []) {
  listEl.innerHTML = "";
  if (ingredients.length === 0) {
    createIngredientRow(listEl);
    return;
  }
  ingredients.forEach((ingredient) => createIngredientRow(listEl, ingredient));
}

function collectIngredientsFrom(listEl) {
  const rows = listEl.querySelectorAll(".ingredient-row");
  const ingredients = [];

  rows.forEach((row) => {
    const name = row.querySelector('[data-field="name"]').value.trim();
    if (!name) {
      return;
    }
    const amountValue = row.querySelector('[data-field="amount"]').value;
    const unitValue = row.querySelector('[data-field="unit"]').value.trim();
    const amount = normalizeNumber(amountValue);
    ingredients.push({ name, amount, unit: unitValue });
  });

  return ingredients;
}

function addIngredientRow() {
  createIngredientRow(ingredientList);
}

function collectIngredients() {
  return collectIngredientsFrom(ingredientList);
}

function resetRecipeForm() {
  editingRecipeId = null;
  recipeFormTitle.textContent = "レシピを登録";
  recipeSaveButton.textContent = "登録";
  recipeCancelButton.hidden = true;
  recipeForm.reset();
  recipeServingsInput.value = String(DEFAULT_BASE_SERVINGS);
  recipeInstructionsInput.value = "";
  resetIngredientList(ingredientList);
  // タグをリセット
  currentTags = [];
  renderTagList(recipeTagList, currentTags, () => {});
}

function fillRecipeForm(recipe) {
  recipeNameInput.value = recipe.name || "";
  recipeUrlInput.value = recipe.url || "";
  recipeServingsInput.value = String(normalizeBaseServings(recipe.baseServings));
  recipeInstructionsInput.value = recipe.instructions || "";
  resetIngredientList(ingredientList, normalizeIngredients(recipe.ingredients));
  // タグを設定
  currentTags = recipe.tags ? [...recipe.tags] : [];
  renderTagList(recipeTagList, currentTags, (removedTag) => {
    const index = currentTags.indexOf(removedTag);
    if (index > -1) currentTags.splice(index, 1);
    renderTagList(recipeTagList, currentTags, arguments.callee);
  });
}

// --- Recipe Fetch from URL ---

function detectUrlType(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "youtube";
    }
    if (host.includes("twitter.com") || host.includes("x.com")) {
      return "twitter";
    }
    return "web";
  } catch {
    return "web";
  }
}

async function fetchUrlContent(url) {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  const response = await fetch(proxyUrl);
  const html = await response.text();
  return { type: detectUrlType(url), content: html, url };
}

// JSON-LD (schema.org/Recipe) から直接レシピを抽出
function extractRecipeFromJsonLd(html) {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      const recipes = Array.isArray(json) ? json : [json];

      for (const item of recipes) {
        // @graph形式の対応
        const candidates = item["@graph"] ? item["@graph"] : [item];

        for (const candidate of candidates) {
          if (candidate["@type"] === "Recipe" ||
              (Array.isArray(candidate["@type"]) && candidate["@type"].includes("Recipe"))) {
            return parseSchemaRecipe(candidate);
          }
        }
      }
    } catch (e) {
      // パース失敗は無視して次へ
    }
  }
  return null;
}

function parseSchemaRecipe(schema) {
  const name = schema.name || "";
  const servings = parseInt(schema.recipeYield) || 2;

  const ingredients = [];
  const rawIngredients = schema.recipeIngredient || [];

  for (const ing of rawIngredients) {
    if (typeof ing === "string") {
      // "玉ねぎ 1個" や "鶏肉 200g" のようなパターンを解析
      const parsed = parseIngredientString(ing);
      ingredients.push(parsed);
    }
  }

  // 手順を抽出
  let instructions = "";
  const rawInstructions = schema.recipeInstructions || [];
  if (Array.isArray(rawInstructions)) {
    const steps = rawInstructions.map((step, index) => {
      if (typeof step === "string") {
        return `${index + 1}. ${step}`;
      }
      if (step && step.text) {
        return `${index + 1}. ${step.text}`;
      }
      if (step && step.name) {
        return `${index + 1}. ${step.name}`;
      }
      return null;
    }).filter(Boolean);
    instructions = steps.join("\n");
  } else if (typeof rawInstructions === "string") {
    instructions = rawInstructions;
  }

  return { name, servings, ingredients, instructions };
}

function parseIngredientString(str) {
  // 数量と単位を抽出する簡易パーサー
  const result = { name: str.trim(), amount: "", unit: "" };

  // ミリリットル: "200ml", "200mL", "200ミリリットル"
  const mlMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:ml|mL|ミリリットル)/i);
  if (mlMatch) {
    result.amount = parseFloat(mlMatch[1]);
    result.unit = "ml";
    result.name = str.replace(mlMatch[0], "").trim();
    result.name = result.name.replace(/^\d+(?:\.\d+)?\s*/, "").trim();
    if (!result.name) result.name = str.trim();
    return result;
  }

  // グラム数: "200g", "200グラム"
  const gramsMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:g|グラム)/i);
  if (gramsMatch) {
    result.amount = parseFloat(gramsMatch[1]);
    result.unit = "g";
    result.name = str.replace(gramsMatch[0], "").trim();
    result.name = result.name.replace(/^\d+(?:\.\d+)?\s*/, "").trim();
    if (!result.name) result.name = str.trim();
    return result;
  }

  // cc/CC: "200cc"
  const ccMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:cc|CC)/i);
  if (ccMatch) {
    result.amount = parseFloat(ccMatch[1]);
    result.unit = "ml";
    result.name = str.replace(ccMatch[0], "").trim();
    result.name = result.name.replace(/^\d+(?:\.\d+)?\s*/, "").trim();
    if (!result.name) result.name = str.trim();
    return result;
  }

  // 日本語の単位パターン（単位が先、数量が後: "大さじ1", "大さじ1/2"）
  const unitFirstPatterns = [
    { regex: /(大さじ)\s*(\d+(?:\/\d+)?)/, unit: "大さじ" },
    { regex: /(小さじ)\s*(\d+(?:\/\d+)?)/, unit: "小さじ" },
    { regex: /(カップ)\s*(\d+(?:\/\d+)?)/, unit: "カップ" },
  ];

  for (const { regex, unit } of unitFirstPatterns) {
    const match = str.match(regex);
    if (match) {
      const amountStr = match[2];
      if (amountStr.includes("/")) {
        const [num, den] = amountStr.split("/").map(Number);
        result.amount = num / den;
      } else {
        result.amount = parseFloat(amountStr);
      }
      result.unit = unit;
      result.name = str.replace(match[0], "").trim();
      if (!result.name) result.name = str.trim();
      return result;
    }
  }

  // 単位付き数量（数量が先: "1個", "2本", "1/2片"）
  const unitPatterns = [
    { regex: /(\d+(?:\/\d+)?)\s*(個)/, unit: "個" },
    { regex: /(\d+(?:\/\d+)?)\s*(本)/, unit: "本" },
    { regex: /(\d+(?:\/\d+)?)\s*(枚)/, unit: "枚" },
    { regex: /(\d+(?:\/\d+)?)\s*(切れ)/, unit: "切れ" },
    { regex: /(\d+(?:\/\d+)?)\s*(片)/, unit: "片" },
    { regex: /(\d+(?:\/\d+)?)\s*(かけ)/, unit: "かけ" },
    { regex: /(\d+(?:\/\d+)?)\s*(束)/, unit: "束" },
    { regex: /(\d+(?:\/\d+)?)\s*(袋)/, unit: "袋" },
    { regex: /(\d+(?:\/\d+)?)\s*(パック)/, unit: "パック" },
    { regex: /(\d+(?:\/\d+)?)\s*(丁)/, unit: "丁" },
    { regex: /(\d+(?:\/\d+)?)\s*(合)/, unit: "合" },
    { regex: /(\d+(?:\/\d+)?)\s*(房)/, unit: "房" },
    { regex: /(\d+(?:\/\d+)?)\s*(玉)/, unit: "玉" },
    { regex: /(\d+(?:\/\d+)?)\s*(株)/, unit: "株" },
    { regex: /(\d+(?:\/\d+)?)\s*(缶)/, unit: "缶" },
  ];

  for (const { regex, unit } of unitPatterns) {
    const match = str.match(regex);
    if (match) {
      const amountStr = match[1];
      if (amountStr.includes("/")) {
        const [num, den] = amountStr.split("/").map(Number);
        result.amount = num / den;
      } else {
        result.amount = parseFloat(amountStr);
      }
      result.unit = unit;
      result.name = str.replace(match[0], "").trim();
      if (!result.name) result.name = str.trim();
      return result;
    }
  }

  // 「少々」「適量」「ひとつまみ」などはそのまま単位として扱う
  const vaguePatterns = [
    { regex: /(少々)/, unit: "少々" },
    { regex: /(適量)/, unit: "適量" },
    { regex: /(ひとつまみ)/, unit: "ひとつまみ" },
    { regex: /(お好みで)/, unit: "お好みで" },
    { regex: /(適宜)/, unit: "適宜" },
  ];

  for (const { regex, unit } of vaguePatterns) {
    const match = str.match(regex);
    if (match) {
      result.unit = unit;
      result.name = str.replace(match[0], "").trim();
      if (!result.name) result.name = str.trim();
      return result;
    }
  }

  // 名前のクリーンアップ（数量部分を除去）
  result.name = result.name.replace(/^\d+(?:\.\d+)?\s*/, "").trim();
  if (!result.name) result.name = str.trim();

  return result;
}

// AIやJSON-LDから取得した食材データを正規化するヘルパー関数
function normalizeIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  return ingredients.map(ing => {
    const hasAmount = ing.amount !== undefined && ing.amount !== null && ing.amount !== "" && ing.amount !== 0;
    const hasUnit = ing.unit && ing.unit.trim() !== "";
    // amountとunitが空の場合、nameを再解析して数量を抽出
    if (!hasAmount && !hasUnit && ing.name) {
      const parsed = parseIngredientString(ing.name);
      return {
        name: parsed.name || ing.name,
        amount: parsed.amount !== "" ? parsed.amount : "",
        unit: parsed.unit || ""
      };
    }
    return {
      name: ing.name || "",
      amount: hasAmount ? ing.amount : "",
      unit: ing.unit || ""
    };
  });
}

function buildRecipeParsePrompt(html) {
  return `以下のHTMLからレシピ情報を抽出してJSON形式で返してください。

必ず以下の形式のJSONのみを返してください（説明不要）:
{"name":"レシピ名","servings":2,"ingredients":[{"name":"食材名","amount":200,"unit":"g"}],"instructions":"1. 手順1\\n2. 手順2"}

注意:
- nameはレシピのタイトル（必須）
- servingsは基準人数（整数）
- amountは数量、unitは単位（g, ml, 個, 本, 片, かけ, 枚, 大さじ, 小さじ等）
- 「適量」「少々」などは数量を省略
- instructionsは調理手順（番号付きで改行区切り）
- JSONのみ返すこと

HTML:
${html.slice(0, 8000)}`;
}

function buildTextParsePrompt(text) {
  return `以下のテキストからレシピ情報を抽出してJSON形式で返してください。
ツイートやSNS投稿の場合、スレッド全体から材料と手順を集めてください。

必ず以下の形式のJSONのみを返してください（説明不要）:
{"name":"レシピ名","servings":2,"ingredients":[{"name":"食材名","amount":200,"unit":"g"}],"instructions":"1. 手順1\\n2. 手順2"}

注意:
- nameは料理名（必須、テキストから推測）
- servingsは基準人数（整数、不明なら2）
- amountは数量、unitは単位（g, ml, 個, 本, 片, かけ, 枚, 大さじ, 小さじ等）
- 「適量」「少々」などは数量を省略
- instructionsは調理手順（番号付きで改行区切り）
- JSONのみ返すこと

テキスト:
${text.slice(0, 4000)}`;
}

async function parseTextWithOllama(text, statusEl) {
  showLoading("テキストを解析中...");

  try {
    const prompt = buildTextParsePrompt(text);
    const recipe = await callOllamaApi(prompt);
    return recipe;
  } catch (error) {
    throw new Error("テキストの解析に失敗しました: " + error.message);
  } finally {
    hideLoading();
  }
}

async function callOllamaApi(prompt) {
  const response = await fetch(OLLAMA_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.response || "";

  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("レシピ情報を抽出できませんでした");
  }

  return JSON.parse(jsonMatch[0]);
}

async function fetchAndParseRecipe(url, statusEl) {
  showLoading("URLを取得中...");

  try {
    const urlData = await fetchUrlContent(url);

    // 1. まずJSON-LDを試す（高速・正確）
    showLoading("レシピデータを検索中...");
    const jsonLdRecipe = extractRecipeFromJsonLd(urlData.content);

    if (jsonLdRecipe && jsonLdRecipe.name) {
      setFetchStatus(statusEl, "success", "JSON-LDから取得しました");
      return jsonLdRecipe;
    }

    // 2. JSON-LDがなければOllamaで解析
    showLoading("AIで解析中（ローカル）...");

    const prompt = buildRecipeParsePrompt(urlData.content);
    const recipe = await callOllamaApi(prompt);
    return recipe;
  } catch (error) {
    throw new Error("レシピの解析に失敗しました: " + error.message);
  } finally {
    hideLoading();
  }
}

function setFetchStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = "form-field__help";
  if (type === "loading") {
    el.classList.add("form-field__help--loading");
  } else if (type === "error") {
    el.classList.add("form-field__help--error");
  } else if (type === "success") {
    el.classList.add("form-field__help--success");
  }
}

function clearFetchStatus(el) {
  if (!el) return;
  el.textContent = "";
  el.className = "form-field__help";
}

async function handleRecipeFetch(urlInput, nameInput, servingsInput, ingredientListEl, instructionsInput, statusEl) {
  const url = urlInput.value.trim();
  if (!url) {
    setFetchStatus(statusEl, "error", "URLを入力してください");
    return;
  }

  try {
    const recipe = await fetchAndParseRecipe(url, statusEl);

    // Fill form fields - always update recipe name from parsed data
    if (recipe.name) {
      nameInput.value = recipe.name;
    }

    if (recipe.servings) {
      const servings = normalizeBaseServings(recipe.servings);
      servingsInput.value = String(servings);
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      resetIngredientList(ingredientListEl, normalizeIngredients(recipe.ingredients));
    }

    if (recipe.instructions && instructionsInput) {
      instructionsInput.value = recipe.instructions;
    }

    setFetchStatus(statusEl, "success", "レシピを取得しました");
    setTimeout(() => clearFetchStatus(statusEl), 3000);
  } catch (error) {
    setFetchStatus(statusEl, "error", error.message || "取得に失敗しました");
  }
}

// --- End Recipe Fetch ---

function startEditingRecipe(recipe) {
  editingRecipeId = recipe.id;
  recipeFormTitle.textContent = "レシピを編集";
  recipeSaveButton.textContent = "更新";
  recipeCancelButton.hidden = false;
  fillRecipeForm(recipe);
}

function renderRecipeList() {
  const query = recipeSearchInput.value.trim();
  let list = query ? searchRecipes(query) : recipeDb.slice();

  // タグフィルターが有効な場合はフィルタリング
  if (activeTagFilter) {
    list = list.filter(recipe =>
      recipe.tags && recipe.tags.includes(activeTagFilter)
    );
  }

  recipeList.innerHTML = "";

  if (list.length === 0) {
    recipeEmpty.hidden = false;
    recipeEmpty.textContent = activeTagFilter
      ? `「${activeTagFilter}」タグのメニューはありません`
      : "まだメニューがありません";
    return;
  }
  recipeEmpty.hidden = true;

  list.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-card recipe-card--compact";

    // クリック可能なエリア（タイトル + サマリー）
    const clickable = document.createElement("div");
    clickable.className = "recipe-card__clickable";
    clickable.addEventListener("click", () => {
      const detailEl = card.querySelector(".recipe-card__detail");
      if (detailEl) {
        detailEl.hidden = !detailEl.hidden;
        card.classList.toggle("recipe-card--expanded", !detailEl.hidden);
      }
    });

    const title = document.createElement("h3");
    title.className = "recipe-card__title";
    title.textContent = recipe.name;
    clickable.appendChild(title);

    // タグ表示
    if (recipe.tags && recipe.tags.length > 0) {
      const tagsEl = document.createElement("div");
      tagsEl.className = "recipe-card__tags";
      recipe.tags.forEach(tag => {
        const tagEl = document.createElement("span");
        tagEl.className = "tag tag--small";
        tagEl.textContent = tag;
        tagEl.addEventListener("click", (e) => {
          e.stopPropagation();
          activeTagFilter = tag;
          renderTagFilter();
          renderRecipeList();
        });
        tagsEl.appendChild(tagEl);
      });
      clickable.appendChild(tagsEl);
    }

    // 簡易情報（食材数 + 基準人数）
    const summary = document.createElement("p");
    summary.className = "recipe-card__summary";
    const ingredientCount = recipe.ingredients.length;
    const servingsText = `${formatNumber(normalizeBaseServings(recipe.baseServings))}人前`;
    const ingredientText = ingredientCount > 0 ? `食材${ingredientCount}種` : "食材未登録";
    summary.textContent = `${servingsText} ・ ${ingredientText}`;
    clickable.appendChild(summary);

    card.appendChild(clickable);

    // アクションボタン（編集・削除のみ）
    const actions = document.createElement("div");
    actions.className = "recipe-card__actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button--ghost button--small";
    editButton.textContent = "編集";
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      startEditingRecipe(recipe);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button--ghost button--small button--danger";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const ok = window.confirm(`「${recipe.name}」を削除しますか？`);
      if (!ok) {
        return;
      }
      recipeDb = recipeDb.filter((entry) => entry.id !== recipe.id);
      saveRecipeDb();
      renderRecipeList();
      renderWeek(currentWeekStart);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(actions);

    // 詳細（初期は非表示）
    const detail = document.createElement("div");
    detail.className = "recipe-card__detail";
    detail.hidden = true;

    // URL
    if (recipe.url) {
      const urlEl = document.createElement("a");
      urlEl.className = "recipe-card__url";
      urlEl.href = recipe.url;
      urlEl.target = "_blank";
      urlEl.rel = "noreferrer";
      urlEl.textContent = "レシピページを開く →";
      detail.appendChild(urlEl);
    }

    // 食材リスト
    if (recipe.ingredients.length > 0) {
      const ingredientsSection = document.createElement("div");
      ingredientsSection.className = "recipe-card__section";
      const ingredientsTitle = document.createElement("p");
      ingredientsTitle.className = "recipe-card__section-title";
      ingredientsTitle.textContent = "食材";
      ingredientsSection.appendChild(ingredientsTitle);

      const listEl = document.createElement("ul");
      listEl.className = "recipe-card__ingredients";
      recipe.ingredients.forEach((ingredient) => {
        const item = document.createElement("li");
        item.textContent = formatIngredientDisplay(ingredient);
        listEl.appendChild(item);
      });
      ingredientsSection.appendChild(listEl);
      detail.appendChild(ingredientsSection);
    }

    // 作り方
    if (recipe.instructions) {
      const instructionsSection = document.createElement("div");
      instructionsSection.className = "recipe-card__section";
      const instructionsTitle = document.createElement("p");
      instructionsTitle.className = "recipe-card__section-title";
      instructionsTitle.textContent = "作り方";
      instructionsSection.appendChild(instructionsTitle);
      const instructionsText = document.createElement("pre");
      instructionsText.className = "recipe-card__instructions-text";
      instructionsText.textContent = recipe.instructions;
      instructionsSection.appendChild(instructionsText);
      detail.appendChild(instructionsSection);
    }

    card.appendChild(detail);
    recipeList.appendChild(card);
  });
}

function openRecipesView({ scroll } = { scroll: true }) {
  landingSection.hidden = true;
  appSection.hidden = true;
  recipesSection.hidden = false;
  publicRecipesSection.hidden = true;
  weeklySetsSection.hidden = true;
  renderTagFilter();
  renderRecipeList();
  if (scroll) {
    recipesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openAppView({ scroll } = { scroll: true }) {
  landingSection.hidden = true;
  appSection.hidden = false;
  recipesSection.hidden = true;
  publicRecipesSection.hidden = true;
  weeklySetsSection.hidden = true;
  if (scroll) {
    appSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openLandingView() {
  landingSection.hidden = false;
  appSection.hidden = true;
  recipesSection.hidden = true;
  publicRecipesSection.hidden = true;
  weeklySetsSection.hidden = true;
}

function openPublicRecipesView({ scroll } = { scroll: true }) {
  landingSection.hidden = true;
  appSection.hidden = true;
  recipesSection.hidden = true;
  publicRecipesSection.hidden = false;
  weeklySetsSection.hidden = true;
  renderPublicRecipes();
  renderPublicTagFilter();
  if (scroll) {
    publicRecipesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function syncViewFromHash() {
  if (window.location.hash === "#app") {
    openAppView({ scroll: false });
    return;
  }
  if (window.location.hash === "#recipes") {
    openRecipesView({ scroll: false });
    return;
  }
  if (window.location.hash === "#publicRecipes") {
    openPublicRecipesView({ scroll: false });
    return;
  }
  if (window.location.hash === "#landing") {
    openLandingView();
    return;
  }
  openAppView({ scroll: false });
}

function renderSearchResults({ query, container, dayKey, dishId }) {
  container.innerHTML = "";
  const trimmed = query.trim();

  // クエリが空の場合は全レシピを表示（最大8件）
  const matches = trimmed
    ? searchRecipes(trimmed).slice(0, 6)
    : recipeDb.slice(0, 8);
  const exactMatch = trimmed ? getRecipeByName(trimmed) : null;

  // レシピがない場合はヒントを表示
  if (recipeDb.length === 0 && !trimmed) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  // 空クエリで候補がある場合、ヘッダーを表示
  if (!trimmed && matches.length > 0) {
    const header = document.createElement("div");
    header.className = "recipe-search__header";
    header.textContent = "登録済みのレシピ";
    container.appendChild(header);
  }

  if (matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "recipe-detail__notice";
    empty.textContent = "該当するレシピがありません。";
    container.appendChild(empty);
  } else {
    matches.forEach((recipe) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "recipe-search__item";
      item.textContent = recipe.name;

      if (recipe.ingredients.length > 0) {
        const meta = document.createElement("span");
        meta.className = "recipe-search__meta";
        meta.textContent = recipe.ingredients
          .slice(0, 2)
          .map(formatIngredientDisplay)
          .join(" / ");
        item.appendChild(meta);
      }

      item.addEventListener("click", () => {
        selectRecipeForDish(dayKey, dishId, recipe);
      });

      container.appendChild(item);
    });
  }

  if (trimmed && !exactMatch) {
    const createButton = document.createElement("button");
    createButton.type = "button";
    createButton.className = "recipe-search__item recipe-search__item--create";
    createButton.textContent = `「${trimmed}」を新規登録`;
    createButton.addEventListener("click", () => {
      openRecipeModal({ dayKey, dishId, name: trimmed });
    });
    container.appendChild(createButton);
  }
}

/**
 * 統合された料理カード（レシピ選択済みの場合のみ）
 * コンパクト表示 + クリックで詳細展開
 */
function renderUnifiedDishCard({ dish, recipe, dayKey }) {
  const card = document.createElement("div");
  card.className = "unified-dish-card";

  // コンパクト表示（クリックで詳細展開）
  const compact = document.createElement("div");
  compact.className = "unified-dish-card__compact";
  compact.addEventListener("click", () => {
    const expandedEl = card.querySelector(".unified-dish-card__expanded");
    if (expandedEl) {
      expandedEl.hidden = !expandedEl.hidden;
      card.classList.toggle("unified-dish-card--expanded", !expandedEl.hidden);
    }
  });

  const name = document.createElement("span");
  name.className = "unified-dish-card__name";
  name.textContent = recipe.name;
  compact.appendChild(name);

  const indicator = document.createElement("span");
  indicator.className = "unified-dish-card__indicator";
  indicator.textContent = "▼";
  compact.appendChild(indicator);

  card.appendChild(compact);

  // 詳細部分（初期は非表示）
  const expanded = document.createElement("div");
  expanded.className = "unified-dish-card__expanded";
  expanded.hidden = true;

  const baseServings = normalizeBaseServings(recipe.baseServings);
  const meta = document.createElement("p");
  meta.className = "unified-dish-card__meta";
  meta.textContent = `基準: ${formatNumber(baseServings)}人前`;
  expanded.appendChild(meta);

  if (recipe.url) {
    const link = document.createElement("a");
    link.className = "unified-dish-card__link";
    link.href = recipe.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "レシピページを開く";
    link.addEventListener("click", (e) => e.stopPropagation());
    expanded.appendChild(link);
  }

  if (recipe.ingredients.length > 0) {
    const ingredientsSection = document.createElement("div");
    ingredientsSection.className = "unified-dish-card__section";
    const ingredientsTitle = document.createElement("p");
    ingredientsTitle.className = "unified-dish-card__section-title";
    ingredientsTitle.textContent = "食材";
    ingredientsSection.appendChild(ingredientsTitle);

    const listEl = document.createElement("ul");
    listEl.className = "unified-dish-card__ingredients";
    recipe.ingredients.forEach((ingredient) => {
      const item = document.createElement("li");
      item.textContent = formatIngredientDisplay(ingredient);
      listEl.appendChild(item);
    });
    ingredientsSection.appendChild(listEl);
    expanded.appendChild(ingredientsSection);
  }

  if (recipe.instructions) {
    const instructionsSection = document.createElement("div");
    instructionsSection.className = "unified-dish-card__section";
    const instructionsTitle = document.createElement("p");
    instructionsTitle.className = "unified-dish-card__section-title";
    instructionsTitle.textContent = "作り方";
    instructionsSection.appendChild(instructionsTitle);
    const instructionsText = document.createElement("pre");
    instructionsText.className = "unified-dish-card__instructions";
    instructionsText.textContent = recipe.instructions;
    instructionsSection.appendChild(instructionsText);
    expanded.appendChild(instructionsSection);
  }

  const actions = document.createElement("div");
  actions.className = "unified-dish-card__actions";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "button--ghost button--small";
  clearButton.textContent = "解除";
  clearButton.addEventListener("click", (e) => {
    e.stopPropagation();
    clearDishSelection(dayKey, dish.id);
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "button--ghost button--small";
  editButton.textContent = "編集";
  editButton.addEventListener("click", (e) => {
    e.stopPropagation();
    openRecipesView({ scroll: true });
    history.replaceState(null, "", "#recipes");
    startEditingRecipe(recipe);
  });

  actions.appendChild(clearButton);
  actions.appendChild(editButton);
  expanded.appendChild(actions);

  card.appendChild(expanded);

  return card;
}

function renderServingControl({ dish, recipe }) {
  const wrapper = document.createElement("label");
  wrapper.className = "servings-field";

  const label = document.createElement("span");
  label.textContent = "この品は何人前";
  wrapper.appendChild(label);

  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.step = "1";

  if (recipe) {
    const baseServings = normalizeBaseServings(recipe.baseServings);
    const servingsValue = resolveDishServings(dish, recipe);
    input.value = servingsValue ? formatNumber(servingsValue) : formatNumber(baseServings);
    input.placeholder = formatNumber(baseServings);
  } else {
    input.disabled = true;
    input.placeholder = "-";
  }

  input.addEventListener("input", () => {
    if (!recipe) {
      return;
    }
    const value = normalizeNumber(input.value);
    if (value > 0) {
      dish.servings = value;
    } else {
      delete dish.servings;
    }
    scheduleSave();
    renderShoppingList();
  });

  input.addEventListener("blur", () => {
    if (!recipe) {
      return;
    }
    if (!input.value) {
      const baseServings = normalizeBaseServings(recipe.baseServings);
      dish.servings = baseServings;
      input.value = formatNumber(baseServings);
      scheduleSave();
      renderShoppingList();
    }
  });

  wrapper.appendChild(input);

  if (!recipe) {
    const hint = document.createElement("span");
    hint.className = "servings-field__hint";
    hint.textContent = "レシピ選択後に入力";
    wrapper.appendChild(hint);
  }

  return wrapper;
}

function renderWeek(weekStart) {
  currentWeekStart = weekStart;
  currentData = loadWeekData(weekStart);
  weekStartInput.value = formatDate(weekStart);

  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);
  weekRange.textContent = `${formatDisplayDate(weekStart)} - ${formatDisplayDate(endDate)}`;

  weekGrid.innerHTML = "";

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateKey = formatDate(date);
    const dayData = getDayData(dateKey);

    const card = document.createElement("article");
    card.className = "day-card";
    card.style.setProperty("--delay", `${index * 0.06}s`);

    const header = document.createElement("div");
    header.className = "day-header";

    const title = document.createElement("h2");
    title.className = "day-title";
    title.textContent = DAY_LABELS[index];

    const dateLabel = document.createElement("span");
    dateLabel.className = "day-date";
    dateLabel.textContent = formatDisplayDate(date);

    header.appendChild(title);
    header.appendChild(dateLabel);
    card.appendChild(header);

    const dishList = document.createElement("div");
    dishList.className = "dish-list";

    dayData.dishes.forEach((dish, dishIndex) => {
      const selectedRecipe = dish.recipeId ? getRecipeById(dish.recipeId) : null;

      const dishCard = document.createElement("div");
      dishCard.className = "dish-card";

      const dishHeader = document.createElement("div");
      dishHeader.className = "dish-card__header";

      const dishTitle = document.createElement("span");
      dishTitle.className = "dish-card__title";
      dishTitle.textContent = `品目 ${dishIndex + 1}`;

      const dishActions = document.createElement("div");
      dishActions.className = "dish-card__actions";
      if (dayData.dishes.length > 1) {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "button--ghost button--small";
        removeButton.textContent = "削除";
        removeButton.addEventListener("click", () => {
          removeDish(dateKey, dish.id);
        });
        dishActions.appendChild(removeButton);
      }

      dishHeader.appendChild(dishTitle);
      dishHeader.appendChild(dishActions);
      dishCard.appendChild(dishHeader);

      // レシピが選択されている場合は統合されたコンパクトカードを表示
      if (selectedRecipe) {
        dishCard.appendChild(renderUnifiedDishCard({ dish, recipe: selectedRecipe, dayKey: dateKey }));
        dishCard.appendChild(renderServingControl({ dish, recipe: selectedRecipe }));
      } else if (dish.recipeId && !selectedRecipe) {
        // レシピIDはあるが、レシピが削除されている場合
        const deletedNotice = document.createElement("div");
        deletedNotice.className = "dish-deleted-notice";

        const message = document.createElement("p");
        message.textContent = "レシピが削除されています";
        deletedNotice.appendChild(message);

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = "button--ghost button--small";
        clearButton.textContent = "解除";
        clearButton.addEventListener("click", () => {
          clearDishSelection(dateKey, dish.id);
        });
        deletedNotice.appendChild(clearButton);

        dishCard.appendChild(deletedNotice);
      } else {
        // レシピ未選択の場合は検索入力欄を表示
        const searchWrapper = document.createElement("div");
        searchWrapper.className = "recipe-search";

        const label = document.createElement("label");
        label.textContent = "料理名";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "料理名を入力";
        if (dish.draftName) {
          input.value = dish.draftName;
        }

        const results = document.createElement("div");
        results.className = "recipe-search__results";
        results.hidden = true;

        input.addEventListener("input", () => {
          dish.draftName = input.value;
          scheduleSave();
          renderSearchResults({
            query: input.value,
            container: results,
            dayKey: dateKey,
            dishId: dish.id,
          });
        });

        input.addEventListener("focus", () => {
          renderSearchResults({
            query: input.value,
            container: results,
            dayKey: dateKey,
            dishId: dish.id,
          });
        });

        input.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") {
            return;
          }
          const trimmed = input.value.trim();
          if (!trimmed) {
            return;
          }
          event.preventDefault();
          dish.draftName = trimmed;
          const existing = getRecipeByName(trimmed);
          if (existing) {
            selectRecipeForDish(dateKey, dish.id, existing);
            return;
          }
          openRecipeModal({ dayKey: dateKey, dishId: dish.id, name: trimmed });
        });

        searchWrapper.appendChild(label);
        searchWrapper.appendChild(input);
        searchWrapper.appendChild(results);

        dishCard.appendChild(searchWrapper);

        // 下書き状態の場合のヒント
        if (dish.draftName) {
          const hint = document.createElement("p");
          hint.className = "recipe-detail__notice";
          hint.textContent = "Enterで確定、または候補から選択";
          dishCard.appendChild(hint);
        }
      }

      dishList.appendChild(dishCard);
    });

    card.appendChild(dishList);

    const addDishButton = document.createElement("button");
    addDishButton.type = "button";
    addDishButton.className = "button--ghost button--small dish-add";
    addDishButton.textContent = "+ 品目を追加";
    addDishButton.addEventListener("click", () => {
      dayData.dishes.push(createDishEntry());
      commitSave();
      renderWeek(currentWeekStart);
    });
    card.appendChild(addDishButton);

    weekGrid.appendChild(card);
  }

  renderShoppingList();
  setSaveStatus("保存済み");
}

function renderShoppingList() {
  const checkedState = getShoppingState();
  // Key: "食材名|単位" で集計（同じ名前でも単位が違えば別エントリ）
  const totals = new Map();
  const orderedKeys = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    const dateKey = formatDate(date);
    const dayData = getDayData(dateKey);
    dayData.dishes.forEach((dish) => {
      if (!dish.recipeId) {
        return;
      }
      const recipe = getRecipeById(dish.recipeId);
      if (!recipe) {
        return;
      }
      const baseServings = normalizeBaseServings(recipe.baseServings);
      const servings = resolveDishServings(dish, recipe);
      const multiplier = servings / baseServings;
      recipe.ingredients.forEach((ingredient) => {
        const name = ingredient.name.trim();
        if (!name) {
          return;
        }
        const amount = normalizeNumber(ingredient.amount);
        const unit = String(ingredient.unit || "").trim();
        // 同じ名前 + 同じ単位 で集計
        const key = `${normalizeText(name)}|${unit.toLowerCase()}`;
        if (!totals.has(key)) {
          totals.set(key, { name, amount: 0, unit });
          orderedKeys.push(key);
        }
        const entry = totals.get(key);
        entry.amount += amount * multiplier;
      });
    });
  }

  Object.keys(checkedState).forEach((key) => {
    if (!totals.has(key)) {
      delete checkedState[key];
    }
  });

  shoppingList.innerHTML = "";

  if (orderedKeys.length === 0) {
    shoppingEmpty.hidden = false;
    return;
  }
  shoppingEmpty.hidden = true;

  orderedKeys.forEach((key) => {
    const itemData = totals.get(key);
    const listItem = document.createElement("li");
    listItem.className = "checklist__item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checklist__toggle";
    checkbox.checked = Boolean(checkedState[key]);
    checkbox.addEventListener("change", () => {
      checkedState[key] = checkbox.checked;
      listItem.classList.toggle("checklist__item--checked", checkbox.checked);
      scheduleSave();
      // Update badge and count
      if (typeof updateFabBadge === "function") updateFabBadge();
      if (typeof updateShoppingCount === "function") updateShoppingCount();
    });

    const text = document.createElement("span");
    text.className = "checklist__text";
    text.textContent = itemData.name;

    listItem.appendChild(checkbox);
    listItem.appendChild(text);

    if (itemData.amount > 0) {
      const amountBadge = document.createElement("span");
      amountBadge.className = "checklist__count";
      if (itemData.unit) {
        amountBadge.textContent = `${formatNumber(itemData.amount)}${itemData.unit}`;
      } else {
        amountBadge.textContent = `${formatNumber(itemData.amount)}`;
      }
      listItem.appendChild(amountBadge);
    }

    if (checkbox.checked) {
      listItem.classList.add("checklist__item--checked");
    }

    shoppingList.appendChild(listItem);
  });
}

function shiftWeek(offset) {
  const next = new Date(currentWeekStart);
  next.setDate(next.getDate() + offset * 7);
  renderWeek(startOfWeek(next));
}

weekStartInput.addEventListener("change", (event) => {
  if (!event.target.value) {
    return;
  }
  const selected = new Date(`${event.target.value}T00:00:00`);
  renderWeek(startOfWeek(selected));
});

prevWeekButton.addEventListener("click", () => shiftWeek(-1));
nextWeekButton.addEventListener("click", () => shiftWeek(1));
thisWeekButton.addEventListener("click", () => renderWeek(startOfWeek(new Date())));

clearWeekButton.addEventListener("click", () => {
  const label = formatDisplayDate(currentWeekStart);
  const ok = window.confirm(`${label}の週をクリアしますか？`);
  if (!ok) {
    return;
  }
  localStorage.removeItem(storageKey(currentWeekStart));
  renderWeek(currentWeekStart);
});

ingredientAddButton.addEventListener("click", () => addIngredientRow());
recipeModalIngredientAddButton.addEventListener("click", () => {
  createIngredientRow(recipeModalIngredientList);
});

// タグ入力のセットアップ
setupTagInput(recipeTagInput, recipeTagList, currentTags, () => {});
setupTagInput(recipeModalTagInput, recipeModalTagList, modalTags, () => {});

// Recipe fetch from URL buttons
recipeFetchButton.addEventListener("click", () => {
  handleRecipeFetch(
    recipeUrlInput,
    recipeNameInput,
    recipeServingsInput,
    ingredientList,
    recipeInstructionsInput,
    recipeFetchStatus
  );
});

recipeModalFetchButton.addEventListener("click", () => {
  handleRecipeFetch(
    recipeModalUrlInput,
    recipeModalNameInput,
    recipeModalServingsInput,
    recipeModalIngredientList,
    recipeModalInstructionsInput,
    recipeModalFetchStatus
  );
});

// Text parse toggle and buttons
recipeTextToggle.addEventListener("click", () => {
  recipeTextArea.hidden = !recipeTextArea.hidden;
});

recipeModalTextToggle.addEventListener("click", () => {
  recipeModalTextArea.hidden = !recipeModalTextArea.hidden;
});

recipeTextParse.addEventListener("click", async () => {
  const text = recipeTextInput.value.trim();
  if (!text) {
    setFetchStatus(recipeFetchStatus, "error", "テキストを入力してください");
    return;
  }
  try {
    const recipe = await parseTextWithOllama(text, recipeFetchStatus);
    if (recipe.name) {
      recipeNameInput.value = recipe.name;
    }
    if (recipe.servings) {
      recipeServingsInput.value = String(normalizeBaseServings(recipe.servings));
    }
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      resetIngredientList(ingredientList, normalizeIngredients(recipe.ingredients));
    }
    if (recipe.instructions) {
      recipeInstructionsInput.value = recipe.instructions;
    }
    setFetchStatus(recipeFetchStatus, "success", "テキストから取得しました");
    setTimeout(() => clearFetchStatus(recipeFetchStatus), 3000);
  } catch (error) {
    setFetchStatus(recipeFetchStatus, "error", error.message);
  }
});

recipeModalTextParse.addEventListener("click", async () => {
  const text = recipeModalTextInput.value.trim();
  if (!text) {
    setFetchStatus(recipeModalFetchStatus, "error", "テキストを入力してください");
    return;
  }
  try {
    const recipe = await parseTextWithOllama(text, recipeModalFetchStatus);
    if (recipe.name) {
      recipeModalNameInput.value = recipe.name;
    }
    if (recipe.servings) {
      recipeModalServingsInput.value = String(normalizeBaseServings(recipe.servings));
    }
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      resetIngredientList(recipeModalIngredientList, normalizeIngredients(recipe.ingredients));
    }
    if (recipe.instructions) {
      recipeModalInstructionsInput.value = recipe.instructions;
    }
    setFetchStatus(recipeModalFetchStatus, "success", "テキストから取得しました");
    setTimeout(() => clearFetchStatus(recipeModalFetchStatus), 3000);
  } catch (error) {
    setFetchStatus(recipeModalFetchStatus, "error", error.message);
  }
});

recipeModalBackdrop.addEventListener("click", () => closeRecipeModal());
recipeModalCloseButton.addEventListener("click", () => closeRecipeModal());
recipeModalCancelButton.addEventListener("click", () => closeRecipeModal());

recipeModalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = recipeModalNameInput.value.trim();
  if (!name) {
    recipeModalNameInput.focus();
    return;
  }

  const url = recipeModalUrlInput.value.trim();
  const ingredients = collectIngredientsFrom(recipeModalIngredientList);
  const instructions = recipeModalInstructionsInput.value.trim();
  const baseServings = normalizeBaseServings(recipeModalServingsInput.value);
  const tags = [...modalTags];
  const now = new Date().toISOString();
  const existing = getRecipeByName(name);
  let targetRecipe = null;

  if (existing) {
    recipeDb = recipeDb.map((recipe) =>
      recipe.id === existing.id
        ? { ...recipe, name, url, ingredients, instructions, baseServings, tags, updatedAt: now }
        : recipe,
    );
    targetRecipe = { id: existing.id, baseServings };
  } else {
    targetRecipe = {
      id: `recipe-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      url,
      ingredients,
      instructions,
      baseServings,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    recipeDb.push(targetRecipe);
  }

  saveRecipeDb();
  renderRecipeList();
  renderTagFilter();

  if (modalDayKey && modalDishId) {
    selectRecipeForDish(modalDayKey, modalDishId, targetRecipe);
  } else {
    renderWeek(currentWeekStart);
  }
  closeRecipeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (!recipeModal.hidden) {
    closeRecipeModal();
  }
});

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = recipeNameInput.value.trim();
  if (!name) {
    recipeNameInput.focus();
    return;
  }

  const url = recipeUrlInput.value.trim();
  const ingredients = collectIngredients();
  const instructions = recipeInstructionsInput.value.trim();
  const baseServings = normalizeBaseServings(recipeServingsInput.value);
  const tags = [...currentTags];
  const now = new Date().toISOString();

  if (editingRecipeId) {
    recipeDb = recipeDb.map((recipe) =>
      recipe.id === editingRecipeId
        ? { ...recipe, name, url, ingredients, instructions, baseServings, tags, updatedAt: now }
        : recipe,
    );
  } else {
    recipeDb.push({
      id: `recipe-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      url,
      ingredients,
      instructions,
      baseServings,
      tags,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveRecipeDb();
  resetRecipeForm();
  renderRecipeList();
  renderTagFilter();
  renderWeek(currentWeekStart);
});

recipeCancelButton.addEventListener("click", () => {
  resetRecipeForm();
});

recipeSearchInput.addEventListener("input", renderRecipeList);

enterAppButton.addEventListener("click", () => {
  openAppView({ scroll: true });
  history.replaceState(null, "", "#app");
});

enterRecipesButton.addEventListener("click", () => {
  openRecipesView({ scroll: true });
  history.replaceState(null, "", "#recipes");
});

backToLandingButton.addEventListener("click", () => {
  openLandingView();
  history.replaceState(null, "", "#landing");
});

openRecipesFromAppButton.addEventListener("click", () => {
  openRecipesView({ scroll: true });
  history.replaceState(null, "", "#recipes");
});

backToLandingFromRecipesButton.addEventListener("click", () => {
  openLandingView();
  history.replaceState(null, "", "#landing");
});

openAppFromRecipesButton.addEventListener("click", () => {
  openAppView({ scroll: true });
  history.replaceState(null, "", "#app");
});

// Public recipes navigation handlers
if (backToLandingFromPublicButton) {
  backToLandingFromPublicButton.addEventListener("click", () => {
    openLandingView();
    history.replaceState(null, "", "#landing");
  });
}

if (openAppFromPublicButton) {
  openAppFromPublicButton.addEventListener("click", () => {
    openAppView({ scroll: true });
    history.replaceState(null, "", "#app");
  });
}

// Desktop navigation to public recipes
const openPublicRecipesFromAppButton = document.getElementById("openPublicRecipesFromApp");
const openPublicRecipesFromRecipesButton = document.getElementById("openPublicRecipesFromRecipes");
const openRecipesFromPublicButton = document.getElementById("openRecipesFromPublic");

if (openPublicRecipesFromAppButton) {
  openPublicRecipesFromAppButton.addEventListener("click", () => {
    openPublicRecipesView({ scroll: true });
    history.replaceState(null, "", "#publicRecipes");
  });
}

if (openPublicRecipesFromRecipesButton) {
  openPublicRecipesFromRecipesButton.addEventListener("click", () => {
    openPublicRecipesView({ scroll: true });
    history.replaceState(null, "", "#publicRecipes");
  });
}

if (openRecipesFromPublicButton) {
  openRecipesFromPublicButton.addEventListener("click", () => {
    openRecipesView({ scroll: true });
    history.replaceState(null, "", "#recipes");
  });
}

window.addEventListener("hashchange", syncViewFromHash);

resetRecipeForm();
renderWeek(currentWeekStart);
renderRecipeList();
syncViewFromHash();

// ============================================
// Navigation (PC Global Nav & Mobile Bottom Nav)
// ============================================

const mobileNav = document.getElementById("mobileNav");
const globalNav = document.getElementById("globalNav");
const pageEl = document.querySelector(".page");
const fabShopping = document.getElementById("fabShopping");
const fabBadge = document.getElementById("fabBadge");

function isMobileView() {
  return window.innerWidth <= 768;
}

function updateNavigation(currentView) {
  // ランディングページではナビを非表示
  if (currentView === "landing") {
    if (mobileNav) mobileNav.hidden = true;
    if (globalNav) globalNav.hidden = true;
    if (pageEl) pageEl.classList.remove("page--with-nav");
    return;
  }

  // モバイル: ボトムナビを表示、グローバルナビを非表示
  // PC: グローバルナビを表示、ボトムナビを非表示
  if (isMobileView()) {
    if (mobileNav) mobileNav.hidden = false;
    if (globalNav) globalNav.hidden = true;
    if (pageEl) pageEl.classList.remove("page--with-nav");
  } else {
    if (mobileNav) mobileNav.hidden = true;
    if (globalNav) globalNav.hidden = false;
    if (pageEl) pageEl.classList.add("page--with-nav");
  }

  // アクティブなナビアイテムを更新（モバイル）
  if (mobileNav) {
    const navItems = mobileNav.querySelectorAll(".mobile-nav__item");
    navItems.forEach((item) => {
      const navType = item.dataset.nav;
      const isActive = (currentView === "app" && navType === "kondate") ||
                       (currentView === "recipes" && navType === "recipes") ||
                       (currentView === "publicRecipes" && navType === "publicRecipes") ||
                       (currentView === "weeklySets" && navType === "weeklySets");
      if (isActive) {
        item.setAttribute("aria-current", "page");
        item.classList.add("mobile-nav__item--active");
      } else {
        item.removeAttribute("aria-current");
        item.classList.remove("mobile-nav__item--active");
      }
    });
  }

  // アクティブなナビアイテムを更新（PC）
  if (globalNav) {
    const navLinks = globalNav.querySelectorAll(".global-nav__link");
    navLinks.forEach((link) => {
      const navType = link.dataset.nav;
      const isActive = (currentView === "app" && navType === "kondate") ||
                       (currentView === "recipes" && navType === "recipes") ||
                       (currentView === "publicRecipes" && navType === "publicRecipes") ||
                       (currentView === "weeklySets" && navType === "weeklySets");
      if (isActive) {
        link.setAttribute("aria-current", "page");
        link.classList.add("global-nav__link--active");
      } else {
        link.removeAttribute("aria-current");
        link.classList.remove("global-nav__link--active");
      }
    });
  }
}

// Alias for backward compatibility
function updateMobileNav(currentView) {
  updateNavigation(currentView);
}

function scrollToShoppingList() {
  const checklistEl = document.querySelector(".checklist");
  if (checklistEl) {
    checklistEl.scrollIntoView({ behavior: "smooth", block: "start" });
    // フォーカスを移動してスクリーンリーダー対応
    checklistEl.focus({ preventScroll: true });
  }
}

function updateFabBadge() {
  if (!fabBadge || !fabShopping) return;

  // 買い物リストのアイテム数をカウント
  const items = shoppingList.querySelectorAll(".checklist__item");
  const uncheckedCount = Array.from(items).filter(
    (item) => !item.classList.contains("checklist__item--checked")
  ).length;

  if (uncheckedCount > 0) {
    fabBadge.textContent = uncheckedCount;
    fabBadge.hidden = false;
  } else {
    fabBadge.hidden = true;
  }
}

// Navigation click handler (shared for mobile and PC)
function handleNavClick(navType) {
  switch (navType) {
    case "landing":
      openLandingView();
      history.replaceState(null, "", "#landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "kondate":
      openAppView({ scroll: false });
      history.replaceState(null, "", "#app");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "recipes":
      openRecipesView({ scroll: false });
      history.replaceState(null, "", "#recipes");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "publicRecipes":
      openPublicRecipesView({ scroll: false });
      history.replaceState(null, "", "#publicRecipes");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "weeklySets":
      openWeeklySetsView({ scroll: false });
      history.replaceState(null, "", "#weeklySets");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
  }
}

// Mobile nav click handlers
if (mobileNav) {
  mobileNav.addEventListener("click", (event) => {
    const navItem = event.target.closest(".mobile-nav__item");
    if (!navItem) return;
    handleNavClick(navItem.dataset.nav);
  });
}

// PC Global nav click handlers
if (globalNav) {
  globalNav.addEventListener("click", (event) => {
    // Handle logo click - go to landing
    const logo = event.target.closest(".global-nav__logo");
    if (logo) {
      event.preventDefault();
      openLandingView();
      history.replaceState(null, "", "#landing");
      return;
    }

    // Handle nav link click
    const navLink = event.target.closest(".global-nav__link");
    if (!navLink) return;
    handleNavClick(navLink.dataset.nav);
  });
}

// FAB click handler
if (fabShopping) {
  fabShopping.addEventListener("click", scrollToShoppingList);
}

// Override view functions to update mobile nav
const originalOpenAppView = openAppView;
const originalOpenRecipesView = openRecipesView;
const originalOpenLandingView = openLandingView;
const originalOpenPublicRecipesView = openPublicRecipesView;

function openAppViewWithNav(options) {
  originalOpenAppView.call(this, options);
  updateMobileNav("app");
}

function openRecipesViewWithNav(options) {
  originalOpenRecipesView.call(this, options);
  updateMobileNav("recipes");
}

function openLandingViewWithNav() {
  originalOpenLandingView.call(this);
  updateMobileNav("landing");
}

function openPublicRecipesViewWithNav(options) {
  originalOpenPublicRecipesView.call(this, options);
  updateMobileNav("publicRecipes");
}

// Replace global functions
window.openAppView = openAppViewWithNav;
window.openRecipesView = openRecipesViewWithNav;
window.openLandingView = openLandingViewWithNav;
window.openPublicRecipesView = openPublicRecipesViewWithNav;

// Override renderShoppingList to update FAB badge and collapsible count
const originalRenderShoppingList = renderShoppingList;
const shoppingCount = document.getElementById("shoppingCount");

function renderShoppingListWithBadge() {
  originalRenderShoppingList.call(this);
  updateFabBadge();
  updateShoppingCount();
}

function updateShoppingCount() {
  if (!shoppingCount) return;
  const items = shoppingList.querySelectorAll(".checklist__item");
  const uncheckedCount = Array.from(items).filter(
    (item) => !item.classList.contains("checklist__item--checked")
  ).length;
  shoppingCount.textContent = uncheckedCount > 0 ? `${uncheckedCount}品目` : "";
}

// Replace the renderShoppingList reference
window.renderShoppingList = renderShoppingListWithBadge;

// Helper to get current view
function getCurrentView() {
  if (!landingSection.hidden) return "landing";
  if (!appSection.hidden) return "app";
  if (!recipesSection.hidden) return "recipes";
  if (!publicRecipesSection.hidden) return "publicRecipes";
  if (weeklySetsSection && !weeklySetsSection.hidden) return "weeklySets";
  return "landing";
}

// Update on resize
window.addEventListener("resize", () => {
  updateMobileNav(getCurrentView());
});

// Initial mobile nav state
function initMobileNav() {
  updateMobileNav(getCurrentView());
}

// Run after initial render
setTimeout(initMobileNav, 0);

// ============================================
// Public Recipes Functionality
// ============================================

function loadPublicRecipes() {
  // Use embedded data to avoid CORS issues with file:// protocol
  publicRecipesData = [...EMBEDDED_PUBLIC_RECIPES];
  if (publicRecipeCount) {
    publicRecipeCount.textContent = publicRecipesData.length + "件";
  }
  return publicRecipesData;
}

function getPublicRecipeTags() {
  const tags = new Set();
  publicRecipesData.forEach(recipe => {
    (recipe.tags || []).forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

function renderPublicTagFilter() {
  if (!publicTagFilterList) return;

  const tags = getPublicRecipeTags();
  publicTagFilterList.innerHTML = "";

  if (tags.length === 0) {
    publicTagFilter.hidden = true;
    return;
  }

  publicTagFilter.hidden = false;

  // すべて表示ボタン
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "tag-filter__btn" + (publicSelectedTags.length === 0 ? " tag-filter__btn--active" : "");
  allButton.textContent = "すべて";
  allButton.addEventListener("click", () => {
    publicSelectedTags = [];
    renderPublicTagFilter();
    renderPublicRecipes();
  });
  publicTagFilterList.appendChild(allButton);

  // 各タグボタン
  tags.forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-filter__btn" + (publicSelectedTags.includes(tag) ? " tag-filter__btn--active" : "");
    button.textContent = tag;
    button.addEventListener("click", () => {
      if (publicSelectedTags.includes(tag)) {
        publicSelectedTags = publicSelectedTags.filter(t => t !== tag);
      } else {
        publicSelectedTags.push(tag);
      }
      renderPublicTagFilter();
      renderPublicRecipes();
    });
    publicTagFilterList.appendChild(button);
  });
}

function filterPublicRecipes(recipes, query) {
  let filtered = recipes;

  // タグフィルター
  if (publicSelectedTags.length > 0) {
    filtered = filtered.filter(recipe =>
      publicSelectedTags.some(tag => (recipe.tags || []).includes(tag))
    );
  }

  // 検索クエリ
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(q);
      const ingredientMatch = (recipe.ingredients || []).some(
        ing => ing.name.toLowerCase().includes(q)
      );
      const tagMatch = (recipe.tags || []).some(
        tag => tag.toLowerCase().includes(q)
      );
      return nameMatch || ingredientMatch || tagMatch;
    });
  }

  return filtered;
}

function renderPublicRecipes() {
  if (!publicRecipeList) return;

  const query = publicRecipeSearch ? publicRecipeSearch.value : "";
  const filtered = filterPublicRecipes(publicRecipesData, query);

  publicRecipeList.innerHTML = "";

  if (filtered.length === 0) {
    publicRecipeEmpty.hidden = false;
    return;
  }

  publicRecipeEmpty.hidden = true;

  filtered.forEach(recipe => {
    const card = document.createElement("article");
    card.className = "recipe-card";

    const ingredientsList = (recipe.ingredients || [])
      .slice(0, 5)
      .map(ing => ing.name)
      .join("、");
    const moreIngredients = (recipe.ingredients || []).length > 5
      ? `　他${(recipe.ingredients || []).length - 5}品`
      : "";

    const tagsHtml = (recipe.tags || []).map(tag =>
      `<span class="recipe-card__tag">${tag}</span>`
    ).join("");

    card.innerHTML = `
      <div class="recipe-card__header">
        <h3 class="recipe-card__title">${recipe.name}</h3>
        <span class="recipe-card__servings">${recipe.servings}人前</span>
      </div>
      <div class="recipe-card__tags">${tagsHtml}</div>
      <p class="recipe-card__ingredients">
        <strong>食材:</strong> ${ingredientsList}${moreIngredients}
      </p>
      <div class="recipe-card__actions">
        <button type="button" class="button--primary button--small import-btn">
          メニューに追加
        </button>
        <button type="button" class="button--ghost button--small detail-btn">
          詳細を見る
        </button>
      </div>
    `;

    // Import button handler
    const importBtn = card.querySelector(".import-btn");
    importBtn.addEventListener("click", () => importPublicRecipe(recipe));

    // Detail button handler
    const detailBtn = card.querySelector(".detail-btn");
    detailBtn.addEventListener("click", () => showPublicRecipeDetail(recipe));

    publicRecipeList.appendChild(card);
  });
}

// Toast notification
let toastTimeout = null;

function showToast(message, type = "default") {
  console.log("showToast called:", { message, type });

  const toastEl = document.getElementById("toast");
  const toastMessageEl = document.getElementById("toastMessage");

  console.log("Toast elements:", { toastEl, toastMessageEl });

  if (!toastEl || !toastMessageEl) {
    console.warn("Toast elements not found:", { toastEl, toastMessageEl });
    return;
  }

  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Update message and style
  toastMessageEl.textContent = message;
  toastEl.className = "toast" + (type !== "default" ? ` toast--${type}` : "");
  toastEl.removeAttribute("hidden");

  console.log("Toast should be visible now, hidden attr:", toastEl.hasAttribute("hidden"));

  // Auto hide after 3 seconds
  toastTimeout = setTimeout(() => {
    toastEl.setAttribute("hidden", "");
  }, 3000);
}

// Recipe detail modal
const recipeDetailModal = document.getElementById("recipeDetailModal");
const recipeDetailModalBackdrop = document.getElementById("recipeDetailModalBackdrop");
const recipeDetailModalClose = document.getElementById("recipeDetailModalClose");
const recipeDetailTitle = document.getElementById("recipeDetailTitle");
const recipeDetailBody = document.getElementById("recipeDetailBody");
const recipeDetailImport = document.getElementById("recipeDetailImport");

let currentDetailRecipe = null;

function openRecipeDetailModal(recipe) {
  if (!recipeDetailModal) return;

  currentDetailRecipe = recipe;

  // Build tags HTML
  const tagsHtml = (recipe.tags || []).map(tag =>
    `<span class="recipe-card__tag">${tag}</span>`
  ).join("");

  // Build ingredients HTML
  const ingredientsHtml = (recipe.ingredients || []).map(ing => {
    const amount = ing.amount ? `${ing.amount}${ing.unit || ""}` : "";
    return `<li>
      <span class="recipe-detail__ingredient-name">${ing.name}</span>
      <span class="recipe-detail__ingredient-amount">${amount}</span>
    </li>`;
  }).join("");

  // Set modal content
  recipeDetailBody.innerHTML = `
    <h3 class="recipe-detail__name">${recipe.name}</h3>
    <div class="recipe-detail__meta">
      <span class="recipe-detail__servings">${recipe.servings}人前</span>
      <div class="recipe-detail__tags">${tagsHtml}</div>
    </div>
    <div class="recipe-detail__section">
      <h4 class="recipe-detail__section-title">食材</h4>
      <ul class="recipe-detail__ingredients">${ingredientsHtml}</ul>
    </div>
    ${recipe.instructions ? `
    <div class="recipe-detail__section">
      <h4 class="recipe-detail__section-title">作り方</h4>
      <p class="recipe-detail__instructions">${recipe.instructions}</p>
    </div>
    ` : ""}
  `;

  recipeDetailModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeRecipeDetailModal() {
  if (!recipeDetailModal) return;
  recipeDetailModal.hidden = true;
  document.body.style.overflow = "";
  currentDetailRecipe = null;
}

// Modal event listeners
if (recipeDetailModalBackdrop) {
  recipeDetailModalBackdrop.addEventListener("click", closeRecipeDetailModal);
}
if (recipeDetailModalClose) {
  recipeDetailModalClose.addEventListener("click", closeRecipeDetailModal);
}
if (recipeDetailImport) {
  recipeDetailImport.addEventListener("click", () => {
    if (currentDetailRecipe) {
      importPublicRecipe(currentDetailRecipe);
      closeRecipeDetailModal();
    }
  });
}

function importPublicRecipe(publicRecipe) {
  // Check if already exists in private recipes
  const existing = recipeDb.find(r => r.name === publicRecipe.name);
  if (existing) {
    if (!confirm(`「${publicRecipe.name}」は既にメニューに登録されています。上書きしますか？`)) {
      return;
    }
    // Remove existing recipe
    recipeDb = recipeDb.filter(r => r.id !== existing.id);
  }

  // Convert public recipe format to private recipe format
  const newRecipe = {
    id: "recipe-" + Date.now(),
    name: publicRecipe.name,
    url: "",
    baseServings: publicRecipe.servings,
    tags: [...(publicRecipe.tags || [])],
    instructions: publicRecipe.instructions || "",
    ingredients: (publicRecipe.ingredients || []).map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || ""
    }))
  };

  recipeDb.push(newRecipe);
  saveRecipeDb();

  // Show success toast
  console.log("importPublicRecipe: calling showToast");
  showToast(`「${publicRecipe.name}」をメニューに追加しました`, "success");

  // Re-render to update UI
  renderPublicRecipes();
}

function showPublicRecipeDetail(recipe) {
  openRecipeDetailModal(recipe);
}

// Search input handler
if (publicRecipeSearch) {
  publicRecipeSearch.addEventListener("input", () => {
    renderPublicRecipes();
  });
}

// Load public recipes on page load (now synchronous with embedded data)
loadPublicRecipes();
// If we're on public recipes page, re-render after data is loaded
if (window.location.hash === "#publicRecipes" || !publicRecipesSection.hidden) {
  renderPublicRecipes();
  renderPublicTagFilter();
}

// ============================================
// Weekly Sets Functionality (1週間を選ぶ)
// ============================================

const WEEKLY_SETS_DB_KEY = "weekly-sets-db-v1";
const FAVORITE_SETS_KEY = "favorite-sets-v1";
const MY_SETS_KEY = "my-sets-v1";
const APPLIED_SET_KEY_PREFIX = "applied-set-";

// Weekly Sets section elements (weeklySetsSection is defined at the top)
const setCount = document.getElementById("setCount");
const favoriteSetCount = document.getElementById("favoriteSetCount");
const favoriteSetsSection = document.getElementById("favoriteSetsSection");
const favoriteSetsGrid = document.getElementById("favoriteSetsGrid");
const mySetsSection = document.getElementById("mySetsSection");
const mySetsGrid = document.getElementById("mySetsGrid");
const seasonSetsGrid = document.getElementById("seasonSetsGrid");
const sceneSetsGrid = document.getElementById("sceneSetsGrid");
const allSetsGrid = document.getElementById("allSetsGrid");
const setsEmpty = document.getElementById("setsEmpty");

// Set detail modal elements
const setDetailModal = document.getElementById("setDetailModal");
const setDetailModalBackdrop = document.getElementById("setDetailModalBackdrop");
const setDetailModalClose = document.getElementById("setDetailModalClose");
const setDetailTitle = document.getElementById("setDetailTitle");
const setDetailBody = document.getElementById("setDetailBody");
const setFavoriteToggle = document.getElementById("setFavoriteToggle");
const applySetButton = document.getElementById("applySetButton");

// Set apply modal elements
const setApplyModal = document.getElementById("setApplyModal");
const setApplyModalBackdrop = document.getElementById("setApplyModalBackdrop");
const setApplyModalClose = document.getElementById("setApplyModalClose");
const setApplyDate = document.getElementById("setApplyDate");
const setApplyCustom = document.getElementById("setApplyCustom");
const confirmApplySet = document.getElementById("confirmApplySet");
const cancelApplySet = document.getElementById("cancelApplySet");

// Save my set modal elements
const saveMySetModal = document.getElementById("saveMySetModal");
const saveMySetModalBackdrop = document.getElementById("saveMySetModalBackdrop");
const saveMySetModalClose = document.getElementById("saveMySetModalClose");
const mySetName = document.getElementById("mySetName");
const confirmSaveMySet = document.getElementById("confirmSaveMySet");
const cancelSaveMySet = document.getElementById("cancelSaveMySet");

// Applied set banner elements
const appliedSetBanner = document.getElementById("appliedSetBanner");
const appliedSetName = document.getElementById("appliedSetName");
const saveAsMySet = document.getElementById("saveAsMySet");
const clearAppliedSet = document.getElementById("clearAppliedSet");
const applySetFromKondate = document.getElementById("applySetFromKondate");

// Navigation elements for weekly sets
const backToLandingFromSets = document.getElementById("backToLandingFromSets");
const openAppFromSets = document.getElementById("openAppFromSets");
const openRecipesFromSets = document.getElementById("openRecipesFromSets");

// Current state
let currentDetailSet = null;
let selectedApplyWeek = "current";

// Default weekly sets data (運営が用意するセット)
const DEFAULT_WEEKLY_SETS = [
  {
    id: "set-nabe-week",
    name: "お鍋であったか1週間",
    description: "寒い日に嬉しい、鍋料理中心の1週間",
    tags: ["冬", "鍋", "あったか"],
    category: "season",
    days: [
      { day: "月", dishes: [{ name: "キムチ鍋", recipeId: null }] },
      { day: "火", dishes: [{ name: "豚しゃぶ", recipeId: null }] },
      { day: "水", dishes: [{ name: "おでん", recipeId: null }] },
      { day: "木", dishes: [{ name: "もつ鍋", recipeId: null }] },
      { day: "金", dishes: [{ name: "すき焼き", recipeId: null }] },
      { day: "土", dishes: [] },
      { day: "日", dishes: [{ name: "水炊き", recipeId: null }] },
    ],
  },
  {
    id: "set-summer-vege",
    name: "夏野菜を楽しむ1週間",
    description: "旬の夏野菜をたっぷり使った献立",
    tags: ["夏", "野菜", "さっぱり"],
    category: "season",
    days: [
      { day: "月", dishes: [{ name: "ゴーヤチャンプルー", recipeId: null }] },
      { day: "火", dishes: [{ name: "冷やし中華", recipeId: null }] },
      { day: "水", dishes: [{ name: "ナスの揚げ浸し", recipeId: null }, { name: "冷奴", recipeId: null }] },
      { day: "木", dishes: [{ name: "トマトカレー", recipeId: null }] },
      { day: "金", dishes: [{ name: "ズッキーニのパスタ", recipeId: null }] },
      { day: "土", dishes: [] },
      { day: "日", dishes: [{ name: "夏野菜の揚げ浸し", recipeId: null }] },
    ],
  },
  {
    id: "set-busy-week",
    name: "忙しい週の時短1週間",
    description: "15分以内で作れる簡単レシピ中心",
    tags: ["時短", "簡単", "平日"],
    category: "scene",
    days: [
      { day: "月", dishes: [{ name: "豚のしょうが焼き", recipeId: "default-ginger-pork" }] },
      { day: "火", dishes: [{ name: "親子丼", recipeId: null }] },
      { day: "水", dishes: [{ name: "焼きそば", recipeId: null }] },
      { day: "木", dishes: [{ name: "チャーハン", recipeId: null }] },
      { day: "金", dishes: [{ name: "カレーライス", recipeId: "default-curry" }] },
      { day: "土", dishes: [] },
      { day: "日", dishes: [{ name: "オムライス", recipeId: "default-omurice" }] },
    ],
  },
  {
    id: "set-washoku-week",
    name: "和食の基本1週間",
    description: "定番の和食で落ち着く1週間",
    tags: ["和食", "定番", "家庭料理"],
    category: "scene",
    days: [
      { day: "月", dishes: [{ name: "肉じゃが", recipeId: null }, { name: "味噌汁", recipeId: "default-miso-soup" }] },
      { day: "火", dishes: [{ name: "焼き魚", recipeId: null }, { name: "ひじき煮", recipeId: null }] },
      { day: "水", dishes: [{ name: "豚汁", recipeId: null }, { name: "だし巻き卵", recipeId: "default-dashimaki" }] },
      { day: "木", dishes: [{ name: "筑前煮", recipeId: null }] },
      { day: "金", dishes: [{ name: "鮭の塩焼き", recipeId: null }, { name: "きんぴらごぼう", recipeId: null }] },
      { day: "土", dishes: [] },
      { day: "日", dishes: [{ name: "天ぷら", recipeId: null }] },
    ],
  },
  {
    id: "set-genki-week",
    name: "元気がない時の1週間",
    description: "優しい味付けで体に染みる献立",
    tags: ["優しい", "回復", "体調管理"],
    category: "scene",
    days: [
      { day: "月", dishes: [{ name: "雑炊", recipeId: null }] },
      { day: "火", dishes: [{ name: "湯豆腐", recipeId: null }] },
      { day: "水", dishes: [{ name: "うどん", recipeId: null }] },
      { day: "木", dishes: [{ name: "クリームシチュー", recipeId: "default-stew" }] },
      { day: "金", dishes: [{ name: "茶碗蒸し", recipeId: null }, { name: "おにぎり", recipeId: null }] },
      { day: "土", dishes: [] },
      { day: "日", dishes: [{ name: "お粥", recipeId: null }] },
    ],
  },
];

// Load/Save functions
function loadWeeklySets() {
  const raw = localStorage.getItem(WEEKLY_SETS_DB_KEY);
  if (!raw) {
    // Initialize with default sets
    localStorage.setItem(WEEKLY_SETS_DB_KEY, JSON.stringify(DEFAULT_WEEKLY_SETS));
    return [...DEFAULT_WEEKLY_SETS];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_WEEKLY_SETS];
  }
}

function saveWeeklySets(sets) {
  localStorage.setItem(WEEKLY_SETS_DB_KEY, JSON.stringify(sets));
}

function loadFavoriteSets() {
  const raw = localStorage.getItem(FAVORITE_SETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveFavoriteSets(favorites) {
  localStorage.setItem(FAVORITE_SETS_KEY, JSON.stringify(favorites));
}

function loadMySets() {
  const raw = localStorage.getItem(MY_SETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMySets(mySets) {
  localStorage.setItem(MY_SETS_KEY, JSON.stringify(mySets));
}

function getAppliedSetKey(weekStart) {
  return APPLIED_SET_KEY_PREFIX + formatDate(weekStart);
}

function loadAppliedSet(weekStart) {
  const key = getAppliedSetKey(weekStart);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveAppliedSet(weekStart, setInfo) {
  const key = getAppliedSetKey(weekStart);
  if (setInfo) {
    localStorage.setItem(key, JSON.stringify(setInfo));
  } else {
    localStorage.removeItem(key);
  }
}

// State
let weeklySetsData = loadWeeklySets();
let favoriteSetsIds = loadFavoriteSets();
let mySetsData = loadMySets();

// Check if set is favorite
function isSetFavorite(setId) {
  return favoriteSetsIds.includes(setId);
}

// Toggle favorite
function toggleSetFavorite(setId) {
  if (isSetFavorite(setId)) {
    favoriteSetsIds = favoriteSetsIds.filter(id => id !== setId);
  } else {
    favoriteSetsIds.push(setId);
  }
  saveFavoriteSets(favoriteSetsIds);
  renderWeeklySets();
  updateFavoriteCount();
}

// Update favorite count
function updateFavoriteCount() {
  if (favoriteSetCount) {
    favoriteSetCount.textContent = favoriteSetsIds.length + "件";
  }
}

// Get all sets (default + my sets)
function getAllSets() {
  return [...weeklySetsData, ...mySetsData];
}

// Open weekly sets view
function openWeeklySetsView({ scroll } = { scroll: true }) {
  landingSection.hidden = true;
  appSection.hidden = true;
  recipesSection.hidden = true;
  publicRecipesSection.hidden = true;
  weeklySetsSection.hidden = false;

  renderWeeklySets();
  updateFavoriteCount();
  updateNavigation("weeklySets");

  if (scroll) {
    weeklySetsSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Render set card
function renderSetCard(set, container) {
  const card = document.createElement("article");
  card.className = "set-card";
  card.dataset.setId = set.id;

  const isFavorite = isSetFavorite(set.id);
  const dayPreviews = set.days.map(d => {
    const count = d.dishes.length;
    return `<div class="set-card__day-preview">
      <span class="set-card__day-label">${d.day}</span>
      <span class="set-card__day-count">${count > 0 ? count : "-"}</span>
    </div>`;
  }).join("");

  const tagsHtml = (set.tags || []).map(tag =>
    `<span class="set-card__tag">${tag}</span>`
  ).join("");

  card.innerHTML = `
    <div class="set-card__header">
      <h3 class="set-card__name">${set.name}</h3>
      <button type="button" class="set-card__favorite ${isFavorite ? "set-card__favorite--active" : ""}"
              data-set-id="${set.id}" title="お気に入り">
        <span class="material-symbols-rounded">${isFavorite ? "favorite" : "favorite_border"}</span>
      </button>
    </div>
    <div class="set-card__tags">${tagsHtml}</div>
    <div class="set-card__preview">${dayPreviews}</div>
  `;

  // Card click -> open detail
  card.addEventListener("click", (e) => {
    if (e.target.closest(".set-card__favorite")) return;
    openSetDetailModal(set);
  });

  // Favorite button click
  const favBtn = card.querySelector(".set-card__favorite");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSetFavorite(set.id);
  });

  container.appendChild(card);
}

// Render weekly sets
function renderWeeklySets() {
  const allSets = getAllSets();

  // Update count
  if (setCount) {
    setCount.textContent = allSets.length + "件";
  }

  // Favorites
  const favoriteSets = allSets.filter(s => isSetFavorite(s.id));
  if (favoriteSets.length > 0) {
    favoriteSetsSection.hidden = false;
    favoriteSetsGrid.innerHTML = "";
    favoriteSets.forEach(set => renderSetCard(set, favoriteSetsGrid));
  } else {
    favoriteSetsSection.hidden = true;
  }

  // My Sets
  if (mySetsData.length > 0) {
    mySetsSection.hidden = false;
    mySetsGrid.innerHTML = "";
    mySetsData.forEach(set => renderSetCard(set, mySetsGrid));
  } else {
    mySetsSection.hidden = true;
  }

  // Season sets
  const seasonSets = weeklySetsData.filter(s => s.category === "season");
  seasonSetsGrid.innerHTML = "";
  if (seasonSets.length > 0) {
    seasonSets.forEach(set => renderSetCard(set, seasonSetsGrid));
    document.getElementById("seasonSetsSection").hidden = false;
  } else {
    document.getElementById("seasonSetsSection").hidden = true;
  }

  // Scene sets
  const sceneSets = weeklySetsData.filter(s => s.category === "scene");
  sceneSetsGrid.innerHTML = "";
  if (sceneSets.length > 0) {
    sceneSets.forEach(set => renderSetCard(set, sceneSetsGrid));
    document.getElementById("sceneSetsSection").hidden = false;
  } else {
    document.getElementById("sceneSetsSection").hidden = true;
  }

  // All sets
  allSetsGrid.innerHTML = "";
  if (allSets.length > 0) {
    setsEmpty.hidden = true;
    allSets.forEach(set => renderSetCard(set, allSetsGrid));
  } else {
    setsEmpty.hidden = false;
  }
}

// Open set detail modal
function openSetDetailModal(set) {
  currentDetailSet = set;

  // Update favorite toggle
  const isFavorite = isSetFavorite(set.id);
  setFavoriteToggle.innerHTML = `<span class="material-symbols-rounded">${isFavorite ? "favorite" : "favorite_border"}</span>`;
  setFavoriteToggle.classList.toggle("button--icon--active", isFavorite);

  // Build timeline HTML
  const timelineHtml = set.days.map((dayData, index) => {
    const dishesHtml = dayData.dishes.length > 0
      ? dayData.dishes.map(dish => `
          <div class="set-timeline__dish">
            <span class="set-timeline__dish-icon material-symbols-rounded">restaurant</span>
            <span class="set-timeline__dish-name">${dish.name}</span>
          </div>
        `).join("")
      : `<span class="set-timeline__empty">お休み / 外食</span>`;

    return `
      <div class="set-timeline__day">
        <div class="set-timeline__day-header">
          <span class="set-timeline__day-label">${dayData.day}曜</span>
          <span class="set-timeline__day-num">${index + 1}</span>
        </div>
        <div class="set-timeline__day-content">
          <div class="set-timeline__dishes">
            ${dishesHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const tagsHtml = (set.tags || []).map(tag =>
    `<span class="set-detail__tag">${tag}</span>`
  ).join("");

  setDetailBody.innerHTML = `
    <div class="set-detail__header">
      <h3 class="set-detail__name">${set.name}</h3>
      <p class="set-detail__desc">${set.description || ""}</p>
      <div class="set-detail__tags">${tagsHtml}</div>
    </div>
    <div class="set-timeline">
      ${timelineHtml}
    </div>
  `;

  setDetailModal.hidden = false;
  document.body.style.overflow = "hidden";
}

// Close set detail modal
function closeSetDetailModal() {
  setDetailModal.hidden = true;
  document.body.style.overflow = "";
  currentDetailSet = null;
}

// Open set apply modal
function openSetApplyModal(set) {
  currentDetailSet = set || currentDetailSet;
  selectedApplyWeek = "current";

  // Reset UI
  const options = setApplyModal.querySelectorAll(".set-apply__option");
  options.forEach(opt => {
    opt.classList.toggle("set-apply__option--active", opt.dataset.week === "current");
  });
  setApplyCustom.hidden = true;
  setApplyDate.value = formatDate(startOfWeek(new Date()));

  setApplyModal.hidden = false;
  document.body.style.overflow = "hidden";
}

// Close set apply modal
function closeSetApplyModal() {
  setApplyModal.hidden = true;
  document.body.style.overflow = "";
}

// Apply set to week
function applySetToWeek(set, targetWeekStart) {
  // Load or create week data
  const weekKey = storageKey(targetWeekStart);
  let weekData = loadWeekData(targetWeekStart);

  // Clear existing data
  weekData.days = {};

  // Apply set dishes to each day
  set.days.forEach((dayData, index) => {
    // Calculate the date for this day
    const date = new Date(targetWeekStart);
    date.setDate(date.getDate() + index);
    const dateKey = formatDate(date);

    weekData.days[dateKey] = {
      dishes: dayData.dishes.map(dish => createDishEntry({
        recipeId: dish.recipeId || null,
        draftName: dish.name,
        servings: 2,
      }))
    };
    // Ensure at least one empty dish if no dishes
    if (weekData.days[dateKey].dishes.length === 0) {
      weekData.days[dateKey].dishes.push(createDishEntry());
    }
  });

  // Save week data
  const payload = {
    days: weekData.days,
    shoppingChecked: weekData.shoppingChecked || {},
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(weekKey, JSON.stringify(payload));

  // Save applied set info
  saveAppliedSet(targetWeekStart, {
    setId: set.id,
    setName: set.name,
    isMySet: set.isMySet || false,
    appliedAt: new Date().toISOString(),
  });

  return weekData;
}

// Confirm apply set
function confirmApplySetAction() {
  if (!currentDetailSet) return;

  let targetWeekStart;

  switch (selectedApplyWeek) {
    case "current":
      targetWeekStart = startOfWeek(new Date());
      break;
    case "next":
      targetWeekStart = new Date(startOfWeek(new Date()));
      targetWeekStart.setDate(targetWeekStart.getDate() + 7);
      break;
    case "custom":
      targetWeekStart = startOfWeek(new Date(setApplyDate.value));
      break;
    default:
      targetWeekStart = startOfWeek(new Date());
  }

  applySetToWeek(currentDetailSet, targetWeekStart);

  // Close modals
  closeSetApplyModal();
  closeSetDetailModal();

  // Navigate to kondate view with the applied week
  currentWeekStart = targetWeekStart;
  currentData = loadWeekData(currentWeekStart);
  openAppView({ scroll: true });
  renderWeek(currentWeekStart);
  updateAppliedSetBanner();

  showToast(`「${currentDetailSet.name}」を適用しました`, "success");
}

// Update applied set banner
function updateAppliedSetBanner() {
  const appliedSet = loadAppliedSet(currentWeekStart);

  if (appliedSet && appliedSetBanner && appliedSetName) {
    appliedSetBanner.hidden = false;
    appliedSetName.textContent = appliedSet.setName;
  } else if (appliedSetBanner) {
    appliedSetBanner.hidden = true;
  }
}

// Clear applied set (remove set assignment from current week)
function clearAppliedSetAction() {
  const appliedSet = loadAppliedSet(currentWeekStart);
  if (!appliedSet) return;

  // Remove the applied set info
  const key = `${APPLIED_SET_KEY_PREFIX}${formatDate(currentWeekStart)}`;
  localStorage.removeItem(key);

  // Update banner
  updateAppliedSetBanner();

  showToast("セットの適用を取り消しました", "info");
}

// Save current week as my set
function openSaveMySetModal() {
  mySetName.value = "";
  saveMySetModal.hidden = false;
  document.body.style.overflow = "hidden";
  mySetName.focus();
}

function closeSaveMySetModal() {
  saveMySetModal.hidden = true;
  document.body.style.overflow = "";
}

function confirmSaveMySetAction() {
  const name = mySetName.value.trim();
  if (!name) {
    mySetName.focus();
    return;
  }

  // Build set from current week data
  const newSet = {
    id: "my-set-" + Date.now(),
    name: name,
    description: "マイセット",
    tags: ["マイセット"],
    category: "my",
    isMySet: true,
    days: DAY_LABELS.map(dayKey => {
      const dayData = getDayData(dayKey);
      return {
        day: dayKey,
        dishes: dayData.dishes.filter(d => d.recipeId || d.draftName).map(d => {
          const recipe = d.recipeId ? recipeDb.find(r => r.id === d.recipeId) : null;
          return {
            name: recipe ? recipe.name : d.draftName,
            recipeId: d.recipeId || null,
          };
        })
      };
    }),
    createdAt: new Date().toISOString(),
  };

  mySetsData.push(newSet);
  saveMySets(mySetsData);

  closeSaveMySetModal();
  showToast(`「${name}」をマイセットに保存しました`, "success");

  // Update applied set info
  saveAppliedSet(currentWeekStart, {
    setId: newSet.id,
    setName: newSet.name,
    isMySet: true,
    appliedAt: new Date().toISOString(),
  });
  updateAppliedSetBanner();
}

// Event listeners for weekly sets navigation
if (backToLandingFromSets) {
  backToLandingFromSets.addEventListener("click", () => {
    openLandingView();
    history.replaceState(null, "", "#landing");
  });
}

if (openAppFromSets) {
  openAppFromSets.addEventListener("click", () => {
    openAppView({ scroll: true });
    history.replaceState(null, "", "#app");
  });
}

if (openRecipesFromSets) {
  openRecipesFromSets.addEventListener("click", () => {
    openRecipesView({ scroll: true });
    history.replaceState(null, "", "#recipes");
  });
}

// Set detail modal events
if (setDetailModalBackdrop) {
  setDetailModalBackdrop.addEventListener("click", closeSetDetailModal);
}
if (setDetailModalClose) {
  setDetailModalClose.addEventListener("click", closeSetDetailModal);
}
if (setFavoriteToggle) {
  setFavoriteToggle.addEventListener("click", () => {
    if (currentDetailSet) {
      toggleSetFavorite(currentDetailSet.id);
      const isFavorite = isSetFavorite(currentDetailSet.id);
      setFavoriteToggle.innerHTML = `<span class="material-symbols-rounded">${isFavorite ? "favorite" : "favorite_border"}</span>`;
      setFavoriteToggle.classList.toggle("button--icon--active", isFavorite);
    }
  });
}
if (applySetButton) {
  applySetButton.addEventListener("click", () => {
    openSetApplyModal(currentDetailSet);
  });
}

// Set apply modal events
if (setApplyModalBackdrop) {
  setApplyModalBackdrop.addEventListener("click", closeSetApplyModal);
}
if (setApplyModalClose) {
  setApplyModalClose.addEventListener("click", closeSetApplyModal);
}
if (cancelApplySet) {
  cancelApplySet.addEventListener("click", closeSetApplyModal);
}
if (confirmApplySet) {
  confirmApplySet.addEventListener("click", confirmApplySetAction);
}

// Week selection in apply modal
const applyOptions = setApplyModal ? setApplyModal.querySelectorAll(".set-apply__option") : [];
applyOptions.forEach(option => {
  option.addEventListener("click", () => {
    applyOptions.forEach(opt => opt.classList.remove("set-apply__option--active"));
    option.classList.add("set-apply__option--active");
    selectedApplyWeek = option.dataset.week;
    setApplyCustom.hidden = selectedApplyWeek !== "custom";
  });
});

// Save my set modal events
if (saveMySetModalBackdrop) {
  saveMySetModalBackdrop.addEventListener("click", closeSaveMySetModal);
}
if (saveMySetModalClose) {
  saveMySetModalClose.addEventListener("click", closeSaveMySetModal);
}
if (cancelSaveMySet) {
  cancelSaveMySet.addEventListener("click", closeSaveMySetModal);
}
if (confirmSaveMySet) {
  confirmSaveMySet.addEventListener("click", confirmSaveMySetAction);
}

// Applied set banner events
if (saveAsMySet) {
  saveAsMySet.addEventListener("click", openSaveMySetModal);
}
if (clearAppliedSet) {
  clearAppliedSet.addEventListener("click", clearAppliedSetAction);
}
if (applySetFromKondate) {
  applySetFromKondate.addEventListener("click", () => {
    openWeeklySetsView({ scroll: true });
    history.replaceState(null, "", "#weeklySets");
  });
}

// Extend syncViewFromHash for weeklySets
const originalSyncViewFromHash = syncViewFromHash;
window.syncViewFromHash = function() {
  const hash = window.location.hash;
  if (hash === "#weeklySets") {
    openWeeklySetsView({ scroll: false });
    return;
  }
  originalSyncViewFromHash();
};

// Override openAppView to update applied set banner
const previousOpenAppView = window.openAppView;
window.openAppView = function(options) {
  previousOpenAppView.call(this, options);
  updateAppliedSetBanner();
};

// Initialize applied set banner on page load
setTimeout(() => {
  updateAppliedSetBanner();
}, 100);

// Escape key to close modals
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!setDetailModal.hidden) {
    closeSetDetailModal();
  }
  if (!setApplyModal.hidden) {
    closeSetApplyModal();
  }
  if (!saveMySetModal.hidden) {
    closeSaveMySetModal();
  }
});
