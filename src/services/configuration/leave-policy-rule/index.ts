import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from '../../../hooks'
import { requestPolicyKeys } from '../request-policy'
import type { CreateLeavePolicyRuleInput } from './types'
import type { LeavePolicyRule } from '../request-policy/types'

export type { CreateLeavePolicyRuleInput, FinancialYearType } from './types'

/**
 * Backend note: GET /v1/config/leave-policy-rule/list reads its `requestPolicyId`
 * filter from the request body, which browsers refuse to send on a GET — it 500s
 * unconditionally. There's also no updateLeavePolicyRuleSchema support for `id`
 * (same bug as request-policy update), so update always 400s too. Only
 * create/delete are exposed here; the current set of rules for a policy is read
 * from RequestPolicy's own detail response (`leaveRules`), which already embeds
 * them and doesn't hit either broken endpoint.
 */
export function useLeavePolicyRule() {
  const http = useHttpClient()
  const queryClient = useQueryClient()
  // Leave rules are embedded in the parent policy's detail response, so
  // invalidate that instead of a (non-existent) leave-policy-rule list query.
  const invalidateParentPolicy = (requestPolicyId: string) =>
    queryClient.invalidateQueries({ queryKey: requestPolicyKeys.detail(requestPolicyId) })

  const createLeavePolicyRule = useMutation({
    mutationFn: async (input: CreateLeavePolicyRuleInput) => {
      const res = await http.post<LeavePolicyRule>('/v1/config/leave-policy-rule', input)
      return res.data
    },
    onSuccess: (data) => invalidateParentPolicy(data.requestPolicyId),
  })

  const deleteLeavePolicyRule = useMutation({
    mutationFn: async ({ id }: { id: string; requestPolicyId: string }) => {
      const res = await http.delete<LeavePolicyRule>(`/v1/config/leave-policy-rule?id=${id}`)
      return res.data
    },
    onSuccess: (_data, variables) => invalidateParentPolicy(variables.requestPolicyId),
  })

  return { createLeavePolicyRule, deleteLeavePolicyRule }
}
