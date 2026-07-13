import { useState, type ReactNode } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { Button, ConfirmDialog, Dropdown, Modal, TextField, Typography } from '../../../../components'
import { getErrorMessage } from '../../../../lib'
import {
  useLeavePolicyRule,
  useLeaveType,
  useRequestPolicy,
  type LeavePolicyRule,
  type RequestPolicy,
} from '../../../../services'

const FINANCIAL_YEAR_OPTIONS = [
  { label: 'Financial Year', value: 'FINANCIAL' },
  { label: 'Calendar Year', value: 'CALENDAR' },
]

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-body">{label}</p>
      <p className="text-sm font-medium text-heading">{value}</p>
    </div>
  )
}

type NewLeaveRuleForm = {
  leaveTypeId: string
  daysPerMonth: string
  daysPerYear: string
  monthlyUsageLimit: string
  minServiceDaysRequired: string
  financialYearType: 'FINANCIAL' | 'CALENDAR'
}

const EMPTY_LEAVE_RULE_FORM: NewLeaveRuleForm = {
  leaveTypeId: '',
  daysPerMonth: '0',
  daysPerYear: '0',
  monthlyUsageLimit: '',
  minServiceDaysRequired: '0',
  financialYearType: 'FINANCIAL',
}

type RequestPolicyDetailModalProps = {
  open: boolean
  onClose: () => void
  policy: RequestPolicy | null
}

export default function RequestPolicyDetailModal({ open, onClose, policy }: RequestPolicyDetailModalProps) {
  const { getRequestPolicyDetail } = useRequestPolicy({ requestPolicyId: policy?.id })
  const { getLeaveTypes } = useLeaveType({ listParams: { page: 1, limit: 100 } })
  const { createLeavePolicyRule, deleteLeavePolicyRule } = useLeavePolicyRule()
  const [addingRule, setAddingRule] = useState(false)
  const [ruleForm, setRuleForm] = useState<NewLeaveRuleForm>(EMPTY_LEAVE_RULE_FORM)
  const [deleteTarget, setDeleteTarget] = useState<LeavePolicyRule | null>(null)

  const detail = getRequestPolicyDetail.data
  const leaveTypes = getLeaveTypes.data?.leaveTypes ?? []
  const leaveTypeName = (id: string) => leaveTypes.find((lt) => lt.id === id)?.name ?? '—'

  const wfhRule = detail?.wfhRules?.[0]
  const regRule = detail?.regularizationRules?.[0]

  const startAddRule = () => {
    setRuleForm(EMPTY_LEAVE_RULE_FORM)
    setAddingRule(true)
  }

  const submitAddRule = () => {
    if (!policy || !ruleForm.leaveTypeId) return
    createLeavePolicyRule.mutate(
      {
        requestPolicyId: policy.id,
        leaveTypeId: ruleForm.leaveTypeId,
        daysPerMonth: ruleForm.daysPerMonth ? Number(ruleForm.daysPerMonth) : undefined,
        daysPerYear: ruleForm.daysPerYear ? Number(ruleForm.daysPerYear) : undefined,
        monthlyUsageLimit: ruleForm.monthlyUsageLimit ? Number(ruleForm.monthlyUsageLimit) : undefined,
        minServiceDaysRequired: ruleForm.minServiceDaysRequired
          ? Number(ruleForm.minServiceDaysRequired)
          : undefined,
        financialYearType: ruleForm.financialYearType,
      },
      { onSuccess: () => setAddingRule(false) },
    )
  }

  const confirmDeleteRule = () => {
    if (!deleteTarget || !policy) return
    deleteLeavePolicyRule.mutate(
      { id: deleteTarget.id, requestPolicyId: policy.id },
      { onSuccess: () => setDeleteTarget(null) },
    )
  }

  if (!policy) return null

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg" title={policy.name}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type" value={policy.type} />
            <Field label="Default" value={policy.isDefault ? 'Yes' : 'No'} />
            <Field label="Status" value={policy.status} />
          </div>
          {policy.description && <Field label="Description" value={policy.description} />}

          {getRequestPolicyDetail.isLoading && (
            <Typography variant="body-sm" color="body">
              Loading policy details…
            </Typography>
          )}

          {policy.type === 'WFH' && wfhRule && (
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-body/60 uppercase">WFH Rule</p>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
                <Field label="Type" value={wfhRule.type === 'PERMANENT' ? 'Permanent (unlimited)' : 'Restricted'} />
                <Field label="Max Days / Month" value={wfhRule.maxDaysPerMonth ?? '—'} />
                <Field label="Carry Forward" value={wfhRule.monthCarryForwardAllowed ? 'Allowed' : 'Not allowed'} />
                <Field label="Carry Forward Limit" value={wfhRule.monthCarryForwardLimit ?? '—'} />
                <Field label="Requires Approval" value={wfhRule.requiresApproval ? 'Yes' : 'No'} />
              </div>
              <p className="mt-2 text-xs text-body">
                Rule editing isn't available yet — delete and recreate the policy to change these values.
              </p>
            </div>
          )}

          {policy.type === 'REGULARIZATION' && regRule && (
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-body/60 uppercase">
                Regularization Rule
              </p>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
                <Field label="Type" value={regRule.type === 'UNRESTRICTED' ? 'Unrestricted' : 'Restricted'} />
                <Field label="Max Days / Month" value={regRule.maxDaysPerMonth ?? '—'} />
                <Field label="Requires Approval" value={regRule.requiresApproval ? 'Yes' : 'No'} />
              </div>
              <p className="mt-2 text-xs text-body">
                Rule editing isn't available yet — delete and recreate the policy to change these values.
              </p>
            </div>
          )}

          {policy.type === 'LEAVE' && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider text-body/60 uppercase">Leave Rules</p>
                {!addingRule && (
                  <Button size="sm" variant="outline" leftIcon={<FiPlus size={14} />} onClick={startAddRule}>
                    Add Leave Rule
                  </Button>
                )}
              </div>

              {createLeavePolicyRule.isError && (
                <Typography variant="body-sm" className="mb-2 text-red-500">
                  {getErrorMessage(createLeavePolicyRule.error)}
                </Typography>
              )}

              {addingRule && (
                <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border p-3">
                  <Dropdown
                    label="Leave Type"
                    required
                    options={leaveTypes.map((lt) => ({ label: lt.name, value: lt.id }))}
                    value={ruleForm.leaveTypeId}
                    onChange={(value) => setRuleForm((prev) => ({ ...prev, leaveTypeId: value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Days / Month"
                      inputMode="numeric"
                      value={ruleForm.daysPerMonth}
                      onChange={(e) => setRuleForm((prev) => ({ ...prev, daysPerMonth: e.target.value }))}
                    />
                    <TextField
                      label="Days / Year"
                      inputMode="numeric"
                      value={ruleForm.daysPerYear}
                      onChange={(e) => setRuleForm((prev) => ({ ...prev, daysPerYear: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Monthly Usage Limit"
                      inputMode="numeric"
                      value={ruleForm.monthlyUsageLimit}
                      onChange={(e) => setRuleForm((prev) => ({ ...prev, monthlyUsageLimit: e.target.value }))}
                    />
                    <TextField
                      label="Min Service Days Required"
                      inputMode="numeric"
                      value={ruleForm.minServiceDaysRequired}
                      onChange={(e) =>
                        setRuleForm((prev) => ({ ...prev, minServiceDaysRequired: e.target.value }))
                      }
                    />
                  </div>
                  <Dropdown
                    label="Financial Year Type"
                    options={FINANCIAL_YEAR_OPTIONS}
                    value={ruleForm.financialYearType}
                    onChange={(value) =>
                      setRuleForm((prev) => ({ ...prev, financialYearType: value as 'FINANCIAL' | 'CALENDAR' }))
                    }
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAddingRule(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      loading={createLeavePolicyRule.isPending}
                      disabled={!ruleForm.leaveTypeId}
                      onClick={submitAddRule}
                    >
                      Add Rule
                    </Button>
                  </div>
                </div>
              )}

              {detail?.leaveRules && detail.leaveRules.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {detail.leaveRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-heading">{leaveTypeName(rule.leaveTypeId)}</p>
                        <p className="text-xs text-body">
                          {rule.daysPerMonth}/month · {rule.daysPerYear}/year
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${leaveTypeName(rule.leaveTypeId)} rule`}
                        onClick={() => setDeleteTarget(rule)}
                        className="rounded-lg p-2 text-body transition-colors hover:bg-surface-2 hover:text-red-500"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !addingRule && (
                  <p className="rounded-lg bg-surface-2 px-3 py-2.5 text-xs text-body">
                    No leave rules added yet — click "Add Leave Rule" to attach one per leave type.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Leave Rule"
        message={`Remove the ${leaveTypeName(deleteTarget?.leaveTypeId ?? '')} rule from this policy?`}
        loading={deleteLeavePolicyRule.isPending}
        onConfirm={confirmDeleteRule}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
