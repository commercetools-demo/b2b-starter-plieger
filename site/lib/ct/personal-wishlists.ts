import { apiRoot } from './client';

/** All calls use apiRoot.shoppingLists() with customer where clause (no asAssociate) */

export async function getWishlists(
  customerId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;
  const response = await apiRoot
    .shoppingLists()
    .get({
      queryArgs: {
        where: `customer(id="${customerId}")`,
        limit,
        offset,
        sort: 'createdAt desc',
      },
    })
    .execute();
  return response.body;
}

export async function getWishlistById(id: string, customerId: string) {
  const response = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .get()
    .execute();
  const list = response.body as any;
  if (list.customer?.id !== customerId) {
    throw new Error('Not found');
  }
  return list;
}

export async function createWishlist(customerId: string, name: string) {
  const response = await apiRoot
    .shoppingLists()
    .post({
      body: {
        name: { 'en-US': name },
        customer: { id: customerId, typeId: 'customer' },
      },
    })
    .execute();
  return response.body;
}

export async function updateWishlist(id: string, version: number, actions: any[]) {
  const response = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({ body: { version, actions } })
    .execute();
  return response.body;
}

export async function deleteWishlist(id: string, version: number) {
  await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .delete({ queryArgs: { version } })
    .execute();
}

export async function addItemToWishlist(
  id: string,
  version: number,
  productId: string,
  variantId: number,
  quantity = 1
) {
  const response = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'addLineItem',
            productId,
            variantId,
            quantity,
          },
        ],
      },
    })
    .execute();
  return response.body;
}

export async function removeItemFromWishlist(id: string, version: number, lineItemId: string) {
  const response = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [{ action: 'removeLineItem', lineItemId }],
      },
    })
    .execute();
  return response.body;
}
