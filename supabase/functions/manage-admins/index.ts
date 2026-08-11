// supabase/functions/manage-admins/index.ts
// Edge Function สำหรับจัดการบัญชีแอดมิน CMS (CRUD) — ต้องรันผ่าน service_role key เท่านั้น
// เพราะ supabase.auth.admin.* (createUser/listUsers/updateUserById/deleteUser) ใช้ anon/authenticated
// key จากฝั่ง client ไม่ได้เลย ต้องมี service_role ซึ่งห้ามฝังในโค้ดฝั่ง client เด็ดขาด — ฟังก์ชันนี้จึงเป็น
// ตัวกลางเดียวที่แตะ service_role ได้ ตรวจสอบ JWT ของผู้เรียกก่อนทุกครั้งว่า login เข้า CMS อยู่จริง
// ก่อนอนุญาตให้ดำเนินการ (ระบบนี้ยังไม่มี role/สิทธิ์แยกชั้น — แอดมินที่ login สำเร็จถือว่าจัดการแอดมินคนอื่น
// ได้ทั้งหมด เหมือน pattern เดิมของทั้งระบบ CMS นี้)
//
// วิธี deploy (ทำเองนอกโค้ดนี้ ผ่าน Supabase CLI หรือ Dashboard > Edge Functions):
//   supabase functions deploy manage-admins
// ไม่ต้องตั้ง secret เพิ่มเอง — SUPABASE_URL/SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY ถูก inject ให้
// อัตโนมัติทุก Edge Function อยู่แล้วโดย Supabase

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// สุ่มรหัสผ่านเริ่มต้น 14 ตัวอักษร (ตัวใหญ่/เล็ก/ตัวเลข/สัญลักษณ์ อย่างละอย่างน้อย 1 ตัว) ให้แอดมินคนใหม่
// ใช้ login ครั้งแรกได้ทันที — แอดมินที่สร้างต้องคัดลอกไปส่งต่อเอง (ไม่แสดงซ้ำอีกหลังจากนี้)
function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;

  function pick(chars: string) {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  var out = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (var i = out.length; i < 14; i++) out.push(pick(all));
  // สลับตำแหน่งให้ไม่ได้เรียงตามหมวดเสมอ
  for (var j = out.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = out[j];
    out[j] = out[k];
    out[k] = tmp;
  }
  return out.join('');
}

function sanitizeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    display_name: (u.user_metadata && u.user_metadata.display_name) || '',
    must_set_password: !!(u.user_metadata && u.user_metadata.must_set_password),
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return jsonResponse({ error: 'ไม่พบ session — กรุณา login ใหม่' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // ยืนยันตัวตนผู้เรียกด้วย anon client + token ของ session ปัจจุบัน (ไม่ใช่ service_role)
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData.user) {
    return jsonResponse({ error: 'session ไม่ถูกต้องหรือหมดอายุ — กรุณา login ใหม่' }, 401);
  }
  const callerId = callerData.user.id;

  const admin = createClient(supabaseUrl, serviceRoleKey);

  let payload: any = {};
  try {
    payload = await req.json();
  } catch (_e) {
    return jsonResponse({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, 400);
  }

  const action = payload.action;

  try {
    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
      if (error) throw error;
      const users = (data.users || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(sanitizeUser);
      return jsonResponse({ users: users, currentUserId: callerId });
    }

    if (action === 'create') {
      const email = String(payload.email || '').trim().toLowerCase();
      const displayName = String(payload.display_name || '').trim();
      if (!email) return jsonResponse({ error: 'กรุณากรอกอีเมล' }, 400);

      const password = generatePassword();
      const { data, error } = await admin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // ยืนยันอีเมลให้อัตโนมัติ ทำให้ login ได้ทันทีโดยไม่ต้องกดยืนยันอีเมล
        user_metadata: { display_name: displayName, must_set_password: true },
      });
      if (error) throw error;

      return jsonResponse({ user: sanitizeUser(data.user), password: password });
    }

    if (action === 'update') {
      const id = payload.id;
      if (!id) return jsonResponse({ error: 'ไม่พบรหัสแอดมิน' }, 400);
      const displayName = String(payload.display_name || '').trim();

      const { data: existing, error: getError } = await admin.auth.admin.getUserById(id);
      if (getError) throw getError;
      const mergedMetadata = Object.assign({}, existing.user.user_metadata, { display_name: displayName });

      const { data, error } = await admin.auth.admin.updateUserById(id, { user_metadata: mergedMetadata });
      if (error) throw error;
      return jsonResponse({ user: sanitizeUser(data.user) });
    }

    if (action === 'reset_password') {
      const id = payload.id;
      if (!id) return jsonResponse({ error: 'ไม่พบรหัสแอดมิน' }, 400);

      const { data: existing, error: getError } = await admin.auth.admin.getUserById(id);
      if (getError) throw getError;
      const mergedMetadata = Object.assign({}, existing.user.user_metadata, { must_set_password: true });

      const password = generatePassword();
      const { error } = await admin.auth.admin.updateUserById(id, {
        password: password,
        user_metadata: mergedMetadata,
      });
      if (error) throw error;
      return jsonResponse({ password: password });
    }

    if (action === 'delete') {
      const id = payload.id;
      if (!id) return jsonResponse({ error: 'ไม่พบรหัสแอดมิน' }, 400);
      if (id === callerId) {
        return jsonResponse({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' }, 400);
      }

      const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 });
      if (listError) throw listError;
      if ((listData.users || []).length <= 1) {
        return jsonResponse({ error: 'ไม่สามารถลบแอดมินคนสุดท้ายของระบบได้' }, 400);
      }

      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'ไม่รู้จัก action นี้' }, 400);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }, 500);
  }
});
