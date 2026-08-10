import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberWrite(){
  // 데이터 처리 - 데이터 표시 전에 처리, 후에 처리 가능--------
  // 항목 한개를 저장하는 상태 객체 작성 - 5개
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState('');
  const [tel, setTel] = useState('');
  const [postNo, setPostNo] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState('');

  const navigate = useNavigate();

  // 맨 처음에 커서의 위치를 title로 만들어 보자.
  useEffect(()=>{
    document.getElementById('id').focus();
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
      id : id,
      pw : pw,
      name : name,
      gender : gender,
      birth : birth,
      tel : tel,
      postNo : postNo,
      address : address,
      email : email,
      roles : roles
    }

    // 수집한 데이터 출력 확인
    console.log(data);

    // Spring Boot로 백엔드 처리 APi 호출해서 데이터 전달
    try {
      const response = await axios.post("http://localhost/member/write.do",data);
      alert(response.data); // 서버에서 보낸 데이터를 출력하자.
      navigate("/"); // react 서버
    } catch (error) { // 서버에서 오류가 난 경우 : 500번 오류
      console.log(error);
    }

  }

  // 데이터 표시--------------------------------
  return(
    <>
      <div>/member/write</div>
      <hr />
      <p>회원 가입 페이지 입니다.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label htmlFor="id" className="form-label">아이디:</label>
          <input type="text" className="form-control" id="id"
           placeholder="아이디 입력" name="id" required maxLength={100}
           onChange={(e) => setId(e.target.value)}/>
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

         <div className="mb-3 mt-3">
          <label htmlFor="name" className="form-label">이름:</label>
          <input type="text" className="form-control" id="name"
           placeholder="이름 입력" name="name" required maxLength={10}
           onChange={(e) => setName(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="gender1" className="form-label">
            <input type="radio" className="form-control" id="gender1"
            name="gender" required value={"남자"}
           onChange={(e) => setGender(e.target.value)}/> 남자</label>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="gender2" className="form-label">
            <input type="radio" className="form-control" id="gender2"
            name="gender" required value={"여자"}
           onChange={(e) => setGender(e.target.value)}/> 여자</label>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="birth" className="form-label">생년월일:</label>
          <input type="text" className="form-control" id="birth"
           placeholder="yyyy-MM-dd HH:mm:ss" name="birth" required
           onChange={(e) => setBirth(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="tel" className="form-label">전화번호:</label>
          <input type="text" className="form-control" id="tel"
           placeholder="전화번호 입력" name="tel" maxLength={13}
           onChange={(e) => setTel(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="postNo" className="form-label">우편번호:</label>
          <input type="text" className="form-control" id="postNo"
           placeholder="우편 번호 입력" name="postNo" required maxLength={5}
           onChange={(e) => setPostNo(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="addresss" className="form-label">주소:</label>
          <input type="text" className="form-control" id="addresss"
           placeholder="주소 입력" name="addresss" required
           onChange={(e) => setAddress(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label">이메일:</label>
          <input type="text" className="form-control" id="email"
           placeholder="이메일 입력" name="email" required
           onChange={(e) => setEmail(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="roles1" className="form-label">일반 회원</label>
          <input type="checkbox" className="form-control" id="roles1"
           name="roles" value={"user"}
           onChange={(e) => setRoles(e.target.value)}/>
        </div>

         <div className="mb-3 mt-3">
          <label htmlFor="roles2" className="form-label">관리자</label>
          <input type="checkbox" className="form-control" id="roles2"
           name="roles" value={"admin"}
           onChange={(e) => setRoles(e.target.value)}/>
        </div>

       <button type="submit" className="btn btn-primary mr-2">가입</button>
        <button type="reset" className="btn btn-success mr-2">새로입력</button>
        <button type="button" className="btn btn-warning"
          onClick={() => navigate("/")}>취소</button>

      </form>
    </>
  );
}

export default MemberWrite;