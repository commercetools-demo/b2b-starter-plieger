import { apiRoot } from './client';

function asAssociateInStore(associateId: string, businessUnitKey: string, storeKey: string) {
  return (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey }) as any)
    .inStoreKeyWithStoreKeyValue({ storeKey })
    .shoppingLists();
}

export async function getPurchaseLists(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;
  const response = await asAssociateInStore(associateId, businessUnitKey, storeKey)
    .get({
      queryArgs: {
        limit,
        offset,
        sort: 'lastModifiedAt desc',
        expand: ['lineItems[*].variant'],
      },
    })
    .execute();
  return response.body;
}

export async function getPurchaseListById(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  id: string
) {
  const response = await asAssociateInStore(associateId, businessUnitKey, storeKey)
    .withId({ ID: id })
    .get({
      queryArgs: {
        expand: ['lineItems[*].variant'],
      },
    })
    .execute();
  return response.body;
}

export async function createPurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  name: string,
  customerId: string
) {
  const body: Record<string, unknown> = {
    name: { 'en-US': name },
    customer: { id: customerId, typeId: 'customer' },
  };

  const response = await asAssociateInStore(associateId, businessUnitKey, storeKey)
    .post({ body: body as any })
    .execute();
  return response.body;
}

export async function updatePurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  id: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>
) {
  const response = await asAssociateInStore(associateId, businessUnitKey, storeKey)
    .withId({ ID: id })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}

export async function deletePurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  id: string,
  version: number
) {
  await asAssociateInStore(associateId, businessUnitKey, storeKey)
    .withId({ ID: id })
    .delete({ queryArgs: { version } })
    .execute();
}

export async function addItemToPurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  id: string,
  version: number,
  productId: string,
  variantId?: number,
  quantity = 1
) {
  return updatePurchaseList(
    associateId,
    businessUnitKey,
    storeKey,
    id,
    version,
    [{ action: 'addLineItem', productId, variantId, quantity }]
  );
}

export async function removeItemFromPurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  id: string,
  version: number,
  lineItemId: string
) {
  return updatePurchaseList(
    associateId,
    businessUnitKey,
    storeKey,
    id,
    version,
    [{ action: 'removeLineItem', lineItemId }]
  );
}
