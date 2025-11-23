# 🔧 Adaptive Pricing Habilitado pero Sigue Mostrando USD

## 🔍 Problema
Adaptive Pricing está **habilitado** en Stripe Dashboard, pero el checkout **sigue mostrando USD** en lugar de convertir a MXN para clientes mexicanos.

## ✅ Verificaciones Necesarias

### 1. Verificar que "Checkout" esté Habilitado

En la página de **Adaptive Pricing** que estás viendo:

1. Busca la sección **"Checkout, Elements y página de facturas alojadas"**
2. Verifica que el toggle para **"Tradingsinperdidas"** (o el nombre de tu cuenta) esté **ACTIVADO** (ON/púrpura)
3. Si está desactivado, **ACTÍVALO**
4. Guarda los cambios

### 2. Verificar "Divisas Aceptadas"

En la misma página de Adaptive Pricing:

1. Busca la sección **"Divisas aceptadas"** (Accepted Currencies)
2. Verifica que **MXN** (pesos mexicanos) esté en la lista de monedas aceptadas
3. Si no está, agrégalo

### 3. Verificar Configuración de Métodos de Pago

1. Ve a **Configuración** → **Pagos** → **"Métodos de pago"**
2. Verifica que **Cards** esté habilitado para **México**
3. Verifica que **MXN** esté en las monedas soportadas

### 4. Probar desde México

Adaptive Pricing solo funciona cuando:
- El cliente está en una ubicación donde la moneda local es diferente a USD
- Stripe detecta la ubicación del cliente

**Para probar:**
1. Usa una **VPN configurada en México**
2. O pide a un cliente mexicano que pruebe
3. El checkout debería mostrar el precio en **MXN**

### 5. Verificar Tipo de Cuenta

Adaptive Pricing puede tener restricciones según el tipo de cuenta:
- Algunas cuentas solo funcionan para ciertas regiones
- Verifica que tu cuenta de Stripe esté completamente activada

## 🔧 Solución Alternativa: Detectar Ubicación en el Código

Si Adaptive Pricing no funciona después de verificar todo lo anterior, puedo implementar una solución donde:

1. **Detectamos la ubicación del cliente** (país)
2. **Si es México** → creamos el checkout con configuración específica para MXN
3. **Si es otro país** → usamos USD

Esto requiere:
- Detectar el país del cliente (desde el navegador o IP)
- Modificar el código para usar diferentes configuraciones según el país

## 📞 Contactar a Stripe Support

Si después de verificar todo lo anterior sigue sin funcionar:

1. Ve a: https://support.stripe.com/
2. Contacta a soporte
3. Explica:
   > "Tengo Adaptive Pricing habilitado en mi Dashboard, pero el checkout sigue mostrando USD en lugar de convertir a MXN para clientes mexicanos. He verificado que está habilitado para 'Checkout, Elements y página de facturas alojadas' y que MXN está en las divisas aceptadas. ¿Qué más necesito configurar?"

## 🧪 Cómo Verificar que Funciona

1. **Desde México** (o con VPN en México):
   - Abre tu sitio web
   - Intenta hacer un checkout
   - Deberías ver el precio en **MXN** (~$350 MXN)
   - Si ves USD, Adaptive Pricing no está funcionando

2. **Verificar en Stripe Dashboard**:
   - Ve a **Payments** → Busca pagos recientes
   - Si hay pagos en **MXN**, Adaptive Pricing está funcionando
   - Si todos están en **USD**, no está funcionando

## ⚠️ Notas Importantes

- Adaptive Pricing **solo funciona cuando Stripe detecta** que el cliente está en un país diferente
- Si pruebas desde tu ubicación actual (que puede no ser México), seguirás viendo USD
- Necesitas probar **desde México** o con **VPN en México** para verificar que funciona

## 🎯 Próximos Pasos

1. ✅ Verifica que "Checkout" esté habilitado en Adaptive Pricing
2. ✅ Verifica que MXN esté en "Divisas aceptadas"
3. ✅ Prueba desde México (o con VPN)
4. ❓ Si no funciona, contacta a Stripe Support
5. ❓ O implementa la solución alternativa de detección de ubicación

¿Quieres que implemente la solución alternativa de detección de ubicación mientras verificas la configuración de Adaptive Pricing?

