#!/bin/bash

# 🧪 Script de Prueba con CURL - Flujo de Guardado de Datos del Cliente
# 
# Uso: bash scripts/test-customer-data-curl.sh
# O:   chmod +x scripts/test-customer-data-curl.sh && ./scripts/test-customer-data-curl.sh

# ==========================================
# COLORES
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ==========================================
# CONFIGURACIÓN
# ==========================================
BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
TEMP_FILE="/tmp/test_response_$$.json"

# ==========================================
# FUNCIONES
# ==========================================

print_header() {
  echo -e "\n${MAGENTA}${'═' * 60}${NC}"
  echo -e "${MAGENTA}📋 $1${NC}"
  echo -e "${MAGENTA}${'═' * 60}${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_test() {
  echo -e "${CYAN}🧪 $1${NC}"
}

print_json() {
  if command -v jq &> /dev/null; then
    jq . <<< "$1"
  else
    echo "$1"
  fi
}

# ==========================================
# DATOS DE PRUEBA
# ==========================================

cat << 'EOF'

╔════════════════════════════════════════════════════════════╗
║  🧪 Script de Prueba CURL - Guardado de Datos del Cliente ║
║                    ViveroWeb Test Suite                    ║
╚════════════════════════════════════════════════════════════╝

EOF

print_info "Usando BASE_URL: $BASE_URL"
print_info "Timestamp: $TIMESTAMP"

# ==========================================
# TEST 1: Crear Preferencia de Pago
# ==========================================

print_header "TEST 1: Crear Preferencia de Pago con Datos del Cliente"

PREFERENCE_DATA='{
  "items": [
    {
      "product_id": "test-prod-1",
      "product_name": "Maceta Grande",
      "quantity": 2,
      "price": 500,
      "image": "https://via.placeholder.com/200"
    },
    {
      "product_id": "test-prod-2",
      "product_name": "Tierra para Plantas",
      "quantity": 1,
      "price": 300,
      "image": "https://via.placeholder.com/200"
    }
  ],
  "shipping_address": {
    "street": "Avenida Test",
    "number": "1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "zip": "1000",
    "additional_info": "Apto 5B - Lado izquierdo"
  },
  "payment_method": "mercadopago",
  "customer_email": "test_user_123456@testuser.com",
  "customer_name": "Test User Completo",
  "customer_phone": "11 1234-5678",
  "shipping_method": "delivery",
  "notes": "Envío a domicilio incluido"
}'

print_test "Enviando datos de preferencia..."
print_info "Payload:"
print_json "$PREFERENCE_DATA"

PREFERENCE_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/api/mercadopago/create-preference" \
  -H "Content-Type: application/json" \
  -d "$PREFERENCE_DATA")

echo "$PREFERENCE_RESPONSE" > "$TEMP_FILE"

if echo "$PREFERENCE_RESPONSE" | grep -q "preference_id"; then
  print_success "Preferencia creada exitosamente"
  PREFERENCE_ID=$(echo "$PREFERENCE_RESPONSE" | jq -r '.data.preference_id' 2>/dev/null || echo "N/A")
  print_success "Preference ID: $PREFERENCE_ID"
  print_info "Respuesta completa:"
  print_json "$PREFERENCE_RESPONSE"
else
  print_error "Fallo crear preferencia"
  print_info "Respuesta:"
  print_json "$PREFERENCE_RESPONSE"
fi

# ==========================================
# TEST 2: Crear Orden
# ==========================================

print_header "TEST 2: Crear Orden Directamente"

ORDER_DATA='{
  "items": [
    {
      "product_id": "test-prod-1",
      "product_name": "Maceta Grande",
      "quantity": 2,
      "price": 500,
      "image": "https://via.placeholder.com/200"
    },
    {
      "product_id": "test-prod-2",
      "product_name": "Tierra para Plantas",
      "quantity": 1,
      "price": 300,
      "image": "https://via.placeholder.com/200"
    }
  ],
  "shipping_address": {
    "street": "Avenida Test",
    "number": "1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "zip": "1000",
    "additional_info": "Apto 5B - Lado izquierdo"
  },
  "payment_method": "mercadopago",
  "customer_email": "test_user_123456@testuser.com",
  "customer_name": "Test User Completo",
  "customer_phone": "11 1234-5678",
  "shipping_method": "delivery",
  "notes": "Orden creada por test CURL"
}'

print_test "Creando orden..."

ORDER_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

if echo "$ORDER_RESPONSE" | grep -q '"id"'; then
  print_success "Orden creada exitosamente"
  ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id' 2>/dev/null || echo "N/A")
  print_success "Order ID: $ORDER_ID"
  print_info "Respuesta:"
  print_json "$ORDER_RESPONSE"
  
  # ==========================================
  # TEST 3: Obtener Detalles de la Orden
  # ==========================================
  
  print_header "TEST 3: Obtener Detalles de la Orden"
  
  print_test "Recuperando detalles..."
  
  ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID")
  
  if echo "$ORDER_DETAILS" | grep -q '"customer_info"'; then
    print_success "Order details recuperados exitosamente"
    
    # Extraer y validar datos
    CUSTOMER_INFO=$(echo "$ORDER_DETAILS" | jq '.customer_info' 2>/dev/null)
    
    if [ ! -z "$CUSTOMER_INFO" ] && [ "$CUSTOMER_INFO" != "null" ]; then
      print_success "✅ customer_info existe"
      print_info "Contenido de customer_info:"
      print_json "$CUSTOMER_INFO"
      
      # Validar campos
      EMAIL=$(echo "$CUSTOMER_INFO" | jq -r '.email' 2>/dev/null)
      NAME=$(echo "$CUSTOMER_INFO" | jq -r '.name' 2>/dev/null)
      PHONE=$(echo "$CUSTOMER_INFO" | jq -r '.phone' 2>/dev/null)
      SHIPPING_METHOD=$(echo "$CUSTOMER_INFO" | jq -r '.shipping_method' 2>/dev/null)
      ADDRESS=$(echo "$CUSTOMER_INFO" | jq '.address' 2>/dev/null)
      
      # Validar email
      if [ "$EMAIL" = "test_user_123456@testuser.com" ]; then
        print_success "✅ Email correcto: $EMAIL"
      else
        print_error "❌ Email incorrecto: $EMAIL"
      fi
      
      # Validar nombre
      if [ "$NAME" = "Test User Completo" ]; then
        print_success "✅ Nombre correcto: $NAME"
      else
        print_error "❌ Nombre incorrecto: $NAME"
      fi
      
      # Validar teléfono
      if [ "$PHONE" = "11 1234-5678" ]; then
        print_success "✅ Teléfono correcto: $PHONE"
      else
        print_error "❌ Teléfono incorrecto: $PHONE"
      fi
      
      # Validar shipping_method
      if [ "$SHIPPING_METHOD" = "delivery" ]; then
        print_success "✅ Shipping method correcto: $SHIPPING_METHOD"
      else
        print_error "❌ Shipping method incorrecto: $SHIPPING_METHOD"
      fi
      
      # Validar dirección
      if [ ! -z "$ADDRESS" ] && [ "$ADDRESS" != "null" ]; then
        print_success "✅ Dirección existe"
        print_info "Contenido de dirección:"
        print_json "$ADDRESS"
      else
        print_error "❌ Dirección no existe"
      fi
      
    else
      print_error "❌ customer_info es null o vacío"
    fi
    
    print_info "Detalles completos de la orden:"
    print_json "$ORDER_DETAILS"
    
  else
    print_error "Fallo obtener detalles de orden"
    print_info "Respuesta:"
    print_json "$ORDER_DETAILS"
  fi
  
else
  print_error "Fallo crear orden"
  print_info "Respuesta:"
  print_json "$ORDER_RESPONSE"
fi

# ==========================================
# RESUMEN
# ==========================================

print_header "📊 RESUMEN DE PRUEBAS"

echo "✅ Pruebas completadas"
echo "📝 Resultados guardados en: $TEMP_FILE"
echo ""
print_info "Para usar con jq, instala: brew install jq (macOS) o apt-get install jq (Linux)"

# Limpiar
rm -f "$TEMP_FILE"

echo ""
echo -e "${GREEN}🎉 Pruebas finalizadas${NC}\n"

