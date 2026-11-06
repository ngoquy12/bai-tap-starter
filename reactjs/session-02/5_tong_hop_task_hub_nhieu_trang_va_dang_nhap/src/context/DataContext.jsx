// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { createContext, useContext, useEffect, useState } from "react";
import { getEmployees } from "../api/employees.js";
import { getErrorMessage } from "../api/http.js";
import { getTasks } from "../api/tasks.js";

// Kho dữ liệu dùng chung cho mọi trang: nhân viên và công việc được tải ĐÚNG MỘT LẦN rồi giữ trong context.
// Chuyển trang, đổi bộ lọc, đổi trang danh sách đều dùng lại dữ liệu này, không gửi thêm yêu cầu
// (mỗi endpoint crudcrud chỉ nhận 100 yêu cầu).
const DataContext = createContext(null);

// Trạng thái ban đầu của một tài nguyên: chưa có dữ liệu, chưa lỗi.
const EMPTY = { items: null, error: "" };
const FETCHERS = { employees: getEmployees, tasks: getTasks };

function DataProvider({ children }) {
  const [state, setState] = useState({ employees: EMPTY, tasks: EMPTY });
  // Nơi nhớ lời hứa (Promise) tải của từng tài nguyên: nhiều trang cùng gọi load() chỉ gửi một yêu cầu,
  // kể cả khi StrictMode chạy effect hai lần. Đặt trong state dạng đối tượng để mọi lần render dùng chung một bản.
  const [pending] = useState(() => ({}));

  // Gộp thay đổi vào trạng thái của một tài nguyên.
  function patch(name, changes) {
    setState((prev) => ({ ...prev, [name]: { ...prev[name], ...changes } }));
  }

  // Tải một tài nguyên nếu chưa tải. Trả Promise của mảng bản ghi; lỗi thì xóa dấu "đã tải" để lần sau thử lại được.
  function load(name) {
    if (!pending[name]) {
      patch(name, { error: "" });
      pending[name] = FETCHERS[name]()
        .then((items) => {
          patch(name, { items });
          return items;
        })
        .catch((error) => {
          delete pending[name];
          patch(name, { items: null, error: getErrorMessage(error) });
          throw error;
        });
    }
    return pending[name];
  }

  // Tải lại từ đầu (nút "Thử lại" sau lỗi).
  function reload(name) {
    delete pending[name];
    return load(name);
  }

  // Thay mảng bản ghi bằng kết quả của hàm `update(mảngCũ)`: dùng sau khi ghi thành công, khỏi tải lại.
  function setItems(name, update) {
    setState((prev) => ({ ...prev, [name]: { ...prev[name], items: update(prev[name].items) } }));
  }

  return <DataContext.Provider value={{ state, load, reload, setItems }}>{children}</DataContext.Provider>;
}

// Lấy context; báo lỗi rõ ràng khi dùng ngoài DataProvider.
function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("Hook dữ liệu phải được dùng bên trong DataProvider");
  }
  return context;
}

// Dùng cho đăng nhập: trả { loadEmployees }, gọi loadEmployees() nhận Promise của mảng nhân viên
// (gửi yêu cầu lần đầu, các lần sau trả luôn dữ liệu đã có).
function useData() {
  const { load } = useDataContext();
  return { loadEmployees: () => load("employees") };
}

// Hook chung: tự tải tài nguyên khi trang mount (nếu chưa tải) và trả { items, loading, error, reload, setItems }.
//   items    mảng bản ghi, null khi chưa có
//   loading  true khi đang chờ lần tải đầu
//   error    câu tiếng Việt khi lỗi, chuỗi rỗng khi không lỗi
//   reload   tải lại (cho nút "Thử lại")
//   setItems setItems((mảngCũ) => mảngMới) sau khi ghi thành công
function useResource(name) {
  const { state, load, reload, setItems } = useDataContext();
  useEffect(() => {
    load(name).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const current = state[name];
  return {
    items: current.items,
    loading: current.items === null && !current.error,
    error: current.error,
    reload: () => reload(name).catch(() => {}),
    setItems: (update) => setItems(name, update),
  };
}

// Danh sách nhân viên dùng chung.
function useEmployees() {
  return useResource("employees");
}

// Danh sách công việc dùng chung.
function useTasks() {
  return useResource("tasks");
}

export { DataProvider, useData, useEmployees, useTasks };
