/** Mirrors backend Prisma `RequestPolicy`. */
export type RequestPolicy = {
  id: string
  tenantId: string
  name: string
  description: string | null
  type: RequestPolicyType
  isDefault: boolean
  status: RequestPolicyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** `GET /v1/config/request-policy?id=` includes the type-specific rule(s). */
export type RequestPolicyDetail = RequestPolicy & {
  wfhRules: WFHPolicyRule[]
  regularizationRules: RegularizationPolicyRule[]
  leaveRules: LeavePolicyRule[]
}

/** Backend joi: type must be LEAVE | WFH | REGULARIZATION (Prisma also has HOLIDAY, unused). */
export type RequestPolicyType = 'LEAVE' | 'WFH' | 'REGULARIZATION'

export type RequestPolicyStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export type WFHRuleType = 'PERMANENT' | 'RESTRICTED'

export type WFHPolicyRule = {
  id: string
  requestPolicyId: string
  type: WFHRuleType
  maxDaysPerMonth: number | null
  monthCarryForwardAllowed: boolean
  monthCarryForwardLimit: number | null
  requiresApproval: boolean
  createdAt: string
  updatedAt: string
}

export type RegularizationRuleType = 'UNRESTRICTED' | 'RESTRICTED'

export type RegularizationPolicyRule = {
  id: string
  requestPolicyId: string
  type: RegularizationRuleType
  maxDaysPerMonth: number | null
  requiresApproval: boolean
  createdAt: string
  updatedAt: string
}

export type FinancialYearType = 'FINANCIAL' | 'CALENDAR'

export type LeavePolicyRule = {
  id: string
  requestPolicyId: string
  leaveTypeId: string
  daysPerMonth: number
  monthlyCarryForwardAllowed: boolean
  monthlyCarryForwardLimit: number | null
  monthlyUsageLimit: number | null
  daysPerYear: number
  yearlyCarryForwardAllowed: boolean
  yearlyCarryForwardLimit: number | null
  financialYearType: FinancialYearType
  minServiceDaysRequired: number
  createdAt: string
  updatedAt: string
}

/**
 * POST /v1/config/request-policy — name/type required. wfhRule is required when
 * type is WFH, regularizationRule required when type is REGULARIZATION; both are
 * created together with the policy in the same call (there's no separate create
 * step for these rules).
 */
export type CreateRequestPolicyInput = {
  name: string
  description?: string
  type: RequestPolicyType
  wfhRule?: {
    type?: WFHRuleType
    maxDaysPerMonth?: number
    monthCarryForwardAllowed?: boolean
    monthCarryForwardLimit?: number
    requiresApproval?: boolean
  }
  regularizationRule?: {
    type?: RegularizationRuleType
    maxDaysPerMonth?: number
    requiresApproval?: boolean
  }
}

/** meta returned by GET /v1/config/request-policy/list?pagination=true. */
export type RequestPolicyListMeta = {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type RequestPolicyListParams = {
  page: number
  limit: number
}
