/**
 * Envío de OTP en modo demo (BRIEF.md, "Fuera de alcance" #3): el código no
 * se envía por correo real, se devuelve en la respuesta de la API para
 * mostrarlo en pantalla. El hook de envío real queda comentado abajo.
 */
export async function enviarOtpDemo(email: string, codigo: string): Promise<void> {
  console.log(`[demo] OTP para ${email}: ${codigo}`);

  // --- Hook para conectar en v2 con un proveedor real (Resend, SMTP corporativo) ---
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "cursos@adipa.cl",
  //   to: email,
  //   subject: "Tu código de acceso ADIPA",
  //   text: `Tu código de verificación es: ${codigo}. Vence en 10 minutos.`,
  // });
}
