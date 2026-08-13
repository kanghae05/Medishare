import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";


function PacsDetail() {

  const { studyId } = useParams();
  const navigate = useNavigate();


  // =========================================================
  // 상태값
  // =========================================================

  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);


  // =========================================================
  // Study 상세 조회
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    const loadStudyDetail = async () => {

      setLoading(true);
      setErrorMessage("");


      try {

        const response =
          await api.get(
            "/pacs/view.do",
            {
              params: {
                id: studyId
              }
            }
          );


        if (cancelled) {
          return;
        }


        console.log(
          "PACS Study 상세 : ",
          response.data
        );


        setStudy(
          response.data
        );


      } catch (error) {

        if (cancelled) {
          return;
        }


        console.error(
          "PACS 상세 조회 오류 : ",
          error
        );


        setErrorMessage(
          "PACS Study 상세 정보를 불러오지 못했습니다."
        );


      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    };


    loadStudyDetail();


    return () => {
      cancelled = true;
    };

  }, [studyId]);


  // =========================================================
  // 대표 썸네일 조회
  // 로그인 토큰이 포함된 api 요청으로 Blob 이미지를 가져온다.
  // =========================================================
 useEffect(() => {
  const orthancStudyId =
    study?.orthancStudyId;

  if (!orthancStudyId) {
    return undefined;
  }

  let cancelled = false;
  let objectUrl = null;

  const loadThumbnail = async () => {
    try {
      const response =
        await api.get(
          `/pacs/thumbnail/${
            encodeURIComponent(
              orthancStudyId
            )
          }`,
          {
            responseType: "blob"
          }
        );

      if (cancelled) {
        return;
      }

      objectUrl =
        URL.createObjectURL(
          response.data
        );

      setThumbnailFailed(false);
      setThumbnailSrc(objectUrl);

    } catch (error) {
      if (cancelled) {
        return;
      }

      console.error(
        "PACS 대표 썸네일 조회 오류 : ",
        error
      );

      setThumbnailFailed(true);
    }
  };

  loadThumbnail();

  return () => {
    cancelled = true;

    if (objectUrl) {
      URL.revokeObjectURL(
        objectUrl
      );
    }
  };
}, [study?.orthancStudyId]);


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


  // 20000101 → 2000-01-01
  // 이미 2000-01-01 형식이면 그대로 표시
  const formatDicomDate = (date) => {

    if (!date) {
      return "-";
    }


    const value =
      String(date);


    if (value.includes("-")) {

      return value;
    }


    if (value.length !== 8) {

      return value;
    }


    return (
      `${value.substring(0, 4)}-`
      + `${value.substring(4, 6)}-`
      + `${value.substring(6, 8)}`
    );
  };


  // 093000 → 09:30:00
  // 이미 09:30:00 형식이면 그대로 표시
  const formatDicomTime = (time) => {

    if (!time) {
      return "-";
    }


    const raw =
      String(time);


    if (raw.includes(":")) {

      return raw;
    }


    const value =
      raw.split(".")[0];


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
  // OHIF Viewer
  // =========================================================

  const openViewer = () => {

    if (!study?.studyInstanceUID) {

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
  // 로딩
  // =========================================================

  if (loading) {

    return (

      <div
        className="
          d-flex
          justify-content-center
          align-items-center
        "
        style={{
          minHeight: "400px"
        }}
      >

        <div className="text-secondary">
          PACS Study 정보를 불러오는 중입니다.
        </div>

      </div>
    );
  }


  // =========================================================
  // 오류
  // =========================================================

  if (errorMessage) {

    return (

      <div className="mt-4">

        <div className="alert alert-danger">

          {errorMessage}

        </div>


        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate(
              "/pacs/list"
            )
          }
        >
          목록으로
        </button>

      </div>
    );
  }


  if (!study) {

    return null;
  }


  const firstSeries =
    study.seriesList?.[0];


  // =========================================================
  // 화면
  // =========================================================

  return (

    <div className="pacs-detail-page">


      {/* =====================================================
          상단 타이틀 영역
      ====================================================== */}

      <div className="pacs-detail-hero">

        <div>

          <div className="detail-eyebrow">
            PACS STUDY DETAIL
          </div>


          <h1 className="detail-title">
            Study Detail
          </h1>


          <div className="detail-patient-id">

            Patient ID

            <strong>
              {
                displayValue(
                  study.patientId
                )
              }
            </strong>

          </div>

        </div>


        <div className="detail-hero-right">

          {
            typeof study.stable === "boolean"
            && (

              study.stable
                ? (

                  <span className="detail-stable-badge">

                    <span className="detail-badge-dot" />

                    Stable

                  </span>

                )
                : (

                  <span className="detail-updating-badge">

                    <span className="detail-badge-dot" />

                    Updating

                  </span>
                )
            )
          }


          <button
            type="button"
            className="detail-back-button"
            onClick={() =>
              navigate(
                "/pacs/list"
              )
            }
          >
            목록으로
          </button>


          <button
            type="button"
            className="detail-viewer-button"
            onClick={
              openViewer
            }
          >
            OHIF Viewer 열기
          </button>

        </div>

      </div>


      {/* =====================================================
          요약 정보
      ====================================================== */}

      <div className="detail-summary-grid">


        <div className="detail-summary-card">

          <span className="detail-summary-label">
            MODALITY
          </span>

          <strong className="detail-summary-value small-value">

            {
              displayValue(
                firstSeries?.modality
              )
            }

          </strong>

          <span className="detail-summary-desc">
            영상 검사 유형
          </span>

        </div>


        <div className="detail-summary-card">

          <span className="detail-summary-label">
            SERIES
          </span>

          <strong className="detail-summary-value">

            {
              study.seriesCount
              ?? 0
            }

          </strong>

          <span className="detail-summary-desc">
            Series Count
          </span>

        </div>


        <div className="detail-summary-card">

          <span className="detail-summary-label">
            INSTANCES
          </span>

          <strong className="detail-summary-value">

            {
              study.instanceCount
              ?? 0
            }

          </strong>

          <span className="detail-summary-desc">
            DICOM Images
          </span>

        </div>

      </div>


      {/* =====================================================
          대표 영상 + 정보
      ====================================================== */}

      <div className="detail-main-grid">


        {/* 대표 영상 */}

        <div className="detail-panel image-panel">

          <div className="detail-panel-header">

            <div>

              <span className="detail-panel-kicker">
                PREVIEW
              </span>

              <h5>
                대표 영상
              </h5>

            </div>

          </div>


          <div className="detail-image-area">

            {
              thumbnailFailed
                ? (

                  <div className="detail-no-image">

                    <span>
                      NO IMAGE
                    </span>

                  </div>

                )
                : thumbnailSrc
                  ? (

                    <img
                      src={thumbnailSrc}
                      alt="PACS Study Thumbnail"
                      className="detail-thumbnail"
                      onError={() =>
                        setThumbnailFailed(
                          true
                        )
                      }
                    />

                  )
                  : (

                    <div className="detail-no-image">

                      <span>
                        LOADING
                      </span>

                    </div>
                  )
            }

          </div>


          <div className="detail-image-footer">

            <span>
              Study Date
            </span>

            <strong>

              {
                formatDicomDate(
                  study.studyDate
                )
              }

            </strong>

          </div>

        </div>


        {/* 오른쪽 정보 */}

        <div className="detail-info-column">


          {/* 환자 정보 */}

          <div className="detail-panel">

            <div className="detail-panel-header">

              <div>

                <span className="detail-panel-kicker">
                  PATIENT
                </span>

                <h5>
                  환자 정보
                </h5>

              </div>

            </div>


            <div className="detail-info-grid">

              <div className="detail-info-item">

                <span className="detail-info-label">
                  Patient ID
                </span>

                <strong>

                  {
                    displayValue(
                      study.patientId
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Patient Name
                </span>

                <strong>

                  {
                    displayValue(
                      study.patientName
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Sex
                </span>

                <strong>

                  {
                    displayValue(
                      study.patientSex
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Birth Date
                </span>

                <strong>

                  {
                    formatDicomDate(
                      study.patientBirthDate
                    )
                  }

                </strong>

              </div>

            </div>

          </div>


          {/* Study 정보 */}

          <div className="detail-panel">

            <div className="detail-panel-header">

              <div>

                <span className="detail-panel-kicker">
                  STUDY INFORMATION
                </span>

                <h5>
                  Study 정보
                </h5>

              </div>

            </div>


            <div className="detail-info-grid">

              <div className="detail-info-item">

                <span className="detail-info-label">
                  Study Date
                </span>

                <strong>

                  {
                    formatDicomDate(
                      study.studyDate
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Study Time
                </span>

                <strong>

                  {
                    formatDicomTime(
                      study.studyTime
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Study Description
                </span>

                <strong>

                  {
                    displayValue(
                      study.studyDescription
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Accession Number
                </span>

                <strong>

                  {
                    displayValue(
                      study.accessionNumber
                    )
                  }

                </strong>

              </div>


              <div className="detail-info-item full-width">

                <span className="detail-info-label">
                  Study Instance UID
                </span>

                <div className="detail-uid">

                  {
                    displayValue(
                      study.studyInstanceUID
                    )
                  }

                </div>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Series Count
                </span>

                <strong>

                  {
                    study.seriesCount
                    ?? 0
                  }

                </strong>

              </div>


              <div className="detail-info-item">

                <span className="detail-info-label">
                  Instance Count
                </span>

                <strong>

                  {
                    study.instanceCount
                    ?? 0
                  }

                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          Series 목록
      ====================================================== */}

      <div className="detail-panel series-panel">

        <div className="detail-panel-header series-header">

          <div>

            <span className="detail-panel-kicker">
              DICOM SERIES
            </span>

            <h5>
              Series 목록
            </h5>

          </div>


          <span className="series-total">

            총 {
              study.seriesList?.length
              ?? 0
            }건

          </span>

        </div>


        <div className="table-responsive">

          <table className="detail-series-table">

            <thead>

              <tr>

                <th>
                  SERIES NUMBER
                </th>

                <th>
                  MODALITY
                </th>

                <th>
                  SERIES DESCRIPTION
                </th>

                <th>
                  INSTANCE COUNT
                </th>

              </tr>

            </thead>


            <tbody>

              {
                study.seriesList?.length > 0
                  ? (

                    study.seriesList.map(
                      (series, index) => (

                        <tr
                          key={
                            series.id
                            || series.seriesInstanceUID
                            || index
                          }
                        >

                          <td>

                            <span className="series-number">

                              {
                                displayValue(
                                  series.seriesNumber
                                )
                              }

                            </span>

                          </td>


                          <td>

                            <span className="modality-badge">

                              {
                                displayValue(
                                  series.modality
                                )
                              }

                            </span>

                          </td>


                          <td>

                            {
                              displayValue(
                                series.seriesDescription
                              )
                            }

                          </td>


                          <td>

                            <strong>

                              {
                                series.instanceCount
                                ?? 0
                              }

                            </strong>

                          </td>

                        </tr>
                      )
                    )

                  )
                  : (

                    <tr>

                      <td
                        colSpan="4"
                        className="detail-empty-row"
                      >
                        Series 정보가 없습니다.
                      </td>

                    </tr>
                  )
              }

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          PacsDetail 전용 스타일
      ====================================================== */}

      <style>
        {`

          .pacs-detail-page {
            padding-bottom: 60px;
            color: #172033;
          }


          .pacs-detail-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 25px;
            margin-bottom: 22px;
            padding: 28px 32px;
            border-radius: 14px;
            background:
              linear-gradient(
                135deg,
                #162438 0%,
                #203653 100%
              );
            color: #ffffff;
          }


          .detail-eyebrow {
            margin-bottom: 7px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.7px;
            color: #8ebcf6;
          }


          .detail-title {
            margin: 0 0 8px;
            font-size: 29px;
            font-weight: 700;
          }


          .detail-patient-id {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #b9c8dc;
          }


          .detail-patient-id strong {
            color: #ffffff;
          }


          .detail-hero-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }


          .detail-stable-badge,
          .detail-updating-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 36px;
            padding: 0 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
          }


          .detail-stable-badge {
            border: 1px solid rgba(95,215,154,.35);
            background: rgba(40,171,108,.15);
            color: #79e3ad;
          }


          .detail-updating-badge {
            border: 1px solid rgba(255,196,81,.35);
            background: rgba(255,181,51,.12);
            color: #ffd47a;
          }


          .detail-badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
          }


          .detail-back-button,
          .detail-viewer-button {
            height: 38px;
            padding: 0 15px;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 700;
          }


          .detail-back-button {
            border: 1px solid rgba(255,255,255,.3);
            background: rgba(255,255,255,.08);
            color: #ffffff;
          }


          .detail-viewer-button {
            border: 1px solid #3e8bf1;
            background: #347cd9;
            color: #ffffff;
          }


          .detail-back-button:hover {
            background: rgba(255,255,255,.14);
          }


          .detail-viewer-button:hover {
            background: #286abf;
          }


          .detail-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 22px;
          }


          .detail-summary-card {
            display: flex;
            flex-direction: column;
            padding: 18px 21px;
            border: 1px solid #e1e7ef;
            border-radius: 12px;
            background: #ffffff;
            box-shadow:
              0 3px 12px rgba(28,44,70,.04);
          }


          .detail-summary-label {
            margin-bottom: 6px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #8692a6;
          }


          .detail-summary-value {
            margin-bottom: 3px;
            font-size: 25px;
            color: #1f3048;
          }


          .detail-summary-value.small-value {
            font-size: 20px;
          }


          .detail-summary-desc {
            font-size: 12px;
            color: #9aa4b5;
          }


          .detail-main-grid {
            display: grid;
            grid-template-columns:
              minmax(280px, 350px)
              minmax(0, 1fr);
            gap: 20px;
            align-items: stretch;
            margin-bottom: 22px;
          }


          .detail-info-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }


          .detail-panel {
            overflow: hidden;
            border: 1px solid #dfe5ec;
            border-radius: 13px;
            background: #ffffff;
            box-shadow:
              0 3px 15px rgba(28,44,70,.04);
          }


          .detail-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 17px 20px;
            border-bottom: 1px solid #e6ebf0;
          }


          .detail-panel-header h5 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #1c2b3f;
          }


          .detail-panel-kicker {
            display: block;
            margin-bottom: 3px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.2px;
            color: #8694aa;
          }


          .image-panel {
            display: flex;
            flex-direction: column;
          }


          .detail-image-area {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            min-height: 330px;
            padding: 20px;
            background: #10151c;
          }


          .detail-thumbnail {
            width: 100%;
            max-width: 310px;
            max-height: 330px;
            object-fit: contain;
          }


          .detail-no-image {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 280px;
            color: #758196;
          }


          .detail-no-image span {
            font-size: 11px;
            letter-spacing: 1px;
          }


          .detail-image-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 18px;
            border-top: 1px solid #e7ebef;
            font-size: 11px;
            color: #8290a3;
          }


          .detail-image-footer strong {
            color: #3a485b;
          }


          .detail-info-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 0;
            padding: 5px 20px 18px;
          }


          .detail-info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-height: 76px;
            padding: 15px 12px;
            border-bottom: 1px solid #edf0f4;
          }


          .detail-info-item:nth-last-child(-n+2) {
            border-bottom: 0;
          }


          .detail-info-item.full-width {
            grid-column: 1 / -1;
          }


          .detail-info-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .45px;
            color: #8793a5;
          }


          .detail-info-item strong {
            font-size: 13px;
            color: #2c3a4c;
          }


          .detail-uid {
            padding: 9px 11px;
            border-radius: 6px;
            background: #f5f7fa;
            font-size: 11px;
            line-height: 1.5;
            color: #516177;
            word-break: break-all;
          }


          .series-panel {
            margin-bottom: 20px;
          }


          .series-header {
            padding-top: 18px;
            padding-bottom: 18px;
          }


          .series-total {
            font-size: 11px;
            color: #8794a6;
          }


          .detail-series-table {
            width: 100%;
            margin: 0;
            border-collapse: collapse;
          }


          .detail-series-table thead {
            background: #f4f6f9;
          }


          .detail-series-table th {
            padding: 12px 15px;
            border-bottom: 1px solid #dce3ea;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .5px;
            color: #657287;
          }


          .detail-series-table td {
            padding: 14px 15px;
            border-bottom: 1px solid #edf0f4;
            font-size: 12px;
            color: #344154;
          }


          .detail-series-table tbody tr:last-child td {
            border-bottom: 0;
          }


          .series-number {
            font-weight: 700;
            color: #203653;
          }


          .modality-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 38px;
            height: 27px;
            padding: 0 9px;
            border-radius: 6px;
            background: #edf4fd;
            font-size: 11px;
            font-weight: 700;
            color: #2867ad;
          }


          .detail-empty-row {
            padding: 45px !important;
            text-align: center;
            color: #8794a6 !important;
          }


          @media (max-width: 900px) {

            .pacs-detail-hero {
              align-items: flex-start;
              flex-direction: column;
            }


            .detail-summary-grid {
              grid-template-columns: 1fr;
            }


            .detail-main-grid {
              grid-template-columns: 1fr;
            }


            .detail-info-grid {
              grid-template-columns: 1fr;
            }


            .detail-info-item.full-width {
              grid-column: auto;
            }
          }

        `}
      </style>

    </div>
  );
}


export default PacsDetail;