import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BoardDelete from "./BoardDelete";
import { format } from "date-fns";

function BoardView(){
  // 데이터 처리 ---------------------------------------------
  // 파라메터로 넘어오는 데이터 수집 - useLocation
  // const location = useLocation();
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const inc = searchParams.get('inc');
  // 넘어온 데이터 확인하기
  console.log("no:", no, ", inc:", inc);

  // 서버에서 가져온 데이터를 저장하는 상태 변수
  const [vo, setVo] = useState({}); // vo는 null이 아니다. vo로 판단이 안되서 vo.no로 판단한다.

  // 삭제 div를 보이게/안보이게 하는 선택적 랜더링을 할 상태 변수
  const [showDelete, setShowDelete] = useState(false);

  // 컴포넌트 이동 - routing : 페이지 이동
  const navigate = useNavigate();

  // 랜더링 전에 컴포넌트를 처음 실행할 때 Spring Boot Server에서 데이터 가져오기 - useEffect()
  useEffect(()=>{
    axios.get(`http://localhost/board/view.do?no=${no}&inc=${inc}`)
    .then((response) =>{
      // 가져온 데이터 확인
      console.log("json 데이터 : " + JSON.stringify(response.data));
      setVo(response.data);
    }).catch((error)=> {
      console.log(`error : ${error}`);
      console.log("vo : " + JSON.stringify(vo));
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  }, [no]);// no가 바뀌면 실행된다. 
  // link 연결시 a 태그를 사용하시면 [] 한번만 실행하는 것 가능
  // link 연결시 <Link> <NavLink> 태그를 사용하면 현재 컴포넌트를 그대로 사용 - 그번호를 바꾸면 실행된다.

  // 삭제 버튼은 누르면 showDelete를 상태 변경 시킨다.(토글)
  const handleDeleteClick = () => {
    setShowDelete(!showDelete);
    if(showDelete) document.getElementById("pw").value = "";
  }

  // 데이터 저장하고 데이터를 이용해서 HTML tag를 만든다.
  return(
    <>
      <div>/board/view</div>
      <hr />
      <p>일반 게시판 글보기 페이지 입니다.</p>
      <table className="table">
        {/* 조건부 랜더링 : vo.no가 null 이거나 0 인 경우 (tag 하나 - tbody tag) 랜더링한다. */}
        {!vo.no && (
          <tbody>
            <tr>
              <td>데이터가 존재하지 않습니다.</td>
            </tr>
          </tbody>
        )}
        {/* 조건부 랜더링 : vo.no가 0이 아닌 다른 숫자인 경우 랜더링한다. no의 특성상 0보다 큰 숫자만 활용 */}
        {vo.no && (
            <tbody>
                <tr>
                <th>번호</th>
                <td>{vo.no}</td>
              </tr>
              <tr>
                <th>제목</th>
                <td>{vo.title}</td>
              </tr>
              <tr>
                <th>내용</th>
                <td><pre>{vo.content}</pre></td>
              </tr>
              <tr>
                <th>작성자</th>
                <td>{vo.writer}</td>
              </tr>
              <tr>
                <th>작성일</th>
                <td>{format(vo.writeDate, "yyyy-MM-dd")}</td>
              </tr>
              <tr>
                <th>조회수</th>
                <td>{vo.hit}</td>
              </tr>
            </tbody>
          )
        }
      </table>
      <button className="btn btn-primary" onClick={() => navigate(`/board/update?no=${no}`)
      }>수정</button>&nbsp;
      <button className="btn btn-danger" onClick={handleDeleteClick}>삭제</button>&nbsp;
      <Link to={"/board/list"} className="btn btn-success">리스트</Link>&nbsp;
      { showDelete && <BoardDelete no = {vo.no} handleCancel={handleDeleteClick} />}
    </>
  );
}

export default BoardView;