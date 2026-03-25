import { apiRoot } from './client';
import type { RecurringOrder, RecurringOrderState, RecurrencePolicy } from '@/lib/types';

export async function getRecurringOrders(
  customerId: string,
  businessUnitKey: string,
  options: { limit?: number; offset?: number; states?: RecurringOrderState[] } = {}
) {
  const { limit = 20, offset = 0, states } = options;

  const whereClauses = [
    `businessUnit(key="${businessUnitKey}")`,
  ];
  if (states && states.length > 0) {
    whereClauses.push(`recurringOrderState in (${states.map((s) => `"${s}"`).join(',')})`);
  }

  const response = await (apiRoot as any)
    .recurringOrders()
    .get({
      queryArgs: {
        where: whereClauses.join(' and '),
        limit,
        offset,
        sort: 'createdAt desc',
        expand: ['cart'],
      },
    })
    .execute();

  return {
    results: response.body.results.map(mapRecurringOrder),
    total: response.body.total,
    limit: response.body.limit,
    offset: response.body.offset,
  };
}

export async function getRecurringOrderById(id: string) {
  const response = await (apiRoot as any)
    .recurringOrders()
    .withId({ ID: id })
    .get({ queryArgs: { expand: ['cart'] } })
    .execute();
  return mapRecurringOrder(response.body);
}

export async function createRecurringOrder(draft: {
  cartId: string;
  cartVersion: number;
  startsAt?: string;
  expiresAt?: string;
}) {
  const response = await (apiRoot as any)
    .recurringOrders()
    .post({
      body: {
        cart: { id: draft.cartId },
        cartVersion: draft.cartVersion,
        ...(draft.startsAt && { startsAt: draft.startsAt }),
        ...(draft.expiresAt && { expiresAt: draft.expiresAt }),
      },
    })
    .execute();
  return mapRecurringOrder(response.body);
}

export async function updateRecurringOrderState(id: string, state: RecurringOrderState) {
  const current = await (apiRoot as any).recurringOrders().withId({ ID: id }).get().execute();
  const response = await (apiRoot as any)
    .recurringOrders()
    .withId({ ID: id })
    .post({
      body: {
        version: current.body.version,
        actions: [{ action: 'setRecurringOrderState', recurringOrderState: { type: state.toLowerCase() } }],
      },
    })
    .execute();
  return mapRecurringOrder(response.body);
}

export async function duplicateRecurringOrder(id: string) {
  const current = await (apiRoot as any)
    .recurringOrders()
    .withId({ ID: id })
    .get({ queryArgs: { expand: ['cart'] } })
    .execute();
  const obj = current.body;
  return createRecurringOrder({
    cartId: obj.cart.id,
    cartVersion: obj.cart.obj?.version ?? 1,
  });
}

export async function getRecurrencePolicies(options: { limit?: number } = {}) {
  const { limit = 50 } = options;
  const response = await (apiRoot as any)
    .recurrencePolicies()
    .get({ queryArgs: { limit } })
    .execute();

  return response.body.results.map((policy: any): RecurrencePolicy => ({
    id: policy.id,
    key: policy.key,
    name: localizedStringToString(policy.name),
    schedule: policy.schedule,
    createdAt: policy.createdAt,
  }));
}

function mapRecurringOrder(obj: any): RecurringOrder {
  return {
    id: obj.id,
    version: obj.version,
    createdAt: obj.createdAt,
    businessUnitKey: obj.businessUnit?.key,
    customerId: obj.customer?.id,
    originOrderId: obj.originOrder?.id,
    state: obj.recurringOrderState,
    schedule: obj.schedule,
    startsAt: obj.startsAt,
    nextOrderAt: obj.nextOrderAt,
    lastOrderAt: obj.lastOrderAt,
    resumesAt: obj.resumesAt,
    orderSnapshot: deriveSnapshot(obj.cart?.obj),
  };
}

function deriveSnapshot(cart: any): RecurringOrder['orderSnapshot'] {
  if (!cart) {
    return { totalPrice: { centAmount: 0, currencyCode: 'USD', fractionDigits: 2 }, lineItems: [] };
  }
  return {
    totalPrice: cart.totalPrice,
    lineItems: (cart.lineItems ?? []).map((li: any) => ({
      name: li.name,
      quantity: li.quantity,
    })),
  };
}

function localizedStringToString(ls: Record<string, string> | undefined): string {
  if (!ls) return '';
  return ls['en-US'] ?? ls['en'] ?? Object.values(ls)[0] ?? '';
}
