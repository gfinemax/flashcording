import type { QuizPool, QuizSession, QuizQuestion } from "@/lib/types"

export const mockQuizPools: QuizPool[] = [
  {
    id: 1,
    title: "Python 기초",
    category: "python",
    difficulty: "easy",
    question_count: 10,
  },
  {
    id: 2,
    title: "Git 브랜칭",
    category: "git",
    difficulty: "medium",
    question_count: 15,
  },
  {
    id: 3,
    title: "React Hooks",
    category: "react",
    difficulty: "hard",
    question_count: 8,
  },
  {
    id: 4,
    title: "TypeScript 고급",
    category: "typescript",
    difficulty: "hard",
    question_count: 12,
  },
  {
    id: 5,
    title: "Flask 라우팅",
    category: "python",
    difficulty: "medium",
    question_count: 10,
  },
  {
    id: 6,
    title: "Python 코딩 챌린지",
    category: "python",
    difficulty: "medium",
    question_count: 5,
  },
]

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: "다음 중 Git rebase의 장점은?",
    options: [
      { id: 1, text: "커밋 히스토리를 선형으로 유지" },
      { id: 2, text: "충돌 해결이 더 쉬움" },
      { id: 3, text: "원격 저장소와 자동 동기화" },
      { id: 4, text: "브랜치 삭제가 자동화됨" },
    ],
    correct_option_id: 1,
    explanation: "Git rebase는 커밋 히스토리를 선형으로 유지하여 더 깔끔한 프로젝트 히스토리를 만듭니다.",
  },
  {
    id: 2,
    text: "Python에서 리스트 컴프리헨션의 장점은?",
    options: [
      { id: 1, text: "코드가 더 길어진다" },
      { id: 2, text: "성능이 느려진다" },
      { id: 3, text: "간결하고 읽기 쉬운 코드" },
      { id: 4, text: "메모리를 더 많이 사용한다" },
    ],
    correct_option_id: 3,
    explanation:
      "리스트 컴프리헨션은 간결하고 읽기 쉬운 코드를 작성할 수 있게 해주며, 일반적으로 for 루프보다 빠릅니다.",
  },
  {
    id: 3,
    text: "React의 useEffect 훅은 언제 실행되나요?",
    options: [
      { id: 1, text: "컴포넌트가 마운트될 때만" },
      { id: 2, text: "의존성 배열의 값이 변경될 때" },
      { id: 3, text: "매 렌더링마다" },
      { id: 4, text: "사용자가 클릭할 때" },
    ],
    correct_option_id: 2,
    explanation: "useEffect는 의존성 배열에 지정된 값이 변경될 때 실행됩니다. 빈 배열이면 마운트 시에만 실행됩니다.",
  },
]

export const mockCodeWritingQuestions: QuizQuestion[] = [
  {
    id: 101,
    type: "code-writing",
    text: "두 숫자를 더하는 함수를 작성하세요",
    options: [],
    correct_option_id: 0,
    language: "python",
    code_template: `def add_numbers(a, b):
    # 여기에 코드를 작성하세요
    pass`,
    test_cases: [
      { input: "add_numbers(2, 3)", expected_output: "5" },
      { input: "add_numbers(10, 20)", expected_output: "30" },
      { input: "add_numbers(-5, 5)", expected_output: "0" },
    ],
    explanation: "두 숫자를 더하려면 return a + b를 사용하면 됩니다.",
  },
  {
    id: 102,
    type: "code-writing",
    text: "리스트의 최댓값을 찾는 함수를 작성하세요",
    options: [],
    correct_option_id: 0,
    language: "python",
    code_template: `def find_max(numbers):
    # 여기에 코드를 작성하세요
    pass`,
    test_cases: [
      { input: "find_max([1, 5, 3, 9, 2])", expected_output: "9" },
      { input: "find_max([10, 20, 30])", expected_output: "30" },
      { input: "find_max([-5, -1, -10])", expected_output: "-1" },
    ],
    explanation: "max() 함수를 사용하거나 반복문으로 최댓값을 찾을 수 있습니다.",
  },
]

export function createMockQuizSession(poolId: number): QuizSession {
  const questions = poolId === 6 ? mockCodeWritingQuestions : mockQuizQuestions

  return {
    session_id: `session-${Date.now()}`,
    pool_id: poolId,
    questions,
    current_question: 0,
    score: 0,
  }
}
