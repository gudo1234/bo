import PhoneNumber from "awesome-phonenumber";

let handler = async (m, { conn, args }) => {

    if (!args[0]) {
        return m.reply(`✳️ Ingresa un número\n\nEjemplo:\n.enviar 50488723207`);
    }

    // Limpiar número
    let numero = args[0].replace(/\D/g, "");

    // Validar número
    const pn = new PhoneNumber("+" + numero);
    if (!pn.isValid()) {
        return m.reply("❌ Número inválido");
    }

    // Convertir a JID
    let jid = pn.getNumber("rfc3966").replace("tel:+", "") + "@s.whatsapp.net";

    let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`;

    await conn.sendButton2(
        jid, // 👈 se envía directamente al número
        txt,
        '📱 *Diarcel Store*',
        numero,
        [],
        null,
        [
            [
                '🛒 Comprar ahora',
                `https://wa.me/50498511183?text=👋+Hola,+me+interesa+el+iPhone+15+de+128GB,+¿me+puedes+dar+más+información?+`
            ],
            []
        ]
    );

    m.reply(`✅ Mensaje enviado a +${numero}`);
};

handler.command = ['enviar'];

export default handler;
