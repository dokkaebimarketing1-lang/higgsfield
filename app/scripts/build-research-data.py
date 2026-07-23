#!/usr/bin/env python3
"""Build privacy-safe research datasets from official Seoul education files.

The official files are downloaded separately and converted from legacy XLS to
XLSX before this script runs. Raw files stay outside the repository because
they include names, telephone numbers and exact addresses. This script only
publishes course-level records without direct identifiers and aggregate statistics.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Iterable

import pandas as pd


DATASET_DATE = "2026-01-01"
PIPELINE_VERSION = "1.0.0"
FILTER_VERSION = "piano-filter-v1"
RAW_BASE = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do"


@dataclass(frozen=True)
class SourceSpec:
    source_id: str
    local_name: str
    original_name: str
    download_url: str
    source_page: str
    kind: str
    facility_type: str | None = None


SOURCES: tuple[SourceSpec, ...] = (
    SourceSpec(
        "moe-2025-private-education-survey",
        "moe-2025-private-education-survey.pdf",
        "[교육부 03-13(금) 조간보도자료] 2025년 초중고 사교육비 조사 결과.pdf",
        "https://www.moe.go.kr/boardCnts/fileDown.do?m=020402&s=moe&fileSeq=7562a697bdba006065fa92054b1d634e",
        "https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=105597&lev=0&m=020402",
        "official-statistics-pdf",
    ),
    SourceSpec(
        "seoul-academy-gangnam-1",
        "seoul-academy-gangnam-1.xls",
        "1. 2026. 1. 1.기준 서울 내 학원 현황(강남구1).xls",
        f"{RAW_BASE}?q_fileSn=2233296&q_fileId=23d315d6-8c39-4ca4-bae0-85f669390b6e",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130171732114&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-gangnam-2",
        "seoul-academy-gangnam-2.xls",
        "2. 2026. 1. 1.기준 서울 내 학원 현황(강남구2).xls",
        f"{RAW_BASE}?q_fileSn=2233296&q_fileId=312efd28-9361-44e7-98a6-437f2879114a",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130171732114&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-seocho",
        "seoul-academy-seocho.xls",
        "3. 2026. 1. 1.기준 서울 내 학원 현황(서초구).xls",
        f"{RAW_BASE}?q_fileSn=2233296&q_fileId=f2cd622d-ea3f-4a29-9c4b-92f511c30d80",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130171732114&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-gangdong-songpa",
        "seoul-academy-gangdong-songpa.xls",
        "4. 2026. 1. 1.기준 서울 내 학원 현황(강동송파).xls",
        f"{RAW_BASE}?q_fileSn=2233296&q_fileId=9a11e0df-7aba-4006-9a6c-59482d64aab1",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130171732114&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-seongdong-gwangjin-dongbu",
        "seoul-academy-seongdong-gwangjin-dongbu.xls",
        "5. 2026. 1. 1.기준 서울 내 학원 현황(성동광진, 동부).xls",
        f"{RAW_BASE}?q_fileSn=2233296&q_fileId=384645f1-8d90-4593-8732-87f292c4d542",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130171732114&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-seobu-jungbu",
        "seoul-academy-seobu-jungbu.xls",
        "6. 2026. 1. 1.기준 서울 내 학원 현황(서부, 중부).xls",
        f"{RAW_BASE}?q_fileSn=2233297&q_fileId=c7ad6b5f-6f7b-42f0-b278-c41d19ead5ef",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173322632&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-nambu-dongjak-gwanak",
        "seoul-academy-nambu-dongjak-gwanak.xls",
        "7. 2026. 1. 1.기준 서울 내 학원 현황(남부, 동작관악).xls",
        f"{RAW_BASE}?q_fileSn=2233297&q_fileId=d809d386-fa11-4186-b5fa-54211aedadc1",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173322632&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-seongbuk-gangbuk-bukbu",
        "seoul-academy-seongbuk-gangbuk-bukbu.xls",
        "8. 2026. 1. 1.기준 서울 내 학원 현황(성북강북, 북부).xls",
        f"{RAW_BASE}?q_fileSn=2233297&q_fileId=8410960d-7c2c-4589-88f9-3a5d47d91489",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173322632&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-academy-gangseo-yangcheon",
        "seoul-academy-gangseo-yangcheon.xls",
        "9. 2026. 1. 1.기준 서울 내 학원 현황(강서양천).xls",
        f"{RAW_BASE}?q_fileSn=2233297&q_fileId=bcb175fb-4bf8-4cdc-93d3-97942d4759d6",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173322632&q_bbsSn=1328",
        "official-administrative-xls",
        "academy",
    ),
    SourceSpec(
        "seoul-teaching-center-north",
        "seoul-teaching-center-north.xls",
        "1. 2026. 1. 1.기준 서울 내 교습소 현황(강북권).xls",
        f"{RAW_BASE}?q_fileSn=2233298&q_fileId=2c959409-02aa-40d9-a572-4c95b810ce62",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173553025&q_bbsSn=1328",
        "official-administrative-xls",
        "teaching_center",
    ),
    SourceSpec(
        "seoul-teaching-center-south",
        "seoul-teaching-center-south.xls",
        "2. 2026. 1. 1.기준 서울 내 교습소 현황(강남권).xls",
        f"{RAW_BASE}?q_fileSn=2233298&q_fileId=81c5b1f8-1166-455b-8934-9ba587f52dd6",
        "https://buseo.sen.go.kr/buseo/bu14/user/bbs/BD_selectBbs.do?q_bbsDocNo=20260130173553025&q_bbsSn=1328",
        "official-administrative-xls",
        "teaching_center",
    ),
)


NATIONAL_MUSIC_ROWS = (
    ("전체", 18_876),
    ("초등학교", 13_560),
    ("중학교", 2_415),
    ("고등학교", 2_901),
)


def text(value: Any) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def normalized_column(value: Any) -> str:
    return re.sub(r"\s+", "", text(value))


def number(value: Any) -> float | None:
    parsed = pd.to_numeric(value, errors="coerce")
    if pd.isna(parsed):
        return None
    return float(parsed)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def find_header_row(raw: pd.DataFrame) -> int:
    for index in range(min(12, len(raw))):
        values = {normalized_column(value) for value in raw.iloc[index].tolist()}
        if "교습과목(반)" in values and "교습비" in values:
            return index
    raise ValueError("교습과목(반)·교습비 헤더를 찾지 못했습니다.")


def read_source_workbook(path: Path) -> Iterable[tuple[str, int, dict[str, Any]]]:
    workbook = pd.ExcelFile(path)
    for sheet_name in workbook.sheet_names:
        raw = pd.read_excel(path, sheet_name=sheet_name, header=None)
        header_row = find_header_row(raw)
        frame = pd.read_excel(path, sheet_name=sheet_name, header=header_row)
        frame.columns = [normalized_column(column) for column in frame.columns]
        for row_offset, (_, row) in enumerate(frame.iterrows(), start=header_row + 2):
            yield sheet_name, row_offset, row.to_dict()


def district_from(address: str, sheet_name: str) -> str:
    match = re.search(r"(?:서울특별시|서울시)\s+([가-힣]+구)\b", address)
    if match:
        return match.group(1)
    candidates = re.findall(r"([가-힣]+구)", sheet_name)
    return candidates[0] if len(candidates) == 1 else ""


OTHER_INSTRUMENT = re.compile(
    r"바이올린|비올라|첼로|플루트|클라리넷|색소폰|트럼펫|성악|보컬|드럼|우쿨렐레|통기타|"
    r"일렉기타|베이스|가야금|해금|작곡|미디|리코더|단소|오카리나|하모니카|피리|관악|현악"
)
PIANO_CURRICULUM = re.compile(
    r"바이엘|체르니|하농|소나티네|소나타|건반|반주|코드|재즈|클래식|작품|콩쿠르|콩쿨|"
    r"입시|전공|연주|즉흥|초급|중급|고급|기초|초등|성인|유아|개인레슨|개인수업|일반|"
    r"취미|레슨|마스터|포인트"
)


def piano_match(
    facility_name: str,
    realm: str,
    series: str,
    course: str,
    subject: str,
) -> str | None:
    searchable = {
        "subject": subject,
        "course": course,
        "series": series,
        "realm": realm,
        "facility": facility_name,
    }
    for key in ("subject", "course", "series"):
        if re.search(r"피아노|piano", searchable[key], re.IGNORECASE):
            if "조율" not in searchable[key]:
                return key

    music_context = any("음악" in value or "예능" in value for value in (realm, series, course))
    named_piano = bool(re.search(r"피아노|piano", facility_name, re.IGNORECASE))
    if (
        named_piano
        and music_context
        and PIANO_CURRICULUM.search(subject)
        and not OTHER_INSTRUMENT.search(subject)
    ):
        return "music_named_facility"
    return None


def quantile(values: pd.Series, q: float) -> int | None:
    clean = pd.to_numeric(values, errors="coerce").dropna()
    if clean.empty:
        return None
    return int(round(float(clean.quantile(q))))


def publishable_stats(values: pd.Series) -> tuple[int | None, int | None, int | None, str]:
    clean = pd.to_numeric(values, errors="coerce").dropna()
    n = len(clean)
    if n < 5:
        return None, None, None, "n<5: 금액 통계 비공개"
    note = "표본 적음(n=5~9)" if n < 10 else ""
    return quantile(clean, 0.5), quantile(clean, 0.25), quantile(clean, 0.75), note


def build_seoul_records(source_dir: Path) -> tuple[pd.DataFrame, dict[str, Any]]:
    records: list[dict[str, Any]] = []
    raw_rows = 0
    matched_rows = 0

    for source in SOURCES:
        if not source.facility_type:
            continue
        converted = source_dir / f"{Path(source.local_name).stem}.xlsx"
        if not converted.exists():
            raise FileNotFoundError(f"변환 XLSX가 없습니다: {converted}")

        for sheet_name, source_row, row in read_source_workbook(converted):
            raw_rows += 1
            facility_name = text(row.get("학원명") or row.get("교습소명"))
            address = text(row.get("학원주소") or row.get("교습소주소"))
            realm = text(row.get("분야구분"))
            series = text(row.get("교습계열"))
            course = text(row.get("교습과정"))
            subject = text(row.get("교습과목(반)"))
            if not facility_name or not subject:
                continue

            match_basis = piano_match(facility_name, realm, series, course, subject)
            if not match_basis:
                continue
            matched_rows += 1

            tuition = number(row.get("교습비"))
            total_fee = number(row.get("총교습비"))
            total_minutes = number(row.get("총교습시간(분)"))
            period = text(row.get("교습기간"))
            district = district_from(address, sheet_name)
            facility_key = hashlib.sha256(
                f"ewha-piano-research|{source.facility_type}|{facility_name}|{address}".encode("utf-8")
            ).hexdigest()[:16]
            hourly = None
            if tuition is not None and tuition > 0 and total_minutes is not None and total_minutes > 0:
                hourly = round(tuition / (total_minutes / 60))

            explicit_one_month = bool(re.fullmatch(r"1개월(?:\s*0일)?", period))
            records.append(
                {
                    "source_file_id": source.source_id,
                    "source_sheet": sheet_name,
                    "source_row": source_row,
                    "facility_type": source.facility_type,
                    "facility_id": facility_key,
                    "district": district,
                    "realm": realm,
                    "series": series,
                    "course": course,
                    "subject": subject,
                    "match_basis": match_basis,
                    "registered_period": period,
                    "total_minutes": int(total_minutes) if total_minutes is not None else None,
                    "tuition_fee_krw": int(tuition) if tuition is not None and tuition > 0 else None,
                    "total_fee_krw": int(total_fee) if total_fee is not None and total_fee > 0 else None,
                    "hourly_tuition_krw": hourly,
                    "explicit_one_month": explicit_one_month,
                }
            )

    frame = pd.DataFrame.from_records(records)
    if frame.empty:
        raise ValueError("피아노 후보 행이 0건입니다.")

    dedupe_columns = [
        "facility_type",
        "facility_id",
        "course",
        "subject",
        "registered_period",
        "total_minutes",
        "tuition_fee_krw",
        "total_fee_krw",
    ]
    before_dedup = len(frame)
    frame = frame.drop_duplicates(subset=dedupe_columns, keep="first").copy()
    duplicate_rows = before_dedup - len(frame)

    valid_hourly = pd.to_numeric(frame["hourly_tuition_krw"], errors="coerce").dropna()
    low = float(valid_hourly.quantile(0.01)) if not valid_hourly.empty else None
    high = float(valid_hourly.quantile(0.99)) if not valid_hourly.empty else None
    frame["qc_hourly_extreme"] = frame["hourly_tuition_krw"].map(
        lambda value: bool(
            value is not None
            and not pd.isna(value)
            and low is not None
            and high is not None
            and (float(value) <= low or float(value) >= high)
        )
    )
    for column in ("source_row", "total_minutes", "tuition_fee_krw", "total_fee_krw", "hourly_tuition_krw"):
        frame[column] = pd.array(frame[column], dtype="Int64")

    frame = frame.sort_values(
        ["facility_type", "district", "facility_id", "subject", "tuition_fee_krw"],
        na_position="last",
    ).reset_index(drop=True)

    counts_by_type: dict[str, Any] = {}
    for facility_type, group in frame.groupby("facility_type"):
        counts_by_type[facility_type] = {
            "records": int(len(group)),
            "facilities": int(group["facility_id"].nunique()),
            "validTuitionRecords": int(group["tuition_fee_krw"].notna().sum()),
            "validHourlyRecords": int(group["hourly_tuition_krw"].notna().sum()),
        }

    metadata = {
        "datasetId": "seoul-piano-registered-fees-2026-01-01",
        "name": "2026 서울 피아노 학원·교습소 등록 교습비 파생 데이터",
        "description": (
            "서울특별시교육청이 공개한 2026년 1월 1일 기준 학원·교습소 교습비 원자료에서 "
            "피아노가 명시된 교습상품을 추출하고 직접 식별정보를 제외한 뒤 등록 교습비와 시간당 환산값을 제공한다."
        ),
        "referenceDate": DATASET_DATE,
        "pipelineVersion": PIPELINE_VERSION,
        "filterVersion": FILTER_VERSION,
        "rawRowsScanned": raw_rows,
        "matchedRowsBeforeDeduplication": matched_rows,
        "duplicateRowsRemoved": duplicate_rows,
        "publishedRecords": int(len(frame)),
        "publishedFacilities": int(frame["facility_id"].nunique()),
        "missingDistrictRecords": int((frame["district"] == "").sum()),
        "validTuitionRecords": int(frame["tuition_fee_krw"].notna().sum()),
        "excludedZeroOrMissingTuitionRecords": int(frame["tuition_fee_krw"].isna().sum()),
        "validHourlyRecords": int(frame["hourly_tuition_krw"].notna().sum()),
        "excludedMissingMinutesForHourlyRecords": int(frame["hourly_tuition_krw"].isna().sum()),
        "hourlyExtremeReviewRecords": int(frame["qc_hourly_extreme"].sum()),
        "matchBasis": dict(Counter(frame["match_basis"])),
        "byFacilityType": counts_by_type,
        "privacy": (
            "가공 CSV에는 설립자·교습자 성명, 전화번호, 시설명, 정확한 주소를 포함하지 않는다. "
            "원자료 파일·시트·행 위치와 시설 ID도 공개 CSV에서 제외하며 시설 수 집계에만 내부 사용한다. "
            "다만 공개 원자료와 속성 조합을 통한 재식별 가능성을 완전히 배제할 수는 없다."
        ),
    }
    return frame, metadata


def build_summary(frame: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    groups: list[tuple[str, str, str, pd.DataFrame]] = []
    for facility_type, group in frame.groupby("facility_type"):
        groups.append(("seoul", "서울 전체", facility_type, group))
        for district, district_group in group.groupby("district"):
            if district:
                groups.append(("district", district, facility_type, district_group))

    for group_level, area, facility_type, group in groups:
        tuition = pd.to_numeric(group["tuition_fee_krw"], errors="coerce").dropna()
        hourly = pd.to_numeric(group["hourly_tuition_krw"], errors="coerce").dropna()
        one_month = pd.to_numeric(
            group.loc[group["explicit_one_month"], "tuition_fee_krw"], errors="coerce"
        ).dropna()
        tuition_median, tuition_q1, tuition_q3, tuition_note = publishable_stats(tuition)
        hourly_median, hourly_q1, hourly_q3, hourly_note = publishable_stats(hourly)
        month_median, month_q1, month_q3, month_note = publishable_stats(one_month)
        rows.append(
            {
                "group_level": group_level,
                "area": area,
                "facility_type": facility_type,
                "candidate_records": len(group),
                "facility_count": group["facility_id"].nunique(),
                "valid_tuition_records": len(tuition),
                "tuition_coverage_pct": round(len(tuition) / len(group) * 100, 2),
                "registered_tuition_median_krw": tuition_median,
                "registered_tuition_q1_krw": tuition_q1,
                "registered_tuition_q3_krw": tuition_q3,
                "registered_tuition_note": tuition_note,
                "valid_hourly_records": len(hourly),
                "hourly_tuition_median_krw": hourly_median,
                "hourly_tuition_q1_krw": hourly_q1,
                "hourly_tuition_q3_krw": hourly_q3,
                "hourly_tuition_note": hourly_note,
                "explicit_one_month_records": len(one_month),
                "explicit_one_month_median_krw": month_median,
                "explicit_one_month_q1_krw": month_q1,
                "explicit_one_month_q3_krw": month_q3,
                "explicit_one_month_note": month_note,
            }
        )
    return pd.DataFrame.from_records(rows).sort_values(
        ["group_level", "facility_type", "area"]
    )


def build_source_manifest(raw_dir: Path, retrieved_at: str) -> dict[str, Any]:
    source_rows = []
    for source in SOURCES:
        raw_path = raw_dir / source.local_name
        if not raw_path.exists():
            raise FileNotFoundError(f"원자료가 없습니다: {raw_path}")
        source_rows.append(
            {
                "sourceId": source.source_id,
                "originalName": source.original_name,
                "format": raw_path.suffix.removeprefix(".").upper(),
                "bytes": raw_path.stat().st_size,
                "sha256": sha256_file(raw_path),
                "retrievedAt": retrieved_at,
                "referenceDate": "2025" if source.kind == "official-statistics-pdf" else DATASET_DATE,
                "sourcePage": source.source_page,
                "downloadUrl": source.download_url,
                "kind": source.kind,
            }
        )
    return {
        "schemaVersion": "1.0",
        "retrievedAt": retrieved_at,
        "sources": source_rows,
        "redistributionPolicy": (
            "원자료 파일은 개인정보를 포함할 수 있어 이 사이트가 재배포하지 않고 공식 기관의 직접 다운로드 URL을 제공한다. "
            "가공 CSV는 성명·전화번호·시설명·정확한 주소와 원자료 파일·시트·행 위치 및 시설 ID를 제거한다."
        ),
    }


def build_national_metadata(manifest: dict[str, Any], retrieved_at: str) -> dict[str, Any]:
    pdf_source = next(
        source for source in manifest["sources"] if source["sourceId"] == "moe-2025-private-education-survey"
    )
    if sum(value for scope, value in NATIONAL_MUSIC_ROWS if scope != "전체") != 18_876:
        raise ValueError("학교급별 음악 사교육비 합계가 전체와 일치하지 않습니다.")
    return {
        "datasetId": "korea-music-private-education-spending-2025",
        "name": "2025 대한민국 음악 사교육비 공식 통계 정리",
        "description": (
            "교육부와 국가데이터처의 2025년 초중고 사교육비 조사 중 음악 과목의 사교육비 총액을 "
            "학교급별로 전사한 데이터다. 피아노 단독 통계나 레슨 가격 통계가 아니다."
        ),
        "referenceYear": 2025,
        "publishedAt": "2026-03-12",
        "retrievedAt": retrieved_at,
        "unit": "억원",
        "table": "학교급(학년) 및 특성별 사교육비 총액",
        "printedPages": "22-23",
        "source": pdf_source,
        "rows": [
            {
                "schoolLevel": scope,
                "musicPrivateEducationSpending100mKrw": value,
                "musicPrivateEducationSpendingKrw": value * 100_000_000,
            }
            for scope, value in NATIONAL_MUSIC_ROWS
        ],
        "limitation": (
            "음악 전체 과목의 학생 단위 명목 지출 추정치이며 피아노만 분리하지 않는다. "
            "표본조사이므로 상대표준오차와 반올림에 유의해야 한다."
        ),
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_csv(path: Path, rows: Iterable[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--raw-dir", type=Path, required=True)
    parser.add_argument("--public-output-dir", type=Path, required=True)
    parser.add_argument("--src-output-dir", type=Path, required=True)
    parser.add_argument("--retrieved-at", default="2026-07-23")
    args = parser.parse_args()

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.retrieved_at):
        raise ValueError("--retrieved-at은 YYYY-MM-DD 형식이어야 합니다.")
    try:
        date.fromisoformat(args.retrieved_at)
    except ValueError as error:
        raise ValueError("--retrieved-at은 YYYY-MM-DD 형식이어야 합니다.") from error

    manifest_filename = f"source-manifest-{args.retrieved_at}.json"

    manifest = build_source_manifest(args.raw_dir, args.retrieved_at)
    frame, seoul_metadata = build_seoul_records(args.source_dir)
    summary = build_summary(frame)
    national_metadata = build_national_metadata(manifest, args.retrieved_at)

    seoul_metadata["retrievedAt"] = args.retrieved_at
    seoul_metadata["sourceManifestPath"] = f"/data/research/{manifest_filename}"
    city_rows = json.loads(
        summary[summary["group_level"] == "seoul"].to_json(orient="records", force_ascii=False)
    )
    district_rows = json.loads(
        summary[summary["group_level"] == "district"].to_json(
            orient="records", force_ascii=False
        )
    )
    seoul_metadata["seoulSummary"] = city_rows
    seoul_metadata["districtSummary"] = district_rows

    public_dir = args.public_output_dir
    src_dir = args.src_output_dir
    public_dir.mkdir(parents=True, exist_ok=True)
    src_dir.mkdir(parents=True, exist_ok=True)

    record_columns = [
        "facility_type",
        "district",
        "realm",
        "series",
        "course",
        "subject",
        "match_basis",
        "registered_period",
        "total_minutes",
        "tuition_fee_krw",
        "total_fee_krw",
        "hourly_tuition_krw",
        "explicit_one_month",
        "qc_hourly_extreme",
    ]
    frame.to_csv(
        public_dir / "seoul-piano-fee-records-2026-01-01.csv",
        columns=record_columns,
        index=False,
        encoding="utf-8-sig",
    )
    summary.to_csv(
        public_dir / "seoul-piano-fee-summary-2026-01-01.csv",
        index=False,
        encoding="utf-8-sig",
    )
    write_csv(
        public_dir / "national-music-private-education-2025.csv",
        [
            {
                "reference_year": 2025,
                "school_level": row["schoolLevel"],
                "category": "음악",
                "spending_100m_krw": row["musicPrivateEducationSpending100mKrw"],
                "spending_krw": row["musicPrivateEducationSpendingKrw"],
                "source_table": national_metadata["table"],
                "source_printed_pages": national_metadata["printedPages"],
            }
            for row in national_metadata["rows"]
        ],
        [
            "reference_year",
            "school_level",
            "category",
            "spending_100m_krw",
            "spending_krw",
            "source_table",
            "source_printed_pages",
        ],
    )

    write_json(public_dir / manifest_filename, manifest)
    write_json(public_dir / "seoul-piano-fees-metadata.json", seoul_metadata)
    write_json(public_dir / "national-music-private-education-metadata.json", national_metadata)
    write_json(src_dir / "source-manifest.json", manifest)
    write_json(src_dir / "seoul-piano-fees.json", seoul_metadata)
    write_json(src_dir / "national-music-private-education.json", national_metadata)

    print(
        json.dumps(
            {
                "seoulRecords": len(frame),
                "seoulFacilities": frame["facility_id"].nunique(),
                "summaryRows": len(summary),
                "sourceFiles": len(manifest["sources"]),
                "publicOutput": str(public_dir),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
