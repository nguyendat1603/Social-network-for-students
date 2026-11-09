-- ============================================================================
-- SEED DATA: KHOA/VIỆN & MÃ HỌC PHẦN MẪU (FACULTIES & COURSES)
-- ============================================================================

INSERT INTO public.faculties (code, name, description)
VALUES
    ('SOICT', 'Trường Công nghệ Thông tin và Truyền thông', 'Khoa học máy tính, Kỹ thuật máy tính, An toàn thông tin, Khoa học dữ liệu & AI'),
    ('SEEE', 'Trường Điện - Điện tử', 'Kỹ thuật Điện, Tự động hóa, Điện tử Viễn thông, Hệ thống nhúng & IoT'),
    ('SMEC', 'Trường Cơ khí', 'Kỹ thuật Cơ điện tử, Cơ khí chế tạo, Kỹ thuật Ô tô, Hàng không'),
    ('SEM', 'Viện Kinh tế và Quản lý', 'Quản trị kinh doanh, Tài chính - Ngân hàng, Phân tích kinh doanh'),
    ('FAMI', 'Khoa Toán - Tin', 'Toán ứng dụng, Tin học kinh tế, Giải tích & Đại số đại cương')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'IT3080', 'Mạng máy tính', id, 3, 'Kiến trúc mạng TCP/IP, định tuyến, lập trình socket và giao thức tầng ứng dụng'
FROM public.faculties WHERE code = 'SOICT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'IT3100', 'Lập trình hướng đối tượng', id, 3, 'Nguyên lý OOP với Java/C++, Design Patterns và thiết kế phần mềm'
FROM public.faculties WHERE code = 'SOICT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'IT4409', 'Công nghệ Web và Dịch vụ Trực tuyến', id, 3, 'Kiến trúc ứng dụng Web hiện đại, RESTful API, WebSocket và bảo mật Web'
FROM public.faculties WHERE code = 'SOICT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'ET2010', 'Điện tử tương tự', id, 3, 'Mạch bán dẫn, khuếch đại thuật toán và thiết kế mạch tương tự'
FROM public.faculties WHERE code = 'SEEE'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'MI1111', 'Giải tích 1', id, 4, 'Giới hạn, đạo hàm, tích phân hàm một biến và chuỗi số'
FROM public.faculties WHERE code = 'FAMI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (code, name, faculty_id, credits, description)
SELECT 'MI1131', 'Giải tích 3', id, 3, 'Tích phân bội, tích phân đường, tích phân mặt và phương trình vi phân'
FROM public.faculties WHERE code = 'FAMI'
ON CONFLICT (code) DO NOTHING;
