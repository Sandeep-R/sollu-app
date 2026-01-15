-- Add word_type enum
CREATE TYPE word_type AS ENUM ('noun', 'verb', 'adjective');

-- Add word_type column to words table
ALTER TABLE words ADD COLUMN word_type word_type;

-- Update existing words to have a type (default to noun for greeting-type words)
UPDATE words SET word_type = 'noun' WHERE word_type IS NULL;

-- Make word_type NOT NULL after updating existing rows
ALTER TABLE words ALTER COLUMN word_type SET NOT NULL;
ALTER TABLE words ALTER COLUMN word_type SET DEFAULT 'noun';

-- Insert 100 colloquial Tamil nouns
INSERT INTO words (transliteration, meaning, tamil, word_type) VALUES
  -- Family
  ('amma', 'mother', 'அம்மா', 'noun'),
  ('appa', 'father', 'அப்பா', 'noun'),
  ('anna', 'older brother', 'அண்ணா', 'noun'),
  ('akka', 'older sister', 'அக்கா', 'noun'),
  ('thambi', 'younger brother', 'தம்பி', 'noun'),
  ('thangachi', 'younger sister', 'தங்கச்சி', 'noun'),
  ('maama', 'uncle (maternal)', 'மாமா', 'noun'),
  ('maami', 'aunt (maternal uncle''s wife)', 'மாமி', 'noun'),
  ('aththai', 'aunt (father''s sister)', 'அத்தை', 'noun'),
  ('chithappa', 'uncle (father''s younger brother)', 'சித்தப்பா', 'noun'),
  ('chithi', 'aunt (mother''s younger sister)', 'சித்தி', 'noun'),
  ('paatti', 'grandmother', 'பாட்டி', 'noun'),
  ('thaatha', 'grandfather', 'தாத்தா', 'noun'),
  ('ponnu', 'girl/daughter', 'பொண்ணு', 'noun'),
  ('payyan', 'boy/son', 'பையன்', 'noun'),
  ('kozhandhai', 'child/baby', 'குழந்தை', 'noun'),
  ('friend', 'friend (commonly used)', 'ஃப்ரெண்ட்', 'noun'),
  ('nanban', 'friend (male)', 'நண்பன்', 'noun'),
  ('thozhi', 'friend (female)', 'தோழி', 'noun'),
  ('neighbour', 'neighbor', 'பக்கத்து வீட்டுக்காரர்', 'noun'),

  -- Body parts
  ('thalai', 'head', 'தலை', 'noun'),
  ('mudi', 'hair', 'முடி', 'noun'),
  ('kannu', 'eye', 'கண்ணு', 'noun'),
  ('kaadhu', 'ear', 'காது', 'noun'),
  ('mooku', 'nose', 'மூக்கு', 'noun'),
  ('vaai', 'mouth', 'வாய்', 'noun'),
  ('pal', 'tooth', 'பல்', 'noun'),
  ('naakku', 'tongue', 'நாக்கு', 'noun'),
  ('kai', 'hand', 'கை', 'noun'),
  ('kaal', 'leg/foot', 'கால்', 'noun'),
  ('viral', 'finger', 'விரல்', 'noun'),
  ('vayiru', 'stomach', 'வயிறு', 'noun'),
  ('maarbu', 'chest', 'மார்பு', 'noun'),
  ('mudhugu', 'back', 'முதுகு', 'noun'),
  ('thol', 'shoulder', 'தோள்', 'noun'),

  -- Food & Drink
  ('saappaadu', 'food/meal', 'சாப்பாடு', 'noun'),
  ('saadham', 'rice (cooked)', 'சாதம்', 'noun'),
  ('sambar', 'sambar (lentil curry)', 'சாம்பார்', 'noun'),
  ('rasam', 'rasam (soup)', 'ரசம்', 'noun'),
  ('thayir', 'curd/yogurt', 'தயிர்', 'noun'),
  ('koozh', 'porridge', 'கூழ்', 'noun'),
  ('dosai', 'dosa', 'தோசை', 'noun'),
  ('idli', 'idli', 'இட்லி', 'noun'),
  ('vadai', 'vada (fried snack)', 'வடை', 'noun'),
  ('pongal', 'pongal (rice dish)', 'பொங்கல்', 'noun'),
  ('kaapi', 'coffee', 'காப்பி', 'noun'),
  ('thenni', 'tea', 'டீ', 'noun'),
  ('thanni', 'water', 'தண்ணி', 'noun'),
  ('paal', 'milk', 'பால்', 'noun'),
  ('pazham', 'fruit', 'பழம்', 'noun'),
  ('kaai', 'vegetable/unripe fruit', 'காய்', 'noun'),
  ('kari', 'curry/meat', 'கறி', 'noun'),
  ('meen', 'fish', 'மீன்', 'noun'),
  ('kozhi', 'chicken', 'கோழி', 'noun'),
  ('mutton', 'mutton/goat meat', 'மட்டன்', 'noun'),

  -- Home & Objects
  ('veedu', 'house/home', 'வீடு', 'noun'),
  ('arai', 'room', 'அறை', 'noun'),
  ('kathavu', 'door', 'கதவு', 'noun'),
  ('jannal', 'window', 'ஜன்னல்', 'noun'),
  ('suvar', 'wall', 'சுவர்', 'noun'),
  ('mejai', 'table', 'மேஜை', 'noun'),
  ('naarkaali', 'chair', 'நாற்காலி', 'noun'),
  ('kattil', 'bed/cot', 'கட்டில்', 'noun'),
  ('padukkai', 'bed/mattress', 'படுக்கை', 'noun'),
  ('vilakku', 'lamp/light', 'விளக்கு', 'noun'),
  ('fan', 'fan', 'ஃபேன்', 'noun'),
  ('fridge', 'refrigerator', 'ஃப்ரிட்ஜ்', 'noun'),
  ('TV', 'television', 'டிவி', 'noun'),
  ('phone', 'phone', 'போன்', 'noun'),

  -- Transport
  ('bus', 'bus', 'பஸ்', 'noun'),
  ('train', 'train', 'ட்ரெயின்', 'noun'),
  ('auto', 'auto-rickshaw', 'ஆட்டோ', 'noun'),
  ('bike', 'motorcycle', 'பைக்', 'noun'),
  ('cycle', 'bicycle', 'சைக்கிள்', 'noun'),
  ('car', 'car', 'கார்', 'noun'),
  ('lorry', 'truck', 'லாரி', 'noun'),

  -- Places
  ('kadai', 'shop/store', 'கடை', 'noun'),
  ('school', 'school', 'ஸ்கூல்', 'noun'),
  ('office', 'office', 'ஆபீஸ்', 'noun'),
  ('hospital', 'hospital', 'ஹாஸ்பிடல்', 'noun'),
  ('kovil', 'temple', 'கோவில்', 'noun'),
  ('church', 'church', 'சர்ச்', 'noun'),
  ('mosque', 'mosque', 'மசூதி', 'noun'),
  ('park', 'park', 'பார்க்', 'noun'),
  ('beach', 'beach', 'பீச்', 'noun'),
  ('market', 'market', 'மார்கெட்', 'noun'),

  -- Time
  ('neram', 'time', 'நேரம்', 'noun'),
  ('naazhi', 'day', 'நாள்', 'noun'),
  ('vaaram', 'week', 'வாரம்', 'noun'),
  ('maasam', 'month', 'மாசம்', 'noun'),
  ('varusham', 'year', 'வருஷம்', 'noun'),
  ('kaaalai', 'morning', 'காலை', 'noun'),
  ('madhiyam', 'afternoon', 'மதியம்', 'noun'),
  ('saayangaalam', 'evening', 'சாயங்காலம்', 'noun'),
  ('raathiri', 'night', 'ராத்திரி', 'noun'),

  -- Nature
  ('vanam', 'sky', 'வானம்', 'noun'),
  ('mazhai', 'rain', 'மழை', 'noun'),
  ('veyil', 'sunlight/heat', 'வெயில்', 'noun'),
  ('kaatru', 'wind', 'காத்து', 'noun'),
  ('maram', 'tree', 'மரம்', 'noun');

-- Insert 100 colloquial Tamil verbs
INSERT INTO words (transliteration, meaning, tamil, word_type) VALUES
  -- Common actions
  ('saapidu', 'eat', 'சாப்பிடு', 'verb'),
  ('kudi', 'drink', 'குடி', 'verb'),
  ('padi', 'read/study', 'படி', 'verb'),
  ('ezhuthu', 'write', 'எழுது', 'verb'),
  ('pesu', 'speak/talk', 'பேசு', 'verb'),
  ('kelu', 'listen/hear/ask', 'கேளு', 'verb'),
  ('paaru', 'see/look/watch', 'பாரு', 'verb'),
  ('thoongu', 'sleep', 'தூங்கு', 'verb'),
  ('ezhundhu', 'wake up/get up', 'எழுந்து', 'verb'),
  ('nadai', 'walk', 'நடை', 'verb'),
  ('oodu', 'run', 'ஓடு', 'verb'),
  ('kudhichi', 'jump', 'குதிச்சி', 'verb'),
  ('ukkaru', 'sit', 'உக்காரு', 'verb'),
  ('nillu', 'stand/stop', 'நில்லு', 'verb'),
  ('padu', 'lie down', 'படு', 'verb'),

  -- Movement
  ('poo', 'go', 'போ', 'verb'),
  ('vaa', 'come', 'வா', 'verb'),
  ('kondu vaa', 'bring', 'கொண்டு வா', 'verb'),
  ('kondu poo', 'take (away)', 'கொண்டு போ', 'verb'),
  ('thirumbu', 'return/turn', 'திரும்பு', 'verb'),
  ('eri', 'climb/get on', 'ஏறு', 'verb'),
  ('erangu', 'get down/descend', 'இறங்கு', 'verb'),
  ('nuzhai', 'enter', 'நுழை', 'verb'),
  ('veliya poo', 'go out/exit', 'வெளிய போ', 'verb'),

  -- Daily activities
  ('kulichu', 'bathe', 'குளிச்சு', 'verb'),
  ('thuvachu', 'wash (clothes)', 'துவச்சு', 'verb'),
  ('kazhuvudu', 'wash (dishes/hands)', 'கழுவுடு', 'verb'),
  ('samaichu', 'cook', 'சமைச்சு', 'verb'),
  ('thuni maathiru', 'change clothes', 'துணி மாத்திரு', 'verb'),
  ('moodi poo', 'close (and go)', 'மூடி போ', 'verb'),
  ('thora', 'open', 'தொற', 'verb'),
  ('potu', 'put/place/wear', 'போடு', 'verb'),
  ('edu', 'take/pick up', 'எடு', 'verb'),

  -- Communication
  ('sollu', 'tell/say', 'சொல்லு', 'verb'),
  ('ketpaa', 'ask (question)', 'கேப்பா', 'verb'),
  ('bathil sollu', 'answer/reply', 'பதில் சொல்லு', 'verb'),
  ('call pannu', 'make a call', 'கால் பண்ணு', 'verb'),
  ('message anuppu', 'send message', 'மெசேஜ் அனுப்பு', 'verb'),
  ('sirichi', 'laugh/smile', 'சிரிச்சி', 'verb'),
  ('azhuthu', 'cry', 'அழுது', 'verb'),
  ('koopidu', 'call out/shout', 'கூப்பிடு', 'verb'),

  -- Work & Activities
  ('velai sei', 'work/do work', 'வேலை செய்', 'verb'),
  ('pannu', 'do/make', 'பண்ணு', 'verb'),
  ('mudichu', 'finish/complete', 'முடிச்சு', 'verb'),
  ('aarambhichu', 'start/begin', 'ஆரம்பிச்சு', 'verb'),
  ('niruthiru', 'stop (an action)', 'நிறுத்திரு', 'verb'),
  ('odhaavu', 'help', 'உதவு', 'verb'),
  ('kattuchu', 'build/tie', 'கட்டுச்சு', 'verb'),
  ('odaichu', 'break', 'உடைச்சு', 'verb'),
  ('seripannu', 'fix/repair', 'செரிபண்ணு', 'verb'),

  -- Mental actions
  ('yosi', 'think', 'யோசி', 'verb'),
  ('purinjukko', 'understand', 'புரிஞ்சுக்கோ', 'verb'),
  ('marandhu', 'forget', 'மறந்து', 'verb'),
  ('gnaabagam vachu', 'remember', 'ஞாபகம் வச்சு', 'verb'),
  ('therinjukko', 'know/learn', 'தெரிஞ்சுக்கோ', 'verb'),
  ('nambiru', 'believe/trust', 'நம்பிரு', 'verb'),
  ('sandegam', 'doubt', 'சந்தேகம்', 'verb'),
  ('venum', 'want/need', 'வேணும்', 'verb'),
  ('pudikkum', 'like', 'புடிக்கும்', 'verb'),
  ('pudikkaadhu', 'dislike', 'புடிக்காது', 'verb'),

  -- Physical actions
  ('pudi', 'hold/catch', 'புடி', 'verb'),
  ('vidu', 'leave/let go', 'விடு', 'verb'),
  ('thalli', 'push', 'தள்ளி', 'verb'),
  ('izhu', 'pull', 'இழு', 'verb'),
  ('thookku', 'lift/carry', 'தூக்கு', 'verb'),
  ('poodu', 'throw', 'போடு', 'verb'),
  ('adi', 'hit/beat', 'அடி', 'verb'),
  ('thodu', 'touch', 'தொடு', 'verb'),
  ('kizhi', 'tear', 'கிழி', 'verb'),
  ('vettu', 'cut', 'வெட்டு', 'verb'),

  -- Emotions & States
  ('bayam', 'fear', 'பயம்', 'verb'),
  ('kovam', 'anger', 'கோவம்', 'verb'),
  ('sandhosham', 'be happy', 'சந்தோஷம்', 'verb'),
  ('kavalai padhaadha', 'don''t worry', 'கவலைப்படாத', 'verb'),
  ('adjust pannu', 'adjust/manage', 'அட்ஜஸ்ட் பண்ணு', 'verb'),

  -- Giving & Receiving
  ('kudu', 'give', 'குடு', 'verb'),
  ('vaangu', 'buy/receive', 'வாங்கு', 'verb'),
  ('anuppu', 'send', 'அனுப்பு', 'verb'),
  ('eduthu vai', 'keep/save', 'எடுத்து வை', 'verb'),

  -- Shopping & Money
  ('vilai pesi', 'bargain', 'விலை பேசி', 'verb'),
  ('kaasu kudu', 'pay money', 'காசு குடு', 'verb'),
  ('settle pannu', 'settle/pay', 'செட்டில் பண்ணு', 'verb'),

  -- Travel
  ('ootu', 'drive', 'ஓட்டு', 'verb'),
  ('eri', 'board (bus/train)', 'ஏறு', 'verb'),
  ('irangiru', 'alight/get off', 'இறங்கிரு', 'verb'),
  ('poitu vaa', 'go and come back', 'போயிட்டு வா', 'verb'),

  -- Social
  ('saandhi', 'meet', 'சந்தி', 'verb'),
  ('join aagu', 'join', 'ஜாயின் ஆகு', 'verb'),
  ('vilaiyaadu', 'play', 'விளையாடு', 'verb'),
  ('win pannu', 'win', 'வின் பண்ணு', 'verb'),
  ('lose aagadha', 'don''t lose', 'லூஸ் ஆகாத', 'verb'),

  -- Miscellaneous
  ('wait pannu', 'wait', 'வெயிட் பண்ணு', 'verb'),
  ('try pannu', 'try', 'ட்ரை பண்ணு', 'verb'),
  ('check pannu', 'check', 'செக் பண்ணு', 'verb'),
  ('use pannu', 'use', 'யூஸ் பண்ணு', 'verb'),
  ('start pannu', 'start', 'ஸ்டார்ட் பண்ணு', 'verb'),
  ('stop pannu', 'stop', 'ஸ்டாப் பண்ணு', 'verb'),
  ('clean pannu', 'clean', 'க்ளீன் பண்ணு', 'verb'),
  ('share pannu', 'share', 'ஷேர் பண்ணு', 'verb'),
  ('set pannu', 'set/arrange', 'செட் பண்ணு', 'verb'),
  ('ready aagu', 'get ready', 'ரெடி ஆகு', 'verb');

-- Insert 100 colloquial Tamil adjectives
INSERT INTO words (transliteration, meaning, tamil, word_type) VALUES
  -- Size & Quantity
  ('periya', 'big/large', 'பெரிய', 'adjective'),
  ('chinna', 'small/little', 'சின்ன', 'adjective'),
  ('neelam', 'long/tall', 'நீளம்', 'adjective'),
  ('kuttai', 'short', 'குட்டை', 'adjective'),
  ('agalam', 'wide/broad', 'அகலம்', 'adjective'),
  ('oaram', 'narrow/thin', 'ஒரம்', 'adjective'),
  ('niraiya', 'many/lots of', 'நிறைய', 'adjective'),
  ('konjam', 'few/little', 'கொஞ்சம்', 'adjective'),
  ('muzhu', 'full/whole', 'முழு', 'adjective'),
  ('kali', 'empty', 'காலி', 'adjective'),

  -- Quality
  ('nalla', 'good/nice', 'நல்ல', 'adjective'),
  ('ketta', 'bad', 'கெட்ட', 'adjective'),
  ('azhagaana', 'beautiful', 'அழகான', 'adjective'),
  ('mosam', 'ugly/bad', 'மோசம்', 'adjective'),
  ('puthu', 'new', 'புது', 'adjective'),
  ('pazhaya', 'old (things)', 'பழைய', 'adjective'),
  ('suthham', 'clean', 'சுத்தம்', 'adjective'),
  ('azhukkana', 'dirty', 'அழுக்கான', 'adjective'),
  ('strong', 'strong', 'ஸ்ட்ராங்', 'adjective'),
  ('weak', 'weak', 'வீக்', 'adjective'),

  -- Temperature & Weather
  ('soodu', 'hot', 'சூடு', 'adjective'),
  ('kulir', 'cold/cool', 'குளிர்', 'adjective'),
  ('veppam', 'warm/hot weather', 'வெப்பம்', 'adjective'),
  ('eeram', 'wet/moist', 'ஈரம்', 'adjective'),
  ('ularntha', 'dry', 'உலர்ந்த', 'adjective'),

  -- Taste
  ('inippu', 'sweet', 'இனிப்பு', 'adjective'),
  ('kaaram', 'spicy', 'காரம்', 'adjective'),
  ('pulippu', 'sour', 'புளிப்பு', 'adjective'),
  ('uppu', 'salty', 'உப்பு', 'adjective'),
  ('kasappu', 'bitter', 'கசப்பு', 'adjective'),
  ('ruchiyana', 'tasty/delicious', 'ருசியான', 'adjective'),

  -- Color
  ('velai', 'white', 'வெளை', 'adjective'),
  ('karuppu', 'black', 'கறுப்பு', 'adjective'),
  ('sivappu', 'red', 'சிவப்பு', 'adjective'),
  ('manjal', 'yellow', 'மஞ்சள்', 'adjective'),
  ('pachai', 'green', 'பச்சை', 'adjective'),
  ('neelam', 'blue', 'நீலம்', 'adjective'),
  ('brown', 'brown', 'பிரவுன்', 'adjective'),

  -- Speed & Time
  ('vegam', 'fast/quick', 'வேகம்', 'adjective'),
  ('medhuvaa', 'slow/slowly', 'மெதுவா', 'adjective'),
  ('seekkiram', 'early/soon', 'சீக்கிரம்', 'adjective'),
  ('late', 'late', 'லேட்', 'adjective'),
  ('fresh', 'fresh', 'ஃப்ரெஷ்', 'adjective'),
  ('ketta pona', 'spoiled/rotten', 'கெட்டுப்போன', 'adjective'),

  -- Difficulty
  ('easy', 'easy', 'ஈசி', 'adjective'),
  ('kashdam', 'difficult/hard', 'கஷ்டம்', 'adjective'),
  ('simple', 'simple', 'சிம்பிள்', 'adjective'),
  ('complicated', 'complicated', 'காம்ப்ளிகேடட்', 'adjective'),

  -- Emotion & State
  ('santhosham', 'happy', 'சந்தோஷம்', 'adjective'),
  ('kashtam', 'sad/difficult', 'கஷ்டம்', 'adjective'),
  ('kovam', 'angry', 'கோவம்', 'adjective'),
  ('bayam', 'scared/afraid', 'பயம்', 'adjective'),
  ('kavalai', 'worried', 'கவலை', 'adjective'),
  ('bore', 'bored/boring', 'போர்', 'adjective'),
  ('tired', 'tired', 'டயர்ட்', 'adjective'),
  ('fresh-aa', 'fresh/refreshed', 'ஃப்ரெஷ்-ஆ', 'adjective'),
  ('active', 'active', 'ஆக்டிவ்', 'adjective'),
  ('lazy', 'lazy', 'லேசி', 'adjective'),

  -- Character traits
  ('nallavaru', 'good person', 'நல்லவரு', 'adjective'),
  ('kettavaru', 'bad person', 'கெட்டவரு', 'adjective'),
  ('smart', 'smart/clever', 'ஸ்மார்ட்', 'adjective'),
  ('mutti', 'foolish/stupid', 'முட்டி', 'adjective'),
  ('honest', 'honest', 'ஹானஸ்ட்', 'adjective'),
  ('friendly', 'friendly', 'ஃப்ரெண்ட்லி', 'adjective'),
  ('helpful', 'helpful', 'ஹெல்ப்ஃபுல்', 'adjective'),
  ('strict', 'strict', 'ஸ்ட்ரிக்ட்', 'adjective'),
  ('calm', 'calm', 'காம்', 'adjective'),

  -- Physical states
  ('odambu seri illai', 'unwell/sick', 'உடம்பு சரி இல்லை', 'adjective'),
  ('healthy', 'healthy', 'ஹெல்தி', 'adjective'),
  ('pasi', 'hungry', 'பசி', 'adjective'),
  ('thaagam', 'thirsty', 'தாகம்', 'adjective'),
  ('thookam', 'sleepy', 'தூக்கம்', 'adjective'),
  ('full', 'full (stomach)', 'ஃபுல்', 'adjective'),

  -- Position & Distance
  ('nearla', 'near/close', 'நியர்ல', 'adjective'),
  ('dooram', 'far', 'தூரம்', 'adjective'),
  ('mela', 'up/above', 'மேல', 'adjective'),
  ('keezha', 'down/below', 'கீழ', 'adjective'),
  ('ullai', 'inside', 'உள்ள', 'adjective'),
  ('veliya', 'outside', 'வெளிய', 'adjective'),
  ('munnaadi', 'in front', 'முன்னாடி', 'adjective'),
  ('pinnaadi', 'behind', 'பின்னாடி', 'adjective'),
  ('pakkathula', 'beside/next to', 'பக்கத்துல', 'adjective'),

  -- Comparison
  ('same', 'same', 'சேம்', 'adjective'),
  ('different', 'different', 'டிஃபரெண்ட்', 'adjective'),
  ('better', 'better', 'பெட்டர்', 'adjective'),
  ('worse', 'worse', 'வொர்ஸ்', 'adjective'),
  ('best', 'best', 'பெஸ்ட்', 'adjective'),
  ('worst', 'worst', 'வொர்ஸ்ட்', 'adjective'),

  -- Common descriptors
  ('correct', 'correct/right', 'கரெக்ட்', 'adjective'),
  ('wrong', 'wrong', 'ராங்', 'adjective'),
  ('true', 'true', 'ட்ரூ', 'adjective'),
  ('false', 'false', 'ஃபால்ஸ்', 'adjective'),
  ('important', 'important', 'இம்போர்டன்ட்', 'adjective'),
  ('urgent', 'urgent', 'அர்ஜெண்ட்', 'adjective'),
  ('ready', 'ready', 'ரெடி', 'adjective'),
  ('busy', 'busy', 'பிஸி', 'adjective'),
  ('free', 'free (available)', 'ஃப்ரீ', 'adjective'),
  ('possible', 'possible', 'பாசிபிள்', 'adjective'),
  ('impossible', 'impossible', 'இம்பாசிபிள்', 'adjective'),
  ('super', 'super/great', 'சூப்பர்', 'adjective'),
  ('semma', 'awesome/great', 'செம்ம', 'adjective'),
  ('mass', 'cool/stylish', 'மாஸ்', 'adjective');
