import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Gemini AI endpoint for Homeroom Teacher Assistant
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: 'Chưa cấu hình GEMINI_API_KEY. Hệ thống đang sử dụng bộ phân tích sư phạm cục bộ.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Bạn là Trợ lý AI Cố vấn Sư phạm dành riêng cho Giáo viên Chủ nhiệm THCS Việt Nam tại ứng dụng "ClassCare - Quản Lý Lớp Chủ Nhiệm".
Nhiệm vụ của bạn:
1. Phân tích tình hình học tập, chuyên cần, thi đua, rèn luyện của học sinh dựa trên dữ liệu thực tế được cung cấp.
2. TUYỆT ĐỐI KHÔNG BỊA ĐẶT DỮ LIỆU. Nếu thông tin không có trong dữ liệu, phải thông báo rõ là "Chưa đủ dữ liệu trong hệ thống để kết luận".
3. Trả lời hoàn toàn bằng tiếng Việt chuẩn mực, giàu tính sư phạm, ân cần, mang tính xây dựng, đề xuất các giải pháp thực tế cho giáo viên chủ nhiệm THCS (ví dụ: liên hệ phụ huynh trao đổi nhẹ nhàng, xếp đôi bạn cùng tiến, phân công cán sự lớp hỗ trợ, khuyến khích trong giờ sinh hoạt lớp).
4. Trình bày mạch lạc với tiêu đề, danh sách gạch đầu dòng, nhấn mạnh tên học sinh và số liệu cụ thể.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `DỮ LIỆU HIỆN TẠI CỦA LỚP CHỦ NHIỆM:\n${JSON.stringify(context, null, 2)}\n\nYÊU CẦU CỦA GIÁO VIÊN CHỦ NHIỆM:\n${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      return res.json({
        success: true,
        text: response.text,
      });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Lỗi xử lý AI',
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassCare server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
