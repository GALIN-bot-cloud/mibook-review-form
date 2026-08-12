/**
 * ============================================================
 * 미북 리뷰이벤트 참여자 관리 - Apps Script 백엔드
 * ============================================================
 * 이 코드는 Next.js 프로젝트의 일부가 아니라,
 * Google 스프레드시트의 [확장 프로그램 > Apps Script] 에 붙여넣는 코드입니다.
 *
 * 역할:
 *  - 사용자가 제출한 정보를 월별 시트 탭에 저장
 *  - 첨부한 리뷰 캡처 이미지를 Google Drive 폴더에 저장하고 링크 생성
 *  - 관리자가 "지급완료" 처리하면 해당 행의 상태를 업데이트
 *  - 관리자 페이지에 보여줄 목록/월별 요약 데이터 제공
 */

// ------------------------------------------------------------
// 설정값 (지현님 환경에 맞게 이미 채워둔 값)
// ------------------------------------------------------------
const SPREADSHEET_ID = '191DZdbDbHEesw4fTBgPs1G2dddYrZaUu9uNpa9VIQLc';
const DRIVE_FOLDER_ID = '1nJJj75mGLwpPfZ8dD2ZfBeT6O3mq1rNS';

// 우리 Next.js 서버만 이 스크립트를 호출할 수 있도록 하는 "비밀 값".
// 아무 문자열이나 정해서 넣으시고, 나중에 Next.js 쪽 .env.local 의
// GAS_SHARED_SECRET 에도 똑같은 값을 넣어야 합니다. (둘이 반드시 일치해야 함)
const SHARED_SECRET = '여기에-임의의-긴-비밀문자열을-넣어주세요';

// 시트의 컬럼 순서 (1번째 행 = 헤더)
const HEADERS = ['제출ID', '제출일시', '성함', '이메일', '전화번호', '리뷰캡처링크', '지급상태', '지급처리일시'];

const STATUS_WAITING = '대기';
const STATUS_PAID = '지급완료';

// ------------------------------------------------------------
// 진입점: POST 요청 (제출 / 상태 업데이트)
// ------------------------------------------------------------
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: '인증 실패 (secret 불일치)' });
    }

    if (body.action === 'submit') {
      return jsonResponse(handleSubmit(body));
    }
    if (body.action === 'updateStatus') {
      return jsonResponse(handleUpdateStatus(body));
    }

    return jsonResponse({ ok: false, error: '알 수 없는 action 입니다: ' + body.action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------------
// 진입점: GET 요청 (목록 조회 / 월별 요약)
// ------------------------------------------------------------
function doGet(e) {
  try {
    const params = e.parameter;

    if (params.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: '인증 실패 (secret 불일치)' });
    }

    if (params.action === 'list') {
      return jsonResponse(handleList(params.month));
    }
    if (params.action === 'months') {
      return jsonResponse(handleMonths());
    }

    return jsonResponse({ ok: false, error: '알 수 없는 action 입니다: ' + params.action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------------
// 제출 처리: 새 신청 1건을 해당 월 시트에 추가
// ------------------------------------------------------------
function handleSubmit(body) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const monthKey = getCurrentMonthKey();
  const sheet = getOrCreateMonthSheet(ss, monthKey);

  const submissionId = generateSubmissionId();
  const imageUrl = saveImageToDrive(body.reviewImageBase64, body.reviewImageMimeType, submissionId);
  const now = new Date();

  sheet.appendRow([
    submissionId,
    Utilities.formatDate(now, 'GMT+9', 'yyyy-MM-dd HH:mm:ss'),
    body.name,
    body.email,
    body.phone,
    imageUrl,
    STATUS_WAITING,
    '',
  ]);

  return { ok: true, submissionId: submissionId, month: monthKey };
}

// ------------------------------------------------------------
// 관리자: 지급 상태 업데이트
// ------------------------------------------------------------
function handleUpdateStatus(body) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(body.month);
  if (!sheet) {
    return { ok: false, error: '해당 월 시트를 찾을 수 없습니다: ' + body.month };
  }

  const idColumnValues = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  let targetRow = -1;
  for (let i = 0; i < idColumnValues.length; i++) {
    if (idColumnValues[i][0] === body.submissionId) {
      targetRow = i + 2; // 헤더가 1행이므로 실제 행 번호는 +2
      break;
    }
  }

  if (targetRow === -1) {
    return { ok: false, error: '해당 제출ID를 찾을 수 없습니다: ' + body.submissionId };
  }

  sheet.getRange(targetRow, 7).setValue(body.status); // G열: 지급상태
  sheet.getRange(targetRow, 8).setValue(
    body.status === STATUS_PAID ? Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss') : ''
  ); // H열: 지급처리일시

  return { ok: true };
}

// ------------------------------------------------------------
// 관리자: 특정 월의 전체 목록 조회
// ------------------------------------------------------------
function handleList(monthKey) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(monthKey);
  if (!sheet) {
    return { ok: true, records: [] };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, records: [] };
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const records = rows.map(function (row) {
    return {
      submissionId: row[0],
      submittedAt: row[1],
      name: row[2],
      email: row[3],
      phone: row[4],
      reviewImageUrl: row[5],
      status: row[6],
      paidAt: row[7] || null,
    };
  });

  return { ok: true, records: records };
}

// ------------------------------------------------------------
// 관리자: 존재하는 월별 시트 목록 + 각 월 요약(전체수/지급완료수)
// ------------------------------------------------------------
function handleMonths() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();
  const monthPattern = /^\d{4}-\d{2}$/;

  const months = sheets
    .filter(function (s) {
      return monthPattern.test(s.getName());
    })
    .map(function (s) {
      const lastRow = s.getLastRow();
      let total = 0;
      let paid = 0;
      if (lastRow >= 2) {
        const statusValues = s.getRange(2, 7, lastRow - 1, 1).getValues();
        total = statusValues.length;
        paid = statusValues.filter(function (r) {
          return r[0] === STATUS_PAID;
        }).length;
      }
      return { month: s.getName(), totalCount: total, paidCount: paid };
    })
    .sort(function (a, b) {
      return b.month.localeCompare(a.month); // 최신 월이 먼저 오도록
    });

  return { ok: true, months: months };
}

// ------------------------------------------------------------
// 유틸리티 함수들
// ------------------------------------------------------------

function getCurrentMonthKey() {
  return Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM');
}

function getOrCreateMonthSheet(ss, monthKey) {
  let sheet = ss.getSheetByName(monthKey);
  if (!sheet) {
    sheet = ss.insertSheet(monthKey);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function generateSubmissionId() {
  const ts = new Date().getTime();
  const rand = Math.floor(Math.random() * 1000000);
  return 'S' + ts + '-' + rand;
}

// base64 이미지를 Drive 폴더에 저장하고, 브라우저에서 바로 볼 수 있는 링크를 반환
function saveImageToDrive(base64Data, mimeType, submissionId) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = submissionId + '.' + extension;

  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const file = folder.createFile(blob);

  // 관리자 페이지에서 <img> 태그로 바로 표시할 수 있도록 "링크가 있으면 볼 수 있음"으로 설정
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
