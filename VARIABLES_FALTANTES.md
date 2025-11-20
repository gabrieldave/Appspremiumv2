# 📋 Variables que Faltan en Edge Functions

## ✅ Variables que Ya Tienes Configuradas

Según lo que veo en tu pantalla, ya tienes:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_ANON_KEY` (esta no es necesaria para Edge Functions, pero no hace daño)
- ✅ `SUPABASE_DB_URL` (esta no es necesaria para Edge Functions)

---

## ⚠️ Variables que FALTAN (Necesarias)

Tienes que agregar estas **2 variables** para que las Edge Functions funcionen:

### 1. STRIPE_SECRET_KEY
- **Nombre**: `STRIPE_SECRET_KEY`
- **Valor**: `sk_test_...` (obtener de Stripe Dashboard → Developers → API keys)
- **Necesaria para**: 
  - ✅ `stripe-checkout`
  - ✅ `stripe-webhook`
  - ✅ `stripe-portal`

### 2. STRIPE_WEBHOOK_SECRET
- **Nombre**: `STRIPE_WEBHOOK_SECRET`
- **Valor**: `whsec_F2wUIkkSkQXwHn2xmimusGjSRqfI9aLj`
- **Necesaria para**: 
  - ✅ `stripe-webhook` (solo esta función)

---

## 🚀 Cómo Agregarlas

En la pantalla que estás viendo:

1. **En la sección "ADD OR REPLACE SECRETS"**:
   - En el campo **"Name"**: escribe `STRIPE_SECRET_KEY`
   - En el campo **"Value"**: pega tu `sk_test_...` (obtener de Stripe Dashboard → Developers → API keys)

2. **Click en "Add another"** para agregar la segunda variable:
   - En el campo **"Name"**: escribe `STRIPE_WEBHOOK_SECRET`
   - En el campo **"Value"**: pega tu `whsec_...` (obtener del webhook en Stripe Dashboard)

3. **Click en "Save"** (botón verde abajo a la derecha)

---

## ✅ Checklist Final

Después de agregar, deberías tener estas variables:

### Todas las Variables Necesarias:
- [x] `SUPABASE_URL` ✅ (ya la tienes)
- [x] `SUPABASE_SERVICE_ROLE_KEY` ✅ (ya la tienes)
- [ ] `STRIPE_SECRET_KEY` ⚠️ (FALTA - agregar)
- [ ] `STRIPE_WEBHOOK_SECRET` ⚠️ (FALTA - agregar)

### Variables Opcionales (ya las tienes pero no son necesarias):
- [x] `SUPABASE_ANON_KEY` (no se usa en Edge Functions, pero está bien que esté)
- [x] `SUPABASE_DB_URL` (no se usa en Edge Functions, pero está bien que esté)

---

## 📝 Resumen Rápido

**Faltan 2 variables**:
1. `STRIPE_SECRET_KEY` = `sk_test_...` (obtener de Stripe Dashboard → Developers → API keys)
2. `STRIPE_WEBHOOK_SECRET` = `whsec_...` (obtener del webhook en Stripe Dashboard)

Después de agregarlas y guardar, ¡todo estará listo! 🎉

