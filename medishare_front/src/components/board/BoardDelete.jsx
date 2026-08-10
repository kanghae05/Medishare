import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BoardDelete({no, handleCancel}){
  // 처리 부분
  const [vo, setVo] = useState({no:no, pw:""});

  const navigate = useNavigate();

  const setData = (pw)=>{
    setVo({no:vo.no, pw : pw});
    // console.log(JSON.stringify(vo));
  }

  const handleSubmit = async (evnet) => {
    // 기본 이벤트 무시
    evnet.preventDefault();

    // 삭제 처리
    try {
      // await - 서버에서 응답이 올 때까지 기다린다.
      const response = await axios.post("http://localhost/board/delete.do", vo);
      alert (response.data);
      navigate("/board/list");
    }  catch (error) {
      console.log(error);
      console.log('상태 코드:', error.response?.status);
      console.log('응답 데이터:', error.response?.data);

      if(error.response?.status == 304)
        alert('일반게시판 글삭제가 되지 않았습니다. 정보를 다시 확인해 주시요.');
      else
        alert('일반게시판 글삭제 중 서버 오류가 발생되었습니다.');

    }

  }

  // 표시 부분
  return(
    <div className="alert alert-secondary m-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="pw" className="form-label">본인 확인용 비밀번호 :</label>
          <input type="password" className="form-control" id="pw"
           placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20}
           onChange={(e) => setData(e.target.value)} />
        </div>
        <button className="btn btn-danger">삭제</button>
        <button type="button" onClick={handleCancel} className="btn btn-success">취소</button>
      </form>
    </div>
  );
}

export default BoardDelete;