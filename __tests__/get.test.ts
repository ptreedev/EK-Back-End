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

describe("Endpoint Testing", () => {
  describe("GET: /api", () => {
    it("200: returns api endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("length");
        });
    });
    it("404: returns an error when URL is incorrect", async () => {
      await request(app)
        .get(`/ap`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("URL not found");
        });
    });
  });
  describe("GET: /api/users", () => {
    it("200: returns all users", async () => {
      await request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("length");
          expect(body[0]).toHaveProperty("name");
          expect(body[0]).toHaveProperty("username");
        });
    });
    it("200: returns an individual user by ID", async () => {
      await request(app)
        .get(`/api/users/60c72b2f9b1e8a4f10b7b1f1`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("name");
          expect(body).toHaveProperty("username");
          expect(body).toHaveProperty("items");
          expect(body).toHaveProperty("address");
        });
    });
    it("400: returns error when id is wrong or does not exist", async () => {
      await request(app)
        .get(`/api/users/asdasdoj`)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Not a valid ID");
        });
    });
    it("200: returns a user by username", async () => {
      await request(app)
        .get(`/api/user/peteisking`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("name");
          expect(body).toHaveProperty("username");
          expect(body).toHaveProperty("items");
          expect(body).toHaveProperty("address");
        });
    });
    it("400: returns error when username does not exist", async () => {
      await request(app)
        .get(`/api/user/peteiing`)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("invalid username");
        });
    });
  });
  describe("GET: /api/items", () => {
    it("200: returns all items", async () => {
      await request(app)
        .get("/api/items")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("length");
          expect(body[0]).toHaveProperty("item_name");
          expect(body[0]).toHaveProperty("description");
          expect(body[0]).toHaveProperty("img_string");
        });
    });
    it("200: returns an individual item by ID", async () => {
      await request(app)
        .get(`/api/items/60c72b2f9b1e8a4f10b7b1f6`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("likes");
          expect(body).toHaveProperty("description");
          expect(body).toHaveProperty("img_string");
        });
    });
    it("400: returns error when item id is not correct", async () => {
      await request(app)
        .get(`/api/items/60c72b2f9b1e8a4f10b7`)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Not a valid ID");
        });
    });
  });
  describe("GET: /api/:username/items", () => {
    it("200: returns the items for a given user", async () => {
      type item = {
        _id: String,
        item_name: String,
        description: String,
        img_string: String,
        likes: []
      }
      await request(app)
        .get(`/api/peteisking/items`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("length");
          body.forEach((item: item) => {
            expect(item).toMatchObject({
              _id: expect.any(String),
              item_name: expect.any(String),
              description: expect.any(String),
              img_string: expect.any(String),
            })
          })
        });
    });
    it("404: returns an error when URL is not correct", async () => {
      await request(app)
        .get(`/api/peteisking/iems`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("URL not found");
        });
    });
  });
  describe("GET: /api/likes/user_id", () => {
    it("200: returns an array of a users likes by user ID", async () => {
      await request(app)
        .get(`/api/likes/60c72b2f9b1e8a4f10b7b1f1`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("length");
          expect(body[0].item_name).toBe("table");
        });
    });
    it("404: returns an error when user id is not correct", async () => {
      await request(app)
        .get(`/api/likes/60c72b2f9b1e8a4f10b`)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Cannot Find Matching ID");
        });
    });
  });
  describe("GET: /api/trades/:matching_id/:username", () => {
    it("200: returns an array of available matches for a user including users own matches information", async () => {
      await request(app)
        .get("/api/trades/1731662301477/daisy_flower")
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject([{
            match_item_name: 'bed',
            match_user_name: 'charlie_the_cat',
            match_img_string: 'https://www.naturalbedcompany.co.uk/wp-content/uploads/WALNUT-LEITH-MODERN-BED-WITH-CHARCOAL-LINEN-BEDDING.jpg',
            match_user_id: '60c72b2f9b1e8a4f10b7b1f4',
            match_item_id: '60c72b2f9b1e8a4f10b7b1ff',
            matching_id: expect.any(String),
            _id: '673711dd9c99a216961694ea'
          },
          {
            match_item_name: 'plant',
            match_user_name: 'daisy_flower',
            match_img_string: 'https://www.bpmcdn.com/f/files/kimberley/import/2021-07/25765559_web1_210708-CVA-gardening-morris-flowers_4.jpg;w=1200;h=800;mode=crop',
            match_user_id: '60c72b2f9b1e8a4f10b7b1f5',
            match_item_id: '60c72b2f9b1e8a4f10b7b202',
            matching_id: expect.any(String),
            _id: '673711dd9c99a216961694e4'
          }]);
        });
    });
    it("404: returns an error if matching_id is incorrect", async () => {
      await request(app)
      .get("/api/trades/banana/daisy_flower")
      .expect(404)
      .then(({body}) => {
        expect(body.message).toBe("Cannot Find Matching ID")
      });
    });
    it("400: returns an error if username is incorrect", async () => {
      await request(app)
      .get("/api/trades/1731662301477/peteisking")
      .expect(400)
      .then(({body}) => {
        expect(body.message).toBe("invalid username")
      });
    });
  });
  // describe("GET: /api/tradesuccess/:matching_id/", () => {
  //   it("200: returns an array of 2 users addresses who have matched", async () => {
  //     await request(app)
  //       .get('/api/tradesuccess/')
  //   })
  // })
});
