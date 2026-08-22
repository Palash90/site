const ALL_WORDS = [
    "once", "upon", "time", "for", "fox" , "girl", "boy", "dad", "seven", "father", "love" , "number", "pond", "trees"
];

const EN_WORDS = [... new Set(ALL_WORDS)];
console.log("Total Number of English words: ", EN_WORDS.length);
export default EN_WORDS;