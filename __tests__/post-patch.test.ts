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
      .then(({body}) => {
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
          expect(body.msg).toBe("URL not found");
        });
    });
    it("400: returns an error when user is missing properties/values", async () => {
        await request(app)
          .post("/api/new-user")
          .send({
            username: "test2"
          })
          .expect(400)
        //   .then(({ body }) => {
        //     expect(body.msg).toBe("Invalid request, missing valies/properties from request body");
        //   });
      });
  });