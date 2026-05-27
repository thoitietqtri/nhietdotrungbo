import React, { useEffect, useMemo, useState } from "react";
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