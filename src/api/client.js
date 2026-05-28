// src/api/client.js

// ========================================
// HÀM FORMAT THỜI GIAN
// ========================================

function formatDateTime(date = new Date()) {
  const yyyy = date.getFullYear();

  const mm = String(date.getMonth() + 1).padStart(2, '0');

  const dd = String(date.getDate()).padStart(2, '0');

  const hh = String(date.getHours()).padStart(2, '0');

  const mi = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}+${hh}:${mi}`;
}

// ========================================
// TẠO URL API
// ========================================

function buildAPIUrl(station, startTime, endTime) {
  const url =
    `${station.apiLink}` +
    `?matram=${station.matram}` +
    `&ten_table=${station.tableName}` +
    `&sophut=${station.sophut}` +
    `&tinhtong=${station.tinhtong}` +
    `&thoigianbd=${startTime}` +
    `&thoigiankt=${endTime}`;

  return url;
}

// ========================================
// PARSE HTML TABLE
// ========================================

function parseHTMLTable(htmlText) {
  const parser = new DOMParser();

  const doc = parser.parseFromString(htmlText, 'text/html');

  const rows = doc.querySelectorAll('table tr');

  const result = [];

  rows.forEach((row, index) => {
    // bỏ header
    if (index === 0) return;

    const cols = row.querySelectorAll('td');

    if (cols.length < 2) return;

    const timeText = cols[0]?.innerText?.trim() || '';

    const valueText = cols[1]?.innerText?.trim() || '';

    const value = parseFloat(
      valueText.replace(',', '.')
    );

    if (!isNaN(value)) {
      result.push({
        time: timeText,
        value: value,
      });
    }
  });

  return result;
}

// ========================================
// GỌI API 1 TRẠM
// ========================================

export async function fetchStationData(station) {
  try {
    // lấy 24h gần nhất
    const endDate = new Date();

    const startDate = new Date();

    startDate.setHours(startDate.getHours() - 24);

    const startTime = formatDateTime(startDate);

    const endTime = formatDateTime(endDate);

    const apiUrl = buildAPIUrl(
      station,
      startTime,
      endTime
    );

    console.log('Đang gọi API:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP error: ${response.status}`
      );
    }

    const htmlText = await response.text();

    const data = parseHTMLTable(htmlText);

    // tính toán nhiệt độ
    const values = data.map((d) => d.value);

    const currentTemp =
      values.length > 0
        ? values[values.length - 1]
        : null;

    const maxTemp =
      values.length > 0
        ? Math.max(...values)
        : null;

    const minTemp =
      values.length > 0
        ? Math.min(...values)
        : null;

    return {
      success: true,

      station: station,

      currentTemp: currentTemp,

      maxTemp: maxTemp,

      minTemp: minTemp,

      data: data,

      lastUpdate:
        data.length > 0
          ? data[data.length - 1].time
          : null,
    };
  } catch (error) {
    console.error(
      `Lỗi trạm ${station.tentram}:`,
      error
    );

    return {
      success: false,

      station: station,

      error: error.message,

      currentTemp: null,

      maxTemp: null,

      minTemp: null,

      data: [],
    };
  }
}

// ========================================
// GỌI NHIỀU TRẠM SONG SONG
// ========================================

export async function fetchAllStations(
  stations
) {
  try {
    const promises = stations.map((station) =>
      fetchStationData(station)
    );

    const results = await Promise.all(promises);

    return results;
  } catch (error) {
    console.error(
      'Lỗi fetchAllStations:',
      error
    );

    return [];
  }
}

// ========================================
// FILTER DỮ LIỆU HỢP LỆ
// ========================================

export function getValidStations(results) {
  return results.filter(
    (item) => item.success === true
  );
}

// ========================================
// SẮP XẾP THEO NHIỆT ĐỘ
// ========================================

export function sortByTemperature(
  results,
  descending = true
) {
  return [...results].sort((a, b) => {
    const tempA = a.currentTemp ?? -999;

    const tempB = b.currentTemp ?? -999;

    return descending
      ? tempB - tempA
      : tempA - tempB;
  });
}

// ========================================
// CẢNH BÁO NHIỆT ĐỘ
// ========================================

export function getTemperatureLevel(temp) {
  if (temp === null || temp === undefined) {
    return {
      level: 'nodata',
      label: 'Không có dữ liệu',
      color: '#999',
    };
  }

  if (temp < 18) {
    return {
      level: 'cold',
      label: 'Lạnh',
      color: '#2196F3',
    };
  }

  if (temp < 25) {
    return {
      level: 'normal',
      label: 'Mát',
      color: '#4CAF50',
    };
  }

  if (temp < 35) {
    return {
      level: 'hot',
      label: 'Nóng',
      color: '#FF9800',
    };
  }

  return {
    level: 'extreme',
    label: 'Nắng nóng',
    color: '#F44336',
  };
}

