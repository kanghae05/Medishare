import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";

function PacsDetail() {

  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {

    const loadStudyDetail = async () => {

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

        console.log(
          "PACS Study 상세 : ",
          response.data
        );

        setStudy(
          response.data
        );

      } catch (error) {

        console.error(
          "PACS 상세 조회 오류 : ",
          error
        );

        setErrorMessage(
          "PACS Study 상세 정보를 불러오지 못했습니다."
        );

      } finally {

        setLoading(false);
      }
    };


    loadStudyDetail();

  }, [studyId]);


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

    if (
      !date
      || date.length !== 8
    ) {
      return "-";
    }

    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };


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


  if (loading) {

    return (
      <div className="mt-4 text-center">
        PACS Study 정보를 불러오는 중입니다.
      </div>
    );
  }


  if (errorMessage) {

    return (
      <div className="mt-4">

        <div className="alert alert-danger">
          {errorMessage}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/pacs/list")}
        >
          목록으로
        </button>

      </div>
    );
  }


  if (!study) {
    return null;
  }


  const thumbnailUrl =
    `http://localhost/pacs/thumbnail/${
      encodeURIComponent(
        study.orthancStudyId
      )
    }`;


  return (

    <div className="container-fluid mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h3 className="mb-1">
            PACS Study 상세
          </h3>

          <div className="text-secondary">
            {displayValue(study.patientId)}
          </div>

        </div>


        <div className="d-flex gap-2">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/pacs/list")}
          >
            목록으로
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openViewer}
          >
            OHIF 영상 보기
          </button>

        </div>

      </div>


      <div className="row g-4">

        <div className="col-md-4">

          <div className="card h-100">

            <div className="card-header fw-bold">
              대표 영상
            </div>

            <div className="card-body text-center">

              <img
                src={thumbnailUrl}
                alt="Study Thumbnail"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  backgroundColor: "#000",
                  objectFit: "contain"
                }}
              />

            </div>

          </div>

        </div>


        <div className="col-md-8">

          <div className="card mb-4">

            <div className="card-header fw-bold">
              환자 정보
            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-6 mb-3">
                  <strong>Patient ID</strong>
                  <div>
                    {displayValue(study.patientId)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Patient Name</strong>
                  <div>
                    {displayValue(study.patientName)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>성별</strong>
                  <div>
                    {displayValue(study.patientSex)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>생년월일</strong>
                  <div>
                    {formatDicomDate(study.patientBirthDate)}
                  </div>
                </div>

              </div>

            </div>

          </div>


          <div className="card">

            <div className="card-header fw-bold">
              Study 정보
            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-6 mb-3">
                  <strong>Study Date</strong>
                  <div>
                    {formatDicomDate(study.studyDate)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Study Time</strong>
                  <div>
                    {displayValue(study.studyTime)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Study Description</strong>
                  <div>
                    {displayValue(study.studyDescription)}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Accession Number</strong>
                  <div>
                    {displayValue(study.accessionNumber)}
                  </div>
                </div>

                <div className="col-md-12 mb-3">
                  <strong>Study Instance UID</strong>
                  <div className="text-break">
                    {displayValue(study.studyInstanceUID)}
                  </div>
                </div>

                <div className="col-md-6">
                  <strong>Series Count</strong>
                  <div>
                    {study.seriesCount ?? 0}
                  </div>
                </div>

                <div className="col-md-6">
                  <strong>Instance Count</strong>
                  <div>
                    {study.instanceCount ?? 0}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      <div className="card mt-4">

        <div className="card-header fw-bold">
          Series 목록
        </div>

        <div className="table-responsive">

          <table className="table table-bordered mb-0">

            <thead className="table-dark">

              <tr>
                <th>Series Number</th>
                <th>Modality</th>
                <th>Series Description</th>
                <th>Instance Count</th>
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
                          {displayValue(series.seriesNumber)}
                        </td>

                        <td>
                          {displayValue(series.modality)}
                        </td>

                        <td>
                          {displayValue(series.seriesDescription)}
                        </td>

                        <td>
                          {series.instanceCount ?? 0}
                        </td>

                      </tr>

                    )
                  )
                )
                : (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center text-secondary py-4"
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

    </div>
  );
}

export default PacsDetail;