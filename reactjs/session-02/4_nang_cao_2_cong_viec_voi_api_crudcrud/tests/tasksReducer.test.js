import tasksReducer from "../src/reducers/tasksReducer.js";

// State đóng băng: reducer sửa trực tiếp mảng hay object sẽ ném lỗi.
const A = "6aed00000000000000000001";
const B = "6aed00000000000000000002";
const start = Object.freeze([
  Object.freeze({ _id: A, code: "CV01", title: "Viết tài liệu API", status: "doing", priority: "high", assigneeCode: "NV01", dueDate: "2026-11-10" }),
  Object.freeze({ _id: B, code: "CV02", title: "Sửa lỗi bảng giá", status: "todo", priority: "medium", assigneeCode: "NV02", dueDate: "2026-11-12" }),
]);

describe("tasksReducer", () => {
  test("SET thay cả danh sách bằng mảng tasks trong payload", () => {
    const tasks = [{ _id: "6aed00000000000000000009", title: "Việc mới tải", status: "todo" }];
    expect(tasksReducer(start, { type: "SET", payload: { tasks } })).toEqual(tasks);
    expect(tasksReducer([], { type: "SET", payload: { tasks: [...start] } })).toEqual(start);
  });

  test("ADD thêm công việc vào cuối danh sách và không sửa mảng cũ", () => {
    const task = { _id: "6aed00000000000000000031", title: "Học Vitest", status: "todo", priority: "low", assigneeCode: null, dueDate: "2026-11-20" };
    const next = tasksReducer(start, { type: "ADD", payload: { task } });
    expect(next).toEqual([...start, task]);
    expect(next).not.toBe(start);
    expect(start).toHaveLength(2);
  });

  test("UPDATE thay đúng công việc có cùng _id bằng bản ghi mới, công việc khác giữ nguyên", () => {
    const task = { ...start[1], status: "doing" };
    const next = tasksReducer(start, { type: "UPDATE", payload: { task } });
    expect(next[1]).toEqual(task);
    expect(next[0]).toBe(start[0]);
    expect(next).toHaveLength(2);
    expect(start[1].status).toBe("todo");
  });

  test("REMOVE bỏ đúng một công việc theo _id", () => {
    const next = tasksReducer(start, { type: "REMOVE", payload: { _id: A } });
    expect(next).toEqual([start[1]]);
    expect(start).toHaveLength(2);
    expect(tasksReducer(start, { type: "REMOVE", payload: { _id: "khong-co" } })).toEqual([...start]);
  });

  test("action lạ trả đúng state cũ", () => {
    expect(tasksReducer(start, { type: "KHONG_CO" })).toBe(start);
  });
});
