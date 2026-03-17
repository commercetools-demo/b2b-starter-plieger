import { apiRoot } from './client';

export async function getAssociateRoles(options: { buyerAssignable?: boolean } = {}) {
  const queryArgs: Record<string, unknown> = { limit: 100 };
  if (options.buyerAssignable !== undefined) {
    queryArgs.where = `buyerAssignable=${options.buyerAssignable}`;
  }
  const response = await apiRoot
    .associateRoles()
    .get({ queryArgs: queryArgs as any })
    .execute();
  return response.body.results;
}

export async function getAssociateRoleByKey(key: string) {
  const response = await apiRoot
    .associateRoles()
    .withKey({ key })
    .get()
    .execute();
  return response.body;
}
