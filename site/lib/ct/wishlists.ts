import { ShoppingListDraft } from '@commercetools/platform-sdk';
import { apiRoot } from './client';

function asAssociateInStore(associateId: string, businessUnitKey: string) {
  return (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey }))
    .shoppingLists();
}

export async function getPurchaseLists(
  associateId: string,
  businessUnitKey: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;
  const response = await asAssociateInStore(associateId, businessUnitKey)
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
  id: string
) {
  const response = await asAssociateInStore(associateId, businessUnitKey)
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
  customerId: string,
  locale: string
) {
  const body: ShoppingListDraft = {
    name: { [locale]: name },
    customer: { id: customerId, typeId: 'customer' },
    store: { typeId: 'store', key: storeKey}
  };

  const response = await asAssociateInStore(associateId, businessUnitKey)
    .post({ body })
    .execute();
  return response.body;
}

export async function updatePurchaseList(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>
) {
  const response = await asAssociateInStore(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}

export async function deletePurchaseList(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
) {
  await asAssociateInStore(associateId, businessUnitKey)
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
    id,
    version,
    [{ action: 'addLineItem', productId, variantId, quantity }]
  );
}

export async function removeItemFromPurchaseList(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  lineItemId: string
) {
  return updatePurchaseList(
    associateId,
    businessUnitKey,
    id,
    version,
    [{ action: 'removeLineItem', lineItemId }]
  );
}
