import { CHAT_TOPICS } from './chatbotKnowledge';
import { SUPPORT_EMAIL } from './supportConfig';

/** Minimum score required for a topic to be considered a confident match. */
const CONFIDENCE_THRESHOLD = 1;

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'i', 'my', 'me', 'to', 'for',
  'of', 'on', 'in', 'how', 'what', 'where', 'when', 'can', 'you', 'your',
  'it', 'and', 'or', 'with', 'about', 'please', 'help',
]);

const tokenize = (text: string): string[] =>
  normalize(text)
    .split(' ')
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));

/**
 * Scores a user message against the knowledge base and returns the best
 * matching answer, or a fallback message pointing to support email.
 */
export function getChatbotReply(message: string): string {
  const normalizedMessage = normalize(message);
  const messageTokens = new Set(tokenize(message));

  let bestScore = 0;
  let bestAnswer: string | null = null;

  for (const topic of CHAT_TOPICS) {
    let score = 0;

    for (const keyword of topic.keywords) {
      const normalizedKeyword = normalize(keyword);

      // Exact phrase match counts strongly.
      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 3;
        continue;
      }

      // Otherwise, count overlapping significant words.
      const keywordTokens = tokenize(keyword);
      const overlap = keywordTokens.filter((t) => messageTokens.has(t)).length;
      if (overlap > 0 && overlap === keywordTokens.length) {
        score += 2;
      } else if (overlap > 0) {
        score += overlap * 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = topic.answer;
    }
  }

  if (bestAnswer && bestScore >= CONFIDENCE_THRESHOLD) {
    return bestAnswer;
  }

  return (
    "I'm not totally sure about that one. For anything I can't help with, " +
    `please email our support team at ${SUPPORT_EMAIL} and they'll be happy to assist.`
  );
}
