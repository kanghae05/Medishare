package com.medishare.api.member.service;

import com.medishare.api.member.vo.MemberMyPageVO;
import com.medishare.api.member.vo.MemberUpdateVO;
import com.medishare.api.member.vo.PasswordChangeVO;

public interface MemberMyPageService {
    MemberMyPageVO view(String loginId);
    MemberMyPageVO update(String loginId, MemberUpdateVO request);
    void changePassword(String loginId, PasswordChangeVO request);
}
