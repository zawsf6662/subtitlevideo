"use client";
import { useState } from "react";

export default function SubtitleEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันอัปโหลดไฟล์ไปที่ Backend (FastAPI)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setVideoFile(file);

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSubtitles(data.subtitles); // รับซับจาก AI มาเก็บใน State
      console.log("Data from Backend:", data);
      if (data.subtitles) {
        setSubtitles(data.subtitles);
      } else {
        alert("Backend ส่งข้อมูลมาผิดรูปแบบ!");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", err);
      alert("เชื่อมต่อ Server ไม่ได้! ลืมรัน Backend หรือเปล่า?");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับแก้ตัวหนังสือใน State
  const updateSubtitle = (id: number, newText: string) => {
    setSubtitles(subtitles.map(s => s.id === id ? { ...s, text: newText } : s));
  };

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">AI Subtitle Editor 🎬</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ฝั่งซ้าย: ตัวเล่นวิดีโอ */}
        <div className="space-y-4">
          <input type="file" onChange={handleUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />

          {videoFile && (
            <video
              src={URL.createObjectURL(videoFile)}
              controls
              className="w-full rounded-lg border-2 border-gray-700"
            />
          )}
          {loading && <p className="animate-pulse text-yellow-400">AI กำลังฟังเสียงและปั่นซับให้ใจเย็นๆ นะครับ...</p>}
        </div>

        {/* ฝั่งขวา: รายการซับไตเติ้ลที่แก้ได้ */}
        <div className="bg-gray-800 p-4 rounded-lg h-[600px] overflow-y-auto space-y-3">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Subtitles</h2>
          {subtitles && subtitles.length > 0 ? (
            subtitles.map((sub) => (
              <div key={sub.id} className="flex gap-4 items-start bg-gray-700 p-3 rounded">
                <span className="text-xs text-gray-400 mt-2">{sub.start}s</span>
                <textarea
                  value={sub.text}
                  onChange={(e) => updateSubtitle(sub.id, e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded p-1 resize-none"
                  rows={2}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">ยังไม่มีซับไตเติ้ล อัปโหลดวิดีโอก่อนนะ</p>
          )}
        </div>
      </div>
    </main>
  );
}