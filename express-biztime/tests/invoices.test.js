const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query('DELETE FROM invoices');
  await db.query('DELETE FROM companies');
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test', 'Test Company', 'A test company')
  `);
  await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('test', 100, false, null)
  `);
});

afterAll(async () => {
  await db.end();
});

describe('GET /invoices', () => {
  test('It should respond with an array of invoices', async () => {
    const res = await request(app).get('/invoices');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [{ id: expect.any(Number), comp_code: 'test' }] });
  });
});

describe('GET /invoices/:id', () => {
  test('It should respond with a single invoice', async () => {
    const res = await request(app).get('/invoices/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        amt: 100,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
        company: {
          code: 'test',
          name: 'Test Company',
          description: 'A test company'
        }
      }
    });
  });

  test('It should return 404 for non-existent invoice', async () => {
    const res = await request(app).get('/invoices/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /invoices', () => {
  test('It should add a new invoice', async () => {
    const res = await request(app).post('/invoices').send({ comp_code: 'test', amt: 200 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: 'test',
        amt: 200,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });
});

describe('PUT /invoices/:id', () => {
  test('It should update an invoice', async () => {
    const res = await request(app).put('/invoices/1').send({ amt: 300, paid: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: 'test',
        amt: 300,
        paid: true,
        add_date: expect.any(String),
        paid_date: expect.any(String)
      }
    });
  });

  test('It should return 404 for non-existent invoice', async () => {
    const res = await request(app).put('/invoices/999').send({ amt: 300, paid: true });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /invoices/:id', () => {
  test('It should delete an invoice', async () => {
    const res = await request(app).delete('/invoices/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'deleted' });
  });

  test('It should return 404 for non-existent invoice', async () => {
    const res = await request(app).delete('/invoices/999');
    expect(res.statusCode).toBe(404);
  });
});
