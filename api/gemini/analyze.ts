import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, context } = req.body || {};
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
3. Trả lời hoàn toàn bằng tiếng Việt chuẩn mực, giàu tính sư phạm, ân cần, mang tính xây dựng, đề xuất các giải pháp thực tế cho giáo viên chủ nhiệm THCS.
4. Trình bày mạch lạc với tiêu đề, danh sách gạch đầu dòng, nhấn mạnh tên học sinh và số liệu cụ thể.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `DỮ LIỆU HIỆN TẠI CỦA LỚP CHỦ NHIỆM:\n${JSON.stringify(context, null, 2)}\n\nYÊU CẦU CỦA GIÁO VIÊN CHỦ NHIỆM:\n${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.status(200).json({
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
}
