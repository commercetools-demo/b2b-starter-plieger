import { apiRoot } from './client';

export async function loginCustomer(email: string, password: string) {
  const response = await apiRoot
    .login()
    .post({ body: { email, password } })
    .execute();
  return response.body.customer;
}

export async function createCustomer(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  companyName?: string
) {
  const response = await apiRoot
    .customers()
    .post({
      body: {
        email,
        password,
        firstName,
        lastName,
        companyName,
      },
    })
    .execute();
  return response.body.customer;
}

export async function getCustomerById(customerId: string) {
  const response = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .get()
    .execute();
  return response.body;
}

export async function updateCustomer(
  customerId: string,
  version: number,
  actions: Array<{ action: string; [key: string]: unknown }>
) {
  const response = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .post({ body: { version, actions: actions as any } })
    .execute();
  return response.body;
}
