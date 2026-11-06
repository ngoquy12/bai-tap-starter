import seed from "../db.seed.json";
import { installCrudcrud } from "./crudcrud-fake.js";
import { createTask, deleteTask, getTasks, updateTask } from "../src/api/tasks.js";

let server;

beforeEach(() => {
  server = installCrudcrud(seed);
});

describe("Lớp API tasks", () => {
  test("getTasks gửi một GET /tasks không tham số và trả mảng đủ 12 công việc, mỗi việc có _id", async () => {
    const tasks = await getTasks();
    const calls = window.mockApi.callsTo("GET */tasks");
    expect(calls).toHaveLength(1);
    expect(calls[0].query).toEqual({});
    expect(tasks).toHaveLength(12);
    expect(tasks[0]).toMatchObject(seed.tasks[0]);
    expect(tasks[0]._id).toMatch(/^[a-f0-9]{24}$/);
    expect(tasks).toEqual(server.db.tasks);
  });

  test("createTask gửi POST /tasks đúng thân và trả bản ghi máy chủ vừa tạo, có _id mới", async () => {
    const data = { title: "Học Vitest", status: "todo", priority: "high", assigneeCode: "NV02", dueDate: "2026-11-20" };
    const created = await createTask(data);
    const calls = window.mockApi.callsTo("POST */tasks");
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual(data);
    expect(created).toEqual({ ...data, _id: expect.stringMatching(/^[a-f0-9]{24}$/) });
    expect(server.db.tasks).toHaveLength(13);
    expect(server.db.tasks.at(-1)).toEqual(created);
  });

  test("updateTask gửi PUT /tasks/<_id> với bản ghi ĐẦY ĐỦ trường và trả bản ghi đã ghép (PUT không có thân phản hồi)", async () => {
    const task = server.db.tasks[1];
    const updated = await updateTask({ ...task, status: "doing" });
    const calls = window.mockApi.callsTo(`PUT */tasks/${task._id}`);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({ ...seed.tasks[1], status: "doing" });
    expect(updated).toEqual({ ...task, status: "doing" });
    expect(server.db.tasks[1]).toEqual({ ...task, status: "doing" });
    expect(window.mockApi.callsTo("PATCH */tasks/*")).toHaveLength(0);
  });

  test("updateTask KHÔNG gửi _id trong thân PUT (crudcrud trả 500 nếu thân có _id)", async () => {
    const task = server.db.tasks[4];
    await updateTask({ ...task, title: "Cập nhật bảng lương tháng 12" });
    const body = window.mockApi.callsTo(`PUT */tasks/${task._id}`)[0].body;
    expect(body).not.toHaveProperty("_id");
    expect(Object.keys(body).sort()).toEqual(["assigneeCode", "code", "dueDate", "priority", "status", "title"]);
    expect(server.db.tasks[4].title).toBe("Cập nhật bảng lương tháng 12");
  });

  test("deleteTask gửi DELETE /tasks/<_id> và công việc biến mất khỏi máy chủ", async () => {
    const task = server.db.tasks[2];
    await deleteTask(task._id);
    expect(window.mockApi.callsTo(`DELETE */tasks/${task._id}`)).toHaveLength(1);
    expect(server.db.tasks.some((row) => row._id === task._id)).toBe(false);
    expect(server.db.tasks).toHaveLength(11);
  });
});
