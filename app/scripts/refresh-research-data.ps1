param(
  [string]$PythonPath = "python",
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string]$RetrievedAt = "2026-07-23"
)

$ErrorActionPreference = "Stop"

$appRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$taskTemp = Join-Path ([System.IO.Path]::GetTempPath()) "ewha-piano-official-data-$RetrievedAt"
$xlsxDir = Join-Path $taskTemp "xlsx"
New-Item -ItemType Directory -Force -Path $taskTemp, $xlsxDir | Out-Null

$sources = @(
  @{ Name = "moe-2025-private-education-survey.pdf"; Url = "https://www.moe.go.kr/boardCnts/fileDown.do?m=020402&s=moe&fileSeq=7562a697bdba006065fa92054b1d634e" },
  @{ Name = "seoul-academy-gangnam-1.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233296&q_fileId=23d315d6-8c39-4ca4-bae0-85f669390b6e" },
  @{ Name = "seoul-academy-gangnam-2.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233296&q_fileId=312efd28-9361-44e7-98a6-437f2879114a" },
  @{ Name = "seoul-academy-seocho.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233296&q_fileId=f2cd622d-ea3f-4a29-9c4b-92f511c30d80" },
  @{ Name = "seoul-academy-gangdong-songpa.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233296&q_fileId=9a11e0df-7aba-4006-9a6c-59482d64aab1" },
  @{ Name = "seoul-academy-seongdong-gwangjin-dongbu.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233296&q_fileId=384645f1-8d90-4593-8732-87f292c4d542" },
  @{ Name = "seoul-academy-seobu-jungbu.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233297&q_fileId=c7ad6b5f-6f7b-42f0-b278-c41d19ead5ef" },
  @{ Name = "seoul-academy-nambu-dongjak-gwanak.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233297&q_fileId=d809d386-fa11-4186-b5fa-54211aedadc1" },
  @{ Name = "seoul-academy-seongbuk-gangbuk-bukbu.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233297&q_fileId=8410960d-7c2c-4589-88f9-3a5d47d91489" },
  @{ Name = "seoul-academy-gangseo-yangcheon.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233297&q_fileId=bcb175fb-4bf8-4cdc-93d3-97942d4759d6" },
  @{ Name = "seoul-teaching-center-north.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233298&q_fileId=2c959409-02aa-40d9-a572-4c95b810ce62" },
  @{ Name = "seoul-teaching-center-south.xls"; Url = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2233298&q_fileId=81c5b1f8-1166-455b-8934-9ba587f52dd6" }
)

foreach ($source in $sources) {
  $target = Join-Path $taskTemp $source.Name
  curl.exe -L -sS --fail $source.Url -o $target
  if ($LASTEXITCODE -ne 0) {
    throw "원자료 다운로드 실패: $($source.Name)"
  }
}

$pdfHeader = [System.Text.Encoding]::ASCII.GetString(
  (Get-Content -LiteralPath (Join-Path $taskTemp "moe-2025-private-education-survey.pdf") -Encoding Byte -TotalCount 4)
)
if ($pdfHeader -ne "%PDF") {
  throw "교육부 PDF 파일 서명이 올바르지 않습니다."
}

$expectedXlsHeader = "D0-CF-11-E0-A1-B1-1A-E1"
foreach ($xls in Get-ChildItem -LiteralPath $taskTemp -Filter "*.xls") {
  $header = ((Get-Content -LiteralPath $xls.FullName -Encoding Byte -TotalCount 8) | ForEach-Object { $_.ToString("X2") }) -join "-"
  if ($header -ne $expectedXlsHeader) {
    throw "XLS 파일 서명이 올바르지 않습니다: $($xls.Name)"
  }
}

$excel = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  foreach ($xls in Get-ChildItem -LiteralPath $taskTemp -Filter "*.xls" | Sort-Object Name) {
    $workbook = $null
    try {
      $workbook = $excel.Workbooks.Open($xls.FullName, 0, $true)
      $target = Join-Path $xlsxDir ($xls.BaseName + ".xlsx")
      $workbook.SaveAs($target, 51)
    }
    finally {
      if ($workbook) {
        $workbook.Close($false)
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook)
      }
    }
  }
}
finally {
  if ($excel) {
    $excel.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

& $PythonPath (Join-Path $PSScriptRoot "build-research-data.py") `
  --source-dir $xlsxDir `
  --raw-dir $taskTemp `
  --public-output-dir (Join-Path $appRoot "public\data\research") `
  --src-output-dir (Join-Path $appRoot "src\data\research") `
  --retrieved-at $RetrievedAt

if ($LASTEXITCODE -ne 0) {
  throw "가공 데이터 생성 실패"
}

Write-Output "연구 데이터 갱신 완료: $RetrievedAt"
