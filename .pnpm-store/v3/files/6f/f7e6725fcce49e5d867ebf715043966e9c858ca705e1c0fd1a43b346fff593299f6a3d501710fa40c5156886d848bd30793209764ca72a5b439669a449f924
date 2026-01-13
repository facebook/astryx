"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.minLength = exports.maxLength = exports.poolSize = exports.humanId = exports.adverbs = exports.verbs = exports.nouns = exports.adjectives = void 0;
exports.adjectives = ["afraid", "all", "beige", "better", "big", "blue", "bold", "brave", "breezy", "bright", "brown", "bumpy", "busy", "calm", "chatty", "chilly", "chubby", "clean", "clear", "clever", "cold", "common", "cool", "cozy", "crisp", "cuddly", "curly", "curvy", "cute", "cyan", "dark", "deep", "dirty", "dry", "dull", "eager", "early", "easy", "eight", "eighty", "eleven", "empty", "every", "fair", "famous", "fancy", "fast", "few", "fiery", "fifty", "fine", "five", "flat", "floppy", "fluffy", "forty", "four", "frank", "free", "fresh", "fruity", "full", "funky", "funny", "fuzzy", "gentle", "giant", "gold", "good", "goofy", "great", "green", "grumpy", "happy", "heavy", "hip", "honest", "hot", "huge", "humble", "hungry", "icy", "itchy", "jolly", "khaki", "kind", "large", "late", "lazy", "legal", "lemon", "light", "little", "long", "loose", "loud", "lovely", "lucky", "major", "many", "metal", "mighty", "modern", "moody", "neat", "new", "nice", "nine", "ninety", "odd", "old", "olive", "open", "orange", "perky", "petite", "pink", "plain", "plenty", "polite", "pretty", "proud", "public", "puny", "purple", "quick", "quiet", "rare", "ready", "real", "red", "rich", "ripe", "salty", "seven", "shaggy", "shaky", "sharp", "shiny", "short", "shy", "silent", "silly", "silver", "six", "sixty", "slick", "slimy", "slow", "small", "smart", "smooth", "social", "soft", "solid", "some", "sour", "sparkly", "spicy", "spotty", "stale", "strict", "strong", "sunny", "sweet", "swift", "tall", "tame", "tangy", "tasty", "ten", "tender", "thick", "thin", "thirty", "three", "tidy", "tiny", "tired", "tough", "tricky", "true", "twelve", "twenty", "two", "upset", "vast", "violet", "wacky", "warm", "wet", "whole", "wicked", "wide", "wild", "wise", "witty", "yellow", "young", "yummy"];
exports.nouns = ["actors", "ads", "adults", "aliens", "animals", "ants", "apes", "apples", "areas", "baboons", "badgers", "bags", "balloons", "bananas", "banks", "bars", "baths", "bats", "beans", "bears", "beds", "beers", "bees", "berries", "bikes", "birds", "boats", "bobcats", "books", "bottles", "boxes", "breads", "brooms", "buckets", "bugs", "buses", "bushes", "buttons", "camels", "cameras", "candies", "candles", "canyons", "carpets", "carrots", "cars", "cases", "cats", "chairs", "chefs", "chicken", "cities", "clocks", "cloths", "clouds", "clowns", "clubs", "coats", "cobras", "coins", "colts", "comics", "cooks", "corners", "cougars", "cows", "crabs", "crews", "cups", "cycles", "dancers", "days", "deer", "deserts", "dingos", "dodos", "dogs", "dolls", "donkeys", "donuts", "doodles", "doors", "dots", "dragons", "drinks", "dryers", "ducks", "eagles", "ears", "eels", "eggs", "emus", "ends", "experts", "eyes", "facts", "falcons", "fans", "feet", "files", "flies", "flowers", "forks", "foxes", "friends", "frogs", "games", "garlics", "geckos", "geese", "ghosts", "gifts", "glasses", "goats", "grapes", "groups", "guests", "hairs", "hands", "hats", "heads", "hoops", "hornets", "horses", "hotels", "hounds", "houses", "humans", "icons", "ideas", "impalas", "insects", "islands", "items", "jars", "jeans", "jobs", "jokes", "keys", "kids", "kings", "kiwis", "knives", "lamps", "lands", "laws", "lemons", "lies", "lights", "lilies", "lines", "lions", "lizards", "llamas", "loops", "mails", "mammals", "mangos", "maps", "masks", "meals", "melons", "memes", "meteors", "mice", "mirrors", "moles", "moments", "monkeys", "months", "moons", "moose", "mugs", "nails", "needles", "news", "nights", "numbers", "olives", "onions", "oranges", "otters", "owls", "pandas", "pans", "pants", "papayas", "papers", "parents", "parks", "parrots", "parts", "paths", "paws", "peaches", "pears", "peas", "pens", "pets", "phones", "pianos", "pigs", "pillows", "places", "planes", "planets", "plants", "plums", "poems", "poets", "points", "pots", "pugs", "pumas", "queens", "rabbits", "radios", "rats", "ravens", "readers", "regions", "results", "rice", "rings", "rivers", "rockets", "rocks", "rooms", "roses", "rules", "sails", "schools", "seals", "seas", "sheep", "shirts", "shoes", "showers", "shrimps", "sides", "signs", "singers", "sites", "sloths", "snails", "snakes", "socks", "spiders", "spies", "spoons", "squids", "stamps", "stars", "states", "steaks", "streets", "suits", "suns", "swans", "symbols", "tables", "taxes", "taxis", "teams", "teeth", "terms", "things", "ties", "tigers", "times", "tips", "tires", "toes", "tools", "towns", "toys", "trains", "trams", "trees", "turkeys", "turtles", "vans", "views", "walls", "wasps", "waves", "ways", "webs", "weeks", "windows", "wings", "wolves", "wombats", "words", "worlds", "worms", "yaks", "years", "zebras", "zoos"
];
exports.verbs = ["accept", "act", "add", "admire", "agree", "allow", "appear", "argue", "arrive", "ask", "attack", "attend", "bake", "bathe", "battle", "beam", "beg", "begin", "behave", "bet", "boil", "bow", "brake", "brush", "build", "burn", "buy", "call", "camp", "care", "carry", "change", "cheat", "check", "cheer", "chew", "clap", "clean", "cough", "count", "cover", "crash", "create", "cross", "cry", "cut", "dance", "decide", "deny", "design", "dig", "divide", "do", "double", "doubt", "draw", "dream", "dress", "drive", "drop", "drum", "eat", "end", "enjoy", "enter", "exist", "fail", "fall", "feel", "fetch", "film", "find", "fix", "flash", "float", "flow", "fly", "fold", "follow", "fry", "give", "glow", "go", "grab", "greet", "grin", "grow", "guess", "hammer", "hang", "happen", "heal", "hear", "help", "hide", "hope", "hug", "hunt", "invent", "invite", "itch", "jam", "jog", "join", "joke", "judge", "juggle", "jump", "kick", "kiss", "kneel", "knock", "know", "laugh", "lay", "lead", "learn", "leave", "lick", "lie", "like", "listen", "live", "look", "lose", "love", "make", "march", "marry", "mate", "matter", "melt", "mix", "move", "nail", "notice", "obey", "occur", "open", "own", "pay", "peel", "pick", "play", "poke", "post", "press", "prove", "pull", "pump", "punch", "push", "raise", "read", "refuse", "relate", "relax", "remain", "repair", "repeat", "reply", "report", "rescue", "rest", "retire", "return", "rhyme", "ring", "roll", "rule", "run", "rush", "say", "scream", "search", "see", "sell", "send", "serve", "shake", "share", "shave", "shine", "shop", "shout", "show", "sin", "sing", "sink", "sip", "sit", "sleep", "slide", "smash", "smell", "smile", "smoke", "sneeze", "sniff", "sort", "speak", "spend", "stand", "stare", "start", "stay", "stick", "stop", "strive", "study", "swim", "switch", "take", "talk", "tan", "tap", "taste", "teach", "tease", "tell", "thank", "think", "throw", "tickle", "tie", "trade", "train", "travel", "try", "turn", "type", "unite", "vanish", "visit", "wait", "walk", "warn", "wash", "watch", "wave", "wear", "win", "wink", "wish", "wonder", "work", "worry", "write", "yawn", "yell"];
exports.adverbs = ["bravely", "brightly", "busily", "daily", "freely", "hungrily", "joyously", "knowingly", "lazily", "noisily", "oddly", "politely", "quickly", "quietly", "rapidly", "safely", "sleepily", "slowly", "truly", "yearly"];
function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function longest(arr) { return arr.reduce(function (a, b) { return a.length > b.length ? a : b; }); }
function shortest(arr) { return arr.reduce(function (a, b) { return a.length < b.length ? a : b; }); }
function humanId(options) {
    if (options === void 0) { options = {}; }
    if (typeof options === 'string')
        options = { separator: options };
    if (typeof options === 'boolean')
        options = { capitalize: options };
    var _a = options.separator, separator = _a === void 0 ? '' : _a, _b = options.capitalize, capitalize = _b === void 0 ? true : _b, _c = options.adjectiveCount, adjectiveCount = _c === void 0 ? 1 : _c, _d = options.addAdverb, addAdverb = _d === void 0 ? false : _d;
    var res = __spreadArray(__spreadArray(__spreadArray([], __spreadArray([], Array(adjectiveCount), true).map(function (_) { return random(exports.adjectives); }), true), [
        random(exports.nouns),
        random(exports.verbs)
    ], false), ((addAdverb) ? [random(exports.adverbs)] : []), true);
    if (capitalize)
        res = res.map(function (r) { return r.charAt(0).toUpperCase() + r.substr(1); });
    return res.join(separator);
}
exports.humanId = humanId;
function poolSize(options) {
    if (options === void 0) { options = {}; }
    var _a = options.adjectiveCount, adjectiveCount = _a === void 0 ? 1 : _a, _b = options.addAdverb, addAdverb = _b === void 0 ? false : _b;
    return (exports.adjectives.length * adjectiveCount) * exports.nouns.length * exports.verbs.length * (addAdverb ? exports.adverbs.length : 1);
}
exports.poolSize = poolSize;
function maxLength(options) {
    if (options === void 0) { options = {}; }
    var _a = options.adjectiveCount, adjectiveCount = _a === void 0 ? 1 : _a, _b = options.addAdverb, addAdverb = _b === void 0 ? false : _b, _c = options.separator, separator = _c === void 0 ? '' : _c;
    return (longest(exports.adjectives).length * adjectiveCount) +
        (adjectiveCount * separator.length) +
        longest(exports.nouns).length +
        separator.length +
        longest(exports.verbs).length +
        (addAdverb ? longest(exports.adverbs).length + separator.length : 0);
}
exports.maxLength = maxLength;
function minLength(options) {
    if (options === void 0) { options = {}; }
    var _a = options.adjectiveCount, adjectiveCount = _a === void 0 ? 1 : _a, _b = options.addAdverb, addAdverb = _b === void 0 ? false : _b, _c = options.separator, separator = _c === void 0 ? '' : _c;
    return (shortest(exports.adjectives).length * adjectiveCount) +
        (adjectiveCount * separator.length) +
        shortest(exports.nouns).length +
        separator.length +
        shortest(exports.verbs).length +
        (addAdverb ? shortest(exports.adverbs).length + separator.length : 0);
}
exports.minLength = minLength;
exports.default = humanId;
//# sourceMappingURL=index.js.map