import request from "supertest";
import { app, database, server } from "../src/index";
import seed from "../src/seed";


beforeAll(async () => {
    await seed();
});

afterAll(async () => {
    await database.close();
    server.close();
});

const user = {
    "name": "TestUser1",
    "username": "testuserone",
    "items": [
        {
            "item_name": "carrot",
            "description": "To see in the dark",
            "img_string": "https://www.telegraph.co.uk/content/dam/health-fitness/2024/07/02/TELEMMGLPICT000384087606_17199393672240_trans_NvBQzQNjv4BqpVlberWd9EgFPZtcLiMQf0Rf_Wk3V23H2268P_XkPxc.jpeg?imwidth=680",
            "likes": []
        }
    ],
    "address": [
        {
            "street": "7 Downing Street",
            "city": "Liverpool",
            "post_code": "SW3A 5AA"
        }
    ],
    "matches": []
};

describe("POST: /api/new-user", () => {
    it("201: adds a new user to the database", () => {

        return request(app)
            .post("/api/new-user")
            .send(user)
            .expect(201)
            .then(({ body }) => {
                expect(body).toMatchObject({
                    _id: expect.any(String),
                    name: 'TestUser1',
                    username: 'testuserone',
                    items: [
                        {
                            item_name: 'carrot',
                            description: 'To see in the dark',
                            img_string: 'https://www.telegraph.co.uk/content/dam/health-fitness/2024/07/02/TELEMMGLPICT000384087606_17199393672240_trans_NvBQzQNjv4BqpVlberWd9EgFPZtcLiMQf0Rf_Wk3V23H2268P_XkPxc.jpeg?imwidth=680',
                            likes: [],
                            _id: expect.any(String)
                        }
                    ],
                    address: [
                        {
                            street: '7 Downing Street',
                            city: 'Liverpool',
                            post_code: 'SW3A 5AA',
                            _id: expect.any(String)
                        }
                    ],
                    matches: [],
                    __v: 0

                })
            });
    });
    it("404: returns an error when URL is incorrect", async () => {
        await request(app)
            .post("/api/new-use")
            .send(user)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("URL not found");
            });
    });
    it("422: returns an error when user body is missing properties/values", async () => {
        await request(app)
            .post("/api/new-user")
            .send({
                username: "test2"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, missing Required Fields");
            });
    });
});
const item = {
    "item_name": "chair",
    "description": "To sit on",
    "img_string": "https://www.internionline.it/cdn/shop/files/358832_DRIADE_01.jpg?v=1726069731&width=2000"
};

describe("POST: /api/items/:username", () => {
    it("201: adds an item to items subdocument of specified user", async () => {
        await request(app)
            .post("/api/items/alice_wonder")
            .send(item)
            .expect(201)
            .then(({ body }) => {
                // index position 2 for this user's new item
                expect(body.items[2]).toMatchObject(
                    {
                        "item_name": "chair",
                        "description": "To sit on",
                        "img_string": "https://www.internionline.it/cdn/shop/files/358832_DRIADE_01.jpg?v=1726069731&width=2000",
                        "likes": [],
                        "_id": expect.any(String)
                    }
                );
            });
    });
    it("404: returns an error when username incorrect", async () => {
        await request(app)
            .post("/api/items/alice_wunder")
            .send(item)
            .expect(404)
            .then(({ text }) => {
                expect(text).toBe("Username not found")
            });
    });
    it("422: returns an error when item body is missing properties/values", async () => {
        await request(app)
            .post("/api/items/alice_wonder")
            .send({
                item_name: "Table"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, missing Required Fields");
            });
    });
});
describe("PATCH: /api/items/:id", () => {
    it("200: Updates likes array of an item with a users id", async () => {
        await request(app)
            .patch("/api/items/60c72b2f9b1e8a4f10b7b202")
            .send({
                likes: "60c72b2f9b1e8a4f10b7b1f4"
            })
            .expect(200)
            .then(({ body: { items } }) => {
                expect(items[0]).toMatchObject({
                    item_name: 'plant',
                    description: 'To brighten up your space',
                    img_string: 'https://www.bpmcdn.com/f/files/kimberley/import/2021-07/25765559_web1_210708-CVA-gardening-morris-flowers_4.jpg;w=1200;h=800;mode=crop',
                    likes: ['60c72b2f9b1e8a4f10b7b1f4'],
                    _id: '60c72b2f9b1e8a4f10b7b202'
                });
            });
    });
    it("400: Returns an error when item id is incorrect", async () => {
        await request(app)
            .patch("/api/items/banana")
            .send({
                likes: "60c72b2f9b1e8a4f10b7b1f4"
            })
            .expect(400)
            .then(({ body }) => {
                console.log(body)
                expect(body.message).toBe("input must be a 24 character hex string, 12 byte Uint8Array, or an integer")
            });
    });
    it("422: returns an error when item body is missing / does not contain correct properties/values", async () => {
        await request(app)
            .patch("/api/items/60c72b2f9b1e8a4f10b7b202")
            .send({
                likes: "banana"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request");
            });
    });
});