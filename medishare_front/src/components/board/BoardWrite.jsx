import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BoardWrite(){
  // 데이터 처리 - 데이터 표시 전에 처리, 후에 처리 가능--------
  // 항목 한개를 저장하는 상태 객체 작성 - 5개
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const navigate = useNavigate();

  // 맨 처음에 커서의 위치를 title로 만들어 보자.
  useEffect(()=>{
    document.getElementById('title').focus();
  },[]);

  // 등록 버튼의 클릭 처리 -> 실제적으로 등록 시키는 것. 폼을 화면에 표시(랜더링 후) -> 데이터 수집 -> 등록
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 동작을 무시시킨다. 페이지를 이동시키면서 데이터 넘기기

    // 비밀번호 확인 - 비밀번호와 비밀번호 확인이 틀리면
    if(pw != pw2){
      alert('비밀번호와 비밀번호 확인은 같아야 합니다.'); // 경고 띄우기
      // 데이터 지우기 - pw와 pw2를 value값으로 세팅하는 속성이 작성되어 있어야만 한다.
      setPw('');
      setPw2('');
      // 비밀번호에 커서를 위치시킨다.
      document.getElementById('pw').focus(); // $("#pw").focus()
      return false;
    }

    // 입력한 데이터를 JSON 데이터로 만든다.
    const data = {
      title : title,
      content : content,
      writer : writer,
      pw : pw
    }

    // 수집한 데이터 출력 확인
    console.log(data);

    // Spring Boot로 백엔드 처리 APi 호출해서 데이터 전달
    try {
      const response = await axios.post("http://localhost/board/write.do",data);
      // alert("일반 게시판에 게시글이 등록되었습니다.");
      alert(response.data); // 서버에서 보낸 데이터를 출력하자.
      navigate("/board/list"); // react 서버
    } catch (error) { // 서버에서 오류가 난 경우 : 500번 오류
      console.log(error);
    }

  }

  // 데이터 표시--------------------------------
  return(
    <>
      <div>/board/write</div>
      <hr />
      <p>일반 게시판 글등록 페이지 입니다.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label htmlFor="title" className="form-label">제목:</label>
          <input type="text" className="form-control" id="title"
           placeholder="제목 입력" name="title" required maxLength={100}
           onChange={(e) => setTitle(e.target.value)}/>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="content">내용:</label>
          <textarea className="form-control" rows="5" id="content"
           name="content" required onChange={(e) => setContent(e.target.value)}></textarea>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="writer" className="form-label">작성자:</label>
          <input type="text" className="form-control" id="writer"
           placeholder="작성자 입력" name="writer" required maxLength={10}
           onChange={(e) => setWriter(e.target.value)}/>
        </div>

        <div className="mb-3">
          <label htmlFor="pw" className="form-label">비밀번호:</label>
          <input type="password" className="form-control" id="pw"
           placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20}
           value={pw}
           onChange={(e) => setPw(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="pw2" className="form-label">비밀번호 확인:</label>
          <input type="password" className="form-control" id="pw2"
           placeholder="비밀번호 확인을 입력하세요" required maxLength={20} 
           value={pw2}
           onChange={(e) => setPw2(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary mr-2">등록</button>
        <button type="reset" className="btn btn-success mr-2">새로입력</button>
        <button type="button" className="btn btn-warning"
          onClick={() => location.href = "/board/list"}>취소</button>

      </form>
    </>
  );
}

export default BoardWrite;