import { apiRoot } from './client';

// ─── Read operations (project-level is OK for discovery) ────────────

export async function getBusinessUnitsForAssociate(customerId: string) {
  const response = await apiRoot
    .businessUnits()
    .get({
      queryArgs: {
        where: `associates(customer(id="${customerId}"))`,
        expand: ['associates[*].customer'],
        limit: 100,
      },
    })
    .execute();
  return response.body.results;
}

export async function getBusinessUnitByKey(key: string) {
  const response = await apiRoot
    .businessUnits()
    .withKey({ key })
    .get({
      queryArgs: {
        expand: ['associates[*].customer'],
      },
    })
    .execute();
  return response.body;
}

export async function getBusinessUnitById(id: string) {
  const response = await apiRoot
    .businessUnits()
    .withId({ ID: id })
    .get({
      queryArgs: {
        expand: ['associates[*].customer'],
      },
    })
    .execute();
  return response.body;
}

// ─── Write operations (use as-associate for permission enforcement) ──

export async function createBusinessUnit(
  associateId: string,
  parentBusinessUnitKey: string,
  draft: {
    key: string;
    name: string;
    unitType: 'Company' | 'Division';
    contactEmail?: string;
    associates?: Array<{
      customer: { id: string; typeId: 'customer' };
      associateRoleAssignments: Array<{
        associateRole: { key: string; typeId: 'associate-role' };
      }>;
    }>;
    parentUnit?: { key: string; typeId: 'business-unit' };
    storeMode?: 'Explicit' | 'FromParent';
    stores?: Array<{ key: string; typeId: 'store' }>;
  }
) {
  const response = await (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({
      businessUnitKey: parentBusinessUnitKey,
    }) as any)
    .businessUnits()
    .post({ body: draft as any })
    .execute();
  return response.body;
}

export async function updateBusinessUnit(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>
) {
  const response = await (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey }) as any)
    .businessUnits()
    .withId({ ID: id })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}

// ─── Associate management via Business Unit ─────────────────────────

export async function addAssociate(
  associateId: string,
  businessUnitKey: string,
  businessUnitId: string,
  version: number,
  associate: {
    customer: { id: string; typeId: 'customer' };
    associateRoleAssignments: Array<{
      associateRole: { key: string; typeId: 'associate-role' };
    }>;
  }
) {
  return updateBusinessUnit(associateId, businessUnitKey, businessUnitId, version, [
    { action: 'addAssociate', associate },
  ]);
}

export async function removeAssociate(
  associateId: string,
  businessUnitKey: string,
  businessUnitId: string,
  version: number,
  customerId: string
) {
  return updateBusinessUnit(associateId, businessUnitKey, businessUnitId, version, [
    {
      action: 'removeAssociate',
      customer: { id: customerId, typeId: 'customer' },
    },
  ]);
}

export async function changeAssociateRoles(
  associateId: string,
  businessUnitKey: string,
  businessUnitId: string,
  version: number,
  customerId: string,
  roleAssignments: Array<{
    associateRole: { key: string; typeId: 'associate-role' };
  }>
) {
  return updateBusinessUnit(associateId, businessUnitKey, businessUnitId, version, [
    {
      action: 'changeAssociate',
      associate: {
        customer: { id: customerId, typeId: 'customer' },
        associateRoleAssignments: roleAssignments,
      },
    },
  ]);
}

// ─── Business Unit addresses ─────────────────────────────────────

export async function addBusinessUnitAddress(
  associateId: string,
  businessUnitKey: string,
  businessUnitId: string,
  version: number,
  address: {
    streetName?: string;
    streetNumber?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
    company?: string;
  }
) {
  return updateBusinessUnit(associateId, businessUnitKey, businessUnitId, version, [
    { action: 'addAddress', address },
  ]);
}

export async function removeBusinessUnitAddress(
  associateId: string,
  businessUnitKey: string,
  businessUnitId: string,
  version: number,
  addressId: string
) {
  return updateBusinessUnit(associateId, businessUnitKey, businessUnitId, version, [
    { action: 'removeAddress', addressId },
  ]);
}
