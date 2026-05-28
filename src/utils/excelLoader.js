import * as XLSX from 'xlsx';
        station.matram !== '' &&
        station.tentram !== '' &&
        station.apiLink !== ''
    );

    console.log('Danh sách trạm:', filteredStations);

    return filteredStations;
  } catch (error) {
    console.error('Lỗi đọc file tham số:', error);
    return [];
  }
}

// Gom nhóm API
export function groupStationsByAPI(stations) {
  const groups = {};

  stations.forEach((station) => {
    const api = station.apiLink;

    if (!groups[api]) {
      groups[api] = [];
    }

    groups[api].push(station);
  });

  return groups;
}

// Lấy danh sách tỉnh
export function getProvinceList(stations) {
  const provinces = [...new Set(stations.map((s) => s.tinh))];

  return provinces.sort();
}

// Filter theo tỉnh
export function filterStationsByProvince(stations, province) {
  if (!province || province === 'ALL') {
    return stations;
  }

  return stations.filter((s) => s.tinh === province);
}