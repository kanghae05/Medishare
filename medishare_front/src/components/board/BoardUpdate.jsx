import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function BoardUpdate(){
  // 데이터 처리 -------------------------------
  // 넘어 오는 데이터 no를 받는다.
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  console.log('no:', no);
  // 컴포넌트 이동 - routing : 페이지 이동
  const navigate = useNavigate();

  // 가져온 데이터를 저장하는 상태 변수
  // vo를 랜더링 할 때 사용하게 되는 js로 처리된다. 한개가 오류나 아래 코드 다 무시
  // js에서 axios.get() 호출하고 응답을 기다리지 않고 다름으로 넘어간다. 
  // 그래서 초기값이 null이면 랜더링에서 오류 
  // 해결 방법 : 1. await axios.get(),
  //   2. 초기값을 JSON 데이터로 넣어 둔다. 처음에는 데이터가 없다가 데이터가 넘어오면 useState() 선언으로 값 변경
  const [vo, setVo] = useState({}); // vo.no로 데이터가 있는 없는지 판단할 수 있다.
  // const [vo, setVo] = useState({
  //  no : "",
  //  title: "",
  //  content : "",
  //  writer : "",
  //  writeDate : "",
  //  hit: "",
  //  pw: "" }); // vo.no로 데이터가 있는 없는지 판단할 수 있다.

  // Spring Boot 에서 데이터 가져오기 - no: 받은 데이터, inc : 0
  useEffect(()=>{
    axios.get(`http://localhost/board/view.do?no=${no}&inc=0`)
    .then((response) =>{
      // 가져온 데이터 확인
      console.log("json 데이터 : " + JSON.stringify(response.data));
      setVo(response.data);
    }).catch((error)=> {
      console.log(`error : ${error}`);
      console.log("vo : " + JSON.stringify(vo));
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })

  },[no]);

   // 수정 버튼의 클릭 처리 -> 실제적으로 수정 시키는 것. 폼을 화면에 표시(랜더링 후) -> 데이터 수집 -> 등록
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 동작을 무시시킨다. 페이지를 이동시키면서 데이터 넘기기

    // 수집한 데이터 출력 확인
    console.log(JSON.stringify(vo));

    // Spring Boot로 백엔드 처리 APi 호출해서 데이터 전달
    try {
      const response =  await axios.post("http://localhost/board/update.do",vo);
      alert(response.data); // 처리 결과를 경고 창으로 띄운다.
      navigate(`/board/view?no=${no}&inc=0`); // 수정이 끝나면 글보기로 돌아간다.
    } catch (error) { // 서버에서 오류가 난 경우 : 500번 오류
      console.log(error);
      console.log('상태 코드:', error.response?.status);
      console.log('응답 데이터:', error.response?.data);
      
      if(error.response?.status == 304)
        alert('일반게시판 글수정이 되지 않았습니다. 정보를 다시 확인해 주시요.');
      else
        alert('일반게시판 글수정 중 서버 오류가 발생되었습니다.');
    }

  }

  // vo 데이터 변경하기
  const changeData = (event) => {
    // input 에서 이벤트 일어남 target == input tab. name과 value 속성을 가져와서 처리
    const {name, value} = event.target;

    // 변경된 데이터를 vo에 적용 시키기
    setVo(
      {
        ...vo, // vo의 모든 데이터는 복사해서 넣어 둔다.
        [name]:value // 수정한 항목의 값만 변경시킨다.
      }
    );
  }

  // 데이터 표시 ----------------------------------
  return(
    <>
      <div>/board/update</div>
      <hr />
      <p>일반 게시판 글수정 페이지 입니다.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label htmlFor="no" className="form-label">번호:</label>
          <input type="text" className="form-control" id="no"
           name="no" value={vo.no} readOnly
          />
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="title" className="form-label">제목:</label>
          <input type="text" className="form-control" id="title"
           placeholder="제목 입력" name="title" required maxLength={100}
           value={vo.title}
           onChange={changeData}/>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="content">내용:</label>
          <textarea className="form-control" rows="5" id="content"
           name="content" required value={vo.content}
           onChange={changeData}></textarea>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="writer" className="form-label">작성자:</label>
          <input type="text" className="form-control" id="writer"
           placeholder="작성자 입력" name="writer" required maxLength={10}
           value={vo.writer}
           onChange={changeData}/>
        </div>

        <div className="mb-3">
          <label htmlFor="pw" className="form-label">비밀번호:</label>
          <input type="password" className="form-control" id="pw"
           placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20}
           value={vo.pw}
           onChange={changeData} />
        </div>

        <button type="submit" className="btn btn-primary mr-2">수정</button>
        <button type="reset" className="btn btn-success mr-2">새로입력</button>
        <button type="button" className="btn btn-warning"
          onClick={()=>navigate(`/board/view?no=${no}&inc=0`)}>취소</button>

      </form>

      <a href="view">글보기</a>
    </>
  );
}

export default BoardUpdate;