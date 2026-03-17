import { apiRoot } from './client';

// ─── Quote Requests ─────────────────────────────────────────────────

export async function createQuoteRequest(
  associateId: string,
  businessUnitKey: string,
  cartId: string,
  cartVersion: number,
  comment?: string,
  purchaseOrderNumber?: string
) {
  const body: Record<string, unknown> = {
    cart: { id: cartId, typeId: 'cart' },
    cartVersion,
  };
  if (comment) body.comment = comment;
  if (purchaseOrderNumber) body.purchaseOrderNumber = purchaseOrderNumber;

  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quoteRequests()
    .post({ body: body as any })
    .execute();
  return response.body;
}

export async function getQuoteRequests(
  associateId: string,
  businessUnitKey: string,
  options: { limit?: number; offset?: number; sort?: string } = {}
) {
  const { limit = 20, offset = 0, sort = 'createdAt desc' } = options;
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quoteRequests()
    .get({
      queryArgs: {
        limit,
        offset,
        sort,
      },
    })
    .execute();
  return response.body;
}

export async function getQuoteRequestById(
  associateId: string,
  businessUnitKey: string,
  id: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quoteRequests()
    .withId({ ID: id })
    .get()
    .execute();
  return response.body;
}

export async function cancelQuoteRequest(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quoteRequests()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [{ action: 'changeQuoteRequestState', quoteRequestState: 'Cancelled' }],
      },
    })
    .execute();
  return response.body;
}

// ─── Quotes ──────────────────────────────────────────────────────────

export async function getQuotes(
  associateId: string,
  businessUnitKey: string,
  options: { limit?: number; offset?: number; sort?: string } = {}
) {
  const { limit = 20, offset = 0, sort = 'createdAt desc' } = options;
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quotes()
    .get({
      queryArgs: {
        limit,
        offset,
        sort,
      },
    })
    .execute();
  return response.body;
}

export async function getQuoteById(
  associateId: string,
  businessUnitKey: string,
  id: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quotes()
    .withId({ ID: id })
    .get()
    .execute();
  return response.body;
}

export async function acceptQuote(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quotes()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [{ action: 'changeQuoteState', quoteState: 'Accepted' }],
      },
    })
    .execute();
  return response.body;
}

export async function declineQuote(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quotes()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [{ action: 'changeQuoteState', quoteState: 'Declined' }],
      },
    })
    .execute();
  return response.body;
}

export async function renegotiateQuote(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  buyerComment?: string
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .quotes()
    .withId({ ID: id })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'requestQuoteRenegotiation',
            buyerComment,
          },
        ],
      },
    })
    .execute();
  return response.body;
}
