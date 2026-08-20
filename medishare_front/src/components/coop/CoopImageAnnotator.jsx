import { useEffect, useRef, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// 검사 이미지 위에 자유롭게 그림을 그려서 채팅으로 보내는 도구.
function CoopImageAnnotator({ coopRequestId, imageUrl, onClose, onSent }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // 이미지를 캔버스 배경으로 먼저 그려놓는다.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleDown = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#e0433a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleUp = () => {
    drawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = imageUrl;
  };

  const handleSend = () => {
    setSending(true);
    setError(null);

    // 너무 큰 원본 그대로 보내면 무겁다 - 가로 900px 넘으면 줄여서, PNG 대신 JPEG로 압축해서 보낸다.
    const source = canvasRef.current;
    const maxWidth = 900;
    let out = source;
    if (source.width > maxWidth) {
      const scale = maxWidth / source.width;
      const resized = document.createElement("canvas");
      resized.width = maxWidth;
      resized.height = Math.round(source.height * scale);
      resized.getContext("2d").drawImage(source, 0, 0, resized.width, resized.height);
      out = resized;
    }
    const dataUrl = out.toDataURL("image/jpeg", 0.85);

    api
      .post(`/coop/${coopRequestId}/messages/image.do`, { imageDataUrl: dataUrl })
      .then(() => {
        onSent?.();
        onClose();
      })
      .catch(() => setError("전송에 실패했습니다."))
      .finally(() => setSending(false));
  };

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title mb-0">영상에 그려서 보내기</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div style={{ background: "#0A0F12", borderRadius: 4, overflow: "hidden", textAlign: "center" }}>
              <canvas
                ref={canvasRef}
                style={{ maxWidth: "100%", maxHeight: "60vh", cursor: "crosshair" }}
                onMouseDown={handleDown}
                onMouseMove={handleMove}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
              />
            </div>
            {error && <div className="coop-modal-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-coop-reset" onClick={handleClear} disabled={sending}>
              다시 그리기
            </button>
            <button type="button" className="btn-coop-reset" onClick={onClose} disabled={sending}>
              취소
            </button>
            <button type="button" className="btn-coop-apply" onClick={handleSend} disabled={sending}>
              {sending ? "전송 중..." : "채팅으로 전송"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoopImageAnnotator;