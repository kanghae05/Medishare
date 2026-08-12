import { useEffect, useState } from "react";
import api from "../common/api";


// =========================================================
// PACS Study 썸네일
// =========================================================
function StudyThumbnail({ orthancStudyId }) {

  const [failed, setFailed] = useState(false);

  if (!orthancStudyId || failed) {
    return (
      <span className="text-secondary">
        없음
      </span>
    );
  }

  const thumbnailUrl =
    `${api.defaults.baseURL}/pacs/thumbnail/${
      encodeURIComponent(orthancStudyId)
    }`;

  return (
    <img
      src={thumbnailUrl}
      alt="PACS Study Thumbnail"
      style={{
        width: "90px",
        height: "90px",
        objectFit: "contain",
        backgroundColor: "#000",
        borderRadius: "4px"
      }}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}


function PacsList() {

  // =========================================================
  // 상태값
  // =========================================================

  const [studyList, setStudyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);


  // =========================================================
  // 처음 화면 진입 시 Study 목록 조회
  // =========================================================

  useEffect(() => {

    let cancelled = false;

    const loadStudyList = async () => {

      try {

        const response =
          await api.get("/pacs/list.do");

        if (cancelled) {
          return;
        }

        console.log(
          "PACS Study 목록 : ",
          response.data
        );

        if (Array.isArray(response.data)) {

          setStudyList(response.data);

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
          "PACS DB 테이블이 아직 준비되지 않았거나 목록을 불러올 수 없습니다."
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
        await api.get("/pacs/list.do");

      console.log(
        "PACS Study 목록 : ",
        response.data
      );

      if (Array.isArray(response.data)) {

        setStudyList(response.data);

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
        "PACS DB 테이블이 아직 준비되지 않았거나 목록을 불러올 수 없습니다."
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
  // Orthanc → MariaDB 동기화
  // =========================================================

  const syncStudyList = async () => {

    const result =
      window.confirm(
        "Orthanc의 PACS 데이터를 DB와 동기화하시겠습니까?"
      );


    if (!result) {
      return;
    }


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
        + `저장 : ${response.data.savedCount ?? 0}\n`
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
        "DB 테이블이 아직 생성되지 않았거나 동기화 중 오류가 발생했습니다."
      );
    }
  };


  // =========================================================
  // OHIF Viewer 열기
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
  // 화면 표시용 함수
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
  const formatDicomDate = (date) => {

    if (
      !date
      || date.length !== 8
    ) {

      return "-";
    }

    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };


  // 093000 → 09:30:00
  const formatDicomTime = (time) => {

    if (!time) {
      return "-";
    }


    const value =
      time.split(".")[0];


    if (value.length < 4) {
      return value;
    }


    const hour =
      value.substring(0, 2);

    const minute =
      value.substring(2, 4);

    const second =
      value.length >= 6
        ? value.substring(4, 6)
        : "";


    return second
      ? `${hour}:${minute}:${second}`
      : `${hour}:${minute}`;
  };


  // =========================================================
  // 화면
  // =========================================================

  return (

    <div className="container-fluid mt-4">


      {/* DICOM 업로드 */}

      <div className="card mb-4">

        <div className="card-header fw-bold">
          DICOM 파일 업로드
        </div>


        <div className="card-body">

          <div className="row g-2 align-items-center">


            <div className="col-md-8">

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


            <div className="col-md-4">

              <button
                type="button"
                className="btn btn-primary w-100"
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

          </div>


          {
            selectedFile
            && (

              <div className="mt-2 text-secondary">

                선택 파일 :{" "}
                {selectedFile.name}

              </div>
            )
          }

        </div>

      </div>


      {/* Study 목록 제목 */}

      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-3
        "
      >

        <div>

          <h3 className="mb-1">
            PACS Study 목록
          </h3>

          <div className="text-secondary">
            총 {studyList.length}건
          </div>

        </div>


        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={
              getStudyList
            }
          >
            새로고침
          </button>


          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={
              syncStudyList
            }
          >
            Orthanc 동기화
          </button>

        </div>

      </div>


      {
        errorMessage
        && (

          <div className="alert alert-warning">
            {errorMessage}
          </div>
        )
      }


      {/* Study 목록 */}

      <div className="table-responsive">

        <table
          className="
            table
            table-hover
            table-bordered
            align-middle
          "
        >

          <thead className="table-dark">

            <tr>

              <th className="text-center">
                번호
              </th>

              <th className="text-center">
                썸네일
              </th>

              <th>
                Patient ID
              </th>

              <th>
                Patient Name
              </th>

              <th className="text-center">
                성별
              </th>

              <th className="text-center">
                생년월일
              </th>

              <th className="text-center">
                Study Date
              </th>

              <th className="text-center">
                Study Time
              </th>

              <th>
                Study Description
              </th>

              <th className="text-center">
                Series
              </th>

              <th className="text-center">
                상태
              </th>

              <th className="text-center">
                영상
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
                    className="text-center py-5"
                  >
                    PACS Study 목록을 불러오는 중입니다.
                  </td>

                </tr>

              )
              : studyList.length === 0
              ? (

                <tr>

                  <td
                    colSpan="12"
                    className="
                      text-center
                      py-5
                      text-secondary
                    "
                  >
                    조회된 PACS Study가 없습니다.
                  </td>

                </tr>

              )
              : (

                studyList.map(
                  (study, index) => (

                    <tr
                      key={
                        study.orthancStudyId
                        || study.studyInstanceUID
                        || index
                      }
                    >

                      {/* 번호 */}
                      <td className="text-center">
                        {index + 1}
                      </td>


                      {/* 썸네일 */}
                      <td className="text-center">

                        <StudyThumbnail
                          orthancStudyId={
                            study.orthancStudyId
                          }
                        />

                      </td>


                      {/* Patient ID */}
                      <td>

                        {
                          displayValue(
                            study.patientId
                          )
                        }

                      </td>


                      {/* Patient Name */}
                      <td>

                        {
                          displayValue(
                            study.patientName
                          )
                        }

                      </td>


                      {/* 성별 */}
                      <td className="text-center">

                        {
                          displayValue(
                            study.patientSex
                          )
                        }

                      </td>


                      {/* 생년월일 */}
                      <td className="text-center">

                        {
                          formatDicomDate(
                            study.patientBirthDate
                          )
                        }

                      </td>


                      {/* Study Date */}
                      <td className="text-center">

                        {
                          formatDicomDate(
                            study.studyDate
                          )
                        }

                      </td>


                      {/* Study Time */}
                      <td className="text-center">

                        {
                          formatDicomTime(
                            study.studyTime
                          )
                        }

                      </td>


                      {/* Study Description */}
                      <td>

                        {
                          displayValue(
                            study.studyDescription
                            || study.requestedProcedureDescription
                          )
                        }

                      </td>


                      {/* Series */}
                      <td className="text-center">

                        {
                          study.seriesCount
                          ?? 0
                        }

                      </td>


                      {/* Stable */}
                      <td className="text-center">

                        {
                          study.stable
                          ? (

                            <span className="badge text-bg-success">
                              Stable
                            </span>

                          )
                          : (

                            <span className="badge text-bg-warning">
                              Updating
                            </span>

                          )
                        }

                      </td>


                      {/* OHIF */}
                      <td className="text-center">

                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={
                            () =>
                              openViewer(
                                study
                              )
                          }
                        >
                          영상 보기
                        </button>

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
  );
}

export default PacsList;