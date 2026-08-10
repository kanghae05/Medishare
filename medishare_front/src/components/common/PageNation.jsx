import { useNavigate } from "react-router-dom";

// 컴포넌트에서 Spring Boot에서 넘어오는 pageObject를 
const PageNation = ({pageObject}) => {

  const navigate = useNavigate();

  // 데이터 처리
  console.log("pageObject=",JSON.stringify(pageObject));

  const liTag = [];

  // 페이지 네이션의 페이지를 클릭하면 동작시키는 함수 작성
  const handleClick = (event, page) => {
    event.preventDefault(); // 기본 처리를 무시시킨다. 페이지 이동 무시
    // 넘어온 페이지 확인
    console.log("page=",page);

    // 페이지와 검색 정보를 포함시켜서 리스트를 다시 부르기
    navigate("/board/list?page=" + page
      + "&perPageNum=" + pageObject.perPageNum
      + "&key=" + pageObject.key
      + "&word=" + pageObject.word
    );
  }

  // 맨 앞 페이지(1페이지) 이동 코드 작성
  liTag.push(
      <li className={(pageObject.page==1)?"page-item disabled":"page-item"}>
        <a className="page-link" href="#" onClick={(event)=>handleClick(event, 1)}>&lt;&lt;</a>
      </li>
  );
  // 시작페이지의 이전 페이지
  liTag.push(
      <li className={(pageObject.startPage==1)?"page-item disabled":"page-item"}>
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event, pageObject.startPage - 1)}>&lt;</a>
      </li>
  );

  // 페이지 클릭 버튼
  for(let i=pageObject.startPage; i <= pageObject.endPage; i++){
    liTag.push(
      <li className={(pageObject.page == i)?"page-item disabled":"page-item"}>
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event,i)}>{i}</a>
      </li>
    );
  }

  // 끝 페이지의 다음 페이지
  liTag.push(
      <li className={(pageObject.totalPage > pageObject.endPage)?"page-item":"page-item disabled"}>
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event,pageObject.endPage + 1)}>&gt;</a>
      </li>
  );

  // 마지막 페이지 가기
  liTag.push(
      <li className={(pageObject.totalPage > pageObject.page)?"page-item":"page-item disabled"}>
        <a className="page-link" href="#"
          onClick={(event)=>handleClick(event,pageObject.totalPage)}>&gt;&gt;</a>
      </li>
  );

  // 데이터 표시
  return (
    <div>
      <ul className="pagination">
        {liTag}
      </ul>
    </div>
  )
}

export default PageNation;