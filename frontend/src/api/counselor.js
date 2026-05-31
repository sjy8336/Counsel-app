import axiosInstance from './axiosInstance';

// 상담사 프로필 등록
export const registerCounselorProfile = async (data, token) => {
    const res = await axiosInstance.post('/counselor/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 상담사 프로필 조회
export const getCounselorProfile = async (token) => {
    const res = await axiosInstance.get('/counselor/profile', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 상담사 프로필 수정
export const updateCounselorProfile = async (data, token) => {
    const res = await axiosInstance.put('/counselor/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 전문분야 등록
export const registerSpecialty = async (data, token) => {
    const res = await axiosInstance.post('/counselor/specialty', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 전문분야 조회
export const getSpecialty = async (token) => {
    const res = await axiosInstance.get('/counselor/specialty', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 전문분야 수정
export const updateSpecialty = async (data, token) => {
    const res = await axiosInstance.put('/counselor/specialty', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 자격증 등록
export const registerCertificate = async (data, token) => {
    const res = await axiosInstance.post('/counselor/certificate', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 자격증 조회
export const getCertificates = async (token) => {
    const res = await axiosInstance.get('/counselor/certificate', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 자격증 수정
export const updateCertificate = async (data, token) => {
    const res = await axiosInstance.put('/counselor/certificate', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 학력 등록
export const registerEducation = async (data, token) => {
    const res = await axiosInstance.post('/counselor/education', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 학력 조회
export const getEducations = async (token) => {
    const res = await axiosInstance.get('/counselor/education', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 학력 수정
export const updateEducation = async (data, token) => {
    const res = await axiosInstance.put('/counselor/education', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 경력 등록
export const registerExperience = async (data, token) => {
    const res = await axiosInstance.post('/counselor/experience', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 경력 조회
export const getExperiences = async (token) => {
    const res = await axiosInstance.get('/counselor/experience', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 경력 수정
export const updateExperience = async (data, token) => {
    const res = await axiosInstance.put('/counselor/experience', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 스케줄 등록
export const registerSchedule = async (data, token) => {
    const res = await axiosInstance.post('/counselor/schedule', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 스케줄 조회
export const getSchedules = async (token) => {
    const res = await axiosInstance.get('/counselor/schedule', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 스케줄 수정
export const updateSchedule = async (data, token) => {
    const res = await axiosInstance.put('/counselor/schedule', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
