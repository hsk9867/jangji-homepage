# 배웅 v4 투톤 일러스트 아이콘 (48x48). 색: 짙은 초록 G1, 중간 초록 G2, 연한 초록 G3, 금색 GD, 크림 CR
G1, G2, G3, GD, CR, W = "#2B3D2D", "#4A6B52", "#C9D8CB", "#B19769", "#F5F1E8", "#FFFFFF"
ICONS = {
    # 수목장: 둥근 수관 세 겹 + 금빛 해
    "tree": f'''<circle cx="36" cy="11" r="5" fill="{GD}"/><ellipse cx="24" cy="41" rx="15" ry="3.5" fill="{G3}"/><rect x="21.5" y="28" width="5" height="12" rx="2" fill="{G1}"/><circle cx="24" cy="17" r="9" fill="{G2}"/><circle cx="16.5" cy="23" r="6.5" fill="{G1}"/><circle cx="31.5" cy="23" r="6.5" fill="{G1}"/><circle cx="24" cy="24" r="7" fill="{G2}"/>''',
    # 봉안당: 지붕 + 기둥 + 금빛 아치문
    "hall": f'''<ellipse cx="24" cy="42" rx="17" ry="3" fill="{G3}"/><path d="M8 19 24 8l16 11z" fill="{G1}"/><rect x="9" y="19" width="30" height="4" rx="1" fill="{G2}"/><rect x="10" y="23" width="28" height="16" fill="{CR}"/><rect x="12.5" y="25" width="4" height="14" rx="1.2" fill="{G2}"/><rect x="31.5" y="25" width="4" height="14" rx="1.2" fill="{G2}"/><path d="M19.5 39v-8.5a4.5 4.5 0 0 1 9 0V39z" fill="{GD}"/><rect x="8" y="38" width="32" height="3" rx="1" fill="{G1}"/>''',
    # 매장묘: 둥근 비석 + 잔디 봉분 + 금빛 꽃
    "tomb": f'''<ellipse cx="24" cy="39" rx="17" ry="5" fill="{G3}"/><path d="M15 36V18a9 9 0 0 1 18 0v18z" fill="{G2}"/><path d="M18 36V18.5a6 6 0 0 1 12 0V36z" fill="{G1}"/><rect x="21" y="22" width="6" height="1.8" rx=".9" fill="{CR}"/><rect x="21" y="26" width="6" height="1.8" rx=".9" fill="{CR}"/><circle cx="37" cy="31" r="3" fill="{GD}"/><rect x="36.2" y="33" width="1.6" height="6" rx=".8" fill="{G2}"/><circle cx="10.5" cy="33" r="2.4" fill="{GD}"/><rect x="9.8" y="34.5" width="1.4" height="4.5" rx=".7" fill="{G2}"/>''',
    # 화장장 예약: 달력 + 금빛 체크
    "calendar": f'''<rect x="8" y="11" width="32" height="30" rx="4" fill="{CR}"/><path d="M8 15a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v6H8z" fill="{G1}"/><rect x="14" y="7" width="3.5" height="8" rx="1.75" fill="{G2}"/><rect x="30.5" y="7" width="3.5" height="8" rx="1.75" fill="{G2}"/><rect x="12" y="25" width="5" height="4" rx="1" fill="{G3}"/><rect x="21.5" y="25" width="5" height="4" rx="1" fill="{G3}"/><rect x="12" y="32" width="5" height="4" rx="1" fill="{G3}"/><path d="M22 34l4.5 4.5L35 29" fill="none" stroke="{GD}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>''',
    # 장례지원금: 카드 + 금화
    "support": f'''<rect x="6" y="13" width="30" height="21" rx="4" fill="{G1}"/><rect x="6" y="18" width="30" height="4" fill="{G2}"/><rect x="10" y="26" width="9" height="3" rx="1.5" fill="{CR}"/><circle cx="36" cy="32" r="8.5" fill="{GD}"/><circle cx="36" cy="32" r="5.5" fill="none" stroke="{CR}" stroke-width="1.6"/><path d="M33.5 29.5h5M33.5 32h5" stroke="{CR}" stroke-width="1.4" stroke-linecap="round"/>''',
    # 파묘/이장: 두 지점을 잇는 금빛 길 (로고의 길 모티프)
    "ijang": f'''<ellipse cx="24" cy="41" rx="17" ry="3" fill="{G3}"/><path d="M11 36c8-2 6-12 14-14s8-8 14-10" fill="none" stroke="{GD}" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4"/><path d="M11 30s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" fill="{G2}"/><circle cx="11" cy="20" r="2.3" fill="{CR}"/><path d="M37 24s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" fill="{G1}"/><circle cx="37" cy="14" r="2.3" fill="{GD}"/>''',
    # 이용안내 1: 전화
    "phone": f'''<circle cx="24" cy="24" r="20" fill="{G3}"/><g transform="translate(0.5,-1.5)"><path d="M18.3 15.5l3.2 5.2a2 2 0 0 1-.4 2.6l-1.6 1.4a14 14 0 0 0 6.2 6.2l1.4-1.6a2 2 0 0 1 2.6-.4l5.2 3.2a2 2 0 0 1 .6 2.8l-1.4 2.1a4 4 0 0 1-4.3 1.6C22 36.8 14.2 29 12.4 21.2a4 4 0 0 1 1.6-4.3l2.1-1.4a2 2 0 0 1 2.2 0z" fill="{G1}"/></g><circle cx="32.5" cy="15.5" r="2.8" fill="{GD}"/>''',
    # 이용안내 2: 저울(비교)
    "compare": f'''<circle cx="24" cy="24" r="20" fill="{G3}"/><rect x="23" y="12" width="2" height="22" rx="1" fill="{G1}"/><rect x="17" y="34" width="14" height="2.5" rx="1.25" fill="{G1}"/><rect x="12" y="15" width="24" height="2" rx="1" fill="{G1}"/><path d="M9 24l4.5-8 4.5 8a4.5 4.5 0 0 1-9 0z" fill="{G2}"/><path d="M30 24l4.5-8 4.5 8a4.5 4.5 0 0 1-9 0z" fill="{GD}"/><circle cx="24" cy="12" r="2.2" fill="{GD}"/>''',
    # 이용안내 3: 동행 답사 (두 사람 + 길)
    "walk": f'''<circle cx="24" cy="24" r="20" fill="{G3}"/><path d="M12 36c6-4 9-4 13-8s7-5 11-5" fill="none" stroke="{GD}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 3.5"/><circle cx="19" cy="14.5" r="3.2" fill="{G1}"/><path d="M15 29v-7a4 4 0 0 1 8 0v7z" fill="{G1}"/><circle cx="29" cy="16" r="2.7" fill="{G2}"/><path d="M25.5 29v-6a3.5 3.5 0 0 1 7 0v6z" fill="{G2}"/>''',
    # 이용안내 4: 계약서 + 금빛 인장
    "contract": f'''<circle cx="24" cy="24" r="20" fill="{G3}"/><path d="M16 11h11l6 6v20H16z" fill="{CR}"/><path d="M27 11v6h6z" fill="{G2}"/><rect x="19" y="21" width="11" height="2" rx="1" fill="{G2}"/><rect x="19" y="25.5" width="11" height="2" rx="1" fill="{G2}"/><rect x="19" y="30" width="6" height="2" rx="1" fill="{G2}"/><circle cx="30" cy="32" r="4.2" fill="{GD}"/><circle cx="30" cy="32" r="1.8" fill="none" stroke="{CR}" stroke-width="1.2"/>''',
}
SVG = {k: '<svg viewBox="0 0 48 48" aria-hidden="true">' + v + '</svg>' for k, v in ICONS.items()}
if __name__ == "__main__":
    html = '<!doctype html><meta charset="utf-8"><body style="background:#fff;font-family:sans-serif;padding:30px;display:flex;flex-wrap:wrap;gap:26px">' + "".join(
        f'<div style="text-align:center"><div style="width:84px;height:84px;border-radius:24px;background:#F3F3F3;display:grid;place-items:center"><div style="width:52px;height:52px">{v}</div></div><div style="font-size:12px;margin-top:8px">{k}</div></div>' for k, v in SVG.items()) + '</body>'
    open("C:/Users/홍아름/AppData/Local/Temp/claude/C--Users----/9582b378-7121-4878-849b-ae6132bca047/scratchpad/icons_preview.html", "w", encoding="utf-8").write(html)
    print("preview written")
