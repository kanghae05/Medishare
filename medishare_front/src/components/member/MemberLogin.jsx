import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function MemberLogin(){
  // 데이터 처리 ---------------------------------------------
  // 사용자에게 키보드로 입력 받는 데이터
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  // 컴포넌트 이동 - routing : 페이지 이동
  const navigate = useNavigate();

  // 랜더링 전에 컴포넌트를 처음 실행할 때 Spring Boot Server에서 데이터 가져오기 - useEffect()
  useEffect(()=>{
    document.getElementById('id').focus();
  },[]);

  // 등록 버튼의 클릭 처리 -> 실제적으로 등록 시키는 것. 폼을 화면에 표시(랜더링 후) -> 데이터 수집 -> 등록
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 동작을 무시시킨다. 페이지를 이동시키면서 데이터 넘기기

    // 입력한 데이터를 JSON 데이터로 만든다.
    const data = {
      id : id,
      pw : pw
    }
    // 수집한 데이터 출력 확인
    console.log(data);

    // Spring Boot로 백엔드 처리 APi 호출해서 데이터 전달
    try {
      const response = await axios.post("http://localhost/member/login.do",data);
      console.log(response.data); // 서버에서 보낸 데이터를 출력하자.

      // react 어디서나 접근 가능한 곳에 저장해야한다.
      const result = response.data;

      // 로그인이 성공되면 처리
      if(result.success){

        // JWT 토큰 가져오기
        const token = result.token;

        // JWT 내부 정보 - id, name, roles
        const login = jwtDecode(token);

        console.log(login);

        // localStorage 저장 - react 모든 곳에서 접근가능한 저장장소에 저장
        localStorage.setItem("token", token);
        localStorage.setItem("login", JSON.stringify(login));

        alert(`${login.name}님으로 로그인되었습니다.`);

        // navigate("/"); // react 서버 - 바로 적용이 안됨. 더 많은 소스를 작성 필요
        // 다시 불러오는 location 사용.
        location.href = "/";
   
      }
      
      // navigate("/"); // react 서버
    } catch (error) { // 서버에서 오류가 난 경우 : 500번 오류
      console.log(error);
    }

  }


  // id, pw를 입력하는 form tag 작성
  return(
    <>
      <div>/member/login</div>
      <hr />
      <p>회원 가입 페이지 입니다.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label htmlFor="id" className="form-label">아이디:</label>
          <input type="text" className="form-control" id="id"
           placeholder="아이디 입력" name="id" required maxLength={20}
           value={id}
           onChange={(e) => setId(e.target.value)}/>
        </div>

        <div className="mb-3">
          <label htmlFor="pw" className="form-label">비밀번호:</label>
          <input type="password" className="form-control" id="pw"
           placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20}
           value={pw}
           onChange={(e) => setPw(e.target.value)} />
        </div>


       <button type="submit" className="btn btn-primary mr-2">로그인</button>
        <button type="reset" className="btn btn-success mr-2">새로입력</button>
        <button type="button" className="btn btn-warning"
          onClick={() => navigate("/")}>취소</button>

      </form>
    </>
  );
}

export default MemberLogin;