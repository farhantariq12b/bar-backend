const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("GET /api/v1/products", () => {
    it("should return all products", async () => {
        const res = await request(app).get('/api/v1/products');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.length).toBeGreaterThan(0);
    });
});

describe("POST /api/v1/products", () => {
    it("should return single product", async () => {
        const payload = {
            name: 'some unique product',
            price: 10,
            tax: 0,
            discount: 2,
            discount_type: 'amount',
            max_discount_cap: 10,
        };
        const res = await request(app).post('/api/v1/products').send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe(payload.name);
        expect(res.body.data.discount_type).toBe(payload.discount_type);
    });
});

describe("POST /api/v1/products", () => {
    it("should return duplicate error", async () => {
        const res = await request(app).post('/api/v1/products').send({
            name: 'coke',
            price: 10,
            tax: 0,
            discount: 2,
            discount_type: 'amount',
            max_discount_cap: 10,
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
});