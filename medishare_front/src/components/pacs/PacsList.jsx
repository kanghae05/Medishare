import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";


// =========================================================
// PACS Study 썸네일
// =========================================================
function StudyThumbnail({ orthancStudyId }) {

  const [failed, setFailed] = useState(false);

  if (!orthancStudyId || failed) {

    return (
      <div className="pacs-thumbnail-empty">
        <span>NO IMAGE</span>
      </div>
    );
  }


  const thumbnailUrl =
    `${api.defaults.baseURL}/pacs/thumbnail/${
      encodeURIComponent(orthancStudyId)
    }`;


  return (
    <div className="pacs-thumbnail-box">

      <img
        src={thumbnailUrl}
        alt="PACS Study Thumbnail"
        className="pacs-thumbnail"
        onError={() => {
          setFailed(true);
        }}
      />

    </div>
  );
}


function PacsList() {

  const navigate = useNavigate();


  // =========================================================
  // 상태값
  // =========================================================

  const [studyList, setStudyList] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [syncing, setSyncing] =
    useState(false);

  const [searchKeyword, setSearchKeyword] =
    useState("");


  // =========================================================
  // 처음 화면 진입 시 목록 조회
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    const loadStudyList = async () => {

      try {

        const response =
          await api.get(
            "/pacs/list.do"
          );


        if (cancelled) {
          return;
        }


        if (Array.isArray(response.data)) {

          setStudyList(
            response.data
          );

        } else {

          setStudyList([]);
        }


      } catch (error) {

        if (cancelled) {
          return;
        }


        console.error(
          "PACS 목록 조회 오류 : ",
          error
        );


        setStudyList([]);


        setErrorMessage(
          "PACS Study 목록을 불러오지 못했습니다."
        );


      } finally {

        if (!cancelled) {

          setLoading(false);
        }
      }
    };


    loadStudyList();


    return () => {

      cancelled = true;
    };

  }, []);


  // =========================================================
  // Study 목록 새로고침
  // =========================================================

  const getStudyList = async () => {

    setLoading(true);
    setErrorMessage("");


    try {

      const response =
        await api.get(
          "/pacs/list.do"
        );


      if (Array.isArray(response.data)) {

        setStudyList(
          response.data
        );

      } else {

        setStudyList([]);
      }


    } catch (error) {

      console.error(
        "PACS 목록 조회 오류 : ",
        error
      );


      setStudyList([]);


      setErrorMessage(
        "PACS Study 목록을 불러오지 못했습니다."
      );


    } finally {

      setLoading(false);
    }
  };


  // =========================================================
  // DICOM 파일 선택
  // =========================================================

  const handleFileChange = (e) => {

    const file =
      e.target.files?.[0];


    setSelectedFile(
      file || null
    );
  };


  // =========================================================
  // DICOM → Orthanc 업로드
  // =========================================================

  const uploadDicom = async () => {

    if (!selectedFile) {

      alert(
        "업로드할 DICOM 파일을 선택해주세요."
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      "file",
      selectedFile
    );


    setUploading(true);


    try {

      const response =
        await api.post(
          "/pacs/upload.do",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );


      console.log(
        "DICOM 업로드 결과 : ",
        response.data
      );


      if (
        response.data?.Status === "Success"
        || response.data?.Status === "AlreadyStored"
      ) {

        alert(
          "DICOM 파일이 Orthanc에 업로드되었습니다."
        );

      } else {

        alert(
          "업로드 응답을 확인해주세요."
        );
      }


      setSelectedFile(null);


      const input =
        document.getElementById(
          "dicomFile"
        );


      if (input) {

        input.value = "";
      }


    } catch (error) {

      console.error(
        "DICOM 업로드 오류 : ",
        error
      );


      alert(
        "DICOM 업로드에 실패했습니다."
      );


    } finally {

      setUploading(false);
    }
  };


  // =========================================================
  // Orthanc → DB 동기화
  // =========================================================

  const syncStudyList = async () => {

    const result =
      window.confirm(
        "Orthanc의 PACS 데이터를 DB와 동기화하시겠습니까?"
      );


    if (!result) {
      return;
    }


    setSyncing(true);


    try {

      const response =
        await api.post(
          "/pacs/sync.do"
        );


      console.log(
        "PACS 동기화 결과 : ",
        response.data
      );


      alert(
        `동기화 완료\n`
        + `전체 : ${response.data.totalCount ?? 0}\n`
        + `저장/갱신 : ${response.data.savedCount ?? 0}\n`
        + `건너뜀 : ${response.data.skippedCount ?? 0}\n`
        + `실패 : ${response.data.failedCount ?? 0}`
      );


      await getStudyList();


    } catch (error) {

      console.error(
        "PACS 동기화 오류 : ",
        error
      );


      alert(
        "PACS 동기화 중 오류가 발생했습니다."
      );


    } finally {

      setSyncing(false);
    }
  };


  // =========================================================
  // 상세 페이지 이동
  // =========================================================

  const openDetail = (study) => {

    if (!study.orthancStudyId) {

      alert(
        "Orthanc Study ID가 없습니다."
      );

      return;
    }


    navigate(
      `/pacs/view/${
        encodeURIComponent(
          study.orthancStudyId
        )
      }`
    );
  };


  // =========================================================
  // OHIF Viewer
  // =========================================================

  const openViewer = (study) => {

    if (!study.studyInstanceUID) {

      alert(
        "StudyInstanceUID가 없습니다."
      );

      return;
    }


    const viewerUrl =
      `http://localhost:3000/viewer?StudyInstanceUIDs=${
        encodeURIComponent(
          study.studyInstanceUID
        )
      }`;


    window.open(
      viewerUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };


  // =========================================================
  // 표시용 함수
  // =========================================================

  const displayValue = (value) => {

    if (
      value === null
      || value === undefined
      || value === ""
    ) {

      return "-";
    }


    return value;
  };


  const formatDicomDate = (date) => {

    if (!date) {
      return "-";
    }


    // 이미 2000-01-01 형식
    if (
      typeof date === "string"
      && date.includes("-")
    ) {

      return date;
    }


    if (
      typeof date !== "string"
      || date.length !== 8
    ) {

      return date;
    }


    return (
      `${date.substring(0, 4)}-`
      + `${date.substring(4, 6)}-`
      + `${date.substring(6, 8)}`
    );
  };


  const formatDicomTime = (time) => {

    if (!time) {
      return "-";
    }


    // 이미 11:00:00 형식
    if (
      typeof time === "string"
      && time.includes(":")
    ) {

      return time;
    }


    const value =
      String(time)
        .split(".")[0];


    if (value.length < 4) {

      return value;
    }


    const hour =
      value.substring(
        0,
        2
      );


    const minute =
      value.substring(
        2,
        4
      );


    const second =
      value.length >= 6
        ? value.substring(
            4,
            6
          )
        : "";


    return second
      ? `${hour}:${minute}:${second}`
      : `${hour}:${minute}`;
  };


  // =========================================================
  // 검색
  // =========================================================

  const filteredStudyList =
    useMemo(() => {

      const keyword =
        searchKeyword
          .trim()
          .toLowerCase();


      if (!keyword) {

        return studyList;
      }


      return studyList.filter(
        (study) => {

          const target = [
            study.patientId,
            study.patientName,
            study.studyDate,
            study.studyDescription,
            study.studyInstanceUID
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


          return target.includes(
            keyword
          );
        }
      );

    }, [
      studyList,
      searchKeyword
    ]);


  // =========================================================
  // 통계
  // =========================================================

  const stableCount =
    studyList.filter(
      (study) =>
        study.stable === true
    ).length;


  const updatingCount =
    studyList.length
    - stableCount;


  // =========================================================
  // 화면
  // =========================================================

  return (

    <div className="pacs-page">


      {/* =====================================================
          페이지 소개
      ====================================================== */}

      <div className="pacs-hero">

        <div>

          <div className="pacs-eyebrow">
            MEDICAL IMAGE ARCHIVE
          </div>


          <h1 className="pacs-title">
            PACS Study
          </h1>


          <p className="pacs-subtitle">
            DICOM 영상 업로드, 메타데이터 조회 및
            OHIF Viewer 연동
          </p>

        </div>


        <div className="pacs-server-status">

          <span className="status-dot" />

          Orthanc Connected

        </div>

      </div>


      {/* =====================================================
          통계
      ====================================================== */}

      <div className="pacs-summary-grid">

        <div className="pacs-summary-card">

          <span className="summary-label">
            TOTAL STUDIES
          </span>

          <strong className="summary-value">
            {studyList.length}
          </strong>

          <span className="summary-desc">
            등록된 전체 검사
          </span>

        </div>


        <div className="pacs-summary-card">

          <span className="summary-label">
            STABLE
          </span>

          <strong className="summary-value">
            {stableCount}
          </strong>

          <span className="summary-desc">
            저장 완료
          </span>

        </div>


        <div className="pacs-summary-card">

          <span className="summary-label">
            UPDATING
          </span>

          <strong className="summary-value">
            {updatingCount}
          </strong>

          <span className="summary-desc">
            처리 중
          </span>

        </div>

      </div>


      {/* =====================================================
          DICOM 업로드
      ====================================================== */}

      <div className="pacs-panel">

        <div className="pacs-panel-header">

          <div>

            <span className="panel-kicker">
              DICOM IMPORT
            </span>

            <h5>
              DICOM 파일 업로드
            </h5>

          </div>

        </div>


        <div className="pacs-upload-area">

          <div className="pacs-upload-file">

            <input
              id="dicomFile"
              type="file"
              className="form-control"
              accept=".dcm,application/dicom"
              onChange={
                handleFileChange
              }
            />

          </div>


          <button
            type="button"
            className="pacs-primary-button"
            disabled={
              uploading
              || !selectedFile
            }
            onClick={
              uploadDicom
            }
          >

            {
              uploading
                ? "업로드 중..."
                : "Orthanc 업로드"
            }

          </button>

        </div>


        {
          selectedFile
          && (

            <div className="selected-file">

              선택 파일

              <strong>
                {selectedFile.name}
              </strong>

            </div>
          )
        }

      </div>


      {/* =====================================================
          Study 목록
      ====================================================== */}

      <div className="pacs-panel">

        <div className="study-toolbar">

          <div>

            <span className="panel-kicker">
              STUDY WORKLIST
            </span>

            <h5 className="mb-1">
              PACS Study 목록
            </h5>

            <span className="study-count">
              검색 결과 {filteredStudyList.length}건
            </span>

          </div>


          <div className="study-toolbar-actions">

            <input
              type="text"
              className="pacs-search"
              placeholder="환자 ID, 이름, 검사일 검색"
              value={
                searchKeyword
              }
              onChange={
                (e) =>
                  setSearchKeyword(
                    e.target.value
                  )
              }
            />


            <button
              type="button"
              className="pacs-secondary-button"
              onClick={
                getStudyList
              }
              disabled={
                loading
              }
            >
              새로고침
            </button>


            <button
              type="button"
              className="pacs-outline-button"
              onClick={
                syncStudyList
              }
              disabled={
                syncing
              }
            >

              {
                syncing
                  ? "동기화 중..."
                  : "Orthanc 동기화"
              }

            </button>

          </div>

        </div>


        {
          errorMessage
          && (

            <div className="alert alert-warning m-3">
              {errorMessage}
            </div>
          )
        }


        <div className="table-responsive">

          <table className="pacs-table">

            <thead>

              <tr>

                <th>
                  NO
                </th>

                <th>
                  IMAGE
                </th>

                <th>
                  PATIENT
                </th>

                <th>
                  PATIENT NAME
                </th>

                <th>
                  SEX
                </th>

                <th>
                  BIRTH DATE
                </th>

                <th>
                  STUDY DATE
                </th>

                <th>
                  STUDY TIME
                </th>

                <th>
                  DESCRIPTION
                </th>

                <th>
                  SERIES
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {
                loading
                ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="pacs-empty-row"
                    >
                      PACS Study 목록을 불러오는 중입니다.
                    </td>

                  </tr>

                )
                : filteredStudyList.length === 0
                ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="pacs-empty-row"
                    >
                      조회된 Study가 없습니다.
                    </td>

                  </tr>

                )
                : (

                  filteredStudyList.map(
                    (study, index) => (

                      <tr
                        key={
                          study.orthancStudyId
                          || study.studyInstanceUID
                          || index
                        }
                      >

                        <td className="number-cell">

                          {
                            index + 1
                          }

                        </td>


                        <td>

                          <StudyThumbnail
                            orthancStudyId={
                              study.orthancStudyId
                            }
                          />

                        </td>


                        <td>

                          <div className="patient-id">

                            {
                              displayValue(
                                study.patientId
                              )
                            }

                          </div>

                        </td>


                        <td>

                          {
                            displayValue(
                              study.patientName
                            )
                          }

                        </td>


                        <td>

                          {
                            displayValue(
                              study.patientSex
                            )
                          }

                        </td>


                        <td>

                          {
                            formatDicomDate(
                              study.patientBirthDate
                            )
                          }

                        </td>


                        <td>

                          {
                            formatDicomDate(
                              study.studyDate
                            )
                          }

                        </td>


                        <td>

                          {
                            formatDicomTime(
                              study.studyTime
                            )
                          }

                        </td>


                        <td>

                          <div className="description-cell">

                            {
                              displayValue(
                                study.studyDescription
                              )
                            }

                          </div>

                        </td>


                        <td>

                          <span className="series-badge">

                            {
                              study.seriesCount
                              ?? 0
                            }

                          </span>

                        </td>


                        <td>

                          {
                            study.stable
                              ? (

                                <span className="stable-badge">

                                  <span className="badge-dot" />

                                  Stable

                                </span>

                              )
                              : (

                                <span className="updating-badge">

                                  <span className="badge-dot" />

                                  Updating

                                </span>
                              )
                          }

                        </td>


                        <td>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="detail-button"
                              onClick={() =>
                                openDetail(
                                  study
                                )
                              }
                            >
                              상세
                            </button>


                            <button
                              type="button"
                              className="viewer-button"
                              onClick={() =>
                                openViewer(
                                  study
                                )
                              }
                            >
                              Viewer
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )
                )
              }

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          이 파일에서만 사용하는 PACS 디자인
      ====================================================== */}

      <style>
        {`

          .pacs-page {
            padding-bottom: 60px;
            color: #172033;
          }


          .pacs-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 30px;
            padding: 30px 34px;
            margin-bottom: 22px;
            border-radius: 14px;
            background:
              linear-gradient(
                135deg,
                #162438 0%,
                #203653 100%
              );
            color: white;
          }


          .pacs-eyebrow {
            margin-bottom: 7px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.7px;
            color: #8ebcf6;
          }


          .pacs-title {
            margin: 0 0 5px;
            font-size: 30px;
            font-weight: 700;
          }


          .pacs-subtitle {
            margin: 0;
            font-size: 14px;
            color: #c9d5e5;
          }


          .pacs-server-status {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 14px;
            border: 1px solid rgba(255,255,255,.2);
            border-radius: 999px;
            background: rgba(255,255,255,.08);
            font-size: 12px;
          }


          .status-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #49d58c;
            box-shadow: 0 0 0 4px rgba(73,213,140,.14);
          }


          .pacs-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 22px;
          }


          .pacs-summary-card {
            display: flex;
            flex-direction: column;
            padding: 19px 22px;
            border: 1px solid #e1e7ef;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 3px 12px rgba(28,44,70,.04);
          }


          .summary-label {
            margin-bottom: 6px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #8692a6;
          }


          .summary-value {
            margin-bottom: 3px;
            font-size: 25px;
            color: #1f3048;
          }


          .summary-desc {
            font-size: 12px;
            color: #9aa4b5;
          }


          .pacs-panel {
            overflow: hidden;
            margin-bottom: 22px;
            border: 1px solid #dfe5ec;
            border-radius: 13px;
            background: #ffffff;
            box-shadow: 0 3px 15px rgba(28,44,70,.04);
          }


          .pacs-panel-header {
            padding: 18px 22px 10px;
          }


          .pacs-panel-header h5,
          .study-toolbar h5 {
            font-weight: 700;
            color: #1c2b3f;
          }


          .panel-kicker {
            display: block;
            margin-bottom: 4px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.2px;
            color: #7c8da6;
          }


          .pacs-upload-area {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 22px 20px;
          }


          .pacs-upload-file {
            flex: 1;
          }


          .pacs-upload-file .form-control {
            min-height: 44px;
            border-color: #d8e0e9;
            border-radius: 8px;
          }


          .pacs-primary-button,
          .pacs-secondary-button,
          .pacs-outline-button,
          .detail-button,
          .viewer-button {
            border-radius: 7px;
            font-size: 13px;
            font-weight: 600;
            transition: .15s ease;
          }


          .pacs-primary-button {
            min-width: 160px;
            height: 44px;
            padding: 0 20px;
            border: 0;
            background: #246dcc;
            color: #ffffff;
          }


          .pacs-primary-button:hover:not(:disabled) {
            background: #1c5eb5;
          }


          .pacs-primary-button:disabled {
            opacity: .5;
          }


          .selected-file {
            display: flex;
            gap: 8px;
            padding: 0 22px 18px;
            font-size: 12px;
            color: #7a8799;
          }


          .selected-file strong {
            color: #35445a;
          }


          .study-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 20px 22px;
            border-bottom: 1px solid #e4e9ef;
          }


          .study-count {
            font-size: 12px;
            color: #8995a7;
          }


          .study-toolbar-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }


          .pacs-search {
            width: 260px;
            height: 38px;
            padding: 0 12px;
            border: 1px solid #d5dde7;
            border-radius: 7px;
            outline: none;
            font-size: 12px;
          }


          .pacs-search:focus {
            border-color: #78a8e5;
            box-shadow: 0 0 0 3px rgba(36,109,204,.08);
          }


          .pacs-secondary-button,
          .pacs-outline-button {
            height: 38px;
            padding: 0 14px;
          }


          .pacs-secondary-button {
            border: 1px solid #d2dae4;
            background: #ffffff;
            color: #516075;
          }


          .pacs-outline-button {
            border: 1px solid #246dcc;
            background: #ffffff;
            color: #246dcc;
          }


          .pacs-secondary-button:hover,
          .pacs-outline-button:hover {
            background: #f5f8fc;
          }


          .pacs-table {
            width: 100%;
            min-width: 1120px;
            margin: 0;
            border-collapse: collapse;
          }


          .pacs-table thead {
            background: #f4f6f9;
          }


          .pacs-table th {
            padding: 12px 10px;
            border-bottom: 1px solid #dce3ea;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .45px;
            color: #657287;
            white-space: nowrap;
          }


          .pacs-table td {
            padding: 10px;
            border-bottom: 1px solid #edf0f4;
            font-size: 12px;
            vertical-align: middle;
            color: #344154;
          }


          .pacs-table tbody tr {
            transition: background .12s ease;
          }


          .pacs-table tbody tr:hover {
            background: #f8fbff;
          }


          .pacs-table tbody tr:last-child td {
            border-bottom: 0;
          }


          .number-cell {
            color: #8895a8 !important;
          }


          .patient-id {
            font-weight: 700;
            color: #203653;
          }


          .description-cell {
            max-width: 175px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }


          .pacs-thumbnail-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 82px;
            height: 72px;
            overflow: hidden;
            border-radius: 7px;
            background: #11161d;
          }


          .pacs-thumbnail {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }


          .pacs-thumbnail-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 82px;
            height: 72px;
            border: 1px dashed #d3dae3;
            border-radius: 7px;
            background: #f7f8fa;
          }


          .pacs-thumbnail-empty span {
            font-size: 9px;
            color: #9ba6b5;
          }


          .series-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 25px;
            padding: 0 8px;
            border-radius: 6px;
            background: #eef3f9;
            font-weight: 700;
            color: #52657f;
          }


          .stable-badge,
          .updating-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
          }


          .stable-badge {
            background: #e7f7ef;
            color: #16774a;
          }


          .updating-badge {
            background: #fff3d9;
            color: #9a6710;
          }


          .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }


          .action-buttons {
            display: flex;
            gap: 6px;
            white-space: nowrap;
          }


          .detail-button,
          .viewer-button {
            height: 31px;
            padding: 0 10px;
          }


          .detail-button {
            border: 1px solid #ccd5df;
            background: #ffffff;
            color: #566477;
          }


          .viewer-button {
            border: 1px solid #246dcc;
            background: #246dcc;
            color: #ffffff;
          }


          .detail-button:hover {
            background: #f4f6f8;
          }


          .viewer-button:hover {
            background: #1b5cac;
          }


          .pacs-empty-row {
            padding: 55px !important;
            text-align: center;
            color: #8895a7 !important;
          }


          @media (max-width: 900px) {

            .pacs-hero,
            .study-toolbar {
              align-items: flex-start;
              flex-direction: column;
            }


            .pacs-summary-grid {
              grid-template-columns: 1fr;
            }


            .study-toolbar-actions {
              width: 100%;
              flex-wrap: wrap;
            }


            .pacs-search {
              width: 100%;
            }


            .pacs-upload-area {
              align-items: stretch;
              flex-direction: column;
            }


            .pacs-primary-button {
              width: 100%;
            }
          }

        `}
      </style>

    </div>
  );
}


export default PacsList;