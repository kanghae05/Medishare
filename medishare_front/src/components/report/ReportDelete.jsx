import api from "../common/api";

function ReportDelete({ no, studyNo, onDeleted, onCancel }) {
  const remove = async () => {
    try {
      await api.delete(`/report/delete.do/${no}`);
      alert("판독소견서를 삭제했습니다.");
      onDeleted(studyNo);
    } catch (error) {
      alert(error.response?.data?.message || "삭제 권한이 없거나 삭제에 실패했습니다.");
    }
  };

  return <div className="card border-danger mt-3"><div className="card-body"><p className="mb-3">이 판독소견서를 삭제할까요? 삭제한 데이터는 복구할 수 없습니다.</p><button className="btn btn-danger me-2" onClick={remove}>삭제 확인</button><button className="btn btn-outline-secondary" onClick={onCancel}>취소</button></div></div>;
}

export default ReportDelete;
