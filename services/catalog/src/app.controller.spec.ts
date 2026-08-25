import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  describe("healthCheck", () => {
    it("returns UP status", () => {
      expect(appController.healthCheck()).toEqual({
        message: "UP",
        status: 200,
      });
    });
  });
});
