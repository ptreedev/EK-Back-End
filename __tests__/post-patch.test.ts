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
                expect(body.message).toBe("Invalid request, check submitted fields");
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
                expect(body.message).toBe("Invalid request, check submitted fields");
            });
    });
});
describe("PATCH: /api/items/:id", () => {
    it("200: Updates likes array of an item with a users id", async () => {
        await request(app)
            .patch("/api/items/60c72b2f9b1e8a4f10b7b1fc")
            .send({
                likes: "60c72b2f9b1e8a4f10b7b1f4"
            })
            .expect(200)
            .then(({ body: { items } }) => {
                expect(items[0]).toMatchObject({
                    item_name: 'bookshelf',
                    description: 'To store your books',
                    img_string: 'https://images.photowall.com/products/84850/vintage-bookshelf.jpg?h=699&q=85',
                    likes: ['60c72b2f9b1e8a4f10b7b1f4'],
                    _id: '60c72b2f9b1e8a4f10b7b1fc'
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
describe("POST: /api/matchcheck", () => {
    it("201: creates a matches sub document for each user if a match has occurred and then returns an array of the 2 users", async () => {
        await request(app)
            .post("/api/matchcheck")
            .send({
                user_id: "60c72b2f9b1e8a4f10b7b1f1",
                item_id: "60c72b2f9b1e8a4f10b7b1f9"
            })
            .expect(201)
            .then(({ body }) => {
                expect(body[0].matches).toMatchObject([{
                    match_item_name: 'table',
                    match_user_name: 'alice_wonder',
                    match_img_string: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd02xUg_2qkUSHvHQD5N-aqIjm1B-pYi4u2g&s',
                    match_user_id: '60c72b2f9b1e8a4f10b7b1f2',
                    match_item_id: '60c72b2f9b1e8a4f10b7b1f9',
                    matching_id: expect.any(String),
                    _id: expect.any(String)
                }]);
                expect(body[1].matches).toMatchObject([{
                    match_item_name: 'chair',
                    match_user_name: 'peteisking',
                    match_img_string: 'https://www.internionline.it/cdn/shop/files/358832_DRIADE_01.jpg?v=1726069731&width=2000',
                    match_user_id: '60c72b2f9b1e8a4f10b7b1f1',
                    match_item_id: '60c72b2f9b1e8a4f10b7b1f6',
                    matching_id: expect.any(String),
                    _id: expect.any(String)
                }]);
            });
    });
    it("422: returns an error when item body is missing / does not contain correct properties/values", async () => {
        await request(app)
            .post("/api/matchcheck")
            .send({
                item_id: "2332"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request");
            });
    });
    it("404: returns an error when URL is incorrect", async () => {
        await request(app)
            .get(`/api/match`)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("URL not found");
            });
    });
});
describe("PATCH /api/settrade", () => {
    it("200: sets trade accept boolean to true in a users matches subdocument and returns the updated user document", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "match_id": "673711dd9c99a216961694ea",
                "bool": true
            })
            .expect(200)
            .then(({ body }) => {
                expect(body.matches[0].settrade).toBe(true)
            });
    });
    it("200: sets trade accept boolean to false in a users matches subdocument and returns the updated user document", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "match_id": "673711dd9c99a216961694ea",
                "bool": false
            })
            .expect(200)
            .then(({ body }) => {
                expect(body.matches[0].settrade).toBe(false)
            });
    });
    it("404: returns an error when URL is incorrect", async () => {
        await request(app)
            .patch('/api/settrad')
            .send({
                "match_id": "673711dd9c99a216961694ea",
                "bool": true
            })
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("URL not found")
            });
    });
    it("422: returns an error when an invalid match_id is used", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "match_id": "60c72b2f9b1e8a4f10b7b1ff",
                "bool": true
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, check submitted fields");
            });
    });
    it("422: returns an error when bool value is not a boolean", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "match_id": "673711dd9c99a216961694ea",
                "bool": "banana"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, check submitted fields");
            });
    });
    it("422: returns an error when missing match_id property in sent body", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "bool": "banana"
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, check submitted fields");
            });
    });
    it("422: returns an error when bool property is missing", async () => {
        await request(app)
            .patch('/api/settrade')
            .send({
                "match_id": "673711dd9c99a216961694ea",
            })
            .expect(422)
            .then(({ body }) => {
                expect(body.message).toBe("Invalid request, check submitted fields");
            });
    });
});