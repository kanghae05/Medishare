import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import api from "../common/api";


// =========================================================
// PACS Study 썸네일
// =========================================================
function StudyThumbnail({ orthancStudyId }) {
  const [thumbnailSrc, setThumbnailSrc] =
    useState(null);

  const [failed, setFailed] =
    useState(false);


  useEffect(() => {
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


        setThumbnailSrc(
          objectUrl
        );

      } catch (error) {
        if (cancelled) {
          return;
        }


        console.error(
          "PACS 썸네일 조회 오류:",
          error
        );


        setFailed(true);
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

  }, [orthancStudyId]);


  if (!orthancStudyId || failed) {
    return (
      <div className="pacs-thumbnail-empty">
        <span>NO IMAGE</span>
      </div>
    );
  }


  if (!thumbnailSrc) {
    return (
      <div className="pacs-thumbnail-empty">
        <span>LOADING</span>
      </div>
    );
  }


  return (
    <div className="pacs-thumbnail-box">

      <img
        src={thumbnailSrc}
        alt="PACS Study Thumbnail"
        className="pacs-thumbnail"
        onError={() =>
          setFailed(true)
        }
      />

    </div>
  );
}


// =========================================================
// PACS 공통 Modal
// =========================================================
function PacsModal({
  open,
  type,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) {

  if (!open) {
    return null;
  }


  const icon = (() => {
    if (type === "success") {
      return "✓";
    }

    if (type === "error") {
      return "!";
    }

    if (type === "confirm") {
      return "?";
    }

    return "i";
  })();


  return (
    <div className="pacs-modal-backdrop">

      <div
        className="pacs-modal-card"
        role="dialog"
        aria-modal="true"
      >

        <div
          className={
            `pacs-modal-icon pacs-modal-icon-${type}`
          }
        >
          {icon}
        </div>


        <div className="pacs-modal-content">

          <div className="pacs-modal-eyebrow">
            MEDICAL IMAGE ARCHIVE
          </div>


          <h3 className="pacs-modal-title">
            {title}
          </h3>


          <p className="pacs-modal-message">
            {message}
          </p>

        </div>


        <div className="pacs-modal-actions">

          {
            cancelText
            && (
              <button
                type="button"
                className="pacs-modal-cancel"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )
          }


          <button
            type="button"
            className="pacs-modal-confirm"
            onClick={onConfirm}
          >
            {confirmText || "확인"}
          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// PACS Study 목록
// 관리자 / 의사 공통 화면
// =========================================================
function PacsList() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const recentTimerRef =
    useRef(null);


  // =========================================================
  // 상태값
  // =========================================================
  const [studyList, setStudyList] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [errorMessage, setErrorMessage] =
    useState("");


  const [selectedFiles, setSelectedFiles] =
    useState([]);


  const [uploading, setUploading] =
    useState(false);


  const [uploadProgress, setUploadProgress] =
    useState({
      current: 0,
      total: 0
    });


  const [syncing, setSyncing] =
    useState(false);


  const [searchKeyword, setSearchKeyword] =
    useState("");


  // 방금 갱신된 Study
  const [recentStudyIds, setRecentStudyIds] =
    useState([]);


  // =========================================================
  // Modal 상태
  // =========================================================
  const [modal, setModal] =
    useState({
      open: false,
      type: "info",
      title: "",
      message: "",
      confirmText: "확인",
      cancelText: "",
      onConfirm: null
    });


  // =========================================================
  // Timer 정리
  // =========================================================
  useEffect(() => {

    return () => {
      if (recentTimerRef.current) {
        clearTimeout(
          recentTimerRef.current
        );
      }
    };

  }, []);


  // =========================================================
  // Modal
  // =========================================================
  const showModal = ({
    type = "info",
    title,
    message,
    confirmText = "확인",
    onConfirm = null
  }) => {

    setModal({
      open: true,
      type,
      title,
      message,
      confirmText,
      cancelText: "",
      onConfirm
    });
  };


  const showConfirmModal = ({
    title,
    message,
    confirmText = "확인",
    cancelText = "취소",
    onConfirm
  }) => {

    setModal({
      open: true,
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText,
      onConfirm
    });
  };


  const closeModal = () => {

    setModal((prev) => ({
      ...prev,
      open: false,
      onConfirm: null
    }));
  };


  const handleModalConfirm = () => {

    const confirmAction =
      modal.onConfirm;


    closeModal();


    if (confirmAction) {
      confirmAction();
    }
  };


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
  // Study 목록 조회
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
  // UPDATED 표시
  // 모달 확인 후 시작
  // 5초 뒤 자동 제거
  // =========================================================
  const showRecentStudies = (
    studyIds
  ) => {

    if (
      !Array.isArray(studyIds)
      || studyIds.length === 0
    ) {
      return;
    }


    if (recentTimerRef.current) {
      clearTimeout(
        recentTimerRef.current
      );
    }


    setRecentStudyIds(
      studyIds
    );


    recentTimerRef.current =
      setTimeout(() => {

        setRecentStudyIds([]);

        recentTimerRef.current =
          null;

      }, 5000);
  };


  // =========================================================
  // 수동 새로고침
  // =========================================================
  const refreshStudyList = async () => {

    if (recentTimerRef.current) {

      clearTimeout(
        recentTimerRef.current
      );

      recentTimerRef.current =
        null;
    }


    setRecentStudyIds([]);


    await getStudyList();
  };


  // =========================================================
  // 파일 선택창
  // =========================================================
  const openFilePicker = () => {

    if (uploading) {
      return;
    }


    fileInputRef.current?.click();
  };


  // =========================================================
  // 여러 DICOM 선택
  // =========================================================
  const handleFileChange = (e) => {

    const files =
      Array.from(
        e.target.files || []
      );


    setSelectedFiles(
      files
    );
  };


  // =========================================================
  // 파일 선택 초기화
  // =========================================================
  const clearSelectedFiles = () => {

    setSelectedFiles([]);


    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =========================================================
  // 파일 용량
  // =========================================================
  const selectedTotalSize =
    useMemo(() => {

      return selectedFiles.reduce(
        (sum, file) =>
          sum + (file.size || 0),
        0
      );

    }, [selectedFiles]);


  const formatFileSize = (bytes) => {

    if (!bytes) {
      return "0 MB";
    }


    const mb =
      bytes / 1024 / 1024;


    if (mb < 1) {

      return `${
        (
          bytes / 1024
        ).toFixed(1)
      } KB`;

    }


    return `${mb.toFixed(1)} MB`;
  };


  // =========================================================
  // 여러 DICOM → Orthanc 자동 업로드
  //
  // 1. 파일 업로드
  // 2. ParentStudy 수집
  // 3. DB 동기화
  // 4. 목록 자동 재조회
  // 5. 완료 Modal
  // 6. Modal 확인을 누른 뒤 UPDATED 5초 표시
  // =========================================================
  const uploadDicom = async () => {

    if (selectedFiles.length === 0) {

      showModal({
        type: "info",
        title: "DICOM 파일을 선택해주세요",
        message:
          "Orthanc에 업로드할 DICOM 의료영상 파일을 먼저 선택해주세요."
      });


      return;
    }


    if (recentTimerRef.current) {

      clearTimeout(
        recentTimerRef.current
      );

      recentTimerRef.current =
        null;
    }


    setRecentStudyIds([]);


    setUploading(true);


    setUploadProgress({
      current: 0,
      total: selectedFiles.length
    });


    const parentStudyIds =
      new Set();


    let successCount = 0;

    let failedCount = 0;


    try {

      // =====================================================
      // 1. DICOM 파일 하나씩 업로드
      // =====================================================
      for (
        let index = 0;
        index < selectedFiles.length;
        index++
      ) {

        const file =
          selectedFiles[index];


        const formData =
          new FormData();


        formData.append(
          "file",
          file
        );


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
            `[DICOM ${index + 1}/${selectedFiles.length}]`,
            file.name,
            response.data
          );


          const uploadSuccess =
            response.data?.Status === "Success"
            || response.data?.Status === "AlreadyStored";


          if (uploadSuccess) {

            successCount++;


            const parentStudy =
              response.data?.ParentStudy;


            if (parentStudy) {

              parentStudyIds.add(
                parentStudy
              );
            }

          } else {

            failedCount++;


            console.error(
              "정상 업로드 응답이 아닙니다:",
              file.name,
              response.data
            );
          }

        } catch (fileError) {

          failedCount++;


          console.error(
            "DICOM 개별 파일 업로드 실패:",
            file.name,
            fileError
          );
        }


        setUploadProgress({
          current: index + 1,
          total: selectedFiles.length
        });
      }


      // =====================================================
      // 모든 파일 실패
      // =====================================================
      if (successCount === 0) {

        showModal({
          type: "error",
          title: "DICOM 업로드 실패",
          message:
            `선택한 ${selectedFiles.length}개의 DICOM 파일을 업로드하지 못했습니다.`
        });


        return;
      }


      // =====================================================
      // 2. Study 자동 DB 동기화
      // =====================================================
      if (parentStudyIds.size > 0) {

        for (
          const parentStudy
          of parentStudyIds
        ) {

          try {

            const syncResponse =
              await api.post(
                `/pacs/sync/${
                  encodeURIComponent(
                    parentStudy
                  )
                }`
              );


            console.log(
              "자동 Study 동기화 결과:",
              parentStudy,
              syncResponse.data
            );

          } catch (syncError) {

            console.error(
              "Study 개별 동기화 실패:",
              parentStudy,
              syncError
            );


            // 개별 동기화 실패 시
            // 전체 동기화
            await api.post(
              "/pacs/sync.do"
            );


            break;
          }
        }

      } else {

        await api.post(
          "/pacs/sync.do"
        );
      }


      // =====================================================
      // 3. 목록 바로 다시 조회
      // =====================================================
      await getStudyList();


      // 업로드된 Study IDs 저장
      const uploadedStudyIds =
        Array.from(
          parentStudyIds
        );


      // =====================================================
      // 4. 파일 선택 초기화
      // =====================================================
      clearSelectedFiles();


      // =====================================================
      // 5. 결과 Modal
      //
      // 중요:
      // 여기서는 UPDATED timer를 시작하지 않음
      //
      // 사용자가 확인 버튼을 누르는 순간
      // showRecentStudies 실행
      // =====================================================
      if (failedCount === 0) {

        showModal({
          type: "success",
          title: "DICOM 등록 완료",
          message:
            `총 ${successCount}개의 DICOM 영상 업로드와 PACS 목록 반영이 완료되었습니다.`,
          onConfirm: () => {
            showRecentStudies(
              uploadedStudyIds
            );
          }
        });

      } else {

        showModal({
          type: "error",
          title: "일부 파일 업로드 완료",
          message:
            `총 ${selectedFiles.length}개 중 ${successCount}개 성공, ${failedCount}개 실패했습니다. 성공한 영상은 PACS 목록에 반영되었습니다.`,
          onConfirm: () => {
            showRecentStudies(
              uploadedStudyIds
            );
          }
        });
      }

    } catch (error) {

      console.error(
        "DICOM 다중 업로드 오류:",
        error
      );


      showModal({
        type: "error",
        title: "DICOM 등록 실패",
        message:
          "DICOM 업로드 또는 PACS 데이터 동기화 중 오류가 발생했습니다."
      });

    } finally {

      setUploading(false);


      setUploadProgress({
        current: 0,
        total: 0
      });
    }
  };


  // =========================================================
  // Orthanc 전체 동기화
  // =========================================================
  const executeSync = async () => {

    setSyncing(true);


    if (recentTimerRef.current) {

      clearTimeout(
        recentTimerRef.current
      );

      recentTimerRef.current =
        null;
    }


    setRecentStudyIds([]);


    try {

      const response =
        await api.post(
          "/pacs/sync.do"
        );


      console.log(
        "PACS 동기화 결과:",
        response.data
      );


      await getStudyList();


      const totalCount =
        response.data?.totalCount ?? 0;


      const savedCount =
        response.data?.savedCount ?? 0;


      const skippedCount =
        response.data?.skippedCount ?? 0;


      const failedCount =
        response.data?.failedCount ?? 0;


      showModal({
        type:
          failedCount > 0
            ? "error"
            : "success",

        title:
          failedCount > 0
            ? "일부 동기화 실패"
            : "Orthanc 동기화 완료",

        message:
          `전체 ${totalCount}건 · `
          + `저장/갱신 ${savedCount}건 · `
          + `건너뜀 ${skippedCount}건 · `
          + `실패 ${failedCount}건`
      });

    } catch (error) {

      console.error(
        "PACS 동기화 오류:",
        error
      );


      showModal({
        type: "error",
        title: "동기화 실패",
        message:
          "Orthanc PACS 데이터 동기화 중 오류가 발생했습니다."
      });

    } finally {

      setSyncing(false);
    }
  };


  // =========================================================
  // 수동 동기화
  // =========================================================
  const syncStudyList = () => {

    showConfirmModal({
      title: "Orthanc 데이터를 동기화할까요?",
      message:
        "Orthanc PACS 서버의 Study와 메타데이터를 서비스 DB의 최신 상태로 동기화합니다.",
      confirmText: "동기화",
      cancelText: "취소",
      onConfirm: executeSync
    });
  };


  // =========================================================
  // 상세 페이지
  // =========================================================
  const openDetail = (study) => {

    if (!study.orthancStudyId) {

      showModal({
        type: "error",
        title: "Study 정보를 열 수 없습니다",
        message:
          "Orthanc Study ID가 존재하지 않습니다."
      });


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

      showModal({
        type: "error",
        title: "Viewer를 열 수 없습니다",
        message:
          "해당 검사에 StudyInstanceUID가 존재하지 않습니다."
      });


      return;
    }


    const viewerUrl =
      `http://${window.location.hostname}:3000/viewer?StudyInstanceUIDs=${
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
  // 표시용
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


      <PacsModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />


      {/* HERO */}
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


      {/* SUMMARY */}
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


      {/* DICOM UPLOAD */}
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


          <input
            ref={fileInputRef}
            type="file"
            accept=".dcm,application/dicom"
            multiple
            className="pacs-hidden-file-input"
            onChange={handleFileChange}
          />


          <div className="pacs-file-picker">


            <button
              type="button"
              className="pacs-file-select-button"
              onClick={openFilePicker}
              disabled={uploading}
            >

              <span className="file-button-icon">
                +
              </span>

              DICOM 파일 선택

            </button>


            <div
              className={
                selectedFiles.length > 0
                  ? "pacs-file-name selected"
                  : "pacs-file-name"
              }
            >

              <div>

                <span className="file-name-label">

                  {
                    selectedFiles.length > 0
                      ? "SELECTED DICOM"
                      : "DICOM FILE"
                  }

                </span>


                <span className="file-name-value">

                  {
                    selectedFiles.length > 0
                      ? `${selectedFiles.length}개 파일 · ${formatFileSize(selectedTotalSize)}`
                      : "업로드할 의료영상 파일을 선택해주세요."
                  }

                </span>


                {
                  selectedFiles.length > 0
                  && (
                    <span className="file-name-example">

                      {selectedFiles[0]?.name}

                      {
                        selectedFiles.length > 1
                        && ` 외 ${selectedFiles.length - 1}개`
                      }

                    </span>
                  )
                }

              </div>


              {
                selectedFiles.length > 0
                && !uploading
                && (
                  <button
                    type="button"
                    className="file-clear-button"
                    onClick={clearSelectedFiles}
                    title="파일 선택 취소"
                  >
                    ×
                  </button>
                )
              }

            </div>

          </div>


          <button
            type="button"
            className="pacs-primary-button"
            disabled={
              uploading
              || selectedFiles.length === 0
            }
            onClick={uploadDicom}
          >

            {
              uploading
                ? `업로드 중 ${uploadProgress.current} / ${uploadProgress.total}`
                : "Orthanc 업로드"
            }

          </button>

        </div>


        {
          uploading
          && (
            <div className="pacs-upload-progress-wrap">

              <div className="pacs-upload-progress-info">

                <span>
                  DICOM 영상 업로드 중
                </span>

                <strong>

                  {
                    uploadProgress.total > 0
                      ? Math.round(
                          (
                            uploadProgress.current
                            / uploadProgress.total
                          ) * 100
                        )
                      : 0
                  }%

                </strong>

              </div>


              <div className="pacs-upload-progress">

                <div
                  className="pacs-upload-progress-bar"
                  style={{
                    width:
                      `${
                        uploadProgress.total > 0
                          ? (
                              uploadProgress.current
                              / uploadProgress.total
                            ) * 100
                          : 0
                      }%`
                  }}
                />

              </div>


              <div className="pacs-upload-progress-note">
                업로드가 완료될 때까지 이 페이지를 닫지 마세요.
              </div>

            </div>
          )
        }

      </div>


      {/* STUDY LIST */}
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


            <div className="pacs-search-box">

              <span className="search-icon">
                ⌕
              </span>


              <input
                type="text"
                className="pacs-search"
                placeholder="환자 ID, 이름, 검사일 검색"
                value={searchKeyword}
                onChange={
                  (e) =>
                    setSearchKeyword(
                      e.target.value
                    )
                }
              />


              {
                searchKeyword
                && (
                  <button
                    type="button"
                    className="search-clear-button"
                    onClick={() =>
                      setSearchKeyword("")
                    }
                  >
                    ×
                  </button>
                )
              }

            </div>


            <button
              type="button"
              className="pacs-secondary-button"
              onClick={refreshStudyList}
              disabled={
                loading
                || uploading
              }
            >
              새로고침
            </button>


            <button
              type="button"
              className="pacs-outline-button"
              onClick={syncStudyList}
              disabled={
                syncing
                || uploading
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
            <div className="pacs-error-message">

              <strong>
                PACS 데이터를 불러오지 못했습니다.
              </strong>

              <span>
                {errorMessage}
              </span>

            </div>
          )
        }


        <div className="table-responsive">

          <table className="pacs-table">

            <thead>

              <tr>

                <th>NO</th>
                <th>IMAGE</th>
                <th>PATIENT</th>
                <th>PATIENT NAME</th>
                <th>SEX</th>
                <th>BIRTH DATE</th>
                <th>STUDY DATE</th>
                <th>STUDY TIME</th>
                <th>DESCRIPTION</th>
                <th>SERIES</th>
                <th>IMAGES</th>
                <th>STATUS</th>
                <th>ACTION</th>

              </tr>

            </thead>


            <tbody>

              {
                loading
                  ? (
                    <tr>

                      <td
                        colSpan="13"
                        className="pacs-empty-row"
                      >

                        <div className="pacs-loading">

                          <span className="loading-ring" />

                          PACS Study 목록을 불러오는 중입니다.

                        </div>

                      </td>

                    </tr>
                  )
                  : filteredStudyList.length === 0
                    ? (
                      <tr>

                        <td
                          colSpan="13"
                          className="pacs-empty-row"
                        >
                          조회된 Study가 없습니다.
                        </td>

                      </tr>
                    )
                    : (
                      filteredStudyList.map(
                        (study, index) => {

                          const isRecent =
                            recentStudyIds.includes(
                              study.orthancStudyId
                            );


                          return (

                            <tr
                              key={
                                study.orthancStudyId
                                || study.studyInstanceUID
                                || index
                              }
                              className={
                                isRecent
                                  ? "recent-study-row"
                                  : ""
                              }
                            >


                              <td className="number-cell">
                                {index + 1}
                              </td>


                              <td>

                                <StudyThumbnail
                                  orthancStudyId={
                                    study.orthancStudyId
                                  }
                                />

                              </td>


                              <td>

                                <div className="patient-cell">

                                  <div className="patient-id">

                                    {
                                      displayValue(
                                        study.patientId
                                      )
                                    }

                                  </div>


                                  {
                                    isRecent
                                    && (
                                      <span className="updated-badge">
                                        UPDATED
                                      </span>
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

                                <span className="instance-badge">

                                  {
                                    study.instanceCount
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
                                      openDetail(study)
                                    }
                                  >
                                    상세
                                  </button>


                                  <button
                                    type="button"
                                    className="viewer-button"
                                    onClick={() =>
                                      openViewer(study)
                                    }
                                  >
                                    Viewer
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )
                    )
              }

            </tbody>

          </table>

        </div>

      </div>


      {/* STYLE */}
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
            background: linear-gradient(
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
            box-shadow:
              0 0 0 4px rgba(73,213,140,.14);
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
            box-shadow:
              0 3px 12px rgba(28,44,70,.04);
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
            box-shadow:
              0 3px 15px rgba(28,44,70,.04);
          }


          .pacs-panel-header {
            padding: 20px 22px 11px;
          }


          .pacs-panel-header h5,
          .study-toolbar h5 {
            margin-bottom: 0;
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


          .pacs-hidden-file-input {
            display: none;
          }


          .pacs-upload-area {
            display: flex;
            align-items: stretch;
            gap: 12px;
            padding: 10px 22px 22px;
          }


          .pacs-file-picker {
            flex: 1;
            display: flex;
            min-width: 0;
            min-height: 58px;
            border: 1px solid #d7e0ea;
            border-radius: 9px;
            background: #fafbfd;
            overflow: hidden;
          }


          .pacs-file-select-button {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 0 18px;
            border: 0;
            border-right:
              1px solid #dce4ed;
            background: #f2f6fb;
            color: #2d425e;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }


          .pacs-file-select-button:hover:not(:disabled) {
            background: #eaf1f9;
          }


          .file-button-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 5px;
            background: #dceafb;
            color: #246dcc;
            font-size: 16px;
          }


          .pacs-file-name {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 7px 14px;
          }


          .pacs-file-name > div {
            min-width: 0;
            display: flex;
            flex-direction: column;
          }


          .file-name-label {
            margin-bottom: 2px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .8px;
            color: #9aa5b5;
          }


          .file-name-value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            color: #8b96a6;
          }


          .pacs-file-name.selected
          .file-name-value {
            font-weight: 700;
            color: #34465e;
          }


          .file-name-example {
            margin-top: 2px;
            max-width: 500px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 10px;
            color: #95a0af;
          }


          .file-clear-button {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border: 0;
            border-radius: 50%;
            background: #edf1f5;
            color: #738197;
            font-size: 17px;
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
            flex-shrink: 0;
            min-width: 175px;
            min-height: 58px;
            padding: 0 18px;
            border: 0;
            background: #246dcc;
            color: #ffffff;
          }


          .pacs-primary-button:hover:not(:disabled) {
            background: #1d5fb6;
          }


          .pacs-primary-button:disabled {
            opacity: .48;
          }


          .pacs-upload-progress-wrap {
            margin: -5px 22px 22px;
            padding: 14px 16px;
            border: 1px solid #dbe6f3;
            border-radius: 9px;
            background: #f8fbff;
          }


          .pacs-upload-progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
            color: #607087;
          }


          .pacs-upload-progress-info strong {
            color: #246dcc;
          }


          .pacs-upload-progress {
            width: 100%;
            height: 7px;
            overflow: hidden;
            border-radius: 999px;
            background: #e1e9f3;
          }


          .pacs-upload-progress-bar {
            height: 100%;
            border-radius: 999px;
            background: #246dcc;
            transition:
              width .2s ease;
          }


          .pacs-upload-progress-note {
            margin-top: 8px;
            font-size: 10px;
            color: #8d99aa;
          }


          .study-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 20px 22px;
            border-bottom:
              1px solid #e4e9ef;
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


          .pacs-search-box {
            position: relative;
            display: flex;
            align-items: center;
            width: 310px;
            height: 40px;
            border:
              1px solid #d5dde7;
            border-radius: 8px;
            background: #ffffff;
          }


          .pacs-search-box:focus-within {
            border-color: #78a8e5;
            box-shadow:
              0 0 0 3px rgba(36,109,204,.08);
          }


          .search-icon {
            margin-left: 12px;
            color: #8b99ab;
            font-size: 19px;
            transform: rotate(-20deg);
          }


          .pacs-search {
            width: 100%;
            height: 100%;
            padding: 0 34px 0 9px;
            border: 0;
            outline: 0;
            background: transparent;
            font-size: 12px;
          }


          .search-clear-button {
            position: absolute;
            right: 9px;
            top: 50%;
            transform:
              translateY(-50%);
            width: 23px;
            height: 23px;
            border: 0;
            border-radius: 50%;
            background: #f0f3f7;
            color: #8490a1;
          }


          .pacs-secondary-button,
          .pacs-outline-button {
            height: 40px;
            padding: 0 14px;
          }


          .pacs-secondary-button {
            border:
              1px solid #d2dae4;
            background: #ffffff;
            color: #516075;
          }


          .pacs-outline-button {
            border:
              1px solid #246dcc;
            background: #ffffff;
            color: #246dcc;
          }


          .pacs-error-message {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin: 16px 22px;
            padding: 13px 15px;
            border:
              1px solid #f2d6d5;
            border-radius: 8px;
            background: #fff7f7;
            color: #8c3a3a;
            font-size: 12px;
          }


          .pacs-table {
            width: 100%;
            min-width: 1210px;
            margin: 0;
            border-collapse: collapse;
          }


          .pacs-table thead {
            background: #f4f6f9;
          }


          .pacs-table th {
            padding: 12px 10px;
            border-bottom:
              1px solid #dce3ea;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .45px;
            color: #657287;
            white-space: nowrap;
          }


          .pacs-table td {
            padding: 10px;
            border-bottom:
              1px solid #edf0f4;
            font-size: 12px;
            vertical-align: middle;
            color: #344154;
          }


          .pacs-table tbody tr:hover {
            background: #f8fbff;
          }


          .recent-study-row {
            background: #effaf7;
            box-shadow:
              inset 4px 0 0 #159f98;
          }


          .recent-study-row:hover {
            background:
              #e8f7f3 !important;
          }


          .number-cell {
            color: #8895a8 !important;
          }


          .patient-cell {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }


          .patient-id {
            font-weight: 700;
            color: #203653;
          }


          .updated-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 3px 6px;
            border-radius: 999px;
            background: #dff5ef;
            color: #13836b;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: .5px;
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
            border:
              1px dashed #d3dae3;
            border-radius: 7px;
            background: #f7f8fa;
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


          .instance-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 34px;
            height: 25px;
            padding: 0 8px;
            border-radius: 6px;
            background: #eaf4ff;
            font-weight: 700;
            color: #246dcc;
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
            border:
              1px solid #ccd5df;
            background: #ffffff;
            color: #566477;
          }


          .viewer-button {
            border:
              1px solid #246dcc;
            background: #246dcc;
            color: #ffffff;
          }


          .pacs-empty-row {
            padding: 55px !important;
            text-align: center;
            color: #8895a7 !important;
          }


          .pacs-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
          }


          .loading-ring {
            width: 17px;
            height: 17px;
            border:
              2px solid #dae3ee;
            border-top-color: #246dcc;
            border-radius: 50%;
            animation:
              pacsSpin .7s linear infinite;
          }


          @keyframes pacsSpin {
            to {
              transform:
                rotate(360deg);
            }
          }


          .pacs-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
              rgba(10,18,30,.54);
            backdrop-filter:
              blur(3px);
          }


          .pacs-modal-card {
            width: 100%;
            max-width: 430px;
            padding: 28px;
            border-radius: 16px;
            background: #ffffff;
            box-shadow:
              0 24px 70px rgba(13,28,48,.24);
          }


          .pacs-modal-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            margin-bottom: 19px;
            border-radius: 13px;
            font-size: 24px;
            font-weight: 700;
          }


          .pacs-modal-icon-success {
            background: #e8f7ef;
            color: #168254;
          }


          .pacs-modal-icon-error {
            background: #fff0f0;
            color: #c84f4f;
          }


          .pacs-modal-icon-info,
          .pacs-modal-icon-confirm {
            background: #edf4fd;
            color: #246dcc;
          }


          .pacs-modal-eyebrow {
            margin-bottom: 6px;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1.3px;
            color: #8c9bb0;
          }


          .pacs-modal-title {
            margin: 0 0 10px;
            font-size: 20px;
            font-weight: 750;
            color: #1c2c42;
          }


          .pacs-modal-message {
            margin: 0;
            font-size: 13px;
            line-height: 1.65;
            color: #69778a;
          }


          .pacs-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 26px;
          }


          .pacs-modal-cancel,
          .pacs-modal-confirm {
            min-width: 82px;
            height: 39px;
            padding: 0 15px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
          }


          .pacs-modal-cancel {
            border:
              1px solid #d7dee7;
            background: #ffffff;
            color: #617084;
          }


          .pacs-modal-confirm {
            border:
              1px solid #246dcc;
            background: #246dcc;
            color: #ffffff;
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


            .pacs-search-box {
              width: 100%;
            }


            .pacs-upload-area {
              flex-direction: column;
            }


            .pacs-file-picker,
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