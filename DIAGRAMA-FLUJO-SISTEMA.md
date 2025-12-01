# 📊 Diagrama de Flujo del Sistema - ViveroWeb

## 🎯 Diagrama Completo del Sistema

Este documento contiene el diagrama de flujo principal del sistema ViveroWeb, representando todos los flujos de usuario y procesos técnicos.

---

## 📐 Diagrama Principal (Mermaid)

```mermaid
flowchart TB
    Start([Usuario accede al sistema]) --> TipoUsuario{Tipo de Usuario}
    
    %% FLUJO CLIENTE INVITADO
    TipoUsuario -->|Invitado| ClienteInicio[Página Principal /]
    ClienteInicio --> Navegacion[Navegar Catálogo]
    Navegacion --> Buscar{Buscar/Filtrar?}
    Buscar -->|Sí| BuscarProductos[Buscar Productos]
    BuscarProductos --> VerProducto[Ver Detalle Producto]
    Buscar -->|No| VerProducto
    VerProducto --> AgregarCarrito{Agregar al Carrito?}
    AgregarCarrito -->|Sí| ValidarStock[Validar Stock Disponible]
    ValidarStock -->|Stock OK| GuardarCarrito[Guardar en localStorage]
    ValidarStock -->|Sin Stock| ErrorStock[Mostrar Error: Sin Stock]
    ErrorStock --> VerProducto
    AgregarCarrito -->|No| Navegacion
    GuardarCarrito --> IrCarrito{Ir al Carrito?}
    IrCarrito -->|Sí| PaginaCarrito[/carrito]
    IrCarrito -->|No| Navegacion
    
    PaginaCarrito --> RevisarCarrito[Revisar Items del Carrito]
    RevisarCarrito --> ModificarCarrito{Modificar Carrito?}
    ModificarCarrito -->|Cambiar Cantidad| ActualizarCantidad[Actualizar Cantidad]
    ModificarCarrito -->|Eliminar| EliminarItem[Eliminar Item]
    ModificarCarrito -->|Continuar| SeleccionarEnvio[Seleccionar Envío a Domicilio]
    ActualizarCantidad --> RevisarCarrito
    EliminarItem --> RevisarCarrito
    
    SeleccionarEnvio --> IrCheckout[Ir a Checkout]
    IrCheckout --> PaginaPago[/carrito/pago]
    PaginaPago --> FormularioCliente[Completar Formulario Cliente]
    FormularioCliente --> ValidarForm{Validar Información?}
    ValidarForm -->|Inválido| ErrorForm[Mostrar Errores]
    ErrorForm --> FormularioCliente
    ValidarForm -->|Válido| ValidarStockCheckout[Validar Stock Final]
    ValidarStockCheckout -->|Sin Stock| ErrorStockCheckout[Error: Stock Insuficiente]
    ErrorStockCheckout --> PaginaCarrito
    ValidarStockCheckout -->|Stock OK| SeleccionarPago[Seleccionar Método de Pago]
    
    SeleccionarPago --> TipoPago{Método de Pago}
    TipoPago -->|MercadoPago| CrearPreferencia[Crear Preferencia MP]
    TipoPago -->|Efectivo| CrearOrdenEfectivo[Crear Orden Pending]
    
    CrearPreferencia --> CrearOrdenMP[Crear Orden en BD estado: pending]
    CrearOrdenMP --> RedirigirMP[Redirigir a MercadoPago]
    RedirigirMP --> PagoMP[Usuario paga en MercadoPago]
    PagoMP --> WebhookMP[Webhook MP notifica resultado]
    
    WebhookMP --> ResultadoPago{Resultado Pago}
    ResultadoPago -->|Aprobado| ProcesarPagoExitoso[Procesar Pago Exitoso]
    ResultadoPago -->|Rechazado| ProcesarPagoRechazado[Procesar Pago Rechazado]
    ResultadoPago -->|Pendiente| ProcesarPagoPendiente[Procesar Pago Pendiente]
    
    ProcesarPagoExitoso --> ActualizarOrden[Actualizar Orden: approved]
    ActualizarOrden --> ReducirStock[Reducir Stock Productos]
    ReducirStock --> LimpiarCarrito[Limpiar Carrito]
    LimpiarCarrito --> PaginaSuccess[/pago/success]
    
    ProcesarPagoRechazado --> ActualizarOrdenRechazado[Actualizar Orden: rejected]
    ActualizarOrdenRechazado --> PaginaFailure[/pago/failure]
    
    ProcesarPagoPendiente --> ActualizarOrdenPendiente[Actualizar Orden: pending]
    ActualizarOrdenPendiente --> PaginaPending[/pago/pending]
    
    CrearOrdenEfectivo --> PaginaSuccess
    
    PaginaSuccess --> FinCliente([Fin: Pedido Confirmado])
    PaginaFailure --> FinCliente
    PaginaPending --> FinCliente
    
    %% FLUJO ADMINISTRADOR
    TipoUsuario -->|Administrador| AdminInicio[Acceder a /admin]
    AdminInicio --> MiddlewareAuth{¿Token JWT válido?}
    MiddlewareAuth -->|No| RedirigirLogin[Redirigir a /login]
    MiddlewareAuth -->|Sí| PanelAdmin[Panel de Administración]
    
    RedirigirLogin --> LoginPage[Página de Login]
    LoginPage --> IngresarCredenciales[Ingresar Email y Password]
    IngresarCredenciales --> ValidarLogin[Validar en /api/admin/auth/login]
    ValidarLogin --> LoginValido{¿Credenciales válidas?}
    LoginValido -->|No| ErrorLogin[Mostrar Error]
    ErrorLogin --> LoginPage
    LoginValido -->|Sí| GenerarToken[Generar Token JWT]
    GenerarToken --> GuardarToken[Guardar Token en Cookie]
    GuardarToken --> ActualizarLastLogin[Actualizar last_login]
    ActualizarLastLogin --> LogActividad[Registrar en activity_logs]
    LogActividad --> PanelAdmin
    
    PanelAdmin --> MenuAdmin{¿Qué gestionar?}
    MenuAdmin -->|Productos| GestionProductos[Gestión de Productos]
    MenuAdmin -->|Pedidos| GestionPedidos[Gestión de Pedidos]
    MenuAdmin -->|Categorías| GestionCategorias[Gestión de Categorías]
    MenuAdmin -->|Ventas| HistorialVentas[Historial de Ventas]
    MenuAdmin -->|Logout| CerrarSesion[Cerrar Sesión]
    
    %% Gestión de Productos
    GestionProductos --> AccionProducto{Acción}
    AccionProducto -->|Crear| FormularioProducto[Formulario Nuevo Producto]
    AccionProducto -->|Editar| SeleccionarProducto[Seleccionar Producto]
    AccionProducto -->|Eliminar| ConfirmarEliminar[Confirmar Eliminación]
    AccionProducto -->|Importar| ImportarExcel[Subir Archivo Excel/CSV]
    
    FormularioProducto --> SubirImagenes[Subir Imágenes máx. 3]
    SubirImagenes --> ValidarImagenes{¿Imágenes válidas?}
    ValidarImagenes -->|No| ErrorImagenes[Error: Imágenes inválidas]
    ErrorImagenes --> SubirImagenes
    ValidarImagenes -->|Sí| GuardarProducto[Guardar en /api/products]
    GuardarProducto --> ActualizarBD[Actualizar BD: products]
    ActualizarBD --> LogCrearProducto[Log: product_created]
    LogCrearProducto --> GestionProductos
    
    SeleccionarProducto --> EditarProducto[Editar Información]
    EditarProducto --> GuardarCambios[Guardar Cambios]
    GuardarCambios --> ActualizarProducto[Actualizar en /api/products/[id]]
    ActualizarProducto --> LogEditarProducto[Log: product_updated]
    LogEditarProducto --> GestionProductos
    
    ConfirmarEliminar --> EliminarProducto[Eliminar en /api/products/[id]]
    EliminarProducto --> LogEliminarProducto[Log: product_deleted]
    LogEliminarProducto --> GestionProductos
    
    ImportarExcel --> ProcesarExcel[Procesar y Validar Datos]
    ProcesarExcel --> CrearProductosMasivo[Crear Productos Masivamente]
    CrearProductosMasivo --> LogImportar[Log: products_imported]
    LogImportar --> GestionProductos
    
    %% Gestión de Pedidos
    GestionPedidos --> ListaPedidos[Lista de Pedidos]
    ListaPedidos --> FiltrarPedidos{Filtrar por Estado?}
    FiltrarPedidos -->|Sí| AplicarFiltro[Aplicar Filtro]
    FiltrarPedidos -->|No| VerDetallePedido[Ver Detalle Pedido]
    AplicarFiltro --> VerDetallePedido
    
    VerDetallePedido --> AccionPedido{Acción sobre Pedido}
    AccionPedido -->|Completar| MarcarCompletado[Marcar como Completado]
    AccionPedido -->|Cancelar| CancelarPedido[Cancelar Pedido]
    AccionPedido -->|Actualizar| ActualizarEstado[Actualizar Estado]
    AccionPedido -->|Agregar Notas| AgregarNotas[Agregar Notas Internas]
    
    MarcarCompletado --> ActualizarPedido[Actualizar en /api/orders/[id]]
    CancelarPedido --> ActualizarPedido
    ActualizarEstado --> ActualizarPedido
    AgregarNotas --> ActualizarPedido
    
    ActualizarPedido --> LogPedido[Log: order_updated]
    LogPedido --> GestionPedidos
    
    %% Gestión de Categorías
    GestionCategorias --> AccionCategoria{Acción}
    AccionCategoria -->|Crear| CrearCategoria[Crear Categoría]
    AccionCategoria -->|Editar| EditarCategoria[Editar Categoría]
    AccionCategoria -->|Eliminar| EliminarCategoria[Eliminar Categoría]
    
    CrearCategoria --> GuardarCategoria[Guardar en /api/categories]
    EditarCategoria --> GuardarCategoria
    EliminarCategoria --> ValidarCategoria{¿Tiene productos?}
    ValidarCategoria -->|Sí| ErrorCategoria[Error: No se puede eliminar]
    ValidarCategoria -->|No| GuardarCategoria
    GuardarCategoria --> GestionCategorias
    
    %% Historial de Ventas
    HistorialVentas --> FiltrarVentas[Filtrar por Fechas]
    FiltrarVentas --> VerReportes[Ver Reportes de Ventas]
    VerReportes --> ExportarDatos{¿Exportar?}
    ExportarDatos -->|Sí| Exportar[Exportar Datos]
    ExportarDatos -->|No| HistorialVentas
    Exportar --> HistorialVentas
    
    %% Logout
    CerrarSesion --> EliminarToken[Eliminar Token JWT]
    EliminarToken --> LogLogout[Log: admin_logout]
    LogLogout --> ClienteInicio
    
    %% Consulta de Pedidos (Invitado)
    FinCliente --> ConsultarPedido{¿Consultar Pedido?}
    ConsultarPedido -->|Sí| ConsultaEmail[Consultar por Email]
    ConsultaEmail --> BuscarPedidoEmail[Buscar en /api/orders/guest/[email]]
    BuscarPedidoEmail --> MostrarPedidos[Mostrar Pedidos del Email]
    MostrarPedidos --> FinCliente
    ConsultarPedido -->|No| FinCliente
    
    %% Estilos
    classDef cliente fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef admin fill:#50C878,stroke:#2D8659,stroke-width:2px,color:#fff
    classDef pago fill:#FFD700,stroke:#B8860B,stroke-width:2px,color:#000
    classDef error fill:#FF6B6B,stroke:#C92A2A,stroke-width:2px,color:#fff
    classDef proceso fill:#E8E8E8,stroke:#666,stroke-width:2px,color:#000
    
    class ClienteInicio,Navegacion,BuscarProductos,VerProducto,AgregarCarrito,PaginaCarrito,RevisarCarrito,PaginaPago,FormularioCliente,ConsultaEmail cliente
    class AdminInicio,LoginPage,PanelAdmin,GestionProductos,GestionPedidos,GestionCategorias,HistorialVentas admin
    class CrearPreferencia,RedirigirMP,PagoMP,WebhookMP,ProcesarPagoExitoso pago
    class ErrorStock,ErrorForm,ErrorStockCheckout,ErrorLogin,ErrorImagenes,ErrorCategoria error
```

---

## 🔄 Diagrama Simplificado de Flujos Principales

```mermaid
graph LR
    subgraph "Flujo Cliente Invitado"
        A1[Inicio] --> A2[Navegar]
        A2 --> A3[Agregar al Carrito]
        A3 --> A4[Checkout]
        A4 --> A5[Pago]
        A5 --> A6[Confirmación]
    end
    
    subgraph "Flujo Administrador"
        B1[Login] --> B2[Panel Admin]
        B2 --> B3[Gestión Productos]
        B2 --> B4[Gestión Pedidos]
        B2 --> B5[Gestión Categorías]
    end
    
    subgraph "Flujo de Pago MercadoPago"
        C1[Crear Preferencia] --> C2[Redirigir MP]
        C2 --> C3[Pago en MP]
        C3 --> C4[Webhook]
        C4 --> C5[Actualizar Orden]
    end
```

---

## 🔐 Diagrama de Autenticación y Seguridad

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant M as Middleware
    participant A as API Auth
    participant DB as Supabase
    
    U->>F: Accede a /admin
    F->>M: Request a /admin
    M->>M: Verificar Token JWT
    alt Token no existe o inválido
        M->>F: Redirigir a /login
        F->>U: Mostrar Login
        U->>F: Ingresar credenciales
        F->>A: POST /api/admin/auth/login
        A->>DB: Buscar admin por email
        DB->>A: Datos del admin
        A->>A: Verificar password
        A->>A: Generar JWT
        A->>DB: Actualizar last_login
        A->>F: Token JWT + Admin data
        F->>F: Guardar token en cookie
        F->>U: Redirigir a /admin
    else Token válido
        M->>DB: Verificar admin activo
        DB->>M: Admin válido
        M->>F: Agregar headers x-admin-*
        F->>U: Mostrar Panel Admin
    end
```

---

## 💳 Diagrama de Proceso de Pago

```mermaid
flowchart TD
    Start([Cliente completa checkout]) --> ValidarStock[Validar Stock Disponible]
    ValidarStock -->|Sin Stock| Error[Error: Stock Insuficiente]
    Error --> EndError([Fin: Error])
    
    ValidarStock -->|Stock OK| CrearOrden[Crear Orden en BD<br/>Estado: pending]
    CrearOrden --> TipoPago{Método de Pago}
    
    TipoPago -->|MercadoPago| CrearPreferencia[Crear Preferencia MP<br/>/api/mercadopago/create-preference]
    CrearPreferencia --> Redirigir[Redirigir a MercadoPago]
    Redirigir --> PagoUsuario[Usuario paga en MP]
    PagoUsuario --> Webhook[Webhook MP<br/>/api/mercadopago/webhook]
    
    Webhook --> VerificarFirma[Verificar Firma MP]
    VerificarFirma -->|Inválida| RechazarWebhook[Rechazar Webhook]
    VerificarFirma -->|Válida| EstadoPago{Estado del Pago}
    
    EstadoPago -->|approved| ProcesarAprobado[Actualizar Orden: approved<br/>Reducir Stock<br/>Log actividad]
    EstadoPago -->|rejected| ProcesarRechazado[Actualizar Orden: rejected<br/>Log error]
    EstadoPago -->|pending| ProcesarPendiente[Actualizar Orden: pending<br/>Log pendiente]
    
    ProcesarAprobado --> LimpiarCarrito[Limpiar Carrito]
    LimpiarCarrito --> Success[Redirigir a /pago/success]
    ProcesarRechazado --> Failure[Redirigir a /pago/failure]
    ProcesarPendiente --> Pending[Redirigir a /pago/pending]
    
    TipoPago -->|Efectivo| OrdenEfectivo[Crear Orden<br/>Estado: pending]
    OrdenEfectivo --> Success
    
    Success --> EndSuccess([Fin: Pedido Confirmado])
    Failure --> EndError
    Pending --> EndPending([Fin: Pago Pendiente])
```

---

## 📦 Diagrama de Gestión de Stock

```mermaid
flowchart TD
    Start([Operación con Stock]) --> TipoOperacion{Tipo de Operación}
    
    TipoOperacion -->|Agregar al Carrito| ValidarStockCarrito[Validar Stock<br/>Disponible >= Cantidad]
    ValidarStockCarrito -->|OK| Agregar[Agregar al Carrito]
    ValidarStockCarrito -->|Error| ErrorCarrito[Error: Stock Insuficiente]
    
    TipoOperacion -->|Checkout| ValidarStockCheckout[Validar Stock Final<br/>Antes de Pago]
    ValidarStockCheckout -->|OK| ContinuarCheckout[Continuar Checkout]
    ValidarStockCheckout -->|Error| ErrorCheckout[Error: Stock Insuficiente]
    
    TipoOperacion -->|Pago Aprobado| ReducirStock[Reducir Stock<br/>Por cada item]
    ReducirStock --> ActualizarBD[Actualizar products.stock<br/>en Supabase]
    ActualizarBD --> LogStock[Log: stock_reduced]
    
    TipoOperacion -->|Admin Actualiza| AdminActualiza[Admin Modifica Stock]
    AdminActualiza --> ActualizarBD
    
    Agregar --> End([Fin])
    ContinuarCheckout --> End
    ActualizarBD --> End
    ErrorCarrito --> End
    ErrorCheckout --> End
```

---

## 📝 Notas del Diagrama

1. **Flujos Paralelos**: Los flujos de cliente y admin son independientes y pueden ejecutarse simultáneamente.

2. **Validaciones Múltiples**: El stock se valida en 3 puntos:
   - Al agregar al carrito
   - En el checkout
   - Antes de reducir stock en pago aprobado

3. **Webhook Asíncrono**: El webhook de MercadoPago se procesa de forma asíncrona, por lo que el usuario puede ser redirigido antes de que se complete el procesamiento.

4. **Middleware Global**: Todas las rutas `/admin/*` pasan por el middleware de autenticación antes de llegar al handler.

5. **Carrito Local**: El carrito se almacena en `localStorage` del navegador, no en el servidor, por lo que es específico de cada dispositivo/navegador.

---

**Versión**: 2.0.0  
**Última actualización**: 2025-01-27

