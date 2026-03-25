import { apiRoot } from './client';

/**
 * Helper to build the as-associate cart API root.
 * All cart operations in a B2B context must go through this chain
 * so that associate permissions are enforced by commercetools.
 */
function asAssociateInStore(
  associateId: string,
  businessUnitKey: string,
) {
  return (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey }))
    .carts()
}

export async function createCart(
  customerId: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  currency = 'USD',
  country = 'US'
) {
  const response = await asAssociateInStore(associateId, businessUnitKey)
    .post({
      body: {
        currency,
        country,
        customerId,
        businessUnit: {
          key: businessUnitKey,
          typeId: 'business-unit',
        },
        store: {
          key: storeKey,
          typeId: 'store',
        },
      },
    })
    .execute();
  return response.body;
}

export async function getCartById(
  cartId: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  const response = await asAssociateInStore(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .get()
    .execute();
  return response.body;
}

export async function updateCart(
  cartId: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  const response = await asAssociateInStore(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}

export async function addLineItem(
  cartId: string,
  version: number,
  productId: string,
  variantId: number,
  quantity: number,
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  distributionChannelId?: string
) {
  const lineAction: { action: string; [key: string]: unknown } = {
    action: 'addLineItem',
    productId,
    variantId,
    quantity,
  };
  if (distributionChannelId) {
    lineAction.distributionChannel = {
      typeId: 'channel',
      id: distributionChannelId,
    };
  }
  return updateCart(cartId, version, [lineAction], associateId, businessUnitKey, storeKey);
}

export async function changeLineItemQuantity(
  cartId: string,
  version: number,
  lineItemId: string,
  quantity: number,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  return updateCart(
    cartId,
    version,
    [{ action: 'changeLineItemQuantity', lineItemId, quantity }],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function removeLineItem(
  cartId: string,
  version: number,
  lineItemId: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  return updateCart(
    cartId,
    version,
    [{ action: 'removeLineItem', lineItemId }],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function setShippingAddress(
  cartId: string,
  version: number,
  address: Record<string, string>,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  return updateCart(
    cartId,
    version,
    [{ action: 'setShippingAddress', address }],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function setBillingAddress(
  cartId: string,
  version: number,
  address: Record<string, string>,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  return updateCart(
    cartId,
    version,
    [{ action: 'setBillingAddress', address }],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function addDiscountCode(
  cartId: string,
  version: number,
  code: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  return updateCart(
    cartId,
    version,
    [{ action: 'addDiscountCode', code }],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function addLineItemWithRecurrence(
  cartId: string,
  version: number,
  productId: string,
  variantId: number,
  quantity: number,
  recurrencePolicyId: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  distributionChannelId?: string
) {
  // Step 1: add the line item
  const cart1 = await addLineItem(
    cartId,
    version,
    productId,
    variantId,
    quantity,
    associateId,
    businessUnitKey,
    storeKey,
    distributionChannelId
  );
  // Step 2: find the newly added line item by productId + variantId
  const lineItem = cart1.lineItems.find(
    (li) => li.productId === productId && li.variant.id === variantId
  );
  if (!lineItem) {
    throw new Error('Line item not found after add');
  }
  // Step 3: set recurrence info
  return updateCart(
    cartId,
    cart1.version,
    [
      {
        action: 'setLineItemRecurrenceInfo',
        lineItemId: lineItem.id,
        recurrenceInfo: {
          recurrencePolicy: { typeId: 'recurrence-policy', id: recurrencePolicyId },
          priceSelectionMode: 'Fixed',
        },
      },
    ],
    associateId,
    businessUnitKey,
    storeKey
  );
}

export async function deleteCart(
  cartId: string,
  version: number,
  associateId: string,
  businessUnitKey: string,
  storeKey: string
) {
  await asAssociateInStore(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .delete({ queryArgs: { version } })
    .execute();
}
