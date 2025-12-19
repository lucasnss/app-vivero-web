Notificaciones
Las notificaciones son mensajes enviados por el servidor de Mercado Pago a partir de eventos realizados en tu aplicación. Para que estas notificaciones sean enviadas, debes activar distintos tópicos de notificación, sea por medio de Tus integraciones o al crear un pago, que te informarán sobre los diferentes eventos ocurridos.

La activación de estos tópicos dependerá de la solución de Mercado Pago que hayas integrado y de las necesidades de negocio. Conoce cuáles son, tomando como referencia la tabla a continuación:

Eventos	Nombre en Tus integraciones	Tópico	Productos asociados
Creación y actualización de pagos	Orders (Mercado Pago)	order	Checkout API
Mercado Pago Point
Código QR
Creación y actualización de pagos	Pagos	payment	Checkout API (legacy)
Checkout Pro
Checkout Bricks
Suscripciones
Mercado Pago Point (legacy y solo para IPN)
Wallet Connect
Pago recurrente de una suscripción (creación - actualización)	Planes y suscripciones	subscription_authorized_payment	Suscripciones
Vinculación de una suscripción (creación - actualización)	Planes y suscripciones	subscription_preapproval	Suscripciones
Vinculación de un plan de suscripción (creación - actualización)	Planes y suscripciones	subscription_preapproval_plan	Suscripciones
Vinculación y desvinculación de cuentas que se conectaron mediante OAuth	Vinculación de aplicaciones	mp-connect	Todos los productos que tengan OAuth implementado.
Transacciones con Wallet Connect	Wallet Connect	wallet_connect	Wallet Connect
Alertas de fraude después del procesamiento de un pedido	Alertas de fraude	stop_delivery_op_wh / delivery_cancellation	Checkout API
Checkout Pro
Creación de reembolsos y reclamos	Reclamos	topic_claims_integration_wh	Checkout API
Checkout Pro
Checkout Bricks
Suscripciones
Mercado Pago Point
Código QR
Wallet Connect
Recuperación y actualización de información de tarjetas en Mercado Pago	Card Updater	topic_card_id_wh	Checkout Pro
Checkout API
Checkout Bricks
Creación, cierre o expiración de órdenes comerciales	Órdenes comerciales	topic_merchant_order_wh / merchant_order	Checkout Pro
Código QR (legacy)
Apertura de chargebacks, cambios de estado y modificaciones referentes a las liberaciones de dinero	Chargebacks	topic_chargebacks_wh / chargebacks	Checkout Pro
Checkout API
Checkout Bricks
Finalización, cancelación o errores al procesar intenciones de pago de dispositivos Mercado Pago Point.	Integraciones Point	point_integration_wh / point_integration_ipn	Mercado Pago Point (legacy)
Una vez configuradas, las notificaciones permiten programar el backend de las tiendas para, por ejemplo, actualizar el estado de pedidos cuando un pago es creado, enviar un e-mail de confirmación cuando un pedido es actualizado en Mercado Pago, actualizar el registro de un cliente cuando realice una vinculación de un plan de suscripción, entre otras acciones recurrentes de los eventos detallados en la tabla anterior.

Existen dos tipos de notificaciones para tu configuración, como se muestra en la tabla a continuación.

Tipo	Descripción
Webhooks	Recomendadas. Utilizan HTTP REST para notificar instantáneamente las actualizaciones y ofrecen mayor seguridad en la integración mediante la clave secreta, un método de validación para garantizar que las notificaciones recibidas fueron enviadas por Mercado Pago.
Para aprender a configurar y simular el envío de estas notificaciones, accede a la documentación de Webhooks.
IPN	Permite que la aplicación reciba notificaciones de Mercado Pago sobre el estado de un pago, contracargo o merchant order por medio de una llamada HTTP POST. La notificación puede tardar unos minutos en enviarse, y no permite realizar la validación de origen mediante el header x-Signature.
Importante: Las notificaciones IPN serán descontinuadas pronto. Por esto, recomendamos la utilización de las notificaciones Webhooks.

-------------------------------------------------------------------------------------------------------
Webhooks
Webhooks (también conocido como devolución de llamada web) es un método simple que facilita que una aplicación o sistema proporcione información en tiempo real cada vez que ocurre un evento, es decir, es una forma de recibir datos pasivamente entre dos sistemas a través de un HTTP POST.

Las notificaciones Webhooks se pueden configurar para una o más aplicaciones creadas en Tus integraciones. También es posible configurar una URL de prueba que, junto con las credenciales de prueba, permitirá verificar el correcto funcionamiento de las notificaciones previo a salir a producción.

Una vez configurada, la notificación Webhook será enviada cada vez que ocurra uno o más eventos registrados, evitando la necesidad de verificaciones constantes y, consecuentemente, previniendo la sobrecarga del sistema y la pérdida de datos en situaciones críticas.

Para configurar notificaciones Webhooks, puedes elegir una de las opciones a continuación.

Tipo de configuración	Descripción
Configuración a través de Tus integraciones	Permite configurar notificaciones para cada una de tus aplicaciones, identificar cuentas distintas en caso de ser necesario, y validar el origen de la notificación utilizando una firma secreta (excepto en notificaciones para integraciones con Código QR).
Configuración durante la creación de pagos	Permite la configuración específica de notificaciones para cada pago, preferencia u orden No está permitida para integraciones con Mercado Pago Point.
Importante
Las URLs configuradas durante la creación de un pago tendrán prioridad por sobre aquellas configuradas a través de Tus integraciones.
Una vez que las notificaciones sean configuradas, consulta las acciones necesarias después de recibir una notificación para validar que las mismas fueron debidamente recibidas.

Configuración a través de Tus integraciones
Puedes configurar notificaciones para cada una de tus aplicaciones directamente desde Tus integraciones de manera eficiente y segura. En este apartado, explicaremos cómo:

Indicar las URLs de notificación y configurar eventos
Validar el origen de una notificación
Simular el recibimiento de una notificación
Importante
Este método de configuración no está disponible para integraciones con Código QR ni Suscripciones. Para configurar notificaciones con alguna de estas dos integraciones, utiliza el método Configuración durante la creación de un pago.
1. Indicar URLs de notificación y configurar eventos
Para configurar notificaciones Webhooks mediante Tus integraciones, es necesario indicar las URLs a las que las mismas serán enviadas y especificar los eventos para los cuales deseas recibirlas.

Para hacerlo, sigue el paso a paso a continuación:

Ingresa a Tus Integraciones y selecciona la aplicación para la que deseas activar las notificaciones. En caso de que aún no hayas creado una aplicación, accede a la documentación sobre el Panel del Desarrollador y sigue las instrucciones para poder hacerlo.
En el menú de la izquierda, selecciona Webhooks > Configurar notificaciones, y configura las URLs que serán utilizadas para recibirlas. Recomendamos utilizar dos URLs diferentes para el modo de pruebas y el modo producción:
URL modo pruebas: proporciona una URL que permita probar el correcto funcionamiento de las notificaciones de la aplicación durante la etapa de desarrollo. La prueba de estas notificaciones deberá ser realizada exclusivamente con credenciales de prueba del usuario productivo con el que creaste la aplicación.
URL modo producción: proporciona una URL para recibir notificaciones con tu integración productiva. Estas notificaciones deberán ser configuradas con tus credenciales productivas.
webhooks

Nota
En caso de ser necesario identificar múltiples cuentas, agrega el parámetro ?cliente=(nombredelvendedor) al final de la URL indicada para identificar a los vendedores.
Selecciona los eventos de los que recibirás notificaciones, que serán enviadas en formato JSON a través de un HTTP POST a la URL especificada anteriormente. Un evento puede ser cualquier actualización sobre el tópico reportado, incluyendo cambios de status o atributos. Consulta la tabla a continuación para ver qué eventos pueden ser configurados teniendo en cuenta la solución de Mercado Pago integrada y las particularidades de negocio.
Eventos	Nombre en Tus integraciones	Tópico	Productos asociados
Creación y actualización de pagos	Order (Mercado Pago)	orders	Checkout API
Mercado Pago Point
Código QR
Creación y actualización de pagos	Pagos	payment	Checkout API (legacy)
Checkout Pro
Checkout Bricks
Suscripciones
Wallet Connect
Pago recurrente de una suscripción (creación y actualización)	Planes y suscripciones	subscription_authorized_payment	Suscripciones
Vinculación de una suscripción (creación y actualización)	Planes y suscripciones	subscription_preapproval	Suscripciones
Vinculación de un plan de suscripción (creación y actualización)	Planes y suscripciones	subscription_preapproval_plan	Suscripciones
Vinculación y desvinculación de cuentas conectadas a través de OAuth.	Vinculación de aplicaciones	mp-connect	Todos los productos que hayan implementado OAuth
Transacciones de Wallet Connect	Wallet Connect	wallet_connect	Wallet Connect
Alertas de fraude luego del procesamiento de un pedido	Alertas de fraude	stop_delivery_op_wh	Checkout API
Checkout Pro
Creación de reclamos y reembolsos	Reclamos	topic_claims_integration_wh	Checkout API
Checkout Pro
Checkout Bricks
Suscripciones
Mercado Pago Point
Código QR
Wallet Connect
Recuperación y actualización información de tarjetas dentro de Mercado Pago.	Card Updater	topic_card_id_wh	Checkout Pro
Checkout API
Checkout Bricks
Creación, actualización o cierre de órdenes comerciales	Órdenes comerciales	topic_merchant_order_wh	Checkout Pro
Código QR (legacy)
Apertura de contracargos, cambios de status y modificaciones referentes a las liberaciones de dinero.	Contracargos	topic_chargebacks_wh	Checkout Pro
Checkout API
Checkout Bricks
Finalización, cancelación o errores al procesar intenciones de pago de dispositivos Mercado Pago Point.	Integraciones Point	point_integration_wh	Mercado Pago Point (legacy)
Importante
En caso de dudas sobre los tópicos a activar o los eventos que serán notificados, consulta la documentación Información adicional sobre notificaciones.
Por último, haz clic en Guardar. Esto generará una clave secreta exclusiva para la aplicación, que permitirá validar la autenticidad de las notificaciones recibidas, garantizando que hayan sido enviadas por Mercado Pago. Ten en cuenta que esta clave generada no tiene plazo de caducidad y su renovación periódica no es obligatoria, aunque sí recomendada. Para hacerlo, basta con cliquear en el botón Restablecer.
Importante
Las notificaciones de Código QR no pueden ser validadas utilizando la clave secreta, por eso deberás continuar directamente con la etapa “Simular el recibimiento de una notificación”. Para verificar el origen de las notificaciones de integraciones con Código QR, entra en contacto con Soporte de Mercado Pago.
2. Validar origen de una notificación
Las notificaciones enviadas por Mercado Pago serán semejantes al siguiente ejemplo para un alerta del tópico payment:

{
 "id": 12345,
 "live_mode": true,
 "type": "payment",
 "date_created": "2015-03-25T10:04:58.396-04:00",
 "user_id": 44444,
 "api_version": "v1",
 "action": "payment.created",
 "data": {
     "id": "999999999"
 }
}
Mercado Pago siempre incluirá la clave secreta en las notificaciones Webhooks que serán recibidas, lo que permitirá validar su autenticidad para proporcionar mayor seguridad y prevenir posibles fraudes.

Esta clave será enviada en el header x-signature, que será similar al ejemplo debajo.

`ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839`
Para confirmar la validación, es necesario extraer la clave contenida en el header y compararla con la clave otorgada para tu aplicación en Tus integraciones. Esto podrá ser hecho siguiendo el paso a paso a continuación. Además, al final, disponibilizamos nuestros SDKs con ejemplos de códigos completos para facilitar el proceso.

Para extraer el timestamp (ts) y la clave del header x-signature, divide el contenido del header por el carácter ,, lo que resultará en una lista de elementos. El valor para el prefijo ts es el timestamp (en milisegundos) de la notificación y v1 es la clave encriptada. Siguiendo el ejemplo presentado anteriormente, ts=1704908010 y v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839.
Utilizando el template a continuación, sustituye los parámetros con los datos recibidos en tu notificación.
id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
Los parámetros con el sufijo _url provienen de query params. Ejemplo: [data.id_url] se sustituirá por el valor correspondiente al ID del evento (data.id) y, en este caso, si el data.id_url es alfanumérico, deberá enviarse obligatoriamente en minúsculas. Este query param puede ser hallado en la notificación recibida.
[ts_header] será el valor ts extraído del header x-signature.
[x-request-id_header] deberá ser sustituido por el valor recibido en el header x-request-id.
Importante
Si alguno de los valores presentados en el modelo anterior no está presente en la notificación recibida, debes removerlo.
En Tus integraciones, selecciona la aplicación integrada, ve a la sección de Webhooks y revela la clave secreta generada.
Genera la contraclave para la validación. Para hacer esto, calcula un HMAC con la función de hash SHA256 en base hexadecimal, utilizando la clave secreta como clave y el template con los valores como mensaje.
$cyphedSignature = hash_hmac('sha256', $data, $key);
Finalmente, compara la clave generada con la clave extraída del header, asegurándote de que tengan una correspondencia exacta. Además, puedes usar el timestamp extraído del header para compararlo con un timestamp generado en el momento de la recepción de la notificación, con el fin de establecer una tolerancia de demora en la recepción del mensaje.
A continuación, puedes ver ejemplos de código completo:

<?php
// Obtain the x-signature value from the header
$xSignature = $_SERVER['HTTP_X_SIGNATURE'];
$xRequestId = $_SERVER['HTTP_X_REQUEST_ID'];

// Obtain Query params related to the request URL
$queryParams = $_GET;

// Extract the "data.id" from the query params
$dataID = isset($queryParams['data.id']) ? $queryParams['data.id'] : '';

// Separating the x-signature into parts
$parts = explode(',', $xSignature);

// Initializing variables to store ts and hash
$ts = null;
$hash = null;

// Iterate over the values to obtain ts and v1
foreach ($parts as $part) {
    // Split each part into key and value
    $keyValue = explode('=', $part, 2);
    if (count($keyValue) == 2) {
        $key = trim($keyValue[0]);
        $value = trim($keyValue[1]);
        if ($key === "ts") {
            $ts = $value;
        } elseif ($key === "v1") {
            $hash = $value;
        }
    }
}

// Obtain the secret key for the user/application from Mercadopago developers site
$secret = "your_secret_key_here";

// Generate the manifest string
$manifest = "id:$dataID;request-id:$xRequestId;ts:$ts;";

// Create an HMAC signature defining the hash type and the key as a byte array
$sha = hash_hmac('sha256', $manifest, $secret);
if ($sha === $hash) {
    // HMAC verification passed
    echo "HMAC verification passed";
} else {
    // HMAC verification failed
    echo "HMAC verification failed";
}
?>
3. Simular la recepción de la notificación
Para garantizar que las notificaciones sean configuradas correctamente, es necesario simular su recepción. Para hacerlo, sigue el paso a paso a continuación.

Después de configurar las URLs y los Eventos, haz clic en Guardar para guardar la configuración.
Luego, haz clic en Simular para probar si la URL indicada está recibiendo las notificaciones correctamente.
En la pantalla de simulación, selecciona la URL que se va a probar, que puede ser la URL de prueba o la de producción.
A continuación, elige el tipo de evento e ingresa la identificación que se enviará en el cuerpo de la notificación.
Por último, haz clic en Enviar prueba para verificar la solicitud, la respuesta proporcionada por el servidor y la descripción del evento.
Configuración al crear pagos
Durante el proceso de creación de pagos, preferencias u órdenes presenciales, es posible configurar la URL de notificación de forma más específica para cada pago utilizando el campo notification_url e implementando un receptor de notificaciones.

Importante
No es posible configurar notificaciones para el tópico point_integration_wh utilizando este método. Para activarlo, utiliza la configuración a través de Tus integraciones.
A continuación, explicamos cómo configurar notificaciones al crear un pago utilizando nuestros SDKs.

En el campo notification_url, indica la URL desde la que se recibirán las notificaciones, como se muestra a continuación. Para recibir exclusivamente Webhooks y no IPN, agrega el parámetro source_news=webhooks a la notification_url. Por ejemplo: https://www.yourserver.com/notifications?source_news=webhooks.
<?php 
$client = new PaymentClient();

        $body = [
            'transaction_amount' => 100,
            'token' => 'token',
            'description' => 'description',
            'installments' => 1,
            'payment_method_id' => 'visa',
            'notification_url' => 'http://test.com',
            'payer' => array(
                'email' => 'test@test.com',
                'identification' => array(
                    'type' => 'CPF',
                    'number' => '19119119100'
                )
            )
        ];

$client->create(body);
?>
Implementa el receptor de notificaciones usando el siguiente código como ejemplo:
<?php
 MercadoPago\SDK::setAccessToken("ENV_ACCESS_TOKEN");
 switch($_POST["type"]) {
     case "payment":
         $payment = MercadoPago\Payment::find_by_id($_POST["data"]["id"]);
         break;
     case "plan":
         $plan = MercadoPago\Plan::find_by_id($_POST["data"]["id"]);
         break;
     case "subscription":
         $plan = MercadoPago\Subscription::find_by_id($_POST["data"]["id"]);
         break;
     case "invoice":
         $plan = MercadoPago\Invoice::find_by_id($_POST["data"]["id"]);
         break;
     case "point_integration_wh":
         // $_POST contiene la informaciòn relacionada a la notificaciòn.
         break;
 }
?>
Luego de realizar la configuración necesaria, la notificación Webhook será enviada con formato JSON. Puedes ver a continuación un ejemplo de notificación del tópico payment, y las descripciones de la información enviada en la tabla debajo.

Importante
Los pagos de prueba, creados con credenciales de prueba, no enviarán notificaciones. La única vía para probar la recepción de notificaciones es mediante la Configuración a través de Tus integraciones.
{
 "id": 12345,
 "live_mode": true,
 "type": "payment",
 "date_created": "2015-03-25T10:04:58.396-04:00",
 "user_id": 44444,
 "api_version": "v1",
 "action": "payment.created",
 "data": {
     "id": "999999999"
 }
}
Atributo	Descripción	Ejemplo en el JSON
id	ID de la notificación	12345
live_mode	Indica si la URL ingresada es válida.	true
type	Tipo de notificacion recebida e acuerdo con el tópico previamente seleccionado (payments, mp-connect, subscription, claim, automatic-payments, etc)	payment
date_created	Fecha de creación del recurso notificado	2015-03-25T10:04:58.396-04:00
user_id	Identificador del vendedor	44444
api_version	Valor que indica la versión de la API que envía la notificación	v1
action	Evento notificado, que indica si es una actualización de un recurso o la creación de uno nuevo	payment.created
data.id	ID del pago, de la orden comercial o del reclamo.	999999999
Importante
Para conocer el formato de notificaciones para tópicos distintos a payment, como point_integration_wh, topic_claims_integration_wh y topic_card_id_wh, consulta Información adicional sobre notificaciones.
Acciones necesarias después de recibir la notificación
Cuando recibes una notificación en tu plataforma, Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).

El tiempo de espera para esa confirmación será de 22 segundos. Si no se envía esta respuesta, el sistema entenderá que la notificación no fue recibida y realizará un nuevo intento de envío cada 15 minutos, hasta que reciba la respuesta. Después del tercer intento, el plazo será prorrogado, pero los envíos continuarán sucediendo.

Luego de responder la notificación, confirmando su recibimiento, puedes obtener toda la información sobre el recurso notificado haciendo una requisición al endpoint correspondiente. Para identificar qué endpoint debes utilizar, consulta la tabla debajo:

Tipo	URL	Documentación
order	https://api.mercadopago.com/v1/orders/{id}	Obtener order por ID (para Checkout API)
order	https://api.mercadopago.com/v1/orders/{order_id}	Obtener order por ID (para Mercado Pago Point)
order	https://api.mercadopago.com/v1/orders/{order_id}	Obtener order por ID (para Código QR)
payment	https://api.mercadopago.com/v1/payments/[ID]	Obtener pago
subscription_preapproval	https://api.mercadopago.com/preapproval/search	Obtener suscripción
subscription_preapproval_plan	https://api.mercadopago.com/preapproval_plan/search	Obtener plan de suscripción
subscription_authorized_payment	https://api.mercadopago.com/authorized_payments/[ID]	Obtener información de facturas
topic_claims_integration_wh	https://api.mercadopago.com/post-purchase/v1/claims/[claim_id]	Obtener detalles del reclamo
topic_merchant_order_wh	https://api.mercadopago.com/merchant_orders/[ID]	Obtener orden
topic_chargebacks_wh	https://api.mercadopago.com/v1/chargebacks/[ID]	Obtener contracargo
Con esta información podrás realizar las actualizaciones necesarias a tu plataforma, como actualizar un pago aprobado.

Panel de notificaciones
El panel de notificaciones es una herramienta que permite visualizar los eventos disparados sobre una determinada integración, verificar el estado de las notificaciones, y obtener información detallada sobre esos eventos.

Este Panel será exhibido una vez que hayas configurado tus notificaciones Webhooks, y puedes acceder a él cuando desees, haciendo clic en Webhooks dentro de Tus integraciones.

Entre la información disponible en este panel, encontrarás el porcentaje de notificaciones entregadas, así como una visión rápida de cuáles son las URLs y eventos configurados.

Además, encontrarás una lista completa de las últimas notificaciones enviadas y sus detalles, como estado de la entrega (exitoso o fallido), acción (acción asociada al evento disparado), evento (tipo de evento disparado), y fecha y hora. Si lo deseas, es posible filtrar estos resultados exhibidos por estado de la entrega y por período.

panel de notificaciones webhooks

Detalles del evento
Al hacer clic en una de las notificaciones listadas, podrás acceder a los detalles del evento. Esta sección proporciona mayor información y permite recuperar datos perdidos en caso de fallas en la entrega de la notificación para mantener tu sistema actualizado.

Status: Estado del evento junto con el código de éxito o error correspondiente.
Evento: Tipo de evento disparado, en función de los tópicos seleccionados durante la configuración de las notificaciones.
Tipo: Tópico al que pertenece el evento disparado, en función de la selección hecha durante la configuración.
Fecha y hora del disparo: Fecha y hora en la que fue disparado el evento.
Descripción: Descripción detallada del evento.
ID del disparo: Identificador único de la notificación enviada.
Requisición: JSON del llamado enviado como notificación.
detalles de notificaciones enviadas

En caso de una falla en la entrega de la notificación, podrás conocer cuáles fueron los motivos y rectificar la información necesaria para evitar futuros problemas.

