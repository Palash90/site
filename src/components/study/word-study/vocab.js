import EN_WORDS from "./en";
import BN_WORDS from "./bn";
import HI_WORDS from "./hi";
import KN_WORDS from "./kn";


// Language configuration data
const SUPPORTED_LANGUAGES = {
  English: {
    code: 'en-US',
    vocabs: EN_WORDS
  },
  Hindi: {
    code: 'hi-IN',
    vocabs: HI_WORDS
  },
  Kannada: {
    code: 'kn-IN',
    vocabs: KN_WORDS
  },
  Bengali: {
    code: 'bn-IN',
    vocabs: BN_WORDS
  }
};


export default SUPPORTED_LANGUAGES;