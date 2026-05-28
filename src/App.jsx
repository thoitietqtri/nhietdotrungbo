import { useEffect, useState } from 'react';

import {
  loadTemperatureData,
  startAutoRefresh,
  stopAutoRefresh,
} from './api';

import './App.css';

function App() {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [stations, setStations] =
    useState([]);

  const [statistics, setStatistics] =
    useState(null);

  const [updateTime, setUpdateTime] =
    useState(null);

  const [provinceFilter, setProvinceFilter] =
    useState('ALL');

  const [provinces, setProvinces] =
    useState([]);

  // ======================================
  // LOAD DATA
  // ======================================

  async function loadData() {
    try {
      setLoading(true);

      const result =
        await loadTemperatureData();

      if (result.success) {
        setStations(result.stations);

        setStatistics(result.statistics);

        setUpdateTime(result.updateTime);

        setProvinces(result.provinces);

        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // START
  // ======================================

  useEffect(() => {
    loadData();

    const intervalId =
      startAutoRefresh((data) => {
        if (data.success) {
          setStations(data.stations);

          setStatistics(data.statistics);

          setUpdateTime(data.updateTime);
        }
      }, 10);

    return () => {
      stopAutoRefresh(intervalId);
    };
  }, []);

  // ======================================
  // FILTER TỈNH
  // ======================================

  const filteredStations =
    provinceFilter === 'ALL'
      ? stations
      : stations.filter(
          (station) =>
            station.station.tinh ===
            provinceFilter
        );

  // ======================================
  // FORMAT TIME
  // ======================================

  function formatTime(date) {
    if (!date) return '--';

    return new Date(date).toLocaleString(
      'vi-VN'
    );
  }

  // ======================================
  // CARD MÀU
  // ======================================

  function getCardStyle(level) {
    switch (level) {
      case 'cold':
        return {
          background:
            'linear-gradient(135deg,#2196F3,#64B5F6)',
        };

      case 'normal':
        return {
          background:
            'linear-gradient(135deg,#4CAF50,#81C784)',
        };

      case 'hot':
        return {
          background:
            'linear-gradient(135deg,#FF9800,#FFB74D)',
        };

      case 'extreme':
        return {
          background:
            'linear-gradient(135deg,#F44336,#EF5350)',
        };

      default:
        return {
          background:
            'linear-gradient(135deg,#757575,#BDBDBD)',
        };
    }
  }

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="loading-container">
        <h2>
          Đang tải dữ liệu nhiệt độ...
        </h2>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (error) {
    return (
      <div className="error-container">
        <h2>Có lỗi xảy ra</h2>

        <p>{error}</p>

        <button onClick={loadData}>
          Tải lại
        </button>
      </div>
    );
  }

  // ======================================
  // MAIN
  // ======================================

  return (
    <div className="app-container">
      {/* HEADER */}

      <header className="header">
        <h1>
          🌡️ WEB APP NHIỆT ĐỘ
          TRUNG BỘ
        </h1>

        <p>
          Hệ thống giám sát nhiệt độ
          realtime
        </p>

        <div className="update-time">
          Cập nhật:{' '}
          {formatTime(updateTime)}
        </div>
      </header>

      {/* THỐNG KÊ */}

      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Tổng số trạm</h3>

            <div className="stat-value">
              {
                statistics.totalStations
              }
            </div>
          </div>

          <div className="stat-card">
            <h3>Nhiệt độ TB</h3>

            <div className="stat-value">
              {
                statistics.averageTemp
              }
              °C
            </div>
          </div>

          <div className="stat-card">
            <h3>Nóng nhất</h3>

            <div className="stat-value">
              {statistics
                .hottestStation
                ?.station?.tentram || '--'}
            </div>

            <div>
              {
                statistics
                  .hottestStation
                  ?.currentTemp
              }
              °C
            </div>
          </div>

          <div className="stat-card">
            <h3>Mát nhất</h3>

            <div className="stat-value">
              {statistics
                .coldestStation
                ?.station?.tentram || '--'}
            </div>

            <div>
              {
                statistics
                  .coldestStation
                  ?.currentTemp
              }
              °C
            </div>
          </div>
        </div>
      )}

      {/* FILTER */}

      <div className="filter-bar">
        <label>Chọn tỉnh:</label>

        <select
          value={provinceFilter}
          onChange={(e) =>
            setProvinceFilter(
              e.target.value
            )
          }
        >
          <option value="ALL">
            Tất cả
          </option>

          {provinces.map((province) => (
            <option
              key={province}
              value={province}
            >
              {province}
            </option>
          ))}
        </select>

        <button onClick={loadData}>
          🔄 Làm mới
        </button>
      </div>

      {/* DANH SÁCH TRẠM */}

      <div className="station-grid">
        {filteredStations.map(
          (item, index) => {
            const station =
              item.station;

            const level =
              item.tempLevel?.level;

            return (
              <div
                key={index}
                className="station-card"
                style={getCardStyle(
                  level
                )}
              >
                <div className="station-name">
                  {station.tentram}
                </div>

                <div className="province-name">
                  {station.tinh}
                </div>

                <div className="current-temp">
                  {item.currentTemp ??
                    '--'}
                  °C
                </div>

                <div className="temp-level">
                  {
                    item.tempLevel
                      ?.label
                  }
                </div>

                <div className="temp-detail">
                  <div>
                    Tmax:{' '}
                    {item.maxTemp ??
                      '--'}
                    °C
                  </div>

                  <div>
                    Tmin:{' '}
                    {item.minTemp ??
                      '--'}
                    °C
                  </div>
                </div>

                <div className="last-update">
                  {
                    item.lastUpdate
                  }
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default App;

