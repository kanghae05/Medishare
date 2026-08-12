import api from "../../components/common/api";
export const getSpecialCases=params=>api.get("/api/special-cases",{params}).then(r=>r.data);
export const getSpecialCase=id=>api.get(`/api/special-cases/${id}`).then(r=>r.data);
export const saveSpecialCase=(id,data)=>api[id?"put":"post"](id?`/api/special-cases/${id}`:"/api/special-cases",data).then(r=>r.data);
export const deleteSpecialCase=id=>api.delete(`/api/special-cases/${id}`);
