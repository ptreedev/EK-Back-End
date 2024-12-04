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

describe("DELETE: /api/delete/:id", () => {
    it("204: Deletes user by ID", () => {
        return request(app)
        .delete("/api/delete/675035be2c9575f4434bf6b2")
        .expect(204)
    });
    it("404: Returns an error if User ID does not exist", () => {
        return request(app)
        .delete("/api/delete/675035be2c9575f4434bf6c1")
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("Document not found.")
        });
    });
    it("400: Returns an error if ID is invalid", () => {
        return request(app)
        .delete("/api/delete/banana")
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Cast to ObjectId failed for value "banana" (type string) at path "_id" for model "Data"')
        })
    });
});