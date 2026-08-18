-- 진료과
INSERT INTO department (department_name, description, status, stable) VALUES
('영상의학과', 'X-ray, CT, MRI, 초음파 등 영상 검사 및 판독', 'ACTIVE', TRUE),
('내과', '일반 내과 진료', 'ACTIVE', TRUE),
('외과', '일반 외과 진료 및 수술', 'ACTIVE', TRUE),
('정형외과', '근골격계 질환 진료', 'ACTIVE', TRUE),
('신경과', '신경계 질환 진료', 'ACTIVE', TRUE),
('신경외과', '신경계 수술', 'ACTIVE', TRUE),
('흉부외과', '흉부 및 심장 수술', 'ACTIVE', TRUE),
('소아청소년과', '소아 및 청소년 진료', 'ACTIVE', TRUE),
('산부인과', '산과 및 부인과 진료', 'ACTIVE', TRUE),
('비뇨의학과', '비뇨기계 질환 진료', 'ACTIVE', TRUE),
('피부과', '피부 질환 진료', 'ACTIVE', TRUE),
('안과', '눈 질환 진료', 'ACTIVE', TRUE),
('이비인후과', '귀, 코, 목 질환 진료', 'ACTIVE', TRUE),
('마취통증의학과', '마취 및 통증 관리', 'ACTIVE', TRUE),
('응급의학과', '응급 환자 진료', 'ACTIVE', TRUE),
('재활의학과', '재활 치료', 'ACTIVE', TRUE),
('가정의학과', '일차 진료 및 건강관리', 'ACTIVE', TRUE),
('정신건강의학과', '정신 질환 진료', 'ACTIVE', TRUE),
('병리과', '조직 및 세포 병리 진단', 'ACTIVE', TRUE),
('진단검사의학과', '혈액 및 각종 검사 진단', 'ACTIVE', TRUE);

-- 의사
INSERT INTO member (login_id, password, member_name, email, phone, department_no, position, specialty, status, stable) VALUES
('doctor1',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '김영상', 'doctor1@medishare.local',  '010-1000-0001', 1, '전문의', '흉부영상의학', 'ACTIVE', TRUE),
('doctor2',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '박영상', 'doctor2@medishare.local',  '010-1000-0002', 1, '전문의', '근골격영상의학', 'ACTIVE', TRUE),
('doctor3',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '이영상', 'doctor3@medishare.local',  '010-1000-0003', 1, '전문의', '복부영상의학', 'ACTIVE', TRUE),
('doctor4',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '최영상', 'doctor4@medishare.local',  '010-1000-0004', 1, '전공의', '신경두경부영상의학', 'ACTIVE', TRUE),
('doctor5',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '정영상', 'doctor5@medishare.local',  '010-1000-0005', 1, '전공의', '유방영상의학', 'ACTIVE', TRUE),
('doctor6',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '홍내과', 'doctor6@medishare.local',  '010-1000-0006', 2, '전문의', '소화기내과', 'ACTIVE', TRUE),
('doctor7',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '강내과', 'doctor7@medishare.local',  '010-1000-0007', 2, '전문의', '순환기내과', 'ACTIVE', TRUE),
('doctor8',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '조내과', 'doctor8@medishare.local',  '010-1000-0008', 2, '전공의', '내분비내과', 'ACTIVE', TRUE),
('doctor9',  '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '윤외과', 'doctor9@medishare.local',  '010-1000-0009', 3, '전문의', '일반외과', 'ACTIVE', TRUE),
('doctor10', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '장외과', 'doctor10@medishare.local', '010-1000-0010', 3, '전공의', '혈관외과', 'ACTIVE', TRUE),
('doctor11', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '임정형', 'doctor11@medishare.local', '010-1000-0011', 4, '전문의', '척추외과', 'ACTIVE', TRUE),
('doctor12', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '한신경', 'doctor12@medishare.local', '010-1000-0012', 5, '전문의', '뇌혈관질환', 'ACTIVE', TRUE),
('doctor13', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '오신외', 'doctor13@medishare.local', '010-1000-0013', 6, '전문의', '뇌종양', 'ACTIVE', TRUE),
('doctor14', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '서흉부', 'doctor14@medishare.local', '010-1000-0014', 7, '전문의', '심장혈관흉부외과', 'ACTIVE', TRUE),
('doctor15', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '신소아', 'doctor15@medishare.local', '010-1000-0015', 8, '전문의', '소아청소년과', 'ACTIVE', TRUE),
('doctor16', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '권산부', 'doctor16@medishare.local', '010-1000-0016', 9, '전문의', '산과', 'ACTIVE', TRUE),
('doctor17', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '황비뇨', 'doctor17@medishare.local', '010-1000-0017', 10, '전문의', '비뇨기종양', 'ACTIVE', TRUE),
('doctor18', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '안응급', 'doctor18@medishare.local', '010-1000-0018', 15, '전문의', '응급의학', 'ACTIVE', TRUE),
('doctor19', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '류가정', 'doctor19@medishare.local', '010-1000-0019', 17, '전문의', '가정의학', 'ACTIVE', TRUE),
('doctor20', '{bcrypt}$2a$10$r2xMEvG2Nhw0roDDd3OXOeeZQrQcqcMgw1wlIPpxmr8eHWF43oN0i', '문진단', 'doctor20@medishare.local', '010-1000-0020', 20, '전문의', '진단검사의학', 'ACTIVE', TRUE);report
-- Administrator account and the existing role mapping used by JWT/Spring Security.
-- Password: admin1234 (encoded with the configured BCrypt PasswordEncoder)
INSERT INTO role (role_code, role_name, description, stable) VALUES
('ROLE_ADMIN', 'Administrator', 'Medical staff management administrator', TRUE),
('ROLE_USER', 'User', 'Default medical staff role', TRUE)
ON DUPLICATE KEY UPDATE
role_name = VALUES(role_name), description = VALUES(description), stable = VALUES(stable);

-- Only permissions already enforced by application code are seeded here.
INSERT INTO permission (permission_code, permission_name, description, stable) VALUES
('IMAGE_VIEW', 'PACS image view', 'View PACS study lists, details, and thumbnails', TRUE)
ON DUPLICATE KEY UPDATE
permission_name = VALUES(permission_name), description = VALUES(description), stable = VALUES(stable);

-- ROLE_ADMIN bypasses permission checks in PacsAuthorizationService.
-- ROLE_USER receives the currently enforced PACS viewing permission.
INSERT IGNORE INTO role_permission (role_no, permission_no)
SELECT r.no, p.no
FROM role r
JOIN permission p ON p.permission_code = 'IMAGE_VIEW'
WHERE r.role_code = 'ROLE_USER';

INSERT INTO member (login_id, password, member_name, email, phone, status, stable) VALUES
('admin', '{bcrypt}$2a$10$aXzZZ8tWKt9nNdJ9.SDGv.xx38ni5t5zc4Trg.Ws74p9PFoVqml9S', 'Test Administrator', 'admin@medishare.local', '010-0000-0000', 'ACTIVE', TRUE)
ON DUPLICATE KEY UPDATE
password = VALUES(password), member_name = VALUES(member_name), email = VALUES(email),
phone = VALUES(phone), status = VALUES(status), stable = VALUES(stable);

INSERT IGNORE INTO member_roles (member_no, role_no)
SELECT m.no, r.no
FROM member m
JOIN role r ON r.role_code = 'ROLE_ADMIN'
WHERE m.login_id = 'admin';

INSERT IGNORE INTO member_roles (member_no, role_no)
SELECT m.no, r.no
FROM member m
JOIN role r ON r.role_code = 'ROLE_USER'
WHERE m.login_id LIKE 'doctor%';


-- 소견서 임시 데이터
INSERT INTO report (no, study_no, member_no, title, findings, impression, status, write_date, update_date) VALUES
(1, 4, 1, '저선량 흉부 CT 판독 소견 (폐암 선별검사)',
    '양측 폐야에 결절성 병변 관찰되지 않음. 종격동 및 폐문부 림프절 비대 소견 없음.',
    '특이 소견 없음. 정기 검진 권고.', 'FINAL', NOW(), NOW()),
(2, 5, 1, '흉부 CT 혈관조영(CTA) 판독 소견',
    '주폐동맥 및 양측 분지 폐동맥에 급성 혈전색전증 소견 없음. 폐실질 관류 이상 없음.',
    '폐색전증 소견 없음.', 'FINAL', NOW(), NOW()),
(3, 6, 1, '흉부 CT 판독 소견',
    '우상엽에 약 8mm 크기의 결절성 병변 관찰됨. 종격동 림프절 경도 비대 소견.',
    '우상엽 결절, 추적 관찰 또는 조직검사 고려 요망.', 'DRAFT', NOW(), NOW()),
(4, 7, 1, '흉부 CT(고해상도) 판독 소견',
    '양측 폐야에 간질성 폐질환 시사하는 망상형 음영 및 견인성 기관지확장 소견 관찰됨. UIP 양상에 부합.',
    '간질성 폐질환(UIP 양상) 소견.', 'FINAL', NOW(), NOW()),
(5, 9, 1, '흉부 CT 판독 소견 (기흉 평가)',
    '우측 흉막강 내 소량의 기흉 소견 관찰됨. 폐허탈 정도는 경미함.',
    '우측 경도 기흉.', 'FINAL', NOW(), NOW()),
(6, 11, 1, '흉부 CT 판독 소견 (종격동 병변)',
    '전종격동에 경계가 명확한 연부조직 종괴 관찰됨, 크기 약 3.2cm. 흉선종 의심.',
    '전종격동 종괴, 흉선종 의심 - 추가 평가 요망.', 'DRAFT', NOW(), NOW());

-- 환자: 이름, 성별, 생년월일
UPDATE pacs_patient SET patient_name = '오지훈', patient_sex = 'M', patient_birth_date = '19850312' WHERE no = 8;
UPDATE pacs_patient SET patient_name = '백서연', patient_sex = 'F', patient_birth_date = '19921107' WHERE no = 9;
UPDATE pacs_patient SET patient_name = '남궁민', patient_sex = 'M', patient_birth_date = '19770825' WHERE no = 10;
UPDATE pacs_patient SET patient_name = '조은채', patient_sex = 'F', patient_birth_date = '20010419' WHERE no = 11;
UPDATE pacs_patient SET patient_name = '유하람', patient_sex = 'M', patient_birth_date = '19990630' WHERE no = 12;
UPDATE pacs_patient SET patient_name = '임도현', patient_sex = 'F', patient_birth_date = '19681203' WHERE no = 13;

-- 검사: 촬영시간, 검사설명
UPDATE pacs_study SET study_time = '075000', study_description = '흉부 CT (수술 전 평가)' WHERE no = 8;
UPDATE pacs_study SET study_time = '091500', study_description = '흉부 CT (기흉 평가)' WHERE no = 9;
UPDATE pacs_study SET study_time = '110000', study_description = '흉부 CT (늑막삼출 평가)' WHERE no = 10;
UPDATE pacs_study SET study_time = '134000', study_description = '흉부 CT (종격동 병변 평가)' WHERE no = 11;
UPDATE pacs_study SET study_time = '152000', study_description = '흉부 CT (간질성 폐질환 평가)' WHERE no = 12;
UPDATE pacs_study SET study_time = '170500', study_description = '흉부 CT (기관지확장증 평가)' WHERE no = 13;

-- 시리즈: 설명
UPDATE pacs_series SET series_description = 'Chest CT Preop Evaluation' WHERE no = 5;
UPDATE pacs_series SET series_description = 'Chest CT Pneumothorax Eval' WHERE no = 6;
UPDATE pacs_series SET series_description = 'Chest CT Pleural Series' WHERE no = 7;
UPDATE pacs_series SET series_description = 'Chest CT Mediastinal Series' WHERE no = 8;
UPDATE pacs_series SET series_description = 'Chest CT Interstitial Pattern' WHERE no = 9;
UPDATE pacs_series SET series_description = 'Chest CT Airway Series' WHERE no = 10;


-- 협진 요청 데이터
INSERT INTO coop_request (coop_request_id, req_doctor_id, recv_type, recv_doctor_id, recv_dept_id,
accept_doctor_id, pacs_study_id, report_id, origin_request_id, req_content, status, reject_reason,
req_time, resp_time) VALUES
(1, 6, '지정의사', 1, NULL, 1, 4, 1, NULL, '저선량 흉부 CT 선별검사 결과 폐결절 유무 확인 부탁드립니다.',
'수락', NULL, '2026-08-01 09:00:00', '2026-08-01 10:00:00'),
(2, 7, '지정의사', 1, NULL, NULL, 5, NULL, NULL, '폐색전증 의심 환자로 CTA 소견 확인 부탁드립니다.', '거절',
'영상 화질 문제로 재촬영이 필요할 것 같습니다.', '2026-08-02 09:00:00', '2026-08-02 11:00:00'),
(3, 8, '진료과', NULL, 1, 1, 6, NULL, NULL, '종격동 림프절 비대 소견 판독 부탁드립니다.', '수락', NULL,
'2026-08-03 09:00:00', '2026-08-03 13:00:00'),
(4, 9, '지정의사', 1, NULL, NULL, 7, NULL, NULL, '간질성 폐질환 의심 소견 확인 부탁드립니다.', '거절',
'이미 호흡기내과에서 동일 건으로 협진 진행 중입니다.', '2026-08-04 09:00:00', '2026-08-04 15:00:00'),
(5, 10, '진료과', NULL, 1, NULL, 8, NULL, NULL, '수술 전 흉부 CT 소견 확인 부탁드립니다.', '요청', NULL,
'2026-08-05 09:00:00', NULL),
(6, 11, '지정의사', 18, NULL, 18, 9, NULL, NULL, '외상 후 기흉 소견 있어 응급의학과 협진 요청드립니다.',
'수락', NULL, '2026-08-06 09:00:00', '2026-08-06 09:30:00'),
(7, 15, '진료과', NULL, 1, NULL, 10, NULL, NULL, '소아 환자 늑막삼출 흉부 CT 소견 확인 부탁드립니다.',
'만료', NULL, '2026-08-07 09:00:00', NULL),
(8, 1, '지정의사', 14, NULL, 14, 11, 6, NULL, '종격동 병변 소견상 외과적 평가 필요해 보여 협진 요청드립니다.',
'수락', NULL, '2026-08-08 09:00:00', '2026-08-08 14:00:00'),
(9, 16, '지정의사', 1, NULL, NULL, 12, NULL, NULL,
'임신 중 호흡곤란으로 촬영한 흉부 CT 소견 확인 부탁드립니다.', '요청', NULL, '2026-08-09 09:00:00', NULL),
(10, 19, '진료과', NULL, 1, 1, 13, NULL, NULL,
'만성 기침 환자 기관지확장증 의심되어 흉부 CT 판독 확인 부탁드립니다.', '수락', NULL,
'2026-08-10 09:00:00', '2026-08-10 10:00:00'),
(11, 17, '지정의사', 1, NULL, NULL, 4, NULL, NULL, '촬영 오류로 재협진 필요할 것 같아 요청드립니다.',
'취소', NULL, '2026-08-11 09:00:00', NULL),
(12, 7, '지정의사', 1, NULL, NULL, 5, 2, 2,
 '폐동맥 CT 혈관조영 재촬영본입니다. 폐색전증 소견 확인 부탁드립니다.', '요청', NULL,
 '2026-08-12 09:00:00',NULL),
(13, 18, '진료과', NULL, 1, NULL, 6, NULL, NULL, '기존 판독 소견 재확인 부탁드립니다.', '거절',
'진료과 소속 의사 전원 거절 (개별 사유는 거절기록 참조)', '2026-08-13 09:00:00', '2026-08-13 16:00:00'),
(14, 20, '진료과', NULL, 1, NULL, 7, NULL, NULL,
 '고해상도 흉부 CT 소견 재확인 부탁드립니다.', '요청', NULL, '2026-08-14 09:00:00', NULL),
(15, 6, '지정의사', 2, NULL, NULL, 8, NULL, NULL, '수술 전 평가 흉부 CT 소견 확인 부탁드립니다.',
'만료', NULL, '2026-08-15 09:00:00', NULL),
(16, 9, '지정의사', 3, NULL, 3, 9, NULL, NULL,
'복부 침범 여부 확인을 위해 흉부-복부 경계 CT 소견 확인 부탁드립니다.', '수락', NULL,
'2026-08-16 09:00:00', '2026-08-16 11:00:00');