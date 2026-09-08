export type DecisionStatus = 'active' | 'reviewed'

export type DecisionCategory =
  | 'work'
  | 'business'
  | 'money'
  | 'purchase'
  | 'relationship'
  | 'learning'
  | 'health'
  | 'personal'
  | 'other'

export const CATEGORIES: DecisionCategory[] = [
  'work',
  'business',
  'money',
  'purchase',
  'relationship',
  'learning',
  'health',
  'personal',
  'other',
]

export type ReasonType =
  | 'data'
  | 'experience'
  | 'cost'
  | 'time'
  | 'risk'
  | 'opinion'
  | 'instinct'
  | 'constraint'
  | 'opportunity'

export const REASON_TYPES: ReasonType[] = [
  'data',
  'experience',
  'cost',
  'time',
  'risk',
  'opinion',
  'instinct',
  'constraint',
  'opportunity',
]

export type OutcomeStatus =
  | 'betterThanExpected'
  | 'asExpected'
  | 'worseThanExpected'
  | 'undecidable'

export const OUTCOME_STATUSES: OutcomeStatus[] = [
  'betterThanExpected',
  'asExpected',
  'worseThanExpected',
  'undecidable',
]

export type SameDecisionAgain = 'yes' | 'probably' | 'notSure' | 'probablyNot' | 'no'

export const SAME_AGAIN_VALUES: SameDecisionAgain[] = [
  'yes',
  'probably',
  'notSure',
  'probablyNot',
  'no',
]

export interface Outcome {
  status: OutcomeStatus
  actualResult?: string
  wouldDecideAgain?: SameDecisionAgain
  reflection?: string
  reviewedAt: string // ISO date
}

export interface Decision {
  id: string
  title: string
  reason: string
  expectation?: string
  confidence: number // 0-100
  category: DecisionCategory
  context?: string
  createdAt: string // ISO date
  updatedAt: string
  reviewDate?: string // ISO date (day precision)
  status: DecisionStatus
  reasonTypes: ReasonType[]
  alternatives: string[]
  outcome?: Outcome
}

export type DecisionTemplate = 'basic' | 'product' | 'career' | 'purchase'

export const TEMPLATES: DecisionTemplate[] = ['basic', 'product', 'career', 'purchase']

export const TEMPLATE_CATEGORY: Record<DecisionTemplate, DecisionCategory> = {
  basic: 'other',
  product: 'work',
  career: 'personal',
  purchase: 'purchase',
}

export const REVIEW_PRESETS = [7, 30, 90, 180]

export const MIN_REVIEWS_FOR_INSIGHTS = 5

export function isReviewDue(d: Decision): boolean {
  if (!d.reviewDate || d.status === 'reviewed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(d.reviewDate).getTime() <= today.getTime()
}
