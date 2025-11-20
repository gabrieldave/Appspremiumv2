/**
 * Script para cambiar la contraseña de un usuario en Supabase
 * 
 * Uso:
 * 1. Ejecuta: node scripts/cambiar-contraseña.js
 * 2. Ingresa el email del usuario
 * 3. Ingresa la nueva contraseña
 */

// Necesitas instalar: npm install @supabase/supabase-js dotenv
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pezisfaeecgjdguneuip.supabase.co';
// IMPORTANTE: Necesitas la SERVICE_ROLE_KEY, NO la anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: No se encontró SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nPara usar este script:');
  console.log('1. Ve a Supabase Dashboard → Settings → API');
  console.log('2. Copia la "service_role" key (NO la anon key)');
  console.log('3. Agrégala a tu archivo .env como:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui');
  console.log('\n⚠️  IMPORTANTE: Esta clave es muy sensible. No la compartas.');
  process.exit(1);
}

// Crear cliente con service role (tiene permisos de admin)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Leer argumentos de línea de comandos
const email = process.argv[2] || 'david.del.rio.colin@gmail.com';
const newPassword = process.argv[3];

if (!newPassword) {
  console.log('❌ Uso: node scripts/cambiar-contraseña.js <email> <nueva-contraseña>');
  console.log('Ejemplo: node scripts/cambiar-contraseña.js david.del.rio.colin@gmail.com miNuevaPass123');
  process.exit(1);
}

async function cambiarContraseña() {
  try {
    console.log('🔍 Buscando usuario:', email);
    
    // Buscar el usuario por email
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      console.error('❌ Error buscando usuarios:', searchError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ Usuario no encontrado:', email);
      console.log('\nUsuarios disponibles:');
      users.users.forEach(u => console.log('  -', u.email));
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.id);
    console.log('📧 Email:', user.email);
    console.log('📅 Creado:', user.created_at);
    console.log('🔐 Email confirmado:', user.email_confirmed_at ? 'Sí' : 'No');
    
    // Actualizar la contraseña usando admin API
    console.log('\n🔐 Actualizando contraseña...');
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ Error actualizando contraseña:', error);
      return;
    }
    
    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('\n📝 Detalles:');
    console.log('  Email:', data.user.email);
    console.log('  Nueva contraseña:', newPassword);
    console.log('\n🎉 Ahora puedes iniciar sesión con:');
    console.log('  Email:', email);
    console.log('  Contraseña:', newPassword);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

cambiarContraseña();

