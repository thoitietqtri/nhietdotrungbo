// src/api.js

import {
  loadStationParams,
  groupStationsByAPI,
  filterStationsByProvince,
  getProvinceList,
} from './utils/excelLoader';

import {
  fetchAllStations,
  getValidStations,
  sortByTemperature,
  getTemperatureLevel,
} from './api/client';

// ========================================
// LOAD TOÀN BỘ DỮ LIỆU APP
// ========================================

export async function loadTemperatureData() {
  try {
    console.log(
      '===== BẮT ĐẦU LOAD DỮ LIỆU ====='
    );

    // ====================================
    // LOAD DANH SÁCH TRẠM
    // ====================================

    const stations =
      await loadStationParams();

    console.log(
      'Số lượng trạm:',
      stations.length
    );

    // ====================================
    // GOM NHÓM API
    // ====================================

    const apiGroups =
      groupStationsByAPI(stations);

    console.log(
      'Số nhóm API:',
      Object.keys(apiGroups).length
    );

    // ====================================
    // GỌI API SONG SONG
    // ====================================

    const stationResults =
      await fetchAllStations(stations);

    console.log(
      'Kết quả API:',
      stationResults
    );

    // ====================================
    // LỌC DỮ LIỆU HỢP LỆ
    // ====================================

    const validStations =
      getValidStations(stationResults);

    console.log(
      'Trạm hợp lệ:',
      validStations.length
    );

    // ====================================
    // SẮP XẾP NHIỆT ĐỘ
    // ====================================

    const sortedStations =
      sortByTemperature(validStations);

    // ====================================
    // THÊM CẤP ĐỘ NHIỆT
    // ====================================

    const finalStations =
      sortedStations.map((station) => {
        return {
          ...station,

          tempLevel: getTemperatureLevel(
            station.currentTemp
          ),
        };
      });

    // ====================================
    // DANH SÁCH TỈNH
    // ====================================

    const provinces =
      getProvinceList(stations);

    // ====================================
    // THỐNG KÊ
    // ====================================

    const statistics =
      buildStatistics(finalStations);

    console.log(
      '===== LOAD HOÀN TẤT ====='
    );

    return {
      success: true,

      stations: finalStations,

      provinces: provinces,

      statistics: statistics,

      rawStations: stations,

      apiGroups: apiGroups,

      updateTime: new Date(),
    };
  } catch (error) {
    console.error(
      'Lỗi loadTemperatureData:',
      error
    );

    return {
      success: false,

      stations: [],

      provinces: [],

      statistics: null,

      error: error.message,
    };
  }
}

// ========================================
// LOAD THEO TỈNH
// ========================================

export async function loadProvinceData(
  province
) {
  try {
    const allStations =
      await loadStationParams();

    const filteredStations =
      filterStationsByProvince(
        allStations,
        province
      );

    const results =
      await fetchAllStations(
        filteredStations
      );

    const validStations =
      getValidStations(results);

    const finalStations =
      validStations.map((station) => ({
        ...station,

        tempLevel: getTemperatureLevel(
          station.currentTemp
        ),
      }));

    return {
      success: true,

      stations: sortByTemperature(
        finalStations
      ),

      province: province,
    };
  } catch (error) {
    console.error(
      'Lỗi loadProvinceData:',
      error
    );

    return {
      success: false,

      stations: [],

      error: error.message,
    };
  }
}

// ========================================
// THỐNG KÊ
// ========================================

function buildStatistics(stations) {
  if (!stations || stations.length === 0) {
    return {
      totalStations: 0,

      hottestStation: null,

      coldestStation: null,

      averageTemp: null,
    };
  }

  const temps = stations
    .map((s) => s.currentTemp)
    .filter(
      (temp) =>
        temp !== null &&
        temp !== undefined
    );

  const averageTemp =
    temps.length > 0
      ? (
          temps.reduce(
            (sum, temp) => sum + temp,
            0
          ) / temps.length
        ).toFixed(1)
      : null;

  return {
    totalStations: stations.length,

    hottestStation: stations[0],

    coldestStation:
      stations[stations.length - 1],

    averageTemp: averageTemp,
  };
}

// ========================================
// AUTO REFRESH
// ========================================

export function startAutoRefresh(
  callback,
  intervalMinutes = 10
) {
  console.log(
    `Auto refresh mỗi ${intervalMinutes} phút`
  );

  const intervalMs =
    intervalMinutes * 60 * 1000;

  const intervalId = setInterval(
    async () => {
      console.log(
        'Đang tự động cập nhật dữ liệu...'
      );

      const data =
        await loadTemperatureData();

      callback(data);
    },
    intervalMs
  );

  return intervalId;
}

// ========================================
// DỪNG AUTO REFRESH
// ========================================

export function stopAutoRefresh(
  intervalId
) {
  clearInterval(intervalId);

  console.log(
    'Đã dừng auto refresh'
  );
}

