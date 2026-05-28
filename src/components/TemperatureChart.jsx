import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function TemperatureChart({
  stationName,
  province,
  data,
  currentTemp,
  maxTemp,
  minTemp,
}) {
  // ======================================
  // FORMAT DỮ LIỆU
  // ======================================

  const chartData = data.map((item) => {
    return {
      time: formatHour(item.time),

      temperature: item.value,
    };
  });

  // ======================================
  // FORMAT GIỜ
  // ======================================

  function formatHour(timeString) {
    if (!timeString) return '--';

    try {
      // lấy HH:mm
      return timeString.slice(-5);
    } catch (error) {
      return timeString;
    }
  }

  // ======================================
  // MÀU NHIỆT ĐỘ
  // ======================================

  function getTempColor(temp) {
    if (temp === null || temp === undefined) {
      return '#999';
    }

    if (temp < 18) {
      return '#2196F3';
    }

    if (temp < 25) {
      return '#4CAF50';
    }

    if (temp < 35) {
      return '#FF9800';
    }

    return '#F44336';
  }

  // ======================================
  // TOOLTIP
  // ======================================

  function CustomTooltip({
    active,
    payload,
    label,
  }) {
    if (
      active &&
      payload &&
      payload.length
    ) {
      return (
        <div
          style={{
            background: 'white',

            padding: '12px',

            borderRadius: '10px',

            boxShadow:
              '0 4px 12px rgba(0,0,0,0.15)',

            border:
              '1px solid #ddd',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',

              marginBottom: '6px',
            }}
          >
            {stationName}
          </div>

          <div>🕒 {label}</div>

          <div>
            🌡️{' '}
            {
              payload[0].value
            }
            °C
          </div>
        </div>
      );
    }

    return null;
  }

  // ======================================
  // EMPTY
  // ======================================

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: 'white',

          padding: '20px',

          borderRadius: '18px',

          marginTop: '20px',

          textAlign: 'center',
        }}
      >
        Không có dữ liệu biểu đồ
      </div>
    );
  }

  // ======================================
  // MAIN
  // ======================================

  return (
    <div
      style={{
        background: 'white',

        borderRadius: '20px',

        padding: '20px',

        marginTop: '25px',

        boxShadow:
          '0 4px 15px rgba(0,0,0,0.08)',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            color: '#1565c0',

            marginBottom: '8px',
          }}
        >
          🌡️ {stationName}
        </h2>

        <div
          style={{
            color: '#666',
          }}
        >
          {province}
        </div>
      </div>

      {/* THỐNG KÊ */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(140px,1fr))',

          gap: '15px',

          marginBottom: '25px',
        }}
      >
        {/* CURRENT */}

        <div
          style={{
            background:
              getTempColor(
                currentTemp
              ),

            color: 'white',

            padding: '16px',

            borderRadius: '16px',

            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '14px',

              marginBottom: '6px',
            }}
          >
            Hiện tại
          </div>

          <div
            style={{
              fontSize: '34px',

              fontWeight: 'bold',
            }}
          >
            {currentTemp ??
              '--'}
            °C
          </div>
        </div>

        {/* MAX */}

        <div
          style={{
            background:
              '#F44336',

            color: 'white',

            padding: '16px',

            borderRadius: '16px',

            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '14px',

              marginBottom: '6px',
            }}
          >
            Tmax
          </div>

          <div
            style={{
              fontSize: '30px',

              fontWeight: 'bold',
            }}
          >
            {maxTemp ?? '--'}
            °C
          </div>
        </div>

        {/* MIN */}

        <div
          style={{
            background:
              '#2196F3',

            color: 'white',

            padding: '16px',

            borderRadius: '16px',

            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '14px',

              marginBottom: '6px',
            }}
          >
            Tmin
          </div>

          <div
            style={{
              fontSize: '30px',

              fontWeight: 'bold',
            }}
          >
            {minTemp ?? '--'}
            °C
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ */}

      <div
        style={{
          width: '100%',

          height: '400px',
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="time" />

            <YAxis
              domain={[
                'dataMin - 2',
                'dataMax + 2',
              ]}
            />

            <Tooltip
              content={
                <CustomTooltip />
              }
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#F44336"
              strokeWidth={3}
              dot={{
                r: 3,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}

      <div
        style={{
          marginTop: '18px',

          fontSize: '14px',

          color: '#666',

          textAlign: 'center',
        }}
      >
        Biểu đồ nhiệt độ 24 giờ gần
        nhất
      </div>
    </div>
  );
}

export default TemperatureChart;
