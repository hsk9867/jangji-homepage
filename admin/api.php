<?php
/* 장지상담 홈페이지 관리자 API (카페24 웹호스팅 PHP 7.2 이상)
   - admin.html 이 호출합니다. 콘텐츠는 data/content.json 과 data/content.js 에 저장됩니다.
   - 사진은 uploads/연월/ 폴더에 저장됩니다.
   - 고객 문의는 admin/store/inquiries.json 에 저장됩니다 (.htaccess 로 외부 접근 차단).
   - 비밀번호 해시는 admin/auth.php 에 저장됩니다. 없으면 관리자 페이지에서 처음 한 번 설정합니다. */
declare(strict_types=1);

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'secure' => $secure, 'samesite' => 'Lax']);
} else {
    session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true);
}
session_name('JANGJIADMIN');
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$root      = dirname(__DIR__);
$authFile  = __DIR__ . '/auth.php';
$lockFile  = __DIR__ . '/.lock.json';
$jsonFile  = $root . '/data/content.json';
$jsFile    = $root . '/data/content.js';
$storeDir  = __DIR__ . '/store';
$inqFile   = $storeDir . '/inquiries.json';
$uploadDir = $root . '/uploads';

function out(array $a): void { echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fail(string $err, string $msg = ''): void { out(['ok' => false, 'error' => $err, 'message' => $msg]); }
function rawBody(int $max): string {
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > $max) fail('too_large', '요청이 너무 큽니다.');
    return $raw;
}
function body(int $max = 4194304): array { $j = json_decode(rawBody($max), true); return is_array($j) ? $j : []; }
function cleanStr($v, int $max = 300): string { return mb_substr(trim((string)preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string)$v)), 0, $max); }
function writeAtomic(string $path, string $content): bool {
    $dir = dirname($path);
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) return false;
    $tmp = $path . '.tmp' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $content, LOCK_EX) === false) return false;
    if (!@rename($tmp, $path)) { @unlink($tmp); return false; }
    return true;
}
function readList(string $file): array {
    if (!is_file($file)) return [];
    $d = json_decode((string)@file_get_contents($file), true);
    return is_array($d) ? $d : [];
}
function writeList(string $file, array $list): bool {
    $json = json_encode(array_values($list), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return $json !== false && writeAtomic($file, $json . "\n");
}
function ensureStore(string $dir): void {
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('write', 'admin/store 폴더를 만들 수 없습니다. FTP에서 admin 폴더 권한을 707로 바꿔 주세요.');
    if (!is_file($dir . '/.htaccess')) @file_put_contents($dir . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
}
function authData(string $file): ?array { if (!is_file($file)) return null; $d = include $file; return is_array($d) ? $d : null; }
function verifyPw(array $auth, string $pw): bool {
    if (isset($auth['sha256'], $auth['hash'])) return hash_equals((string)$auth['hash'], hash('sha256', $auth['sha256'] . $pw));
    if (isset($auth['hash'])) return password_verify($pw, (string)$auth['hash']);
    return false;
}
function saveAuth(string $file, string $pw): bool {
    $hash = password_hash($pw, PASSWORD_DEFAULT);
    return writeAtomic($file, "<?php\n// 관리자 비밀번호 해시. 잊었으면 이 파일을 지우고 관리자 페이지에서 다시 설정합니다.\nreturn ['hash' => " . var_export($hash, true) . "];\n");
}
function lockState(string $file): array {
    $d = is_file($file) ? json_decode((string)@file_get_contents($file), true) : null;
    return is_array($d) ? $d + ['fails' => 0, 'until' => 0] : ['fails' => 0, 'until' => 0];
}
function siteConfig(string $jsonFile): array {
    $c = is_file($jsonFile) ? json_decode((string)file_get_contents($jsonFile), true) : null;
    return is_array($c) ? $c : [];
}
/* 사진 경로는 uploads/ 아래 파일이나 img/ 기본 이미지만 허용 */
function cleanPath($p): string {
    $p = cleanStr($p, 200);
    return preg_match('#^(uploads/\d{6}/[a-f0-9]{16,40}\.(jpg|png|webp)|img/[a-z0-9_.-]+\.(svg|png|jpg|webp))$#', $p) ? $p : '';
}
function cleanItem(array $x, array $strFields, int $long = 3000): array {
    $o = [];
    foreach ($strFields as $k) if (isset($x[$k])) $o[$k] = cleanStr($x[$k], in_array($k, ['body', 'comment', 'desc'], true) ? $long : 300);
    return $o;
}
function sanitizeContent(array $c): array {
    $out = [];
    if (isset($c['site']) && is_array($c['site'])) {
        $s = $c['site']; $o = [];
        foreach (['name','slogan','phone','hours','kakao','notifyEmail','bizName','ceo','bizNo','address','email','heroTitle','heroSub','finalTitle'] as $k) if (isset($s[$k])) $o[$k] = cleanStr($s[$k], 400);
        foreach (['logo','heroImage'] as $k) if (isset($s[$k])) $o[$k] = cleanPath($s[$k]);
        if (isset($o['kakao']) && $o['kakao'] !== '' && !preg_match('#^https://#', $o['kakao'])) $o['kakao'] = '';
        foreach (['heroBadges','regions'] as $k) if (isset($s[$k]) && is_array($s[$k])) $o[$k] = array_values(array_filter(array_map(function ($v) { return cleanStr($v, 60); }, array_slice($s[$k], 0, 30)), 'strlen'));
        foreach (['why','steps'] as $k) if (isset($s[$k]) && is_array($s[$k])) {
            $o[$k] = [];
            foreach (array_slice($s[$k], 0, 10) as $r) if (is_array($r)) $o[$k][] = ['t' => cleanStr($r['t'] ?? '', 80), 'd' => cleanStr($r['d'] ?? '', 300)];
        }
        $out['site'] = $o;
    }
    if (isset($c['types']) && is_array($c['types'])) {
        $out['types'] = [];
        foreach (['sumok','napgol','maejang','ijang'] as $key) {
            if (!isset($c['types'][$key]) || !is_array($c['types'][$key])) continue;
            $t = $c['types'][$key];
            $o = cleanItem($t, ['short','desc','price','priceNote']);
            if (isset($t['image'])) $o['image'] = cleanPath($t['image']);
            foreach (['pros','cons','recommend','reasons'] as $k) if (isset($t[$k]) && is_array($t[$k])) $o[$k] = array_values(array_filter(array_map(function ($v) { return cleanStr($v, 200); }, array_slice($t[$k], 0, 20)), 'strlen'));
            if (isset($t['faqs']) && is_array($t['faqs'])) { $o['faqs'] = []; foreach (array_slice($t['faqs'], 0, 30) as $f) if (is_array($f)) $o['faqs'][] = ['q' => cleanStr($f['q'] ?? '', 200), 'a' => cleanStr($f['a'] ?? '', 1500)]; }
            if (isset($t['steps']) && is_array($t['steps'])) { $o['steps'] = []; foreach (array_slice($t['steps'], 0, 12) as $r) if (is_array($r)) $o['steps'][] = ['t' => cleanStr($r['t'] ?? '', 80), 'd' => cleanStr($r['d'] ?? '', 300)]; }
            $out['types'][$key] = $o;
        }
    }
    foreach (['facilities' => ['id','type','name','area','address','operator','price','comment'], 'reviews' => ['id','type','title','author','date','facilityId','body']] as $listKey => $fields) {
        if (!isset($c[$listKey]) || !is_array($c[$listKey])) continue;
        $out[$listKey] = [];
        foreach (array_slice($c[$listKey], 0, 1000) as $x) {
            if (!is_array($x)) continue;
            $o = cleanItem($x, $fields, 5000);
            if (($o['id'] ?? '') === '' || !preg_match('/^[a-zA-Z0-9_-]{1,40}$/', $o['id'])) $o['id'] = substr($listKey, 0, 1) . '-' . bin2hex(random_bytes(4));
            if (!in_array($o['type'] ?? '', ['sumok','napgol','maejang','ijang'], true)) $o['type'] = 'sumok';
            $o['photos'] = [];
            foreach (array_slice(is_array($x['photos'] ?? null) ? $x['photos'] : [], 0, 30) as $p) { $p = cleanPath($p); if ($p !== '') $o['photos'][] = $p; }
            if ($listKey === 'facilities') $o['tags'] = array_values(array_filter(array_map(function ($v) { return cleanStr($v, 30); }, array_slice(is_array($x['tags'] ?? null) ? $x['tags'] : [], 0, 10)), 'strlen'));
            $o['featured'] = !empty($x['featured']);
            $o['visible'] = !isset($x['visible']) || !empty($x['visible']);
            if (!empty($x['sample'])) $o['sample'] = true;
            $out[$listKey][] = $o;
        }
    }
    return $out;
}

$action = isset($_GET['action']) ? (string)$_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'JANGJI')) fail('bad_request');
if ($method !== 'GET' && $method !== 'POST') fail('bad_request');

$hasPw  = is_file($authFile);
$logged = !empty($_SESSION['jangji_admin']);

switch ($action) {
    case 'status':
        $writable = is_writable(dirname($jsFile)) && (!is_file($jsFile) || is_writable($jsFile));
        out(['ok' => true, 'server' => true, 'hasPassword' => $hasPw, 'loggedIn' => $logged, 'writable' => $writable, 'uploadsWritable' => is_dir($uploadDir) && is_writable($uploadDir), 'php' => PHP_VERSION]);

    case 'setup':
        if ($method !== 'POST') fail('bad_request');
        if ($hasPw) fail('already_set');
        $pw = (string)(body()['password'] ?? '');
        if (strlen($pw) < 8) fail('short', '8자 이상이어야 합니다.');
        if (!saveAuth($authFile, $pw)) fail('write', 'admin 폴더에 쓸 수 없습니다. FTP에서 admin 폴더 권한을 707로 바꿔 주세요.');
        session_regenerate_id(true); $_SESSION['jangji_admin'] = true;
        out(['ok' => true]);

    case 'login':
        if ($method !== 'POST') fail('bad_request');
        if (!$hasPw) fail('no_password');
        $lock = lockState($lockFile);
        if ($lock['until'] > time()) fail('locked', '로그인 시도가 많아 15분간 잠겼습니다.');
        $auth = authData($authFile);
        $pw = (string)(body()['password'] ?? '');
        if ($auth && verifyPw($auth, $pw)) {
            @unlink($lockFile);
            session_regenerate_id(true); $_SESSION['jangji_admin'] = true;
            out(['ok' => true]);
        }
        $lock['fails']++;
        if ($lock['fails'] >= 8) { $lock['fails'] = 0; $lock['until'] = time() + 15 * 60; }
        @file_put_contents($lockFile, json_encode($lock), LOCK_EX);
        sleep(1);
        fail('wrong', '비밀번호가 맞지 않습니다.');

    case 'logout':
        $_SESSION = []; session_destroy();
        out(['ok' => true]);

    case 'password':
        if ($method !== 'POST') fail('bad_request');
        if (!$logged) fail('auth');
        $b = body(); $auth = authData($authFile);
        if (!$auth || !verifyPw($auth, (string)($b['current'] ?? ''))) fail('wrong', '현재 비밀번호가 맞지 않습니다.');
        $nw = (string)($b['password'] ?? '');
        if (strlen($nw) < 8) fail('short', '8자 이상이어야 합니다.');
        if (!saveAuth($authFile, $nw)) fail('write');
        out(['ok' => true]);

    /* ---------- 고객 문의 접수 (로그인 불필요) ---------- */
    case 'inquiry':
        if ($method !== 'POST') fail('bad_request');
        $b = json_decode(rawBody(20 * 1024), true);
        $in = is_array($b) && is_array($b['inquiry'] ?? null) ? $b['inquiry'] : null;
        if (!$in) fail('bad_record');
        $rec = [];
        foreach (['type','region','when','name','phone','facility','page'] as $k) $rec[$k] = cleanStr($in[$k] ?? '', 120);
        $rec['memo'] = cleanStr($in['memo'] ?? '', 2000);
        if ($rec['name'] === '' || strlen(preg_replace('/[^0-9]/', '', $rec['phone'])) < 9) fail('bad_record', '이름과 연락처를 확인해 주세요.');
        ensureStore($storeDir);
        $ipHash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|jangji'), 0, 16);
        $fp = fopen($inqFile . '.lock', 'c'); if ($fp) flock($fp, LOCK_EX);
        $list = readList($inqFile);
        $since = time() - 3600; $n = 0;
        foreach ($list as $r) if (($r['ipHash'] ?? '') === $ipHash && strtotime($r['receivedAt'] ?? '1970-01-01') >= $since) $n++;
        if ($n >= 10) { if ($fp) { flock($fp, LOCK_UN); fclose($fp); } fail('rate_limited', '접수가 너무 잦습니다. 전화로 문의해 주세요.'); }
        $rec['id'] = 'Q' . strtoupper(base_convert((string)time(), 10, 36)) . substr(bin2hex(random_bytes(2)), 0, 3);
        $rec['receivedAt'] = gmdate('c');
        $rec['status'] = '신규';
        $rec['ipHash'] = $ipHash;
        array_unshift($list, $rec);
        if (count($list) > 3000) $list = array_slice($list, 0, 3000);
        $ok = writeList($inqFile, $list);
        if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
        if (!$ok) fail('write', '접수 파일을 쓸 수 없습니다.');
        /* 알림 메일 (관리자 > 기본 정보 > 알림 받을 이메일). 실패해도 접수는 유지 */
        $site = siteConfig($jsonFile)['site'] ?? [];
        $to = (string)($site['notifyEmail'] ?? '');
        if ($to !== '' && filter_var($to, FILTER_VALIDATE_EMAIL) && function_exists('mail')) {
            $siteName = (string)($site['name'] ?? '홈페이지');
            $subject = '=?UTF-8?B?' . base64_encode('[' . $siteName . '] 새 상담 문의 - ' . $rec['name'] . ' (' . $rec['type'] . ')') . '?=';
            $text = "새 상담 문의가 접수되었습니다.\n\n이름: {$rec['name']}\n연락처: {$rec['phone']}\n장지 유형: {$rec['type']}\n희망 지역: {$rec['region']}\n시기: {$rec['when']}\n관심 시설: {$rec['facility']}\n문의 내용: {$rec['memo']}\n\n접수 시각: " . date('Y-m-d H:i') . "\n관리자 페이지에서 확인하세요.";
            $host = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
            $headers = "From: =?UTF-8?B?" . base64_encode($siteName) . "?= <no-reply@{$host}>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64";
            @mail($to, $subject, chunk_split(base64_encode($text)), $headers);
        }
        out(['ok' => true, 'id' => $rec['id']]);

    /* ---------- 관리자: 문의 목록 ---------- */
    case 'inbox':
        if (!$logged) fail('auth');
        $l = readList($inqFile);
        foreach ($l as &$r) unset($r['ipHash']);
        out(['ok' => true, 'inquiries' => $l, 'now' => gmdate('c')]);

    case 'inbox_update':
        if ($method !== 'POST') fail('bad_request');
        if (!$logged) fail('auth');
        $b = body();
        $id = cleanStr($b['id'] ?? '', 40); if ($id === '') fail('bad_request');
        $fp = fopen($inqFile . '.lock', 'c'); if ($fp) flock($fp, LOCK_EX);
        $list = readList($inqFile); $found = false;
        foreach ($list as $i => $r) {
            if (($r['id'] ?? '') !== $id) continue;
            $found = true;
            if (!empty($b['delete'])) { unset($list[$i]); break; }
            if (isset($b['status'])) $list[$i]['status'] = cleanStr($b['status'], 40);
            if (isset($b['note'])) $list[$i]['adminNote'] = cleanStr($b['note'], 1000);
            $list[$i]['updatedAt'] = gmdate('c');
            break;
        }
        $ok = $found ? writeList($inqFile, $list) : false;
        if ($fp) { flock($fp, LOCK_UN); fclose($fp); }
        if (!$found) fail('not_found');
        if (!$ok) fail('write');
        out(['ok' => true]);

    /* ---------- 관리자: 사진 업로드 (브라우저에서 줄인 JPEG/PNG/WebP, data URL) ---------- */
    case 'upload':
        if ($method !== 'POST') fail('bad_request');
        if (!$logged) fail('auth');
        $b = body(12 * 1024 * 1024);
        $data = (string)($b['data'] ?? '');
        if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $data, $m)) fail('bad_image', 'JPG, PNG, WebP 사진만 올릴 수 있습니다.');
        $bin = base64_decode($m[2], true);
        if ($bin === false || strlen($bin) > 8 * 1024 * 1024) fail('bad_image', '사진이 너무 큽니다.');
        $info = @getimagesizefromstring($bin);
        $mimeExt = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!$info || !isset($mimeExt[$info['mime']])) fail('bad_image', '사진 파일이 아닙니다.');
        $sub = gmdate('Ym');
        $dir = $uploadDir . '/' . $sub;
        if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('write', 'uploads 폴더에 쓸 수 없습니다. FTP에서 uploads 폴더 권한을 707로 바꿔 주세요.');
        $name = bin2hex(random_bytes(10)) . '.' . $mimeExt[$info['mime']];
        if (@file_put_contents($dir . '/' . $name, $bin, LOCK_EX) === false) fail('write', 'uploads 폴더에 쓸 수 없습니다.');
        out(['ok' => true, 'path' => 'uploads/' . $sub . '/' . $name, 'width' => $info[0], 'height' => $info[1]]);

    /* ---------- 관리자: 콘텐츠 읽기·저장 ---------- */
    case 'load':
        if (!$logged) fail('auth');
        out(['ok' => true, 'content' => siteConfig($jsonFile)]);

    case 'save':
        if ($method !== 'POST') fail('bad_request');
        if (!$logged) fail('auth');
        $c = body()['content'] ?? null;
        if (!is_array($c)) fail('bad_config', '저장 형식이 올바르지 않습니다.');
        $c = sanitizeContent($c);
        $c['savedAt'] = gmdate('c');
        $json = json_encode($c, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_PRETTY_PRINT);
        if ($json === false) fail('encode', json_last_error_msg());
        if (!writeAtomic($jsonFile, $json . "\n") || !writeAtomic($jsFile, "window.SITE_CONTENT = " . $json . ";\n")) {
            fail('write', 'data 폴더에 쓸 수 없습니다. FTP에서 data 폴더 권한을 707로 바꿔 주세요.');
        }
        out(['ok' => true, 'savedAt' => $c['savedAt'], 'content' => $c]);

    default:
        fail('unknown_action');
}
