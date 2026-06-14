const ALL_WORDS = [
    // --- Original & Common Greetings ---
    'hello', 'world', 'thank', 'you', 'please', 'good', 'morning', 'night', 'friend', 'family',
    'home', 'food', 'water', 'happy', 'love', 'time', 'day', 'work', 'life', 'school',
    'book', 'city', 'money', 'help', 'smile', 'today', 'hi', 'bye', 'welcome', 'sorry',
    'great', 'fine', 'yes', 'no', 'ok', 'cool', 'super', 'awesome', 'nice', 'sweet',

    // --- Family & People ---
    'mom', 'dad', 'baby', 'brother', 'sister', 'grandma', 'grandpa', 'aunt', 'uncle', 'cousin',
    'child', 'kid', 'boy', 'girl', 'man', 'woman', 'teacher', 'doctor', 'nurse', 'coach',
    'king', 'queen', 'prince', 'princess', 'fairy', 'giant', 'hero', 'wizard', 'pirate', 'clown',
    'neighbor', 'guest', 'team', 'class', 'group', 'person', 'people', 'twin', 'sir', 'lady',

    // --- Body Parts ---
    'head', 'hair', 'face', 'eye', 'ear', 'nose', 'mouth', 'lip', 'tooth', 'teeth',
    'tongue', 'chin', 'cheek', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger',
    'thumb', 'nail', 'chest', 'tummy', 'belly', 'back', 'hip', 'leg', 'knee', 'ankle',
    'foot', 'feet', 'toe', 'skin', 'bone', 'blood', 'heart', 'brain', 'voice', 'throat',

    // --- Colors ---
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown',
    'gray', 'gold', 'silver', 'bright', 'dark', 'light', 'rainbow', 'clear', 'pale', 'shiny',

    // --- Numbers & Math Terms ---
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand',
    'count', 'add', 'plus', 'minus', 'equal', 'number', 'math', 'line', 'dot', 'shape',
    'circle', 'square', 'triangle', 'star', 'heart', 'oval', 'box', 'block', 'half', 'whole',

    // --- Animals (Pets & Farm) ---
    'dog', 'cat', 'puppy', 'kitten', 'bird', 'fish', 'goldfish', 'turtle', 'rabbit', 'bunny',
    'mouse', 'hamster', 'cow', 'horse', 'pig', 'piglet', 'sheep', 'lamb', 'goat', 'chicken',
    'hen', 'rooster', 'duck', 'duckling', 'goose', 'turkey', 'donkey', 'mule', 'bull', 'llama',

    // --- Animals (Wild & Zoo) ---
    'lion', 'tiger', 'bear', 'elephant', 'monkey', 'ape', 'gorilla', 'chimpanzee', 'zebra', 'giraffe',
    'hippo', 'rhino', 'deer', 'fawn', 'fox', 'wolf', 'kangaroo', 'koala', 'panda', 'camel',
    'leopard', 'cheetah', 'skunk', 'raccoon', 'squirrel', 'chipmunk', 'beaver', 'otter', 'seal', 'walrus',
    'whale', 'dolphin', 'shark', 'octopus', 'penguin', 'polar bear', 'owl', 'eagle', 'parrot', 'peacock',

    // --- Bugs & Tiny Creatures ---
    'bug', 'insect', 'ant', 'bee', 'honeybee', 'butterfly', 'caterpillar', 'ladybug', 'beetle', 'fly',
    'mosquito', 'spider', 'worm', 'snail', 'slug', 'frog', 'toad', 'lizard', 'snake', 'crab',

    // --- Clothes & Wearables ---
    'shirt', 'pants', 'jeans', 'shorts', 'skirt', 'dress', 'gown', 'coat', 'jacket', 'sweater',
    'socks', 'shoes', 'boots', 'sneakers', 'sandals', 'slippers', 'hat', 'cap', 'beanie', 'gloves',
    'mittens', 'scarf', 'belt', 'tie', 'pajamas', 'robe', 'apron', 'costume', 'mask', 'cape',
    'glasses', 'watch', 'ring', 'crown', 'bag', 'backpack', 'purse', 'pocket', 'button', 'zipper',

    // --- Food & Breakfast ---
    'bread', 'butter', 'jam', 'jelly', 'egg', 'cheese', 'milk', 'yogurt', 'cereal', 'oatmeal',
    'pancake', 'waffle', 'toast', 'honey', 'syrup', 'bacon', 'sausage', 'juice', 'tea', 'cocoa',

    // --- Fruits & Vegetables ---
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'cherry', 'peach', 'plum',
    'pear', 'melon', 'watermelon', 'lemon', 'lime', 'mango', 'pineapple', 'kiwi', 'coconut', 'date',
    'carrot', 'potato', 'tomato', 'onion', 'garlic', 'corn', 'peas', 'beans', 'broccoli', 'cucumber',
    'lettuce', 'spinach', 'pumpkin', 'squash', 'pepper', 'mushroom', 'olive', 'pickle', 'nut', 'peanut',

    // --- Dinner & Treats ---
    'rice', 'soup', 'salad', 'pasta', 'pizza', 'burger', 'sandwich', 'taco', 'chicken', 'fish',
    'meat', 'steak', 'fry', 'chip', 'cracker', 'popcorn', 'pretzel', 'cookie', 'cake', 'cupcake',
    'pie', 'donut', 'muffin', 'candy', 'chocolate', 'ice cream', 'pudding', 'jello', 'gum', 'treat',

    // --- Kitchen & Dining ---
    'plate', 'bowl', 'cup', 'glass', 'mug', 'spoon', 'fork', 'knife', 'napkin', 'straw',
    'pot', 'pan', 'dish', 'tray', 'oven', 'stove', 'fridge', 'sink', 'table', 'chair',

    // --- House & Rooms ---
    'house', 'home', 'room', 'bedroom', 'bathroom', 'kitchen', 'living room', 'playroom', 'closet', 'hallway',
    'door', 'window', 'wall', 'floor', 'ceiling', 'roof', 'stairs', 'steps', 'porch', 'yard',
    'garden', 'gate', 'fence', 'chimney', 'garage', 'basement', 'attic', 'key', 'lock', 'bell',

    // --- Furniture & Household items ---
    'bed', 'pillow', 'blanket', 'sheet', 'mattress', 'couch', 'sofa', 'desk', 'lamp', 'light',
    'fan', 'clock', 'mirror', 'rug', 'carpet', 'curtain', 'shelf', 'drawer', 'bin', 'basket',
    'soap', 'towel', 'shampoo', 'brush', 'comb', 'toothbrush', 'toothpaste', 'tissue', 'paper', 'trash',

    // --- School & Supplies ---
    'school', 'class', 'desk', 'board', 'chalk', 'marker', 'crayon', 'pencil', 'pen', 'eraser',
    'ruler', 'glue', 'tape', 'scissors', 'paper', 'notebook', 'folder', 'backpack', 'lunchbox', 'recess',
    'lesson', 'story', 'poem', 'song', 'music', 'art', 'craft', 'paint', 'clay', 'game',
    'letter', 'word', 'sentence', 'page', 'line', 'quiz', 'test', 'grade', 'prize', 'sticker',

    // --- Toys & Fun ---
    'toy', 'doll', 'ball', 'kite', 'balloon', 'bubble', 'block', 'puzzle', 'game', 'card',
    'train', 'car', 'truck', 'plane', 'boat', 'ship', 'rocket', 'robot', 'teddy', 'bear',
    'bike', 'scooter', 'skate', 'wagon', 'slide', 'swing', 'sandbox', 'pool', 'tube', 'float',
    'yo-yo', 'top', 'marble', 'spinner', 'slime', 'chalk', 'drum', 'flute', 'bell', 'horn',

    // --- Nature & Sky ---
    'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'storm', 'thunder',
    'lightning', 'fog', 'mist', 'ice', 'frost', 'air', 'dirt', 'mud', 'sand', 'rock',
    'stone', 'pebble', 'dust', 'ground', 'mountain', 'hill', 'valley', 'cave', 'cliff', 'field',
    'meadow', 'forest', 'woods', 'jungle', 'desert', 'island', 'beach', 'coast', 'ocean', 'sea',
    'river', 'lake', 'pond', 'stream', 'creek', 'wave', 'tide', 'shell', 'wave', 'nature',

    // --- Plants & Flowers ---
    'tree', 'leaf', 'branch', 'root', 'bark', 'seed', 'sprout', 'plant', 'weed', 'grass',
    'moss', 'fern', 'bush', 'shrub', 'flower', 'rose', 'daisy', 'tulip', 'lily', 'sunflower',
    'petal', 'stem', 'thorn', 'bud', 'bloom', 'fruit', 'berry', 'vine', 'ivy', 'clover',

    // --- Weather & Seasons ---
    'weather', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'hot', 'cold', 'warm',
    'cool', 'sunny', 'rainy', 'snowy', 'windy', 'cloudy', 'stormy', 'dry', 'wet', 'climate',

    // --- Places ---
    'town', 'village', 'street', 'road', 'path', 'sidewalk', 'park', 'playground', 'zoo', 'farm',
    'shop', 'store', 'market', 'mall', 'bakery', 'bank', 'library', 'museum', 'hospital', 'clinic',
    'station', 'airport', 'harbor', 'port', 'beach', 'hotel', 'theater', 'circus', 'fair', 'castle',

    // --- Vehicles & Transport ---
    'car', 'truck', 'bus', 'van', 'jeep', 'taxi', 'cab', 'bike', 'bicycle', 'scooter',
    'motorcycle', 'train', 'subway', 'airplane', 'plane', 'helicopter', 'jet', 'rocket', 'spaceship', 'boat',
    'ship', 'submarine', 'ferry', 'yacht', 'canoe', 'raft', 'wheel', 'tire', 'engine', 'motor',
    'seat', 'window', 'door', 'horn', 'brake', 'track', 'road', 'rail', 'driver', 'pilot',

    // --- Time & Days ---
    'second', 'minute', 'hour', 'day', 'week', 'month', 'year', 'century', 'decade', 'date',
    'morning', 'noon', 'afternoon', 'evening', 'night', 'midnight', 'sunrise', 'sunset', 'dawn', 'dusk',
    'today', 'yesterday', 'tomorrow', 'tonight', 'now', 'then', 'later', 'soon', 'early', 'late',
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'weekend', 'holiday', 'vacation',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',

    // --- Easy Verbs / Action Words (Part 1) ---
    'run', 'walk', 'hop', 'jump', 'skip', 'leap', 'dance', 'sing', 'play', 'sports',
    'swim', 'dive', 'float', 'fly', 'climb', 'crawl', 'slide', 'swing', 'ride', 'drive',
    'eat', 'drink', 'bite', 'chew', 'swallow', 'lick', 'taste', 'smell', 'sniff', 'breathe',
    'see', 'look', 'watch', 'stare', 'blink', 'wink', 'hear', 'listen', 'speak', 'talk',
    'say', 'tell', 'whisper', 'shout', 'yell', 'scream', 'cry', 'weep', 'laugh', 'giggle',

    // --- Easy Verbs / Action Words (Part 2) ---
    'smile', 'frown', 'think', 'dream', 'sleep', 'wake', 'rest', 'sit', 'stand', 'kneel',
    'bend', 'stretch', 'reach', 'touch', 'feel', 'hold', 'carry', 'lift', 'drop', 'fall',
    'throw', 'catch', 'kick', 'hit', 'strike', 'push', 'pull', 'slide', 'roll', 'shake',
    'clap', 'wave', 'hug', 'kiss', 'tickle', 'scratch', 'wash', 'clean', 'wipe', 'brush',
    'comb', 'dress', 'wear', 'buy', 'sell', 'give', 'take', 'bring', 'send', 'keep',

    // --- Easy Verbs / Action Words (Part 3) ---
    'open', 'close', 'shut', 'lock', 'unlock', 'turn', 'spin', 'twist', 'fold', 'bend',
    'cut', 'tear', 'rip', 'break', 'fix', 'mend', 'build', 'make', 'draw', 'paint',
    'color', 'write', 'read', 'spell', 'learn', 'teach', 'ask', 'answer', 'find', 'lose',
    'hide', 'seek', 'show', 'share', 'help', 'save', 'win', 'lose', 'start', 'stop',
    'begin', 'end', 'finish', 'wait', 'stay', 'go', 'come', 'leave', 'arrive', 'meet',

    // --- Adjectives / Describing Words (Part 1) ---
    'big', 'small', 'little', 'huge', 'tiny', 'tall', 'short', 'long', 'wide', 'thin',
    'thick', 'fat', 'skinny', 'heavy', 'light', 'strong', 'weak', 'fast', 'slow', 'quick',
    'hot', 'cold', 'warm', 'cool', 'wet', 'dry', 'dirty', 'clean', 'messy', 'neat',
    'hard', 'soft', 'rough', 'smooth', 'sharp', 'dull', 'sticky', 'slippery', 'sweet', 'sour',
    'bitter', 'salty', 'spicy', 'yummy', 'tasty', 'fresh', 'stale', 'rotten', 'good', 'bad',

    // --- Adjectives / Describing Words (Part 2) ---
    'nice', 'kind', 'mean', 'sweet', 'cute', 'pretty', 'beautiful', 'ugly', 'funny', 'silly',
    'smart', 'clever', 'wise', 'brave', 'scared', 'shy', 'proud', 'polite', 'rude', 'gentle',
    'loud', 'quiet', 'noisy', 'silent', 'safe', 'unsafe', 'easy', 'hard', 'difficult', 'simple',
    'new', 'old', 'young', 'ancient', 'modern', 'dear', 'poor', 'rich', 'cheap', 'dear',
    'true', 'false', 'right', 'wrong', 'correct', 'real', 'fake', 'magic', 'lucky', 'super',

    // --- Emotions & Feelings ---
    'happy', 'sad', 'mad', 'angry', 'glad', 'proud', 'scared', 'afraid', 'brave', 'calm',
    'excited', 'bored', 'tired', 'sleepy', 'hungry', 'thirsty', 'sick', 'well', 'hurt', 'pain',
    'shock', 'surprise', 'love', 'hate', 'care', 'worry', 'hope', 'trust', 'fear', 'joy',

    // --- Everyday Items & Materials ---
    'wood', 'metal', 'plastic', 'glass', 'paper', 'cloth', 'fabric', 'string', 'rope', 'wire',
    'chain', 'leather', 'rubber', 'wool', 'cotton', 'silk', 'stone', 'brick', 'clay', 'paint',
    'glue', 'ink', 'wax', 'soap', 'sponge', 'brush', 'comb', 'mirror', 'coin', 'bill',

    // --- Pronouns & Simple Sight Words ---
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine',
    'yours', 'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why',
    'how', 'who', 'what', 'which', 'some', 'any', 'all', 'none', 'every', 'each',
    'both', 'same', 'other', 'another', 'more', 'less', 'most', 'least', 'too', 'very',

    // --- Simple Prepositions & Directions ---
    'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'above', 'below',
    'near', 'far', 'next', 'behind', 'front', 'beside', 'between', 'among', 'through', 'around',
    'into', 'onto', 'top', 'bottom', 'side', 'edge', 'corner', 'left', 'right', 'straight',
    'north', 'south', 'east', 'west', 'forward', 'backward', 'inside', 'outside', 'upon', 'across',

    // --- Celebrations & Special Days ---
    'party', 'feast', 'fair', 'gift', 'present', 'cake', 'candle', 'balloon', 'card', 'wish',
    'holiday', 'vacation', 'trip', 'travel', 'visit', 'parade', 'mask', 'costume', 'hat', 'prize',
    'medal', 'trophy', 'ribbon', 'cheer', 'clap', 'shout', 'laugh', 'fun', 'magic', 'show'
];

const EN_WORDS = [... new Set(ALL_WORDS)];
console.log("Total Number of English words: ", EN_WORDS.length);
export default EN_WORDS;