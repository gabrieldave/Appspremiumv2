import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pezisfaeecgjdguneuip.supabase.co';
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

async function ejecutarMigraciones() {
  try {
    console.log('🚀 Iniciando ejecución de migraciones...\n');
    console.log('📋 Proyecto:', supabaseUrl);
    console.log('');

    // Leer el archivo SQL combinado
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'COMBINED_add_secret_fields.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // Extraer solo las líneas SQL (sin comentarios)
    const sqlLines = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--') && !line.trim().startsWith('/*') && !line.trim().startsWith('*/') && !line.trim().startsWith('#'))
      .join('\n');

    console.log('📝 SQL a ejecutar:');
    console.log('─'.repeat(50));
    console.log(sqlLines);
    console.log('─'.repeat(50));
    console.log('');

    // Ejecutar las migraciones usando RPC o directamente
    // Nota: Supabase no tiene un endpoint directo para ejecutar SQL arbitrario
    // Necesitamos usar el método .rpc() o ejecutar cada ALTER TABLE por separado
    
    console.log('🔄 Ejecutando migración 1: Agregar campo secret_code...');
    const { error: error1 } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_code text;'
    });

    if (error1) {
      // Si RPC no funciona, intentar con query directa usando from()
      console.log('⚠️  RPC no disponible, intentando método alternativo...');
      
      // Intentar verificar si la columna ya existe primero
      const { data: checkData, error: checkError } = await supabaseAdmin
        .from('premium_apps')
        .select('secret_code')
        .limit(1);

      if (checkError && checkError.message.includes('column') && checkError.message.includes('does not exist')) {
        // La columna no existe, necesitamos ejecutar el ALTER TABLE
        // Como no podemos ejecutar ALTER TABLE directamente desde el cliente JS,
        // vamos a usar una función SQL que crearemos temporalmente
        console.log('📌 La columna secret_code no existe. Necesitas ejecutar el SQL manualmente.');
        console.log('\n💡 Opción 1: Ejecutar en Supabase Dashboard → SQL Editor');
        console.log('💡 Opción 2: Usar Supabase CLI: supabase migration up');
        console.log('\n📋 SQL a ejecutar:');
        console.log('─'.repeat(50));
        console.log('ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_code text;');
        console.log('ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_notes text;');
        console.log('─'.repeat(50));
        process.exit(1);
      } else if (!checkError) {
        console.log('✅ La columna secret_code ya existe');
      }
    } else {
      console.log('✅ Migración 1 completada: secret_code agregado');
    }

    console.log('🔄 Ejecutando migración 2: Agregar campo secret_notes...');
    const { error: error2 } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_notes text;'
    });

    if (error2) {
      const { data: checkData2, error: checkError2 } = await supabaseAdmin
        .from('premium_apps')
        .select('secret_notes')
        .limit(1);

      if (checkError2 && checkError2.message.includes('column') && checkError2.message.includes('does not exist')) {
        console.log('📌 La columna secret_notes no existe.');
      } else if (!checkError2) {
        console.log('✅ La columna secret_notes ya existe');
      }
    } else {
      console.log('✅ Migración 2 completada: secret_notes agregado');
    }

    // Verificar que las columnas existen
    console.log('\n🔍 Verificando columnas...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('premium_apps')
      .select('id, secret_code, secret_notes')
      .limit(1);

    if (testError) {
      console.error('❌ Error al verificar:', testError.message);
      console.log('\n💡 Las migraciones necesitan ejecutarse manualmente en Supabase Dashboard → SQL Editor');
      process.exit(1);
    }

    console.log('✅ Migraciones completadas exitosamente!');
    console.log('✅ Columnas verificadas: secret_code y secret_notes están disponibles');
    console.log('\n🎉 ¡Listo! Ahora puedes usar los campos secret_code y secret_notes en tus apps.');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    console.log('\n💡 Alternativa: Ejecuta el SQL manualmente en Supabase Dashboard → SQL Editor');
    console.log('📋 SQL:');
    console.log('─'.repeat(50));
    console.log('ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_code text;');
    console.log('ALTER TABLE premium_apps ADD COLUMN IF NOT EXISTS secret_notes text;');
    console.log('─'.repeat(50));
    process.exit(1);
  }
}

ejecutarMigraciones();







