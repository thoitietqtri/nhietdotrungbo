import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import StationChart from "./components/StationChart.jsx";

async function safeFetchText(url) {
  const res = await fetch(url);

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Lỗi API");
  }

  return text;
}

function ymdHM(d) {
  const pad = (n) => String(n).padStart(2, "0");

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":00"
  );
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

  const defaultStart = new Date(
    defaultEnd.getTime() - 24 * 60 * 60 * 1000
  );

  const [bd, setBd] = useState(ymdHM(defaultStart));
  const [kt, setKt] = useState(ymdHM(defaultEnd));

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    try {
      const response = await fetch(
        "/thamso_khaithac.xlsx"
      );

      const blob =
        await response.arrayBuffer();

      const workbook = XLSX.read(blob, {
        type: "array",
      });

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const json =
        XLSX.utils.sheet_to_json(sheet);

      setStations(json);

      if (json.length > 0) {
        setMatram(json[0].matram);
      }
    } catch (err) {
      console.error(err);

      setErrorMsg(
        "Không đọc được file tham số Excel"
      );
    }
  }

  const tramSelected = useMemo(() => {
    return stations.find(
      (s) => s.matram === matram
    );
  }, [stations, matram]);

  async function handleLoad() {
    try {
      setLoading(true);

      setErrorMsg("");

      setTableRows([]);

      if (!tramSelected) {
        throw new Error("Chưa chọn trạm");
      }

      const quote = (s) => `'${s}'`;

      const params =
        new URLSearchParams({
          matram: tramSelected.matram,

          ten_table:
            tramSelected.Tab,

          sophut: String(
            tramSelected.sophut || 10
          ),

          tinhtong: String(
            tramSelected.tinhtong || 0
          ),

          thoigianbd: quote(bd),

          thoigiankt: quote(kt),
        });

      const apiUrl =
        tramSelected.API_LINK +
        "?" +
        params.toString();

      const proxyUrl =
        "/.netlify/functions/proxy?" +
        params.toString();

      console.log(proxyUrl);

      const html =
        await safeFetchText(proxyUrl);

      console.log(html);

      const parser = new DOMParser();

      const doc =
        parser.parseFromString(
          html,
          "text/html"
        );

      const trs =
        doc.querySelectorAll("tr");

      const rows = [];

      trs.forEach((tr) => {
        const tds =
          tr.querySelectorAll("td");

        if (tds.length >= 2) {
          rows.push({
            "Thời gian":
              tds[0].innerText.trim(),

            "Nhiệt độ":
              tds[1].innerText.trim(),
          });
        }
      });

      if (rows.length === 0) {
        setErrorMsg(
          "Không tìm thấy dữ liệu nhiệt độ"
        );
      }

      setTableRows(rows);
    } catch (err) {
      console.error(err);

      setErrorMsg(err.message);

      setTableRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          color: "#d60000",
          fontSize: 48,
          marginBottom: 20,
        }}
      >
        HỆ THỐNG THEO DÕI NHIỆT ĐỘ MAX
        TRUNG BỘ
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "380px 1fr",
          gap: 20,
        }}
      >
        <div
          style={{
            border:
              "1px solid #cccccc",
            borderRadius: 15,
            padding: 20,
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              color: "#0b2c6b",
              marginBottom: 20,
            }}
          >
            THÔNG SỐ KHAI THÁC
          </h2>

          <label>Trạm</label>

          <select
            value={matram}
            onChange={(e) =>
              setMatram(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5,
              marginBottom: 20,
              borderRadius: 8,
            }}
          >
            {stations.map((s, idx) => (
              <option
                key={idx}
                value={s.matram}
              >
                {s.tentram}
              </option>
            ))}
          </select>

          <label>Từ thời gian</label>

          <input
            type="text"
            value={bd}
            onChange={(e) =>
              setBd(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5,
              marginBottom: 20,
              borderRadius: 8,
            }}
          />

          <label>Đến thời gian</label>

          <input
            type="text"
            value={kt}
            onChange={(e) =>
              setKt(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginTop: 5,
              marginBottom: 20,
              borderRadius: 8,
            }}
          />

          <button
            onClick={handleLoad}
            disabled={loading}
            style={{
              width: "100%",
              padding: 15,
              background: "#ff002f",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "ĐANG TẢI..."
              : "KHAI THÁC NHIỆT ĐỘ"}
          </button>

          {errorMsg && (
            <p
              style={{
                color: "red",
                marginTop: 20,
                fontWeight: "bold",
              }}
            >
              {errorMsg}
            </p>
          )}
        </div>

        <div>
          <table
            border="1"
            cellPadding="8"
            style={{
              borderCollapse:
                "collapse",
              width: "100%",
              background: "white",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#e50019",
                  color: "white",
                }}
              >
                <th>Thời gian</th>

                <th>Nhiệt độ</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map(
                (row, idx) => (
                  <tr key={idx}>
                    <td>
                      {
                        row[
                          "Thời gian"
                        ]
                      }
                    </td>

                    <td>
                      {
                        row[
                          "Nhiệt độ"
                        ]
                      }
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <StationChart
              rows={tableRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

