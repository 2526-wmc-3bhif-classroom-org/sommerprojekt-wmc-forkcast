import express from "express";
import { userRouter } from "../src/routes/userRouter";
import { UserService } from "../src/service/userService";

function makeRes() {
  const statusCalls: Array<number> = [] as any;
  const body: any = {};
  return {
    status(code: number) {
      statusCalls.push(code);
      return this;
    },
    json(obj: any) {
      Object.assign(body, obj);
      return this;
    },
    _statusCalls: statusCalls,
    _body: body
  } as any;
}

describe("userRouter — simple checks without external dependencies", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POST /register validates payload and calls userService.createAccount (201)", async () => {
    const app = express();
    app.use(express.json());
    app.use(userRouter);

    const spy = jest.spyOn(UserService.prototype, "createAccount").mockResolvedValue(undefined as any);

    const res = makeRes();
    const req: any = { body: { username: "u", email: "e@e", password: "p" } };

    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/register");
    await layer.route.stack[0].handle(req, res);

    expect(spy).toHaveBeenCalled();
    expect(res._statusCalls[0]).toBe(201);
    expect(res._body).toHaveProperty("message");
  });

  it("POST /register returns 400 when fields are missing", async () => {
    const res = makeRes();
    const req: any = { body: { username: "u" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/register");
    await layer.route.stack[0].handle(req, res);

    expect(res._statusCalls[0]).toBe(400);
    expect(res._body).toHaveProperty("error");
  });

  it("POST /login validates payload and returns 401 on failed login", async () => {
    const spy = jest.spyOn(UserService.prototype, "loginAccount").mockResolvedValue(false);
    const res = makeRes();
    const req: any = { body: { username: "u", password: "p" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/login");
    await layer.route.stack[0].handle(req, res);

    expect(spy).toHaveBeenCalled();
    expect(res._statusCalls[0]).toBe(401);
  });

  it("POST /login validates payload and returns 400 when fields are missing", async () => {
    const res = makeRes();
    const req: any = { body: { username: "u" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/login");
    await layer.route.stack[0].handle(req, res);

    expect(res._statusCalls[0]).toBe(400);
  });

  it("POST /register returns 400 when service throws", async () => {
    const spy = jest.spyOn(UserService.prototype, "createAccount").mockRejectedValue(new Error("boom"));
    const res = makeRes();
    const req: any = { body: { username: "u", email: "e@e", password: "p" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/register");
    await layer.route.stack[0].handle(req, res);
    expect(res._statusCalls[0]).toBe(400);
    expect(res._body).toHaveProperty("error");
    spy.mockRestore();
  });

  it("POST /login returns 200 and message on success", async () => {
    const spy = jest.spyOn(UserService.prototype, "loginAccount").mockResolvedValue(true);
    const res = makeRes();
    const req: any = { body: { username: "u", password: "p" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/login");
    await layer.route.stack[0].handle(req, res);
    expect(res._body).toHaveProperty("message");
    spy.mockRestore();
  });

  it("POST /login returns 500 when service throws", async () => {
    const spy = jest.spyOn(UserService.prototype, "loginAccount").mockRejectedValue(new Error("boom"));
    const res = makeRes();
    const req: any = { body: { username: "u", password: "p" } };
    const layer = (userRouter as any).stack.find((l: any) => l.route?.path === "/login");
    await layer.route.stack[0].handle(req, res);
    expect(res._statusCalls[0]).toBe(500);
    spy.mockRestore();
  });
});
