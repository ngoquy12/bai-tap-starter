import axios from "axios";
import { Blob as NodeBlob } from "node:buffer";
import { DecompressionStream as NodeDecompressionStream } from "node:stream/web";

// mock-api.js được viết cho trình duyệt thật. Môi trường jsdom của Vitest thiếu hai API nó dùng để
// giải nén dữ liệu (Blob.stream, DecompressionStream), nên lấy bản của Node.
globalThis.Blob = NodeBlob;
globalThis.DecompressionStream = NodeDecompressionStream;

// mock-api.js tìm axios ở phạm vi toàn cục (window.axios), nên gắn vào trước khi nạp nó.
window.axios = axios;
