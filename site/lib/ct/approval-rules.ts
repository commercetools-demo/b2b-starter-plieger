import { apiRoot } from './client';

export async function getApprovalRules(
  businessUnitKey: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: 'anonymous' }) // Will be overridden by session
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules()
    .get({ queryArgs: { limit, offset } })
    .execute();
  return response.body;
}

export async function getApprovalRulesAdmin(
  businessUnitKey: string,
  associateId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules()
    .get({ queryArgs: { limit, offset } })
    .execute();
  return response.body;
}

export async function getApprovalRuleById(
  businessUnitKey: string,
  approvalRuleId: string,
  associateId: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules()
    .withId({ ID: approvalRuleId })
    .get()
    .execute();
  return response.body;
}

export async function createApprovalRule(
  businessUnitKey: string,
  associateId: string,
  draft: {
    name: string;
    description?: string;
    status: 'Active' | 'Inactive';
    predicate: string;
    approvers: {
      tiers: Array<{
        and: Array<{
          or: Array<{
            associateRole: { key: string; typeId: 'associate-role' };
          }>;
        }>;
      }>;
    };
    requesters: Array<{
      associateRole: { key: string; typeId: 'associate-role' };
    }>;
  }
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules()
    .post({ body: draft as any })
    .execute();
  return response.body;
}

export async function updateApprovalRule(
  businessUnitKey: string,
  approvalRuleId: string,
  associateId: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules()
    .withId({ ID: approvalRuleId })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}
