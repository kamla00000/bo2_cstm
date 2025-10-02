import React from "react";

const InfoModal = ({ open, title, message, onOk, onCancel, okButtonText = "OK", cancelButtonText = "キャンセル" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60" style={{ zIndex: 10000 }}>
      <div className="relative flex items-center justify-center w-full max-w-2xl px-2">
        {/* 六角形の背景 */}
        <div
          className="hexagon-bg absolute left-0 right-0 top-0 bottom-0 m-auto z-0"
          style={{ width: "100%", height: "100%" }}
        ></div>
        {/* 六角形の中身 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full py-10 px-8 text-center">
          <div className="text-3xl text-white font-extrabold mb-4 tracking-widest select-none">{title}</div>
          <div className="text-lg text-orange-300 mb-4 whitespace-pre-line break-words">
            {message}
          </div>
          {(onOk || onCancel) && (
          <div className="flex justify-center gap-6 mt-6">
            {onCancel && (
              <button
                className="modal-btn px-6 py-2 text-white rounded transition"
                onClick={onCancel}
              >
                {cancelButtonText}
              </button>
            )}
            {onOk && (
              <button
                className="modal-btn px-6 py-2 text-white rounded transition"
                onClick={onOk}
              >
                {okButtonText}
              </button>
            )}
          </div>
          )}
        </div>
      </div>
      {/* 六角形CSS */}
      <style>{`
        .hexagon-bg {
          background: #2d3748;
          border: 4px solid #fb923c;
          border-left: none;
          border-right: none;
          clip-path: polygon(
            15% 0%, 85% 0%,
            100% 50%, 85% 100%,
            15% 100%, 0% 50%
          );
          box-shadow: 0 0 24px #000a, 0 2px 8px #fb923c44;
        }
        .modal-btn {
          background: #6b7280; /* gray-500 */
        }
        .modal-btn:hover {
          background: #f97316; /* orange-500 */
        }
      `}</style>
    </div>
  );
};

export default InfoModal;