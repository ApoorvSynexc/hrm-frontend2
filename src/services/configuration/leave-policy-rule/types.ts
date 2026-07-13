import type { FinancialYearType } from '../request-policy/types'

export type { FinancialYearType } from '../request-policy/types'

/** POST /v1/config/leave-policy-rule — requestPolicyId & leaveTypeId required, rest optional. */
export type CreateLeavePolicyRuleInput = {
  requestPolicyId: string
  leaveTypeId: string
  daysPerMonth?: number
  daysPerYear?: number
  monthlyCarryForwardAllowed?: boolean
  monthlyCarryForwardLimit?: number
  monthlyUsageLimit?: number
  yearlyCarryForwardAllowed?: boolean
  yearlyCarryForwardLimit?: number
  minServiceDaysRequired?: number
  financialYearType?: FinancialYearType
}
