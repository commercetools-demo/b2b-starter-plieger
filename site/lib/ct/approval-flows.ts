import { apiRoot } from './client';

export async function getApprovalFlows(
  businessUnitKey: string,
  associateId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
) {
  const { limit = 20, offset = 0, status } = options;

  const queryArgs: Record<string, unknown> = { limit, offset };
  if (status) {
    queryArgs.where = `status="${status}"`;
  }

  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalFlows()
    .get({
      queryArgs: queryArgs as any,
    })
    .execute();
  return response.body;
}

export async function getApprovalFlowById(
  businessUnitKey: string,
  approvalFlowId: string,
  associateId: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalFlows()
    .withId({ ID: approvalFlowId })
    .get({
      queryArgs: {
        expand: ['order'],
      },
    })
    .execute();
  return response.body;
}

export async function approveApprovalFlow(
  businessUnitKey: string,
  approvalFlowId: string,
  associateId: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalFlows()
    .withId({ ID: approvalFlowId })
    .post({
      body: {
        action: 'approve',
      } as any,
    })
    .execute();
  return response.body;
}

export async function rejectApprovalFlow(
  businessUnitKey: string,
  approvalFlowId: string,
  associateId: string,
  reason?: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalFlows()
    .withId({ ID: approvalFlowId })
    .post({
      body: {
        action: 'reject',
        reason,
      } as any,
    })
    .execute();
  return response.body;
}
