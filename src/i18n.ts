import type {
  DecisionCategory,
  DecisionTemplate,
  OutcomeStatus,
  ReasonType,
  SameDecisionAgain,
} from './types'

const isKo = navigator.language.startsWith('ko')

function t(en: string, ko: string): string {
  return isKo ? ko : en
}

export const S = {
  isKo,
  appName: 'WhyLog',
  tagline: t('Remember why.', 'Remember why.'),

  // Nav / list
  homePrompt: t('What did you decide today?', '오늘은 무엇을 결정했나요?'),
  newDecision: t('New decision', '새 결정'),
  editDecision: t('Edit decision', '결정 수정'),
  searchHint: t('Search decisions', '결정 검색'),
  emptyList: t(
    'No decisions yet. Capture your first one — future you will thank you.',
    '아직 기록이 없어요. 첫 결정을 기록해보세요 — 미래의 내가 고마워할 거예요.',
  ),
  filterAll: t('All', '전체'),
  filterActive: t('Active', '진행 중'),
  filterDue: t('Review due', '회고 예정'),
  filterReviewed: t('Reviewed', '회고 완료'),
  dueBadge: t('Review due', '회고할 시간'),
  reviewedBadge: t('Reviewed', '회고 완료'),

  // Create
  qWhat: t('What did you decide?', '무엇을 결정했나요?'),
  qReason: t('What was the most important reason?', '가장 중요한 이유는?'),
  qConfidence: t('How confident are you?', '얼마나 확신하나요?'),
  qWhen: t('When should we check back?', '언제 다시 확인할까요?'),
  qAlternatives: t('What were the alternatives?', '다른 선택지는 무엇이었나요?'),
  qExpectation: t('What do you expect to happen?', '무엇이 일어날 것으로 예상하나요?'),
  qContext: t('What was the situation?', '당시 상황은 어땠나요?'),
  categoryLabel: t('Category', '카테고리'),
  reasonTagsLabel: t('Basis for the decision (select all that apply)', '판단 근거 (복수 선택)'),
  addMore: t('Add more detail', '더 기록하기'),
  save: t('Save', '저장'),
  recordDecision: t('Record decision', '결정 기록'),
  customDate: t('Pick a date', '직접 설정'),
  noReviewDate: t('No reminder', '설정 안 함'),
  validateTitle: t('Please enter your decision', '결정을 입력해주세요'),
  validateReason: t('Please enter your reason', '이유를 입력해주세요'),
  alternativesHint: t('One per line', '한 줄에 하나씩 입력'),

  // Detail
  confidenceLabel: t('Confidence', '확신도'),
  reviewOn: t('Review on', '회고 예정일'),
  createdOn: t('Recorded', '기록일'),
  alternativesLabel: t('Alternatives considered', '고려한 대안'),
  expectationLabel: t('Expectation', '예상'),
  contextLabel: t('Context', '당시 상황'),
  edit: t('Edit', '수정'),
  delete: t('Delete', '삭제'),
  deleteConfirm: t(
    'Delete this decision? This cannot be undone.',
    '이 결정을 삭제할까요? 되돌릴 수 없어요.',
  ),
  share: t('Copy share link', '공유 링크 복사'),
  shareCopied: t('Link copied to clipboard', '링크가 복사되었어요'),
  startReview: t('Write review', '회고 작성'),

  // Review
  reviewTitle: t('How did it turn out?', '결과는 어땠나요?'),
  qOutcome: t('Compared to what you expected?', '예상과 비교하면?'),
  qActualResult: t('What actually happened?', '실제로 어떻게 되었나요?'),
  qAgain: t('Would you decide the same way again?', '다시 그때로 돌아가도 같은 결정을 할까요?'),
  qReflection: t('What did you learn?', '무엇을 배웠나요?'),
  atTheTime: t('What you wrote at the time', '그때의 기록'),
  saveReview: t('Save review', '회고 저장'),

  // Insights
  insights: t('Insights', '인사이트'),
  totalDecisions: t('Decisions', '기록한 결정'),
  reviewedCount: t('Reviewed', '회고 완료'),
  dueCount: t('Due for review', '회고 예정'),
  avgConfidence: t('Avg. confidence', '평균 확신도'),
  reasonStatsTitle: t('Success rate by reasoning', '판단 근거별 적중률'),
  highConfidenceTitle: t('When you were 80%+ confident', '확신도 80% 이상이었을 때'),
  betterOrAsExpected: t('turned out as expected or better', '예상대로 또는 그 이상'),
  insightsLocked: (n: number) =>
    t(
      `Review ${n} more decision${n > 1 ? 's' : ''} to unlock insights.`,
      `인사이트를 보려면 회고를 ${n}개 더 작성하세요.`,
    ),

  // Map (timeline + network)
  map: t('Map', '맵'),
  timelineTab: t('Timeline', '타임라인'),
  networkTab: t('Network', '네트워크'),
  mapEmpty: t('Record a few decisions to see them here.', '결정을 몇 개 기록하면 여기서 볼 수 있어요.'),
  networkHint: t(
    'Solid lines: linked decisions · faint lines: same category. Click a node to open it.',
    '진한 선: 연결된 결정 · 흐린 선: 같은 카테고리. 노드를 클릭하면 열려요.',
  ),
  relatedLabel: t('Related decisions', '관련 결정'),
  relatedSearchHint: t('Search decisions to link', '연결할 결정 검색'),

  // Settings / data
  settings: t('Data', '데이터'),
  exportJson: t('Export JSON', 'JSON 내보내기'),
  importJson: t('Import JSON', 'JSON 가져오기'),
  importDone: (added: number, updated: number) =>
    t(`Imported: ${added} added, ${updated} updated`, `가져오기 완료: ${added}개 추가, ${updated}개 갱신`),
  importFailed: t('Import failed: invalid file', '가져오기 실패: 잘못된 파일'),
  localOnlyNote: t(
    'All data lives in this browser only. Export regularly to keep a backup.',
    '모든 데이터는 이 브라우저에만 저장돼요. 정기적으로 내보내기로 백업하세요.',
  ),

  // Shared decision import
  sharedTitle: t('Shared decision', '공유된 결정'),
  sharedImport: t('Add to my log', '내 기록에 추가'),
  sharedImported: t('Added to your log', '내 기록에 추가되었어요'),
  sharedInvalid: t('This share link is invalid.', '잘못된 공유 링크예요.'),

  back: t('Back', '뒤로'),
  cancel: t('Cancel', '취소'),
}

export function categoryLabel(c: DecisionCategory): string {
  const map: Record<DecisionCategory, [string, string]> = {
    work: ['Work', '업무'],
    business: ['Business', '사업'],
    money: ['Money', '돈'],
    purchase: ['Purchase', '구매'],
    relationship: ['Relationship', '관계'],
    learning: ['Learning', '학습'],
    health: ['Health', '건강'],
    personal: ['Personal', '개인'],
    other: ['Other', '기타'],
  }
  return t(...map[c])
}

export function reasonTypeLabel(r: ReasonType): string {
  const map: Record<ReasonType, [string, string]> = {
    data: ['Data', '데이터'],
    experience: ['Experience', '경험'],
    cost: ['Cost', '비용'],
    time: ['Time', '시간'],
    risk: ['Risk', '리스크'],
    opinion: ['Opinion', '타인 의견'],
    instinct: ['Instinct', '직감'],
    constraint: ['Constraint', '제약'],
    opportunity: ['Opportunity', '기회'],
  }
  return t(...map[r])
}

export function outcomeLabel(o: OutcomeStatus): string {
  const map: Record<OutcomeStatus, [string, string]> = {
    betterThanExpected: ['Better than expected', '예상보다 좋음'],
    asExpected: ['As expected', '예상대로'],
    worseThanExpected: ['Worse than expected', '예상보다 나쁨'],
    undecidable: ['Not sure yet', '아직 모름'],
  }
  return t(...map[o])
}

export function sameAgainLabel(v: SameDecisionAgain): string {
  const map: Record<SameDecisionAgain, [string, string]> = {
    yes: ['Yes', '한다'],
    probably: ['Probably', '아마 한다'],
    notSure: ['Not sure', '모르겠다'],
    probablyNot: ['Probably not', '아마 안 한다'],
    no: ['No', '안 한다'],
  }
  return t(...map[v])
}

export function templateLabel(tpl: DecisionTemplate): string {
  const map: Record<DecisionTemplate, [string, string]> = {
    basic: ['Basic', '기본'],
    product: ['Product', 'Product'],
    career: ['Career', 'Career'],
    purchase: ['Purchase', 'Purchase'],
  }
  return t(...map[tpl])
}

export function templateTitleHint(tpl: DecisionTemplate): string {
  const map: Record<DecisionTemplate, [string, string]> = {
    basic: ['e.g. Build the MVP first', '예: MVP를 먼저 개발하기로 했다'],
    product: ['What are you building or changing?', '무엇을 만들거나 바꾸기로 했나요?'],
    career: ['What career decision did you make?', '어떤 커리어 결정을 했나요?'],
    purchase: ['What did you decide to buy, and for how much?', '무엇을 얼마에 구매하기로 했나요?'],
  }
  return t(...map[tpl])
}

export function templateReasonHint(tpl: DecisionTemplate): string {
  const map: Record<DecisionTemplate, [string, string]> = {
    basic: ['Why did you choose this?', '왜 이렇게 결정했나요?'],
    product: ['Why this choice now? Expected benefit vs. cost?', '왜 지금 이 선택인가요? 비용 대비 기대 효과는?'],
    career: ['Why now? What risk are you taking?', '왜 지금인가요? 감수하는 리스크는?'],
    purchase: ['Why do you need it? Advantage over alternatives?', '왜 필요한가요? 대안 대비 장점은?'],
  }
  return t(...map[tpl])
}

export function templateExpectationHint(tpl: DecisionTemplate): string {
  const map: Record<DecisionTemplate, [string, string]> = {
    basic: ['e.g. We can launch within 4 weeks', '예: 4주 이내 출시할 수 있을 것이다'],
    product: ['Which metrics or outcomes should improve?', '어떤 지표·결과가 좋아질 것으로 예상하나요?'],
    career: ['What change do you expect in a year?', '1년 뒤 어떤 변화를 기대하나요?'],
    purchase: ['How often and how will you use it?', '얼마나 자주, 어떻게 사용할 것으로 예상하나요?'],
  }
  return t(...map[tpl])
}

export function templateContextHint(tpl: DecisionTemplate): string {
  const map: Record<DecisionTemplate, [string, string]> = {
    basic: ['Budget, available time, information level, urgency', '예산, 가용 시간, 정보 수준, 긴급도 등'],
    product: ['Budget, timeline, team situation, urgency', '예산, 개발 기간, 팀 상황, 긴급도'],
    career: ['Current situation, alternatives, financial room, urgency', '현재 상황, 대안 유무, 재정 여유, 긴급도'],
    purchase: ['Budget, alternatives, how urgent it is', '예산, 대안, 긴급한 정도'],
  }
  return t(...map[tpl])
}

export function presetLabel(days: number): string {
  switch (days) {
    case 7:
      return t('7 days', '7일')
    case 30:
      return t('30 days', '30일')
    case 90:
      return t('90 days', '90일')
    case 180:
      return t('6 months', '6개월')
    default:
      return t(`${days} days`, `${days}일`)
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
