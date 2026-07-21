-- 0005의 리터럴 \n(백슬래시+n)을 실제 줄바꿈으로 교정
UPDATE posts
SET body = replace(body, char(92) || char(110), char(10))
WHERE instr(body, char(92) || char(110)) > 0;
