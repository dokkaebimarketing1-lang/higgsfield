#!/usr/bin/env python3
"""Build a publishable piano keyword search-demand dataset.

The source workbook is a private working file outside Git. This script publishes
keyword-level metrics and segment flags without workbook formatting, formulas, or
local filesystem paths. Search volumes are advertising-tool estimates, not traffic.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from typing import Any

import pandas as pd


DATASET_ID = "ewha-piano-search-demand-2026"
DATASET_VERSION = "1.0.0"
PUBLISHED_AT = "2026-07-23"
REFERENCE_DATE = "2026-07-23"
SITE_ORIGIN = "https://ewha-piano.higgsfield.app"
SOURCE_SHEET = "전체 키워드"

EXPECTED_SHEETS = (
    "전체 키워드",
    "레슨·과외(알바용)",
    "지역별",
    "대상별(유아~시니어)",
    "알바·구인",
    "엄마·자녀(학부모)",
    "네이버 발굴 키워드",
    "요약",
)

MONTH_COLUMNS = tuple(f"{year}-{month:02d}" for year, month in (
    (2025, 7),
    (2025, 8),
    (2025, 9),
    (2025, 10),
    (2025, 11),
    (2025, 12),
    (2026, 1),
    (2026, 2),
    (2026, 3),
    (2026, 4),
    (2026, 5),
    (2026, 6),
))

BASE_COLUMN_MAP = {
    "키워드": "keyword",
    "총 검색량(구글+네이버)": "total_search_volume",
    "네이버 합계": "naver_total",
    "네이버 모바일": "naver_mobile",
    "네이버 PC": "naver_pc",
    "구글 월평균": "google_monthly_average",
    "네이버 경쟁도": "naver_competition",
    "구글 경쟁도": "google_competition",
    "구글 경쟁지수": "google_competition_index",
    "입찰가 하한(원)": "google_bid_low_krw",
    "입찰가 상한(원)": "google_bid_high_krw",
}

SEGMENTS = {
    "lesson": "레슨·과외(알바용)",
    "local": "지역별",
    "audience": "대상별(유아~시니어)",
    "jobs": "알바·구인",
    "parent": "엄마·자녀(학부모)",
    "naver_discovered": "네이버 발굴 키워드",
}

SEGMENT_NOTES = {
    "전체 키워드": "공개 데이터셋의 기준 모수. 키워드 1개당 1행이며 다른 세그먼트 시트와 합산하지 않습니다.",
    "레슨·과외(알바용)": "전체 키워드의 큐레이션 부분집합이며 레슨 탐색과 구인 의도가 일부 함께 포함될 수 있습니다.",
    "지역별": "전체 키워드의 지역 표현 부분집합입니다.",
    "대상별(유아~시니어)": "전체 키워드의 연령·대상 표현 부분집합입니다.",
    "알바·구인": "전체 키워드 중 구인·구직 의도 부분집합으로 레슨 고객 유입과 분리해 해석합니다.",
    "엄마·자녀(학부모)": "학부모·자녀 관련 자체 분류이며 피아노 외 인접 음악 검색어가 포함될 수 있습니다.",
    "네이버 발굴 키워드": "네이버 지표만 있는 발굴 목록입니다. 전체 키워드와 중복되며 구글+네이버 합계와 직접 비교하지 않습니다.",
}

TARGET_KEYWORDS = (
    "피아노 학원",
    "피아노 코드",
    "어린이 피아노",
    "성인 피아노",
    "피아노 레슨",
    "피아노 연습",
    "피아노 과외",
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def clean_keyword_rows(frame: pd.DataFrame) -> pd.DataFrame:
    if "키워드" not in frame.columns:
        raise ValueError("키워드 열이 없습니다.")
    result = frame.copy()
    result["키워드"] = result["키워드"].fillna("").astype(str).str.strip()
    return result[result["키워드"] != ""].reset_index(drop=True)


def integer_or_none(value: Any) -> int | None:
    if pd.isna(value):
        return None
    if isinstance(value, str):
        normalized = value.strip().replace(",", "")
        if normalized in {"", "-", "—"}:
            return None
        value = normalized
    return int(round(float(value)))


def string_or_none(value: Any) -> str | None:
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


def sum_numeric(frame: pd.DataFrame, column: str) -> int | None:
    if column not in frame.columns:
        return None
    values = pd.to_numeric(frame[column], errors="coerce")
    return int(round(values.sum())) if values.notna().any() else None


def naver_total_sum(frame: pd.DataFrame) -> int | None:
    direct = sum_numeric(frame, "네이버 합계")
    if direct is not None:
        return direct
    if {"네이버 모바일", "네이버 PC"}.issubset(frame.columns):
        mobile = pd.to_numeric(frame["네이버 모바일"], errors="coerce").fillna(0)
        pc = pd.to_numeric(frame["네이버 PC"], errors="coerce").fillna(0)
        return int(round((mobile + pc).sum()))
    return None


def write_csv(path: Path, headers: list[str], rows: list[list[Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(headers)
        writer.writerows(rows)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def distribution_metadata(path: Path, public_url: str, row_count: int, field_count: int) -> dict[str, Any]:
    return {
        "title": path.stem,
        "contentUrl": public_url,
        "encodingFormat": "text/csv",
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "rowCount": row_count,
        "fieldCount": field_count,
    }


def build(source: Path, public_dir: Path, source_dir: Path) -> None:
    workbook = pd.ExcelFile(source)
    missing_sheets = [sheet for sheet in EXPECTED_SHEETS if sheet not in workbook.sheet_names]
    if missing_sheets:
        raise ValueError(f"필수 시트가 없습니다: {', '.join(missing_sheets)}")

    frames = {
        sheet: clean_keyword_rows(pd.read_excel(source, sheet_name=sheet))
        for sheet in EXPECTED_SHEETS
        if sheet != "요약"
    }
    overall = frames[SOURCE_SHEET]
    required_columns = [*BASE_COLUMN_MAP, *MONTH_COLUMNS]
    missing_columns = [column for column in required_columns if column not in overall.columns]
    if missing_columns:
        raise ValueError(f"전체 키워드 시트의 필수 열이 없습니다: {', '.join(missing_columns)}")
    if len(overall) != 4_545:
        raise ValueError(f"전체 키워드 행 수가 4,545가 아닙니다: {len(overall)}")
    if overall["키워드"].duplicated().any():
        duplicates = overall.loc[overall["키워드"].duplicated(), "키워드"].head(10).tolist()
        raise ValueError(f"중복 키워드가 있습니다: {duplicates}")

    segment_sets = {
        segment: set(frame["키워드"].tolist())
        for segment, sheet in SEGMENTS.items()
        for frame in [frames[sheet]]
    }

    output_headers = [
        *BASE_COLUMN_MAP.values(),
        *(f"google_search_volume_{column.replace('-', '_')}" for column in MONTH_COLUMNS),
        "source_coverage",
        *(f"in_{segment}_segment" for segment in SEGMENTS),
    ]
    keyword_rows: list[list[Any]] = []
    published_records: list[dict[str, Any]] = []

    for _, row in overall.iterrows():
        record: dict[str, Any] = {
            output_name: (
                string_or_none(row[source_name])
                if output_name in {"keyword", "naver_competition", "google_competition"}
                else integer_or_none(row[source_name])
            )
            for source_name, output_name in BASE_COLUMN_MAP.items()
        }
        for column in MONTH_COLUMNS:
            record[f"google_search_volume_{column.replace('-', '_')}"] = integer_or_none(row[column])

        has_naver = record["naver_total"] is not None
        has_google = record["google_monthly_average"] is not None
        record["source_coverage"] = (
            "google+naver"
            if has_naver and has_google
            else "naver_only"
            if has_naver
            else "google_only"
            if has_google
            else "no_volume"
        )
        for segment, keywords in segment_sets.items():
            record[f"in_{segment}_segment"] = 1 if record["keyword"] in keywords else 0
        published_records.append(record)
        keyword_rows.append([record.get(header) for header in output_headers])

    total_sum = sum(record["total_search_volume"] or 0 for record in published_records)
    naver_sum = sum(record["naver_total"] or 0 for record in published_records)
    google_sum = sum(record["google_monthly_average"] or 0 for record in published_records)
    if (total_sum, naver_sum, google_sum) != (1_001_925, 593_235, 408_690):
        raise ValueError(
            "전체 검색량 합계가 검증값과 다릅니다: "
            f"total={total_sum}, naver={naver_sum}, google={google_sum}"
        )

    keyword_csv = public_dir / "piano-keyword-search-demand-2026.csv"
    write_csv(keyword_csv, output_headers, keyword_rows)

    summary_headers = [
        "sheet_name",
        "segment_id",
        "data_rows",
        "column_count",
        "total_search_volume_sum",
        "naver_search_volume_sum",
        "google_monthly_average_sum",
        "overlap_policy",
        "notes",
    ]
    summary_rows: list[list[Any]] = []
    summary_records: list[dict[str, Any]] = []
    sheet_to_segment = {sheet: segment for segment, sheet in SEGMENTS.items()}
    for sheet_name, frame in frames.items():
        segment_id = "overall" if sheet_name == SOURCE_SHEET else sheet_to_segment[sheet_name]
        record = {
            "sheetName": sheet_name,
            "segmentId": segment_id,
            "dataRows": len(frame),
            "columnCount": len(frame.columns),
            "totalSearchVolumeSum": sum_numeric(frame, "총 검색량(구글+네이버)"),
            "naverSearchVolumeSum": naver_total_sum(frame),
            "googleMonthlyAverageSum": sum_numeric(frame, "구글 월평균"),
            "overlapPolicy": (
                "기준 모수"
                if sheet_name == SOURCE_SHEET
                else "전체 키워드 및 다른 세그먼트와 중복 가능"
            ),
            "notes": SEGMENT_NOTES[sheet_name],
        }
        summary_records.append(record)
        summary_rows.append(
            [
                record["sheetName"],
                record["segmentId"],
                record["dataRows"],
                record["columnCount"],
                record["totalSearchVolumeSum"],
                record["naverSearchVolumeSum"],
                record["googleMonthlyAverageSum"],
                record["overlapPolicy"],
                record["notes"],
            ]
        )

    summary_csv = public_dir / "piano-keyword-segment-summary-2026.csv"
    write_csv(summary_csv, summary_headers, summary_rows)

    top_keywords = sorted(
        published_records,
        key=lambda item: item["total_search_volume"] or 0,
        reverse=True,
    )[:20]
    target_keyword_rows = [
        next(record for record in published_records if record["keyword"] == keyword)
        for keyword in TARGET_KEYWORDS
    ]

    source_hash = sha256_file(source)
    source_manifest = {
        "manifestVersion": "1.0.0",
        "datasetId": DATASET_ID,
        "source": {
            "originalName": source.name,
            "format": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "bytes": source.stat().st_size,
            "sha256": source_hash,
            "lookupDate": REFERENCE_DATE,
            "publiclyRedistributed": False,
            "notice": (
                "원본 XLSX는 작업용 수식·서식이 포함된 내부 조사 파일이라 재배포하지 않습니다. "
                "개인정보는 없으며 공개 CSV는 전체 키워드 시트의 값과 세그먼트 소속만 재구성합니다."
            ),
        },
    }
    manifest_path = public_dir / "piano-keyword-source-manifest-2026.json"
    write_json(manifest_path, source_manifest)

    dictionary = {
        "schemaVersion": "1.0.0",
        "datasetId": DATASET_ID,
        "datasetVersion": DATASET_VERSION,
        "publishedAt": PUBLISHED_AT,
        "tables": [
            {
                "name": "keyword_search_demand",
                "csvPath": "/data/research/piano-keyword-search-demand-2026.csv",
                "fieldCount": len(output_headers),
                "fields": [
                    {
                        "name": header,
                        "dataType": (
                            "string"
                            if header
                            in {
                                "keyword",
                                "naver_competition",
                                "google_competition",
                                "source_coverage",
                            }
                            else "integer"
                        ),
                        "nullable": header
                        not in {
                            "keyword",
                            "total_search_volume",
                            "source_coverage",
                            *(f"in_{segment}_segment" for segment in SEGMENTS),
                        },
                        "unit": (
                            "KRW"
                            if header in {"google_bid_low_krw", "google_bid_high_krw"}
                            else "monthly search estimate"
                            if "search_volume" in header
                            or header
                            in {
                                "total_search_volume",
                                "naver_total",
                                "naver_mobile",
                                "naver_pc",
                                "google_monthly_average",
                            }
                            else None
                        ),
                        "description": {
                            "keyword": "검색어 원문",
                            "total_search_volume": "구글 최근 12개월 월평균과 네이버 최근 30일 월간 검색수의 합",
                            "naver_total": "네이버 모바일과 PC 월간 검색수 합계",
                            "naver_mobile": "네이버 모바일 월간 검색수",
                            "naver_pc": "네이버 PC 월간 검색수",
                            "google_monthly_average": "구글 키워드 플래너 최근 12개월 월평균 검색량",
                            "naver_competition": "네이버 검색광고 키워드도구 경쟁도",
                            "google_competition": "구글 키워드 플래너 경쟁도 구간",
                            "google_competition_index": "구글 키워드 플래너 경쟁지수",
                            "google_bid_low_krw": "구글 페이지 상단 입찰가 하한 추정치",
                            "google_bid_high_krw": "구글 페이지 상단 입찰가 상한 추정치",
                            "source_coverage": "해당 행에 값이 있는 플랫폼 조합",
                        }.get(
                            header,
                            "구글 월별 검색량 추정치"
                            if header.startswith("google_search_volume_")
                            else "해당 자체 분류 세그먼트 포함 여부(1 또는 0)",
                        ),
                        "derivation": (
                            "네이버·구글 검색량 필드의 값 존재 여부로 플랫폼 조합을 계산"
                            if header == "source_coverage"
                            else "동일 키워드가 원본의 해당 세그먼트 시트에 있으면 1"
                            if header.startswith("in_")
                            else "원본 전체 키워드 시트 값 유지"
                        ),
                        "publicRestriction": "광고 도구 추정치이며 실제 사이트 트래픽이나 검색 이용자 수로 해석하지 않음",
                    }
                    for header in output_headers
                ],
            },
            {
                "name": "segment_summary",
                "csvPath": "/data/research/piano-keyword-segment-summary-2026.csv",
                "fieldCount": len(summary_headers),
                "fields": [
                    {
                        "name": header,
                        "dataType": (
                            "integer"
                            if header
                            in {
                                "data_rows",
                                "column_count",
                                "total_search_volume_sum",
                                "naver_search_volume_sum",
                                "google_monthly_average_sum",
                            }
                            else "string"
                        ),
                        "nullable": header
                        in {
                            "total_search_volume_sum",
                            "naver_search_volume_sum",
                            "google_monthly_average_sum",
                        },
                        "unit": (
                            "monthly search estimate"
                            if header
                            in {
                                "total_search_volume_sum",
                                "naver_search_volume_sum",
                                "google_monthly_average_sum",
                            }
                            else None
                        ),
                        "description": "원본 시트별 행 수·검색량 합계·중복 해석 기준",
                        "derivation": "각 원본 시트를 독립 집계하며 시트 간 합계를 다시 합산하지 않음",
                        "publicRestriction": "세그먼트는 서로 중복될 수 있어 전체 키워드 수로 합산하지 않음",
                    }
                    for header in summary_headers
                ],
            },
        ],
    }
    dictionary_path = public_dir / "piano-keyword-search-demand-schema.json"
    write_json(dictionary_path, dictionary)

    distributions = [
        distribution_metadata(
            keyword_csv,
            "/data/research/piano-keyword-search-demand-2026.csv",
            len(keyword_rows),
            len(output_headers),
        ),
        distribution_metadata(
            summary_csv,
            "/data/research/piano-keyword-segment-summary-2026.csv",
            len(summary_rows),
            len(summary_headers),
        ),
    ]
    metadata = {
        "datasetId": DATASET_ID,
        "datasetVersion": DATASET_VERSION,
        "name": "2026 피아노 키워드 검색수요 데이터",
        "description": (
            "구글 키워드 플래너 최근 12개월 월평균과 네이버 검색광고 키워드도구 최근 30일 "
            "월간 검색수를 결합한 4,545개 피아노 관련 키워드 자체 조사"
        ),
        "publisher": {
            "name": "이화 피아노 과외",
            "url": SITE_ORIGIN,
            "role": "자체 키워드 조사 가공·분류·배포",
        },
        "lookupDate": REFERENCE_DATE,
        "googleWindow": {"start": "2025-07", "end": "2026-06", "metric": "monthly average"},
        "naverWindow": {"description": "조회일 기준 최근 30일 월간 검색수"},
        "sourceWorkbook": {
            "originalName": source.name,
            "bytes": source.stat().st_size,
            "sha256": source_hash,
            "sourceSheet": SOURCE_SHEET,
            "manifestPath": "/data/research/piano-keyword-source-manifest-2026.json",
        },
        "datasetPublishedAt": PUBLISHED_AT,
        "modifiedAt": PUBLISHED_AT,
        "uniqueKeywords": len(published_records),
        "naverMeasuredKeywords": sum(record["naver_total"] is not None for record in published_records),
        "totalSearchVolumeSum": total_sum,
        "naverSearchVolumeSum": naver_sum,
        "googleMonthlyAverageSum": google_sum,
        "segments": summary_records,
        "topKeywords": [
            {
                "keyword": record["keyword"],
                "totalSearchVolume": record["total_search_volume"],
                "naverTotal": record["naver_total"],
                "googleMonthlyAverage": record["google_monthly_average"],
            }
            for record in top_keywords
        ],
        "targetKeywordRows": [
            {
                "keyword": record["keyword"],
                "totalSearchVolume": record["total_search_volume"],
                "naverTotal": record["naver_total"],
                "googleMonthlyAverage": record["google_monthly_average"],
            }
            for record in target_keyword_rows
        ],
        "dataDictionaryPath": "/data/research/piano-keyword-search-demand-schema.json",
        "distributions": distributions,
        "limitations": [
            "검색량은 광고 플랫폼의 추정치이며 실제 검색 트래픽, 노출, 클릭 또는 사용자 수가 아닙니다.",
            "구글은 최근 12개월 월평균, 네이버는 최근 30일 월간 검색수라 관측 기간이 다릅니다.",
            "키워드끼리 검색 의도와 이용자가 겹치므로 행별 검색량 합계를 고유 이용자 수로 해석하면 안 됩니다.",
            "세그먼트 시트는 서로 중복되는 큐레이션 부분집합이라 행 수와 검색량을 다시 합산하면 안 됩니다.",
            "학부모 세그먼트에는 피아노 외 인접 음악 키워드가 포함될 수 있고 분류 누락·오분류 가능성이 있습니다.",
            "원본 요약 시트의 지역·알바 행 수 수식은 #NAME? 오류가 있어 공개 집계는 각 시트의 실제 비어 있지 않은 행을 다시 계산했습니다.",
            "검색량이 높아도 사이트 서비스, 저작권, 검색 의도와 맞지 않으면 목표 페이지로 사용하지 않습니다.",
        ],
    }
    metadata_path = public_dir / "piano-keyword-search-demand-metadata.json"
    write_json(metadata_path, metadata)
    write_json(source_dir / "piano-keyword-search-demand.json", metadata)

    print(
        json.dumps(
            {
                "datasetId": DATASET_ID,
                "rows": len(published_records),
                "totalSearchVolumeSum": total_sum,
                "distributions": distributions,
                "sourceSha256": source_hash,
            },
            ensure_ascii=False,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument(
        "--public-dir",
        type=Path,
        default=Path("public/data/research"),
    )
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path("src/data/research"),
    )
    args = parser.parse_args()
    build(args.source.resolve(), args.public_dir.resolve(), args.source_dir.resolve())


if __name__ == "__main__":
    main()
