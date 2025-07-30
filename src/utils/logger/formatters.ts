import { format } from "winston";

// 🛡️ Sensitive data redaction - Security first approach
export const redactSensitive = format((info: any) => {
  if (info.context) {
    // Email redaction: john.doe@example.com -> joh***@exa***.com
    if (info.context.email) {
      info.context.email = info.context.email.replace(
        /(.{3}).*@(.{3}).*/,
        "$1***@$2***"
      );
    }

    // Password redaction: Always hide completely
    if (info.context.password) {
      info.context.password = "***";
    }

    // Phone number redaction: +1234567890 -> +12***
    if (info.context.phoneNumber) {
      info.context.phoneNumber = info.context.phoneNumber.replace(
        /(\+?\d{2,3}).*/,
        "$1***"
      );
    }
  }
  return info;
});

// 🎨 Development console formatter
export const developmentFormatter = format.combine(
  format.colorize(),
  format.printf(({ timestamp, level, message, traceId, module, action }) => {
    return `${timestamp} [${level}] [${traceId}] ${module}${action ? ":" + action : ""} - ${message}`;
  })
);

// 📝 Production JSON formatter
export const productionFormatter = format.json();
