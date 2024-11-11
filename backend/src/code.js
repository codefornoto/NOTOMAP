function doGet() {
  return getMarkersAsJson()
}

function getMarkersAsJson() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const markers = []

  // ヘッダー行をスキップしてデータを処理
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    const marker = {
      id: row[headers.indexOf('ID')],
      lat: row[headers.indexOf('lat')],
      lng: row[headers.indexOf('lng')],
      message: row[headers.indexOf('message')],
      category: row[headers.indexOf('category')],
    }
    markers.push(marker)
  }

  // JSONとしてレスポンスを返す
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      data: markers,
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// スプレッドシートにマーカーを追加する関数
function addMarker(marker) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const lastRow = sheet.getLastRow()

  sheet.appendRow([
    lastRow, // ID を自動採番
    marker.lat,
    marker.lng,
    marker.message,
    marker.category || '', // categoryが無い場合は空文字を設定
  ])

  return true
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents)
    const result = addMarker(postData)

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
