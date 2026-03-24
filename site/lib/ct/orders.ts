import { apiRoot } from './client';

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(10000 + Math.random() * 90000));
  return `${year}${month}${day}-${random}`;
}

export async function createOrderFromCart(
  cartId: string,
  cartVersion: number,
  associateId: string,
  businessUnitKey: string,
) {
  const orderNumber = generateOrderNumber();
  const asAssociate = apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });

  const response = await asAssociate
    .orders()
    .post({
      body: {
        cart: { id: cartId, typeId: 'cart' },
        version: cartVersion,
        orderNumber,
      },
    })
    .execute();
  return response.body;
}

export async function getOrdersForBusinessUnit(
  businessUnitKey: string,
  associateId: string,
  options: { limit?: number; offset?: number; sort?: string; status?: string } = {}
) {
  const { limit = 20, offset = 0, sort = 'createdAt desc', status } = options;
  const whereClauses: string[] = [];
  if (status) {
    whereClauses.push(`orderState="${status}"`);
  }
  const response = await (apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey }))
    .orders()
    .get({
      queryArgs: {
        where: whereClauses.length > 0 ? whereClauses.join(' and ') : undefined,
        limit,
        offset,
        sort,
      },
    })
    .execute();
  return response.body;
}

export async function getOrderById(
  orderId: string,
  associateId: string,
  businessUnitKey: string,
) {
  const asAssociate = apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });

  const response = await asAssociate
    .orders()
    .withId({ ID: orderId })
    .get()
    .execute();
  return response.body;

}

export async function updateOrderState(
  orderId: string,
  version: number,
  orderState: string,
  associateId: string,
  businessUnitKey: string,
) {
  const asAssociate = apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });

    const response = await asAssociate
      .orders()
      .withId({ ID: orderId })
      .post({
        body: {
          version,
          actions: [{ action: 'changeOrderState', orderState }],
        },
      })
      .execute();
    return response.body;
}

export async function createOrderFromQuote(
  quoteId: string,
  quoteVersion: number,
  associateId: string,
  businessUnitKey: string,
) {
  const orderNumber = generateOrderNumber();
  const asAssociate = apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });

    const response = await asAssociate
      .orders()
      .post({
        body: {
          quote: { id: quoteId, typeId: 'quote' },
          version: quoteVersion,
          orderState: 'Open',
          orderNumber,
        } as any,
      })
      .execute();
    return response.body;
}
