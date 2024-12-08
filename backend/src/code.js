function doGet(e) {
  const sheetName = e.parameter.sheetName
  return getMarkersAsJson(sheetName, e)
}

function getMarkersAsJson(sheetName, e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const items = []

  // ヘッダー行をスキップしてデータを処理
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    let item

    if (sheetName === 'master') {
      item = createMasterItem(row, headers)
    } else if (sheetName === 'Marker') {
      const regionParam = e.parameter.region
      if (regionParam === 'all' || !regionParam || row[headers.indexOf('region')] === regionParam) {
        item = createMarkerItem(row, headers)
      } else {
        continue
      }
    } else {
      item = createFacilityItem(row, headers)
    }

    items.push(item)
  }

  Logger.log(items)
  // JSONとしてレスポンスを返す
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      data: items,
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

function createMasterItem(row, headers) {
  return {
    id: row[headers.indexOf('id')],
    name: row[headers.indexOf('name')],
    address: row[headers.indexOf('address')],
    latitude: row[headers.indexOf('latitude')],
    longitude: row[headers.indexOf('longitude')],
  }
}

function createMarkerItem(row, headers) {
  return {
    id: row[headers.indexOf('ID')],
    lat: row[headers.indexOf('lat')],
    lng: row[headers.indexOf('lng')],
    message: row[headers.indexOf('message')],
    category: row[headers.indexOf('category')],
    region: row[headers.indexOf('region')],
  }
}

function createFacilityItem(row, headers) {
  return {
    id: row[headers.indexOf('ID')],
    lat: row[headers.indexOf('lat')],
    lng: row[headers.indexOf('lng')],
    name: row[headers.indexOf('name')],
  }
}

// スプレッドシートにマーカーを追加する関数
function addMarker(marker, sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  const lastRow = sheet.getLastRow()

  sheet.appendRow([lastRow, marker.lat, marker.lng, marker.message, marker.category, marker.region])

  return true
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents)
    const result = addMarker(postData, 'Marker')

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        data: result,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function test() {
  const sheetName = 'master' // シート名を'master'に指定
  const e = { parameter: { sheetName: sheetName } } // 引数オブジェクトを作成
  const result = doGet(e) // doGet関数を呼び出す
  Logger.log(result) // 結果をログに出力
}

function testGet() {
  const sheetName = 'Marker' // シート名を'master'に指定
  const e = { parameter: { sheetName: sheetName, region: '輪島市' } } // 引数オブジェクトを作成
  const result = doGet(e) // doGet関数を呼び出す
  Logger.log(result) // 結果をログに出力
}
