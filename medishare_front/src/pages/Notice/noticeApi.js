import api from "../../components/common/api";
export const getNotices=(params)=>api.get("/api/notices",{params}).then(r=>r.data);
export const getNotice=(id)=>api.get(`/api/notices/${id}`).then(r=>r.data);
export const saveNotice=(id,data)=>api[id?"put":"post"](id?`/api/notices/${id}`:"/api/notices",data).then(r=>r.data);
export const deleteNotice=(id)=>api.delete(`/api/notices/${id}`);
