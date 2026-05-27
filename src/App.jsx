# Nâng cấp Web App Mưa Lũ sang Web App Nhiệt Độ Max Trung Bộ

## Mục tiêu chỉnh sửa

Chuyển toàn bộ logic:

* Mực nước
* Mưa lũ

sang:

* Nhiệt độ
* Tmax
* Tmin
* Nhiệt độ thời gian thực

Đồng thời:

* Đọc danh sách trạm từ file `thamso_khaithac.xlsx`
* Tự động đổ vào giao diện
* Tự động gọi API
* Tự động hiển thị bảng và biểu đồ

---

# 1. Thay thế file tham số

## File mới

Đặt file:

```bash
public/thamso_khaithac.xlsx
```

Cấu trúc:

| matram | tentram | tinh | matinh | Tab | sophut | tinhtong | API_LINK |
| ------ | ------- | ---- | ------ | --- | ------ | -------- | -------- |

Ví dụ:

| AWS0000028 | Khí Tượng TĐ Bà Nà | Đà Nẵng | Đà Nẵng | nhietdo_wb5 | 10 | 0 | ... |

---

# 2. Cài thêm thư viện đọc Excel

## Chạy lệnh

```bash
npm install xlsx
```

---

# 3. App.jsx mới hoàn chỉnh

## File:

```bash
src/App.jsx
```

---

```jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import StationChart from "./components/StationChart.jsx";

async function safeFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function ymdHM(d) {
  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export default function App() {

  const [stations, setStations] = useState([]);
  const [matram, setMatram] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tableRows, setTableRows] = useState([]);

  const now = new Date();

  const defaultEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0
  );

  const defaultStart = new Date(defaultEnd.getTime() - 24 * 60 * 60 * 1000);

  const [bd, setBd] = useState(ymdHM(defaultStart));
  const [kt, setKt] = useState(ymdHM(defaultEnd));

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {

    try {

      const response = await fetch("/thamso_khaithac.xlsx");
      const blob = await response.arrayBuffer();

      const workbook = XLSX.read(blob, {
        type: "array"
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet);

      setStations(json);

      if (json.length > 0) {
        setMatram(json[0].matram);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Không đọc được file tham số Excel");
    }
  }

  const tramSelected = useMemo(() => {
    return stations.find((s) => s.matram === matram);
  }, [stations, matram]);

  async function handleLoad() {

    try {

      setLoading(true);
      setErrorMsg("");

      if (!tramSelected) {
        throw new Error("Chưa chọn trạm");
      }

      const params = new URLSearchParams({
        matram: tramSelected.matram,
        ten_table: tramSelected.Tab,
        sophut: String(tramSelected.sophut || 10),
        tinhtong: String(tramSelected.tinhtong || 0),
        thoigianbd: bd,
        thoigiankt: kt,
      });

      const apiUrl = `${tramSelected.API_LINK}?${params.toString()}`;

      const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(apiUrl)}`;

      const json = await safeFetchJson(proxyUrl);

      const rows = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];

      const timeKey =
        ["thoigian", "ThoiGian", "time"]
          .find((k) => rows[0]?.[k] != null) || "thoigian";

      const valueKey =
        ["giatri", "GiaTri", "nhietdo", "value"]
          .find((k) => rows[0]?.[k] != null) || "giatri";

      const normalized = rows.map((r) => ({
        "Thời gian": r[timeKey],
        "Nhiệt độ": Number(String(r[valueKey]).replace(",", ".")),
      }));

      setTableRows(normalized);

    } catch (err) {

      console.error(err);
      setErrorMsg(err.message);
      setTableRows([]);

    } finally {

      setLoading(false);

    }
  }

  return (

    <div style={{
      padding: 20,
      fontFamily: "Arial"
    }}>

      <h1>
        HỆ THỐNG THEO DÕI NHIỆT ĐỘ MAX TRUNG BỘ
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 20
      }}>

        <div style={{
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 10
        }}>

          <h3>THÔNG SỐ KHAI THÁC</h3>

          <label>Trạm</label>

          <select
            value={matram}
            onChange={(e) => setMatram(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 10
            }}
          >

            {stations.map((s, idx) => (
              <option key={idx} value={s.matram}>
                {s.tentram}
              </option>
            ))}

          </select>

          <label>Từ thời gian</label>

          <input
            type="text"
            value={bd}
            onChange={(e) => setBd(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 10
            }}
          />

          <label>Đến thời gian</label>

          <input
            type="text"
            value={kt}
            onChange={(e) => setKt(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginBottom: 10
            }}
          />

          <button
            onClick={handleLoad}
            style={{
              width: "100%",
              padding: 12,
              background: "red",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            KHAI THÁC NHIỆT ĐỘ
          </button>

          {loading && (
            <p>Đang tải dữ liệu...</p>
          )}

          {errorMsg && (
            <p style={{ color: "red" }}>
              {errorMsg}
            </p>
          )}

        </div>

        <div>

          <table
            border="1"
            cellPadding="6"
            style={{
              borderCollapse: "collapse",
              width: "100%"
            }}
          >

            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nhiệt độ</th>
              </tr>
            </thead>

            <tbody>

              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row["Thời gian"]}</td>
                  <td>
                    {row["Nhiệt độ"]} °C
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

          <div style={{ marginTop: 20 }}>
            <StationChart rows={tableRows} />
          </div>

        </div>

      </div>

    </div>
  );
}
```

---

# 4. Chỉnh sửa biểu đồ

## File

```bash
src/components/StationChart.jsx
```

---

```jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function StationChart({ rows }) {

  const data = rows.map((r) => ({
    time: r["Thời gian"],
    temp: r["Nhiệt độ"],
  }));

  return (
    <div style={{ width: "100%", height: 400 }}>

      <ResponsiveContainer>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temp"
            stroke="#ff0000"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}
```

---

# 5. Proxy Netlify

## File

```bash
netlify/functions/proxy.js
```

---

```javascript
exports.handler = async function(event) {

  try {

    const url = event.queryStringParameters.url;

    const response = await fetch(url);

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: text
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
}
```

---

# 6. Giao diện mới sau chỉnh sửa

Sau khi chạy:

```bash
npm run dev
```

Web App sẽ:

* Đọc file Excel tham số
* Hiển thị danh sách trạm tự động
* Cho chọn thời gian
* Tự gọi API
* Hiển thị nhiệt độ
* Hiển thị biểu đồ nhiệt độ

---

# 7. Các nâng cấp tiếp theo Mika sẽ làm

## Bước tiếp theo

1. Heatmap nhiệt độ Trung Bộ
2. Bản đồ Leaflet
3. Tmax cao nhất toàn miền Trung
4. Top 10 trạm nóng nhất
5. Dashboard KTTV chuyên nghiệp
6. Xuất Excel tự động
7. Tự động cập nhật 10 phút/lần
8. Cảnh báo nắng nóng
9. Tự động sinh bản tin
10. Deploy Netlify/VPS

---

# 8. Điểm quan trọng

Phiên bản này:

* Không còn phụ thuộc mực nước
* Đã chuyển sang nhiệt độ
* Tự đọc file tham số Excel
* Có thể mở rộng toàn Trung Bộ
* Có thể dùng trực tiếp với VRAIN

---

# 9. Hướng triển khai tốt nhất

Anh chỉ cần:

## Bước 1

Copy file:

```bash
thamso_khaithac.xlsx
```

vào:

```bash
public/
```

## Bước 2

Thay:

```bash
src/App.jsx
```

## Bước 3

Chạy:

```bash
npm install
npm install xlsx
npm run dev
```

---

# 10. Kết quả

Sau khi chạy:

Web App sẽ hoạt động giống:

* hệ thống nghiệp vụ KTTV
* tự động đọc tham số
* tự động gọi API nhiệt độ
* hiển thị dữ liệu thời gian thực
* biểu đồ nhiệt độ Max
