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
DATASET_VERSION = "1.0.0"
DATASET_PUBLISHED_AT = "2026-07-23"
PIPELINE_VERSION = "1.0.0"
FILTER_VERSION = "piano-filter-v1"
RAW_BASE = "https://buseo.sen.go.kr/component/file/ND_fileDownload.do"
SITE_ORIGIN = "https://ewha-piano.higgsfield.app"


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


def field_definition(
    name: str,
    description: str,
    data_type: str,
    unit: str | None,
    nullable: bool,
    derivation: str,
    public_restriction: str,
) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "dataType": data_type,
        "unit": unit,
        "nullable": nullable,
        "derivation": derivation,
        "publicRestriction": public_restriction,
    }


NATIONAL_FIELDS = [
    field_definition(
        "reference_year",
        "사교육비 조사 기준연도",
        "integer",
        "year",
        False,
        "공식 조사 기준연도 2025를 기록한다.",
        "없음",
    ),
    field_definition(
        "school_level",
        "전체 또는 초등학교·중학교·고등학교 학교급",
        "string",
        None,
        False,
        "공식 통계표의 학교급 행을 전사한다.",
        "없음",
    ),
    field_definition(
        "category",
        "사교육 과목 분류",
        "string",
        None,
        False,
        "공식 통계표에서 음악 항목만 선택해 '음악'으로 기록한다.",
        "피아노 단독 분류가 아니므로 피아노 지출액으로 해석하지 않는다.",
    ),
    field_definition(
        "spending_100m_krw",
        "음악 사교육비 총액의 공식 표기값",
        "integer",
        "억원",
        False,
        "공식 통계표의 음악 사교육비 총액을 전사한다.",
        "표본조사 추정치이며 반올림과 상대표준오차에 유의한다.",
    ),
    field_definition(
        "spending_krw",
        "음악 사교육비 총액의 원 단위 환산값",
        "integer",
        "KRW",
        False,
        "spending_100m_krw × 100,000,000",
        "환산값이며 공식 통계표의 별도 원 단위 발표값이 아니다.",
    ),
    field_definition(
        "source_table",
        "값을 전사한 공식 통계표 이름",
        "string",
        None,
        False,
        "공식 PDF 표 제목을 기록한다.",
        "없음",
    ),
    field_definition(
        "source_printed_pages",
        "공식 PDF 인쇄면 기준 표 위치",
        "string",
        "page",
        False,
        "공식 PDF의 인쇄면 22-23쪽을 기록한다.",
        "행 단위 원자료 위치가 아니라 공개 문서의 표 위치만 제공한다.",
    ),
]


SEOUL_RECORD_FIELDS = [
    field_definition(
        "facility_type",
        "학원 또는 교습소 구분",
        "string",
        None,
        False,
        "공식 공개자료의 파일 유형을 academy 또는 teaching_center로 표준화한다.",
        "시설명과 내부 시설 식별자는 공개하지 않는다.",
    ),
    field_definition(
        "district",
        "서울특별시 자치구",
        "string",
        None,
        True,
        "공식 공개자료에서 자치구 수준만 추출하며 확인할 수 없으면 빈 값으로 둔다.",
        "정확한 주소는 공개하지 않는다.",
    ),
    field_definition(
        "realm",
        "공식 자료의 분야 구분",
        "string",
        None,
        True,
        "공식 공개자료의 분야 구분을 공백 정규화 후 기록한다.",
        "직접 식별정보는 포함하지 않는다.",
    ),
    field_definition(
        "series",
        "공식 자료의 교습 계열",
        "string",
        None,
        True,
        "공식 공개자료의 교습 계열을 공백 정규화 후 기록한다.",
        "직접 식별정보는 포함하지 않는다.",
    ),
    field_definition(
        "course",
        "공식 자료의 교습 과정",
        "string",
        None,
        True,
        "공식 공개자료의 교습 과정을 공백 정규화 후 기록한다.",
        "직접 식별정보는 포함하지 않는다.",
    ),
    field_definition(
        "subject",
        "피아노 후보로 분류된 교습 과목 또는 반",
        "string",
        None,
        False,
        "공식 공개자료의 교습 과목(반)을 공백 정규화 후 기록한다.",
        "개인 또는 시설을 식별하는 필드는 함께 공개하지 않는다.",
    ),
    field_definition(
        "match_basis",
        "피아노 후보 포함 근거",
        "string",
        None,
        False,
        "과목·과정·계열의 피아노 명시 또는 음악 맥락과 피아노 시설명·교육과정 규칙을 적용한다.",
        "필터 규칙에 따른 후보 분류이며 모든 피아노 교습상품을 완전하게 포괄하지 않는다.",
    ),
    field_definition(
        "registered_period",
        "공식 자료에 등록된 교습 기간 표현",
        "string",
        None,
        True,
        "공식 공개자료의 교습 기간을 공백 정규화 후 기록한다.",
        "표현 형식이 일정하지 않아 임의로 월 단위 환산하지 않는다.",
    ),
    field_definition(
        "total_minutes",
        "등록 교습시간 합계",
        "integer",
        "minute",
        True,
        "공식 공개자료의 총교습시간(분)을 숫자로 변환한다.",
        "누락 또는 숫자 변환 불가 값은 빈 값으로 공개한다.",
    ),
    field_definition(
        "tuition_fee_krw",
        "등록 교습비",
        "integer",
        "KRW",
        True,
        "공식 공개자료의 교습비에서 0보다 큰 숫자만 기록한다.",
        "실제 결제액이나 시장 평균이 아니며 누락·0 값은 빈 값으로 공개한다.",
    ),
    field_definition(
        "total_fee_krw",
        "등록 총교습비",
        "integer",
        "KRW",
        True,
        "공식 공개자료의 총교습비에서 0보다 큰 숫자만 기록한다.",
        "실제 결제액이 아니며 누락·0 값은 빈 값으로 공개한다.",
    ),
    field_definition(
        "hourly_tuition_krw",
        "등록 교습비의 시간당 환산값",
        "integer",
        "KRW/hour",
        True,
        "tuition_fee_krw ÷ (total_minutes ÷ 60), 원 단위 반올림",
        "교습비와 시간이 모두 유효할 때만 제공하며 실제 시간당 결제액을 뜻하지 않는다.",
    ),
    field_definition(
        "explicit_one_month",
        "교습 기간이 명시적으로 1개월인지 여부",
        "boolean",
        None,
        False,
        "registered_period가 '1개월' 또는 '1개월 0일'과 정확히 일치하면 true다.",
        "다른 기간 표현을 1개월로 추정하지 않는다.",
    ),
    field_definition(
        "qc_hourly_extreme",
        "시간당 환산값의 검토 필요 표시",
        "boolean",
        None,
        False,
        "유효 시간당 환산값의 하위 1% 이하 또는 상위 1% 이상이면 true다.",
        "오류 판정이 아니라 극단값 검토 표식이다.",
    ),
]


def summary_field(
    name: str,
    description: str,
    data_type: str,
    unit: str | None,
    nullable: bool,
    derivation: str,
    public_restriction: str = "없음",
) -> dict[str, Any]:
    return field_definition(
        name,
        description,
        data_type,
        unit,
        nullable,
        derivation,
        public_restriction,
    )


SEOUL_SUMMARY_FIELDS = [
    summary_field(
        "group_level",
        "집계 수준",
        "string",
        None,
        False,
        "서울 전체는 seoul, 자치구별 집계는 district로 기록한다.",
    ),
    summary_field(
        "area",
        "집계 지역",
        "string",
        None,
        False,
        "서울 전체 또는 자치구 이름을 기록한다.",
        "자치구보다 세밀한 위치는 공개하지 않는다.",
    ),
    summary_field(
        "facility_type",
        "학원 또는 교습소 구분",
        "string",
        None,
        False,
        "academy 또는 teaching_center로 구분한다.",
    ),
    summary_field(
        "candidate_records",
        "집계에 포함된 피아노 후보 교습상품 수",
        "integer",
        "record",
        False,
        "그룹별 공개 후보 행 수를 센다.",
    ),
    summary_field(
        "facility_count",
        "집계에 포함된 고유 시설 수",
        "integer",
        "facility",
        False,
        "비공개 내부 시설 식별자의 고유 개수를 센다.",
        "내부 시설 식별자는 공개하지 않고 집계값만 제공한다.",
    ),
    summary_field(
        "valid_tuition_records",
        "유효 등록 교습비가 있는 행 수",
        "integer",
        "record",
        False,
        "tuition_fee_krw가 있는 행을 센다.",
    ),
    summary_field(
        "tuition_coverage_pct",
        "등록 교습비 유효값 비율",
        "number",
        "percent",
        False,
        "valid_tuition_records ÷ candidate_records × 100, 소수 둘째 자리 반올림",
    ),
    summary_field(
        "registered_tuition_median_krw",
        "등록 교습비 중앙값",
        "integer",
        "KRW",
        True,
        "유효 등록 교습비의 50백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "registered_tuition_q1_krw",
        "등록 교습비 제1사분위수",
        "integer",
        "KRW",
        True,
        "유효 등록 교습비의 25백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "registered_tuition_q3_krw",
        "등록 교습비 제3사분위수",
        "integer",
        "KRW",
        True,
        "유효 등록 교습비의 75백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "registered_tuition_note",
        "등록 교습비 통계 공개 상태",
        "string",
        None,
        True,
        "n<5 비공개 또는 n=5~9 표본 적음 안내를 기록하고 그 밖에는 빈 값으로 둔다.",
    ),
    summary_field(
        "valid_hourly_records",
        "유효 시간당 환산값이 있는 행 수",
        "integer",
        "record",
        False,
        "hourly_tuition_krw가 있는 행을 센다.",
    ),
    summary_field(
        "hourly_tuition_median_krw",
        "시간당 환산 등록 교습비 중앙값",
        "integer",
        "KRW/hour",
        True,
        "유효 시간당 환산값의 50백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "hourly_tuition_q1_krw",
        "시간당 환산 등록 교습비 제1사분위수",
        "integer",
        "KRW/hour",
        True,
        "유효 시간당 환산값의 25백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "hourly_tuition_q3_krw",
        "시간당 환산 등록 교습비 제3사분위수",
        "integer",
        "KRW/hour",
        True,
        "유효 시간당 환산값의 75백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "hourly_tuition_note",
        "시간당 환산 통계 공개 상태",
        "string",
        None,
        True,
        "n<5 비공개 또는 n=5~9 표본 적음 안내를 기록하고 그 밖에는 빈 값으로 둔다.",
    ),
    summary_field(
        "explicit_one_month_records",
        "명시적 1개월 등록 교습비 행 수",
        "integer",
        "record",
        False,
        "explicit_one_month가 true이고 교습비가 유효한 행을 센다.",
    ),
    summary_field(
        "explicit_one_month_median_krw",
        "명시적 1개월 등록 교습비 중앙값",
        "integer",
        "KRW",
        True,
        "명시적 1개월 교습비의 50백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "explicit_one_month_q1_krw",
        "명시적 1개월 등록 교습비 제1사분위수",
        "integer",
        "KRW",
        True,
        "명시적 1개월 교습비의 25백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "explicit_one_month_q3_krw",
        "명시적 1개월 등록 교습비 제3사분위수",
        "integer",
        "KRW",
        True,
        "명시적 1개월 교습비의 75백분위수를 원 단위 반올림한다.",
        "유효 표본이 5건 미만이면 공개하지 않는다.",
    ),
    summary_field(
        "explicit_one_month_note",
        "명시적 1개월 통계 공개 상태",
        "string",
        None,
        True,
        "n<5 비공개 또는 n=5~9 표본 적음 안내를 기록하고 그 밖에는 빈 값으로 둔다.",
    ),
]


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

    dataset_name = "2026 서울 피아노 학원·교습소 등록 교습비 파생 데이터"
    metadata = {
        "datasetId": "seoul-piano-registered-fees-2026-01-01",
        "datasetVersion": DATASET_VERSION,
        "name": dataset_name,
        "description": (
            "서울특별시교육청이 공개한 2026년 1월 1일 기준 학원·교습소 교습비 원자료에서 "
            "피아노가 명시된 교습상품을 추출하고 직접 식별정보를 제외한 뒤 등록 교습비와 시간당 환산값을 제공한다."
        ),
        "referenceDate": DATASET_DATE,
        "datasetPublishedAt": DATASET_PUBLISHED_AT,
        "publisher": derived_publisher(),
        "derivedReuse": derived_reuse(
            dataset_name,
            "/research/2026-seoul-piano-academy-fees",
        ),
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


def derived_publisher() -> dict[str, str]:
    return {
        "name": "이화 피아노 과외",
        "url": SITE_ORIGIN,
        "role": "파생 데이터셋 발행 및 유지관리",
    }


def source_license(provider: str, terms_urls: Iterable[str]) -> dict[str, Any]:
    return {
        "scope": "공식 원자료",
        "provider": provider,
        "status": "공식 제공기관의 게시 페이지 및 이용조건 적용",
        "termsUrls": sorted(set(terms_urls)),
        "notice": (
            "원자료의 저작권과 이용조건은 공식 제공기관의 최신 안내를 따른다. "
            "이 메타데이터는 원자료에 대한 추가 권리나 별도 라이선스를 부여하지 않는다."
        ),
    }


def derived_reuse(dataset_name: str, canonical_path: str) -> dict[str, str]:
    return {
        "scope": "이 사이트가 만든 가공 CSV와 설명",
        "attribution": (
            f"이화 피아노 과외, 「{dataset_name}」 v{DATASET_VERSION}, "
            f"{SITE_ORIGIN}{canonical_path}, 접속일 표기"
        ),
        "notice": (
            "인용·재사용 시 데이터셋명, 버전, URL, 접속일과 공식 원자료 출처 및 가공 사실을 함께 표시한다. "
            "재사용 가능 범위는 원자료 제공기관의 이용조건을 먼저 확인해야 하며, 이 안내는 그 범위를 확대하지 않는다."
        ),
        "privacyCondition": "공개 가공본을 개인 또는 시설의 직접 식별정보와 결합해 재식별을 시도하지 않는다.",
    }


def build_national_metadata(manifest: dict[str, Any], retrieved_at: str) -> dict[str, Any]:
    pdf_source = next(
        source for source in manifest["sources"] if source["sourceId"] == "moe-2025-private-education-survey"
    )
    if sum(value for scope, value in NATIONAL_MUSIC_ROWS if scope != "전체") != 18_876:
        raise ValueError("학교급별 음악 사교육비 합계가 전체와 일치하지 않습니다.")
    dataset_name = "2025 대한민국 음악 사교육비 공식 통계 정리"
    source_published_at = "2026-03-12"
    return {
        "datasetId": "korea-music-private-education-spending-2025",
        "datasetVersion": DATASET_VERSION,
        "name": dataset_name,
        "description": (
            "교육부와 국가데이터처의 2025년 초중고 사교육비 조사 중 음악 과목의 사교육비 총액을 "
            "학교급별로 전사한 데이터다. 피아노 단독 통계나 레슨 가격 통계가 아니다."
        ),
        "referenceYear": 2025,
        "sourcePublishedAt": source_published_at,
        "publishedAt": source_published_at,
        "datasetPublishedAt": DATASET_PUBLISHED_AT,
        "modifiedAt": retrieved_at,
        "retrievedAt": retrieved_at,
        "publisher": derived_publisher(),
        "officialSource": {
            "publisher": ["교육부", "국가데이터처"],
            "title": "2025년 초중고 사교육비 조사 결과",
            "sourcePublishedAt": source_published_at,
            "sourcePage": pdf_source["sourcePage"],
            "downloadUrl": pdf_source["downloadUrl"],
        },
        "sourceLicense": source_license(
            "교육부·국가데이터처",
            [pdf_source["sourcePage"]],
        ),
        "derivedReuse": derived_reuse(
            dataset_name,
            "/research/2025-music-private-education-statistics",
        ),
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


def csv_distribution(
    path: Path,
    title: str,
    row_count: int,
    field_count: int,
) -> dict[str, Any]:
    return {
        "title": title,
        "contentUrl": f"/data/research/{path.name}",
        "encodingFormat": "text/csv; charset=utf-8",
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "rowCount": row_count,
        "fieldCount": field_count,
    }


def data_dictionary(
    dataset_id: str,
    tables: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        "schemaVersion": "1.0.0",
        "datasetId": dataset_id,
        "datasetVersion": DATASET_VERSION,
        "publishedAt": DATASET_PUBLISHED_AT,
        "tables": tables,
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_csv(path: Path, rows: Iterable[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
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
    seoul_metadata["modifiedAt"] = args.retrieved_at
    seoul_metadata["sourceManifestPath"] = f"/data/research/{manifest_filename}"
    seoul_sources = [
        source for source in manifest["sources"] if source["kind"] == "official-administrative-xls"
    ]
    seoul_source_pages = sorted({source["sourcePage"] for source in seoul_sources})
    seoul_metadata["officialSource"] = {
        "publisher": "서울특별시교육청",
        "title": "2026년 1월 1일 기준 서울 내 학원·교습소 현황",
        "referenceDate": DATASET_DATE,
        "sourcePages": seoul_source_pages,
        "sourceManifestPath": f"/data/research/{manifest_filename}",
    }
    seoul_metadata["sourceLicense"] = source_license(
        "서울특별시교육청",
        seoul_source_pages,
    )
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
    national_csv = public_dir / "national-music-private-education-2025.csv"
    seoul_records_csv = public_dir / "seoul-piano-fee-records-2026-01-01.csv"
    seoul_summary_csv = public_dir / "seoul-piano-fee-summary-2026-01-01.csv"
    frame.to_csv(
        seoul_records_csv,
        columns=record_columns,
        index=False,
        encoding="utf-8-sig",
        lineterminator="\n",
    )
    summary.to_csv(
        seoul_summary_csv,
        index=False,
        encoding="utf-8-sig",
        lineterminator="\n",
    )
    write_csv(
        national_csv,
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

    national_metadata["dataDictionaryPath"] = (
        "/data/research/national-music-private-education-schema.json"
    )
    national_metadata["distributions"] = [
        csv_distribution(
            national_csv,
            "2025 대한민국 음악 사교육비 학교급별 CSV",
            len(national_metadata["rows"]),
            len(NATIONAL_FIELDS),
        )
    ]
    seoul_metadata["dataDictionaryPath"] = "/data/research/seoul-piano-fees-schema.json"
    seoul_metadata["distributions"] = [
        csv_distribution(
            seoul_records_csv,
            "2026 서울 피아노 등록 교습비 공개 레코드 CSV",
            len(frame),
            len(SEOUL_RECORD_FIELDS),
        ),
        csv_distribution(
            seoul_summary_csv,
            "2026 서울 피아노 등록 교습비 지역별 요약 CSV",
            len(summary),
            len(SEOUL_SUMMARY_FIELDS),
        ),
    ]
    national_schema = data_dictionary(
        national_metadata["datasetId"],
        [
            {
                "name": "national_music_private_education",
                "description": "2025년 음악 사교육비 총액의 학교급별 공식 통계 전사·환산표",
                "csvPath": f"/data/research/{national_csv.name}",
                "fieldCount": len(NATIONAL_FIELDS),
                "fields": NATIONAL_FIELDS,
            }
        ],
    )
    seoul_schema = data_dictionary(
        seoul_metadata["datasetId"],
        [
            {
                "name": "piano_fee_records",
                "description": "직접 식별정보와 원자료 위치를 제외한 피아노 후보 교습상품 단위 가공표",
                "csvPath": f"/data/research/{seoul_records_csv.name}",
                "fieldCount": len(SEOUL_RECORD_FIELDS),
                "fields": SEOUL_RECORD_FIELDS,
            },
            {
                "name": "piano_fee_summary",
                "description": "서울 전체 및 자치구별 학원·교습소 등록 교습비 요약표",
                "csvPath": f"/data/research/{seoul_summary_csv.name}",
                "fieldCount": len(SEOUL_SUMMARY_FIELDS),
                "fields": SEOUL_SUMMARY_FIELDS,
            },
        ],
    )

    write_json(public_dir / manifest_filename, manifest)
    write_json(public_dir / "national-music-private-education-schema.json", national_schema)
    write_json(public_dir / "seoul-piano-fees-schema.json", seoul_schema)
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
