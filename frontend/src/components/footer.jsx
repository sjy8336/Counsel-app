import React from 'react';
import '../static/common.css'

export default function Footer() {
    return (
        <footer className="footer-container">
        <div className="footer-inner">
            <div className="footer-grid">
            <div className="footer-brand">
                <h2 className="footer-logo">MINDWELL</h2>
                <p className="footer-desc">마인드웰은 AI기술을 활용하여 당신의 마음 건강을 진단하고, 가장 적합한 심리전문가를 연결해드리는 멘탈 웰니스 플랫폼 입니다.</p>

            </div>
            <div className="footer-links">
                <h4>서비스</h4>
                <ul>
                <li>전문가 매칭</li><li>AI 감정 일기</li><li>심리 검사</li>
                </ul>
            </div>
            <div className="footer-links">
                <h4>고객지원</h4>
                <ul>
                <li>자주 묻는 질문</li><li>공지사항</li><li>1:1 문의</li>
                </ul>
            </div>
            <div className="footer-links">
                <h4>법적 고지</h4>
                <ul>
                <li className="bold">개인정보처리방침</li><li>이용약관</li>
                </ul>
            </div>
            </div>
            <div className="footer-bottom">
            © 2026 MINDWELL LAB. All rights reserved.
            </div>
        </div>
        </footer>
    );
}